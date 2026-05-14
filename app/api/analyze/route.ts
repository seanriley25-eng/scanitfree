import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

const API_KEY = process.env.ANTHROPIC_API_KEY || "";

const CHAR_LIMIT = 24000;

const TOOL_PROMPTS: Record<string, string> = {
  "food-safety": `You are a food safety analyst. The user will provide a product name, ingredient list, or UPC code. Analyze it and respond with ONLY valid JSON (no markdown, no backticks): {"score": <number 0-100>, "grade": "<A/B/C/D/F>", "flags": [{"severity": "danger|warning|info", "text": "<specific concern>"}], "summary": "<2-3 sentence summary>"}. Cross-reference your knowledge of: recent FDA enforcement actions and recalls, known allergens and labeling requirements, controversial additives (artificial colors, preservatives, etc.), nutritional concerns (excessive sodium, sugar, trans fats). Be specific. For each flag, append a source citation at the end of the text field ONLY when a real one applies — use real FDA recall numbers (e.g., "FDA Recall #F-1234-2024") or CFR regulation citations (e.g., "21 CFR 101.22"). Do NOT fabricate citations; skip the citation entirely if no real source can be cited. Score: 90-100=A (very safe), 70-89=B (minor concerns), 50-69=C (moderate concerns), 30-49=D (significant concerns), 0-29=F (serious safety issues).`,
  "resume-reviewer": `You are an expert resume reviewer. Analyze the resume and respond with ONLY valid JSON (no markdown, no backticks): {"score": <number 0-100>, "grade": "<A/B/C/D/F>", "sections": [{"name": "<section>", "score": <0-100>, "feedback": "<feedback>"}], "atsScore": <0-100>, "topIssues": ["<issue>"], "summary": "<2-3 sentences>"}. Evaluate: formatting/readability, quantified achievements, ATS keyword optimization, section completeness, grammar/consistency, and overall positioning. Be specific and actionable. Where a well-known ATS standard or hiring guideline directly supports your feedback, you may append a brief citation (e.g., "per SHRM resume standards", "per iCIMS ATS parsing docs"). Do NOT fabricate citations; omit entirely if no real standard applies.`,
  "lease-scanner": `You are a tenant rights expert. Analyze the lease and respond with ONLY valid JSON (no markdown, no backticks): {"score": <number 0-100>, "grade": "<A/B/C/D/F>", "flags": [{"severity": "danger|warning|info", "clause": "<clause>", "explanation": "<explanation>", "suggestion": "<suggestion>"}], "missingProtections": ["<item>"], "summary": "<2-3 sentences>"}. Look for: excessive fees, unfair termination clauses, waived tenant rights, maintenance responsibilities shifted to tenant, unreasonable entry provisions, security deposit issues, hidden auto-renewal terms, and missing standard protections. Score 90-100=A (very fair), lower=more concerns. Where jurisdiction can be inferred from the lease and a specific statute applies, you may append it in the explanation field (e.g., "Cal. Civ. Code § 1950.5", "NY RPL § 235-b"). Do NOT fabricate statute citations; omit entirely if jurisdiction is unknown or the specific law is uncertain.`,
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

    const { tool, input } = await req.json();
    if (!tool || !input) return NextResponse.json({ error: "Missing tool or input" }, { status: 400 });

    const systemPrompt = TOOL_PROMPTS[tool];
    if (!systemPrompt) return NextResponse.json({ error: "Unknown tool" }, { status: 400 });

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20251022",
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: "user", content: input.slice(0, CHAR_LIMIT) }],
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