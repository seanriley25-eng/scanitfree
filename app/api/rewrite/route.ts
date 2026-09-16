import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import {
  scoreResume,
  resumeToText,
  fixResume,
  type ScoreResult,
  type StructuredResume,
} from "@/lib/resume-scorer";
import {
  EXTRACT_KW_SYSTEM,
  makeFeedbackSystem,
  makeRewriteSystem,
  makeBoostSystem,
} from "@/lib/resume-prompts";

const API_KEY = process.env.ANTHROPIC_API_KEY || "";
const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 4096;

const RESUME_CHAR_LIMIT = 8000;
const JD_CHAR_LIMIT = 4000;
const PDF_SIZE_LIMIT = 10 * 1024 * 1024;

async function callClaude(system: string, userContent: string | object[]): Promise<any> {
  if (!API_KEY) throw new Error("Server not configured");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      temperature: 0,
      system,
      messages: [{ role: "user", content: userContent }],
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    const errorType = data?.error?.type || `HTTP ${res.status}`;
    throw new Error(errorType);
  }
  const text: string = data.content?.map((b: any) => (b.type === "text" ? b.text : "")).join("") || "";
  if (!text) throw new Error("Empty AI response");
  let clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
  const jsonStart = clean.indexOf("{");
  const jsonEnd = clean.lastIndexOf("}");
  if (jsonStart > 0 && jsonEnd > jsonStart) clean = clean.slice(jsonStart, jsonEnd + 1);
  try {
    return JSON.parse(clean);
  } catch {
    let f = clean;
    if ((f.match(/"/g) || []).length % 2 !== 0) f += '"';
    const o = (f.match(/[\[{]/g) || []).length;
    const c = (f.match(/[\]}]/g) || []).length;
    for (let i = 0; i < o - c; i++) {
      const l = Math.max(f.lastIndexOf("["), f.lastIndexOf("{"));
      f += f[l] === "[" ? "]" : "}";
    }
    try {
      return JSON.parse(f);
    } catch {
      throw new Error("Malformed AI JSON response");
    }
  }
}

async function extractPdfText(base64: string): Promise<string> {
  if (!API_KEY) throw new Error("Server not configured");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: [
            { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } },
            {
              type: "text",
              text: "Extract all text from this resume PDF. Return ONLY the raw text content, preserving section headers and bullet points. No commentary.",
            },
          ],
        },
      ],
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    const errorType = data?.error?.type || `HTTP ${res.status}`;
    throw new Error(errorType);
  }
  const text: string = data.content?.map((b: any) => (b.type === "text" ? b.text : "")).join("") || "";
  return text.trim();
}

