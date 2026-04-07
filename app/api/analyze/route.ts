import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const apiKey = "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";
console.log("API key starts with:", apiKey.substring(0, 10), "length:", apiKey.length);
const client = new Anthropic({ apiKey });

const TOOL_PROMPTS: Record<string, string> = {
  "food-safety": `You are a food safety analyst. The user will provide a product name, ingredient list, or UPC code.

Analyze it and respond with ONLY valid JSON (no markdown, no backticks):
{
  "score": <number 0-100>,
  "grade": "<A/B/C/D/F>",
  "flags": [
    { "severity": "danger|warning|info", "text": "<specific concern with source>" }
  ],
  "summary": "<2-3 sentence plain-English summary of findings>"
}

Cross-reference your knowledge of:
- Recent FDA enforcement actions and recalls
- Known allergens and labeling requirements
- Controversial additives (artificial colors, preservatives, etc.)
- Nutritional concerns (excessive sodium, sugar, trans fats)

Be specific and cite real data when possible. If you don't have enough info, say so in the summary. Score: 90-100=A (very safe), 70-89=B (minor concerns), 50-69=C (moderate concerns), 30-49=D (significant concerns), 0-29=F (serious safety issues).`,

  "resume-reviewer": `You are an expert resume reviewer and hiring consultant. The user will paste their resume text.

Analyze it and respond with ONLY valid JSON (no markdown, no backticks):
{
  "score": <number 0-100>,
  "grade": "<A/B/C/D/F>",
  "sections": [
    { "name": "<section name>", "score": <0-100>, "feedback": "<specific actionable feedback>" }
  ],
  "atsScore": <number 0-100>,
  "topIssues": ["<issue 1>", "<issue 2>", "<issue 3>"],
  "summary": "<2-3 sentence overall assessment>"
}

Evaluate: formatting/readability, impact of bullet points (quantified achievements?), ATS keyword optimization, section completeness, grammar/consistency, and overall positioning. Be specific and actionable.`,

  "lease-scanner": `You are a tenant rights expert and lease analyst. The user will paste their lease or rental agreement text.

Analyze it and respond with ONLY valid JSON (no markdown, no backticks):
{
  "score": <number 0-100>,
  "grade": "<A/B/C/D/F>",
  "flags": [
    { "severity": "danger|warning|info", "clause": "<quoted clause or summary>", "explanation": "<plain-English explanation of why this matters>", "suggestion": "<what to negotiate or ask about>" }
  ],
  "missingProtections": ["<protection that should be in the lease but isn't>"],
  "summary": "<2-3 sentence overall assessment>"
}

Look for: excessive fees, unfair termination clauses, waived tenant rights, maintenance responsibilities shifted to tenant, unreasonable entry provisions, security deposit issues, hidden auto-renewal terms, and missing standard protections. Score 90-100=A (very fair), lower=more concerns. Be specific.`,
};

export async function POST(req: NextRequest) {
  try {
    const { tool, input } = await req.json();

    if (!tool || !input) {
      return NextResponse.json(
        { error: "Missing tool or input" },
        { status: 400 }
      );
    }

    const systemPrompt = TOOL_PROMPTS[tool];
    if (!systemPrompt) {
      return NextResponse.json(
        { error: "Unknown tool" },
        { status: 400 }
      );
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: "user", content: input.slice(0, 8000) }], // limit input size
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse JSON from response, stripping any markdown fencing
    const clean = text.replace(/```json\n?|```\n?/g, "").trim();
    const data = JSON.parse(clean);

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Analysis API error:", err);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
