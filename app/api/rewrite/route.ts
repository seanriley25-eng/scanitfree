import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import {
  scoreResume,
  resumeToText,
  fixResume,
  maxAchievableScore,
  containsTerm,
  type ScoreResult,
  type StructuredResume,
} from "@/lib/resume-scorer";
import {
  EXTRACT_KW_SYSTEM,
  makeFeedbackSystem,
  makeRewriteSystem,
  makeBoostSystem,
  makeScrubSystem,
  makeExplainGapsSystem,
  type RelatedSkill,
} from "@/lib/resume-prompts";

const API_KEY = process.env.ANTHROPIC_API_KEY || "";
const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 4096;

const RESUME_CHAR_LIMIT = 8000;
const JD_CHAR_LIMIT = 4000;
const PDF_SIZE_LIMIT = 10 * 1024 * 1024;
const MAX_BOOST_PASSES = 3;

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

/** Terms from `terms` that appear anywhere in the flattened resume. */
function findLeaks(r: StructuredResume, terms: string[]): string[] {
  const txt = resumeToText(r);
  return terms.filter(t => containsTerm(txt, t));
}

/** Related keywords are allowed in bullets/summary but never as a bare Skills item. */
function relatedInSkills(r: StructuredResume, related: string[]): string[] {
  const skills = (r.skills || []).map(s => s.toLowerCase().trim());
  return related.filter(k => skills.some(s => s === k.toLowerCase()));
}

/** Pull contact details straight from the source text so a hallucinated email/phone can be overwritten. */
function sourceContact(text: string): { email?: string; phone?: string } {
  const email = text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i)?.[0];
  const phone = text.match(/\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/)?.[0];
  return { email, phone };
}

/** Rough count of dated roles in the source — used to warn if the rewrite dropped one. */
function countSourceRoles(text: string): number {
  const m = text.match(/\b(19|20)\d{2}\s*[–—-]\s*((19|20)\d{2}|present|current)\b/gi);
  return m ? m.length : 0;
}

