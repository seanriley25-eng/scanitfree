import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

const API_KEY = process.env.ANTHROPIC_API_KEY || "";

const TOOL_PROMPTS: Record<string, string> = {
  "food-safety": `You are a food safety analyst. The user will provide a product name, ingredient list, or UPC code. Analyze it and respond with ONLY valid JSON (no markdown, no backticks): {"score": <number 0-100>, "grade": "<A/B/C/D/F>", "flags": [{"severity": "danger|warning|info", "text": "<specific concern>"}], "summary": "<2-3 sentence summary>"}. Cross-reference your knowledge of: recent FDA enforcement actions and recalls, known allergens and labeling requirements, controversial additives (artificial colors, preservatives, etc.), nutritional concerns (excessive sodium, sugar, trans fats). Be specific and cite real data when possible. Score: 90-100=A (very safe), 70-89=B (minor concerns), 50-69=C (moderate concerns), 30-49=D (significant concerns), 0-29=F (serious safety issues).`,
  "resume-reviewer": `You are an expert resume reviewer. Analyze the resume and respond with ONLY valid JSON (no markdown, no backticks): {"score": <number 0-100>, "grade": "<A/B/C/D/F>", "sections": [{"name": "<section>", "score": <0-100>, "feedback": "<feedback>"}], "atsScore": <0-100>, "topIssues": ["<issue>"], "summary": "<2-3 sentences>"}. Evaluate: formatting/readability, quantified achievements, ATS keyword optimization, section completeness, grammar/consistency, and overall positioning. Be specific and actionable.`,
  "lease-scanner": `You are a tenant rights expert. Analyze the lease and respond with ONLY valid JSON (no markdown, no backticks): {"score": <number 0-100>, "grade": "<A/B/C/D/F>", "flags": [{"severity": "danger|warning|info", "clause": "<clause>", "explanation": "<explanation>", "suggestion": "<suggestion>"}], "missingProtections": ["<item>"], "summary": "<2-3 sentences>"}. Look for: excessive fees, unfair termination clauses, waived tenant rights, maintenance responsibilities shifted to tenant, unreasonable entry provisions, security deposit issues, hidden auto-renewal terms, and missing standard protections. Score 90-100=A (very fair), lower=more concerns. Be specific.`,
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
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: "user", content: input.slice(0, 8000) }],
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("API error:", JSON.stringify(data));
      return NextResponse.json({ error: "Analysis failed." }, { status: 500 });
    }

    const text = data.content?.[0]?.text || "";
    const clean = text.replace(/```json\n?|```\n?/g, "").trim();
    const parsed = JSON.parse(clean);
    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("Error:", err.message);
    return NextResponse.json({ error: "Analysis failed." }, { status: 500 });
  }
}