function buildCompanyContext(companyName?: string, toolsContext?: string): string {
  if (!companyName && !toolsContext) return "";
  return `\n\nCOMPANY CONTEXT:${companyName ? ` This role is at/for ${companyName}.` : ""}${
    toolsContext ? ` ${toolsContext}` : ""
  } Use tools and terminology appropriate for this company. Do NOT substitute with tools from competing ecosystems (e.g. don't use Jira for Microsoft, don't use Azure for Google).`;
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const limit = rateLimit(ip);
    if (!limit.allowed) {
      const hoursLeft = Math.ceil((limit.resetAt - Date.now()) / (1000 * 60 * 60));
      return NextResponse.json(
        {
          error: `Daily limit reached (15 free scans per day). Resets in ~${hoursLeft} hour${
            hoursLeft === 1 ? "" : "s"
          }. Come back tomorrow!`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const action: string = body.action;

    // ── PDF text extraction ────────────────────────────────────────────────
    if (action === "pdf_extract") {
      const base64: string = body.base64;
      if (!base64) return NextResponse.json({ error: "Missing base64" }, { status: 400 });
      // Rough size check — base64 is ~4/3 the byte size
      if (base64.length > (PDF_SIZE_LIMIT * 4) / 3) {
        return NextResponse.json({ error: "PDF too large. Max 10MB." }, { status: 400 });
      }
      const text = await extractPdfText(base64);
      return NextResponse.json({ text });
    }

    // ── Keyword extraction from JD ─────────────────────────────────────────
    if (action === "extract_kw") {
      const jd: string = (body.jd || "").slice(0, JD_CHAR_LIMIT);
      if (!jd.trim()) return NextResponse.json({ error: "Missing job description" }, { status: 400 });
      const r = await callClaude(EXTRACT_KW_SYSTEM, jd);
      return NextResponse.json({ keywords: Array.isArray(r.keywords) ? r.keywords : [] });
    }

    // ── Qualitative feedback (no score — scoring is deterministic client-side) ─
    if (action === "feedback") {
      const resume: string = (body.resume || "").slice(0, RESUME_CHAR_LIMIT);
      const jd: string = (body.jd || "").slice(0, JD_CHAR_LIMIT);
      const kwList: string[] = Array.isArray(body.kwList) ? body.kwList : [];
      if (!resume.trim() || !jd.trim()) return NextResponse.json({ error: "Missing resume or JD" }, { status: 400 });
      const fb = await callClaude(
        makeFeedbackSystem(kwList),
        `JOB DESCRIPTION:\n${jd}\n\nRESUME:\n${resume}`
      );
      return NextResponse.json(fb);
    }

    // ── Full rewrite + boost loop ──────────────────────────────────────────
    if (action === "rewrite") {
      const resume: string = (body.resume || "").slice(0, RESUME_CHAR_LIMIT);
      const jd: string = (body.jd || "").slice(0, JD_CHAR_LIMIT);
      const kwList: string[] = Array.isArray(body.kwList) ? body.kwList : [];
      const scoreResult: ScoreResult = body.scoreResult;
      const confirmedSkills: string[] = Array.isArray(body.confirmedSkills) ? body.confirmedSkills : [];
      const companyName: string = (body.companyName || "").slice(0, 100);
      const toolsContext: string = (body.toolsContext || "").slice(0, 1000);

      if (!resume.trim() || !jd.trim() || !scoreResult || kwList.length === 0) {
        return NextResponse.json({ error: "Missing required fields for rewrite" }, { status: 400 });
      }

      const found = new Set((scoreResult.ats.found || []).map((k: string) => k.toLowerCase()));
      const confirmedSet = new Set(confirmedSkills);
      const approvedKwList = kwList.filter(
        k => found.has(k.toLowerCase()) || confirmedSet.has(k)
      );
      const declinedKw = kwList.filter(
        k => !found.has(k.toLowerCase()) && !confirmedSet.has(k)
      );
      const compCtx = buildCompanyContext(companyName, toolsContext);

      // Step 1: initial rewrite
      let cur: StructuredResume = await callClaude(
        makeRewriteSystem(approvedKwList),
        `JOB DESCRIPTION:\n${jd}\n\nRESUME:\n${resume}${compCtx}\n\nCurrent score:${scoreResult.total}\nAPPROVED keywords to inject:${approvedKwList.join(", ")}\n${
          declinedKw.length > 0 ? `\nDO NOT add these keywords (user does not have these skills): ${declinedKw.join(", ")}` : ""
        }\nIssues:${[
          ...scoreResult.summary.issues,
          ...scoreResult.skills.issues,
          ...scoreResult.bullets.issues,
          ...scoreResult.format.issues,
        ].join("; ")}`
      );
      cur = fixResume(cur);

      // Step 2: verify + boost loop
      let allChanges: string[] = [...(cur.changes || [])];
      let pass = 1;
      let txt = resumeToText(cur);
      let vScore = scoreResume(txt, kwList);
      const boostTarget = scoreResult.total >= 80 ? 93 : 90;

      while (vScore.total < boostTarget && pass < 4) {
        pass++;
        try {
          const boosted: StructuredResume = await callClaude(
            makeBoostSystem(approvedKwList, vScore, boostTarget),
            `JOB DESCRIPTION:\n${jd}${compCtx}\n\nCURRENT RESUME:\n${JSON.stringify(cur).slice(0, 2000)}`
          );
          cur = fixResume(boosted);
          allChanges = [...allChanges, ...(boosted.changes || [])];
          txt = resumeToText(cur);
          vScore = scoreResume(txt, kwList);
        } catch {
          break;
        }
      }

      return NextResponse.json({
        finalResume: cur,
        changes: allChanges,
        pass,
        verifiedScore: vScore,
        verifiedText: txt,
        declined: declinedKw,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    console.error("Rewrite route error:", err?.message);
    return NextResponse.json(
      { error: `Failed: ${err?.message || "unknown_error"}. Please try again.` },
      { status: 500 }
    );
  }
}