/** Copy immutable facts from `from` onto `to`. Experience is restored wholesale if the pass changed the role count. */
function preserveFacts(to: StructuredResume, from: StructuredResume): StructuredResume {
  to.name = from.name;
  to.email = from.email;
  to.phone = from.phone;
  to.location = from.location;
  to.linkedin = from.linkedin;
  to.education = from.education;
  to.certifications = from.certifications;
  const fromExp = from.experience || [];
  const toExp = to.experience || [];
  if (toExp.length !== fromExp.length) {
    to.experience = fromExp;
  } else {
    to.experience = toExp.map((job, i) => ({
      ...job,
      title: fromExp[i].title,
      company: fromExp[i].company,
      dates: fromExp[i].dates,
    }));
  }
  return to;
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
      const fb = await callClaude(makeFeedbackSystem(kwList), `JOB DESCRIPTION:\n${jd}\n\nRESUME:\n${resume}`);
      return NextResponse.json(fb);
    }

    // ── Explain missing keywords + find adjacent experience ────────────────
    if (action === "explain_gaps") {
      const resume: string = (body.resume || "").slice(0, RESUME_CHAR_LIMIT);
      const missing: string[] = Array.isArray(body.missing) ? body.missing.filter((k: unknown) => typeof k === "string").slice(0, 30) : [];
      if (!resume.trim() || missing.length === 0) {
        return NextResponse.json({ error: "Missing resume or keywords" }, { status: 400 });
      }
      const r = await callClaude(makeExplainGapsSystem(missing), `RESUME:\n${resume}`);
      const gaps = Array.isArray(r.gaps)
        ? r.gaps
            .filter((g: any) => g && typeof g.keyword === "string")
            .map((g: any) => ({
              keyword: g.keyword,
              meaning: typeof g.meaning === "string" ? g.meaning : "",
              relatedHint: typeof g.relatedHint === "string" && g.relatedHint.trim() ? g.relatedHint : null,
            }))
        : [];
      return NextResponse.json({ gaps });
    }

    // ── Full rewrite + boost loop, bounded by the honest ceiling ──────────
    if (action === "rewrite") {
      const resume: string = (body.resume || "").slice(0, RESUME_CHAR_LIMIT);
      const jd: string = (body.jd || "").slice(0, JD_CHAR_LIMIT);
      const kwList: string[] = Array.isArray(body.kwList) ? body.kwList : [];
      const scoreResult: ScoreResult = body.scoreResult;
      const confirmedSkills: string[] = Array.isArray(body.confirmedSkills) ? body.confirmedSkills : [];
      const relatedInput: RelatedSkill[] = Array.isArray(body.relatedSkills)
        ? body.relatedSkills.filter(
            (r: any) => r && typeof r.keyword === "string" && typeof r.experience === "string" && r.experience.trim()
          )
        : [];
      const companyName: string = (body.companyName || "").slice(0, 100);
      const toolsContext: string = (body.toolsContext || "").slice(0, 1000);

      if (!resume.trim() || !jd.trim() || !scoreResult || kwList.length === 0) {
        return NextResponse.json({ error: "Missing required fields for rewrite" }, { status: 400 });
      }

      const found = new Set((scoreResult.ats.found || []).map((k: string) => k.toLowerCase()));
      const confirmedSet = new Set(confirmedSkills);
      const approved = kwList.filter(k => found.has(k.toLowerCase()) || confirmedSet.has(k));
      const approvedSet = new Set(approved);
      const related = relatedInput
        .filter(r => kwList.includes(r.keyword) && !approvedSet.has(r.keyword))
        .map(r => ({ keyword: r.keyword, experience: r.experience.trim().slice(0, 400) }));
      const relatedKw = related.map(r => r.keyword);
      const relatedSet = new Set(relatedKw);
      const declined = kwList.filter(k => !approvedSet.has(k) && !relatedSet.has(k));
      const usableSet = new Set([...approved, ...relatedKw]);

      const ceiling = maxAchievableScore(approved.length, related.length, kwList.length);
      const desiredTarget = scoreResult.total >= 80 ? 93 : 90;
      const target = Math.min(desiredTarget, ceiling);
      const compCtx = buildCompanyContext(companyName, toolsContext);
      const contact = sourceContact(resume);
      const sourceRoles = countSourceRoles(resume);

      // Step 1: initial rewrite
      let cur: StructuredResume = await callClaude(
        makeRewriteSystem(approved, related, declined),
        `JOB DESCRIPTION:\n${jd}\n\nRESUME:\n${resume}${compCtx}\n\nCurrent score: ${scoreResult.total}. Target: ${target}.\nIssues: ${[
          ...scoreResult.summary.issues,
          ...scoreResult.skills.issues,
          ...scoreResult.bullets.issues,
          ...scoreResult.format.issues,
        ].join("; ")}`
      );
      cur = fixResume(cur);
      if (contact.email && !containsTerm(resume, cur.email || " ")) cur.email = contact.email;
      if (contact.phone && cur.phone && !resume.includes(cur.phone.replace(/\D/g, "").slice(-4))) cur.phone = contact.phone;

      const allChanges: string[] = [...(cur.changes || [])];
      let pass = 1;
      let txt = resumeToText(cur);
      let vScore = scoreResume(txt, kwList);

      // Step 2: boost loop — only chases keywords the candidate can honestly use
      while (vScore.total < target - 1 && pass <= MAX_BOOST_PASSES) {
        pass++;
        const usableMissing = vScore.ats.missing.filter(k => usableSet.has(k));
        try {
          const boosted: StructuredResume = await callClaude(
            makeBoostSystem(approved, related, declined, vScore, usableMissing, target),
            `JOB DESCRIPTION:\n${jd}${compCtx}\n\nCURRENT RESUME (JSON):\n${JSON.stringify(cur)}`
          );
          cur = preserveFacts(fixResume(boosted), cur);
          allChanges.push(...(boosted.changes || []));
          txt = resumeToText(cur);
          vScore = scoreResume(txt, kwList);
        } catch {
          break;
        }
      }

      // Step 3: safety net — one scrub pass if any declined term slipped through
      let leaked = findLeaks(cur, declined);
      let relatedAsSkill = relatedInSkills(cur, relatedKw);
      if (leaked.length > 0 || relatedAsSkill.length > 0) {
        try {
          const scrubbed: StructuredResume = await callClaude(
            makeScrubSystem([...leaked, ...relatedAsSkill.map(k => `${k} (as a bare Skills item — may stay in bullets with adjacent framing)`)]),
            JSON.stringify(cur)
          );
          cur = preserveFacts(fixResume(scrubbed), cur);
          txt = resumeToText(cur);
          vScore = scoreResume(txt, kwList);
          leaked = findLeaks(cur, declined);
          relatedAsSkill = relatedInSkills(cur, relatedKw);
        } catch {
          /* report whatever is left */
        }
      }

      const outputRoles = (cur.experience || []).length;
      const warnings: string[] = [];
      if (sourceRoles > 0 && outputRoles < sourceRoles) {
        warnings.push(`Your resume lists ${sourceRoles} dated roles but the rewrite has ${outputRoles} — review before using.`);
      }
      if (leaked.length > 0) {
        warnings.push(`These declined terms still appear and should be removed by hand: ${leaked.join(", ")}.`);
      }
      if (relatedAsSkill.length > 0) {
        warnings.push(`Related keywords listed as bare skills (should only appear with adjacent framing): ${relatedAsSkill.join(", ")}.`);
      }

      return NextResponse.json({
        finalResume: cur,
        changes: allChanges,
        pass,
        verifiedScore: vScore,
        verifiedText: txt,
        declined,
        related: relatedKw,
        ceiling,
        target,
        unaddressed: vScore.ats.missing.filter(k => !usableSet.has(k)),
        warnings,
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
