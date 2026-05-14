import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

const API_KEY = process.env.ANTHROPIC_API_KEY || "";

const CHAR_LIMIT = 24000;

const TOOL_PROMPTS: Record<string, string> = {
  "food-safety": `You are a food safety analyst. The user will provide a product name, ingredient list, or UPC code. Analyze it and respond with ONLY valid JSON (no markdown, no backticks): {"score": <number 0-100>, "grade": "<A/B/C/D/F>", "flags": [{"severity": "danger|warning|info", "text": "<specific concern>"}], "summary": "<2-3 sentence summary>"}. Cross-reference your knowledge of: recent FDA enforcement actions and recalls, known allergens and labeling requirements, controversial additives (artificial colors, preservatives, etc.), nutritional concerns (excessive sodium, sugar, trans fats). Be specific. For each flag, append a source citation at the end of the text field ONLY when a real one applies — use real FDA recall numbers (e.g., "FDA Recall #F-1234-2024") or CFR regulation citations (e.g., "21 CFR 101.22"). Do NOT fabricate citations; skip the citation entirely if no real source can be cited. Score: 90-100=A (very safe), 70-89=B (minor concerns), 50-69=C (moderate concerns), 30-49=D (significant concerns), 0-29=F (serious safety issues).`,
  "resume-reviewer": `You are an expert resume reviewer. The user message contains a RESUME and optionally a JOB DESCRIPTION section. Analyze and respond with ONLY valid JSON (no markdown, no backticks): {"score": <0-100>, "grade": "<A/B/C/D/F>", "sections": [{"name": "<section>", "score": <0-100>, "feedback": "<feedback>"}], "atsScore": <0-100>, "topIssues": ["<issue>"], "summary": "<2-3 sentences>", "keywordGap": {"inferredRole": "<string, only when no JD>", "missingKeywords": ["<keyword>"], "strongOverlaps": ["<keyword>"], "toneAlignment": "<1-2 sentences>", "rewriteHints": ["<hint>"]}}. Evaluate: formatting/readability, quantified achievements, ATS keyword optimization, section completeness, grammar/consistency, overall positioning. IF a JOB DESCRIPTION is present: perform a targeted ATS keyword match — missingKeywords: keywords the JD requires that the resume lacks; strongOverlaps: keywords well-matched in both; toneAlignment: assess seniority/tone fit; rewriteHints: 3-5 diagnostic observations about specific bullets (e.g. "Your AWS bullet lacks a quantified outcome; the JD emphasizes cost reduction") — observations only, do NOT write rewrites; omit inferredRole. IF no JOB DESCRIPTION: infer the likely target role from resume content — inferredRole: state that role; missingKeywords: 5-10 ATS-relevant keywords likely missing for that role; strongOverlaps: strong existing ATS keywords; toneAlignment: note that a JD would enable more targeted matching; rewriteHints: []. Where a well-known ATS standard directly supports feedback, you may append a brief citation. Do NOT fabricate citations.`,
  "lease-scanner": `You are a tenant rights expert with deep knowledge of landlord-tenant law across all 50 US states and DC. The user message begins with STATE/JURISDICTION followed by the lease text. Apply the laws of the stated jurisdiction and respond with ONLY valid JSON (no markdown, no backticks): {"score": <0-100>, "grade": "<A/B/C/D/F>", "flags": [{"severity": "danger|warning|info", "clause": "<clause>", "explanation": "<explanation>", "suggestion": "<suggestion>"}], "missingProtections": ["<item>"], "summary": "<2-3 sentences>"}. Apply state-specific tenant protection laws when flagging issues and cite the exact statute in the explanation where applicable. Key rules: CA — deposits ≤2× rent unfurnished (Cal. Civ. Code § 1950.5), 21-day return, 24h entry notice; NY — 14-day deposit return, deposit ≤1 month (NY RPL § 227-e), 24h entry notice required; TX — 30-day deposit return (TX Prop. Code § 92.101), no cap; NJ — deposit interest required (NJ Stat. § 46:8-19), 30-day return; FL — 15/30/60-day return windows (FL Stat. § 83.49); WA — 14-day move-in inspection required (RCW 59.18.260); IL — 30-day return, itemized statement required (765 ILCS 710); MA — deposits limited to 1 month, last month rent + deposit (M.G.L. c. 186 § 15B). For unlisted states apply URLTA principles. If state is "Other" or "Unknown" apply URLTA only and explicitly note in the summary that state-specific protections could not be verified. Do NOT fabricate statute citations; omit if specific law is uncertain.`,
};

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const limit = rateLimit(ip);

    if (!limit.allowed) {
      const hoursLeft = Math.ceil((limit.resetAt - Date.now()) / (1000 * 60 * 60));
      return NextResponse.json(
        { error: `Daily limit reached (15 free scans per day). Resets in ~${hoursLeft} hour${hoursLeft === 1 ? "" : "s"}. Bookmark us and come back tomorrow!` },
        { status: 429 }
      );
    }

    const { tool, input, jd, state } = await req.json();
    if (!tool || !input) return NextResponse.json({ error: "Missing tool or input" }, { status: 400 });

    const systemPrompt = TOOL_PROMPTS[tool];
    if (!systemPrompt) return NextResponse.json({ error: "Unknown tool" }, { status: 400 });

    // Build tool-specific user message to include optional JD (resume) or required state (lease)
    let userContent: string;
    if (tool === "resume-reviewer" && jd?.trim()) {
      userContent = `RESUME:\n${input.slice(0, CHAR_LIMIT)}\n\nJOB DESCRIPTION:\n${jd.trim().slice(0, 8000)}`;
    } else if (tool === "lease-scanner") {
      const jurisdiction = state?.trim() || "Other / Unknown";
      userContent = `STATE/JURISDICTION: ${jurisdiction}\n\nLEASE TEXT:\n${input.slice(0, CHAR_LIMIT)}`;
    } else {
      userContent = input.slice(0, CHAR_LIMIT);
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: "user", content: userContent }],
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      const errorType = data?.error?.type || "unknown_error";
      console.error("API error:", JSON.stringify(data));
      return NextResponse.json(
        { error: `Analysis failed: ${errorType}. Please try again or contact support.` },
        { status: 500 }
      );
    }

    const text = data.content?.[0]?.text || "";
    const clean = text.replace(/```json\n?|```\n?/g, "").trim();
    try {
      const parsed = JSON.parse(clean);
      return NextResponse.json(parsed);
    } catch {
      console.error("Parse error — raw response:", clean.slice(0, 500));
      return NextResponse.json(
        { error: "Analysis failed: parse_error. The AI returned an unexpected format — please try again." },
        { status: 500 }
      );
    }
  } catch (err: any) {
    const errorClass = err?.name || err?.code || "unexpected_error";
    console.error("Error:", errorClass, err.message);
    return NextResponse.json(
      { error: `Analysis failed: ${errorClass}. Please try again.` },
      { status: 500 }
    );
  }
}