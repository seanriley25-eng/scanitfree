import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { getRelevantRecalls, formatRecallsBlock } from "@/lib/openfda";

const API_KEY = process.env.ANTHROPIC_API_KEY || "";

const CHAR_LIMIT = 24000;
const PRIVACY_CHAR_LIMIT = 50000; // privacy policies can be very long
const FILE_TEXT_LIMIT = 50000;
const FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10 MB

const SUPPORTED_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const TOOL_PROMPTS: Record<string, string> = {
  "food-safety": `You are a food safety analyst. The user will provide a product name, ingredient list, UPC code, or an image/document of a food label. Analyze it and respond with ONLY valid JSON (no markdown, no backticks): {"score": <number 0-100>, "grade": "<A/B/C/D/F>", "flags": [{"severity": "danger|warning|info", "text": "<specific concern>"}], "summary": "<2-3 sentence summary>"}. Cross-reference your knowledge of: recent FDA enforcement actions and recalls, known allergens and labeling requirements, controversial additives (artificial colors, preservatives, etc.), nutritional concerns (excessive sodium, sugar, trans fats). Be specific. For each flag, append a source citation at the end of the text field ONLY when a real one applies — use real FDA recall numbers (e.g., "FDA Recall #F-1234-2024") or CFR regulation citations (e.g., "21 CFR 101.22"). Do NOT fabricate citations; skip the citation entirely if no real source can be cited. Score: 90-100=A (very safe), 70-89=B (minor concerns), 50-69=C (moderate concerns), 30-49=D (significant concerns), 0-29=F (serious safety issues). When an FDA_RECALLS block is present in the user message, treat it as live ground-truth data from the openFDA enforcement database — prioritize it over your training data. If the product matches a recall in the block, flag it as "danger" severity and cite the specific Recall # from the context. If recalls in the block are for related or similar products but not an exact match, include them as a separate "info" flag noting the related recent recalls. If no FDA_RECALLS block is provided, you may still reference historical recalls from your training data but treat them as "info" severity since they are not real-time verified.`,
  "resume-reviewer": `You are an expert resume reviewer. The user message contains a RESUME (text, PDF document, or image) and optionally a JOB DESCRIPTION section. Analyze and respond with ONLY valid JSON (no markdown, no backticks): {"score": <0-100>, "grade": "<A/B/C/D/F>", "sections": [{"name": "<section>", "score": <0-100>, "feedback": "<feedback>"}], "atsScore": <0-100>, "topIssues": ["<issue>"], "summary": "<2-3 sentences>", "keywordGap": {"inferredRole": "<string, only when no JD>", "missingKeywords": ["<keyword>"], "strongOverlaps": ["<keyword>"], "toneAlignment": "<1-2 sentences>", "rewriteHints": ["<hint>"]}}. Evaluate: formatting/readability, quantified achievements, ATS keyword optimization, section completeness, grammar/consistency, overall positioning. IF a JOB DESCRIPTION is present: perform a targeted ATS keyword match — missingKeywords: keywords the JD requires that the resume lacks; strongOverlaps: keywords well-matched in both; toneAlignment: assess seniority/tone fit; rewriteHints: 3-5 diagnostic observations about specific bullets (e.g. "Your AWS bullet lacks a quantified outcome; the JD emphasizes cost reduction") — observations only, do NOT write rewrites; omit inferredRole. IF no JOB DESCRIPTION: infer the likely target role from resume content — inferredRole: state that role; missingKeywords: 5-10 ATS-relevant keywords likely missing for that role; strongOverlaps: strong existing ATS keywords; toneAlignment: note that a JD would enable more targeted matching; rewriteHints: []. Where a well-known ATS standard directly supports feedback, you may append a brief citation. Do NOT fabricate citations.`,
  "cover-letter-reviewer": `You are an expert cover letter reviewer and career coach. The user message contains a COVER LETTER (text or PDF document) and optionally a JOB DESCRIPTION section. Analyze and respond with ONLY valid JSON (no markdown, no backticks): {"score": <0-100>, "grade": "<A/B/C/D/F>", "sections": [{"name": "Opening Hook", "score": <0-100>, "feedback": "<feedback>"}, {"name": "Body Paragraphs", "score": <0-100>, "feedback": "<feedback>"}, {"name": "Closing", "score": <0-100>, "feedback": "<feedback>"}, {"name": "Tone & Voice", "score": <0-100>, "feedback": "<feedback>"}], "lengthAssessment": "<too short|appropriate|too long>", "atsScore": <0-100>, "topIssues": ["<issue>"], "summary": "<2-3 sentences>", "matchAgainstRole": {"inferredRole": "<string, only when no JD provided>", "companyAlignment": "<string, only when JD provided>", "roleAlignment": "<string, only when JD provided>", "missingKeywords": ["<keyword>"], "strongOverlaps": ["<keyword>"], "rewriteHints": ["<diagnostic hint>"]}}. Evaluate: Opening Hook (strength, personalization, immediate value proposition), Body Paragraphs (evidence, quantified achievements, narrative coherence), Closing (call-to-action clarity, confidence, next-step specificity), Tone & Voice (professional register, enthusiasm-to-formality balance, authenticity). ATS score reflects keyword density, formatting clarity, and absence of tables or images. Ideal length is 250-400 words; flag as "too short" below 200 words or "too long" above 500. IF a JOB DESCRIPTION is present: companyAlignment — does the letter demonstrate knowledge of this company's context, values, or challenges; roleAlignment — does the seniority and tone match the level the JD targets; missingKeywords: keywords the JD emphasizes that are absent from the letter; strongOverlaps: keywords already well-represented in both; rewriteHints: 3-5 DIAGNOSTIC observations about specific sentences (e.g. "Your opening mentions 'excited to apply' generically; the JD emphasizes customer-obsession — consider grounding the hook in a specific customer-impact metric") — observations ONLY, do NOT rewrite sentences; omit inferredRole. IF no JOB DESCRIPTION: inferredRole — state the role the letter appears to target; missingKeywords: 5-8 ATS-relevant keywords commonly required for that role that the letter lacks; strongOverlaps: keywords already present; rewriteHints: []. Where a well-known hiring or career standard directly supports feedback, append a brief citation (e.g., "per LinkedIn Talent Insights 2024", "per Indeed Career Guide", "per SHRM cover letter standards") ONLY when a real source applies. Do NOT fabricate citations; skip entirely if uncertain.`,
  "cosmetic-ingredient-scanner": `You are a cosmetic ingredient analyst with expertise in INCI (International Nomenclature of Cosmetic Ingredients) names, dermatology, and cosmetic safety. The user will provide a cosmetic ingredient list (text) or an image/document of a product label. Analyze and respond with ONLY valid JSON (no markdown, no backticks): {"score": <0-100, 100=clean/safe, 0=many high-concern ingredients>, "grade": "<A/B/C/D/F>", "productType": "<inferred from ingredients: e.g. face wash, moisturizer, sunscreen, mascara, shampoo, body lotion>", "summary": "<2-3 sentence plain-English assessment>", "flags": [{"ingredient": "<INCI name as written>", "alsoKnownAs": ["<common name(s)>"], "purpose": "<what it does in the formula>", "severity": "danger|warning|info|safe", "ewgScore": "<1-10 if known from EWG Skin Deep database — omit field entirely if uncertain>", "concerns": ["<specific concerns: e.g. irritation, endocrine disruption, allergen, comedogenic, sensitizer>"], "explanation": "<plain English — empathetic tone, use 'worth knowing' and 'consider' rather than 'dangerous' unless severity is genuinely danger-level>", "citation": "<EWG Skin Deep, named peer-reviewed study, or 21 CFR cosmetic regulation — ONLY when real, do NOT fabricate; omit field if uncertain>"}], "specialConsiderations": {"pregnancySafe": "yes|no|caution|unknown", "pregnancyNotes": "<only when no or caution: which ingredients and why>", "sensitiveSkin": "yes|no|caution|unknown", "fragranceFree": "yes|no|claims but contains masking fragrance", "comedogenicRisk": "low|moderate|high", "allergenAlerts": ["<specific contact allergens present>"]}, "claimsCheck": [{"claim": "<e.g. natural, clean, paraben-free, fragrance-free>", "verified": "yes|partial|misleading", "explanation": "<why>"}], "topConcerns": ["<top 3-5 ingredient names the user should know about>"]}. Parse INCI names regardless of case, order, or line-break formatting. Include flagged ingredients in the flags array (use severity "safe" for notable ingredients with no concerns worth knowing). Score: 90-100=A (clean formulation, low concern), 70-89=B (minor concerns), 50-69=C (moderate concerns worth knowing), 30-49=D (significant concerns), 0-29=F (multiple high-concern ingredients). Pregnancy flags: retinol, retinyl palmitate, adapalene, tretinoin, salicylic acid >2%, hydroquinone, formaldehyde-releasers (DMDM Hydantoin, imidazolidinyl urea, quaternium-15), high-dose essential oils. Contact allergen alerts to surface: methylisothiazolinone (MI), methylchloroisothiazolinone (MCI), formaldehyde, fragrance/parfum, lanolin, balsam of Peru, paraphenylenediamine (PPD). Endocrine-disruptor candidates: parabens (especially butylparaben, propylparaben), phthalates (DBP, DEHP), oxybenzone, octinoxate, triclosan. Claims verification: "natural" has no legal cosmetic definition (21 CFR Part 700); "clean" is an unregulated marketing term; "fragrance-free" may still contain masking fragrances — check for linalool, limonene, citronellol, geraniol; "paraben-free" may use parabens-equivalent preservatives like phenoxyethanol. Cite EWG Skin Deep, real published research, or 21 CFR Part 700/720/740 cosmetic regulations when directly applicable. Do NOT fabricate citations; omit the citation field if uncertain.`,
  "privacy-policy-translator": `You are a privacy policy analyst who translates corporate legal language into plain English for everyday users. The user will provide a privacy policy document (text or PDF). Analyze it and respond with ONLY valid JSON (no markdown, no backticks): {"score": <0-100, higher=more privacy-friendly to users>, "grade": "<A/B/C/D/F>", "service": "<inferred company or product name from the policy; use 'Unknown' if not mentioned>", "summary": "<2-3 sentence plain-English summary of what this company actually does with user data, at an 8th-grade reading level>", "dataCollected": [{"category": "<e.g. Personal Information, Location Data, Browsing History, Financial Data>", "items": ["<specific data point>"], "concern": "low|medium|high"}], "dataShared": [{"with": "<e.g. Advertising Partners, Analytics Providers, Data Brokers, Government Agencies>", "purpose": "<plain-English explanation of why>", "concern": "low|medium|high"}], "userRights": {"canDelete": <boolean — true if policy grants right to delete personal data>, "canExport": <boolean — true if policy grants right to download/export data>, "canOptOut": <boolean — true if policy grants right to opt out of data sale or targeted ads>, "details": "<plain-English instructions for how to exercise these rights, or 'Not described in this policy' if absent>"}, "retention": "<plain-English: how long they keep your data and under what conditions — if vague, say so explicitly>", "jurisdiction": "<which privacy law(s) govern this policy: GDPR, CCPA, PIPEDA, LGPD, 'both GDPR and CCPA', or 'Not specified'>", "redFlags": [{"clause": "<verbatim excerpt or close paraphrase from the policy>", "explanation": "<plain English: what this means for the user and why it matters>", "severity": "danger|warning|info"}]}. Score: 90-100=A (strong user rights, minimal collection, no selling), 70-89=B (reasonable practices, minor concerns), 50-69=C (moderate concerns, some monetization), 30-49=D (significant issues, data heavily monetized), 0-29=F (serious violations: sells data, no rights, indefinite retention). Red flags to detect: vague "affiliates" or "partners" without naming them (warning→danger if selling); indefinite retention language like "as long as necessary" (warning); third-party ad networks and behavioral tracking (warning→danger); using user data to train AI/ML models without explicit opt-in (danger); sale of personal information without CCPA opt-out (danger); mandatory arbitration or class action waivers (warning); broad license grants over user content (warning); right to change policy without notifying users (warning); data collection from children under 13 (danger if no COPPA safeguards). Cite the specific section name or paragraph number when flagging a red flag. Cite applicable law when relevant: GDPR Art. 17 (erasure), Art. 20 (portability), Art. 7 (consent); CCPA § 1798.105 (delete), § 1798.120 (opt-out of sale), § 1798.110 (right to know); COPPA 16 CFR Part 312. Write all plain-English fields at an 8th-grade reading level. If the policy text appears truncated or incomplete, note this in the summary and analyze what is available. Do NOT fabricate company names, data practices, or policy clauses not present in the document.`,
  "lease-scanner": `You are a tenant rights expert with deep knowledge of landlord-tenant law across all 50 US states and DC. The user message begins with STATE/JURISDICTION followed by the lease text or document. Apply the laws of the stated jurisdiction and respond with ONLY valid JSON (no markdown, no backticks): {"score": <0-100>, "grade": "<A/B/C/D/F>", "flags": [{"severity": "danger|warning|info", "clause": "<clause>", "explanation": "<explanation>", "suggestion": "<suggestion>"}], "missingProtections": ["<item>"], "summary": "<2-3 sentences>"}. Apply state-specific tenant protection laws when flagging issues and cite the exact statute in the explanation where applicable. Key rules: CA — deposits ≤2× rent unfurnished (Cal. Civ. Code § 1950.5), 21-day return, 24h entry notice; NY — 14-day deposit return, deposit ≤1 month (NY RPL § 227-e), 24h entry notice required; TX — 30-day deposit return (TX Prop. Code § 92.101), no cap; NJ — deposit interest required (NJ Stat. § 46:8-19), 30-day return; FL — 15/30/60-day return windows (FL Stat. § 83.49); WA — 14-day move-in inspection required (RCW 59.18.260); IL — 30-day return, itemized statement required (765 ILCS 710); MA — deposits limited to 1 month, last month rent + deposit (M.G.L. c. 186 § 15B). For unlisted states apply URLTA principles. If state is "Other" or "Unknown" apply URLTA only and explicitly note in the summary that state-specific protections could not be verified. Do NOT fabricate statute citations; omit if specific law is uncertain.`,
};

/** Build a plain-text user message for the existing pasted-text path. */
function buildTextContent(
  tool: string,
  input: string,
  jd?: string,
  state?: string
): string {
  if (tool === "resume-reviewer" && jd?.trim()) {
    return `RESUME:\n${input.slice(0, CHAR_LIMIT)}\n\nJOB DESCRIPTION:\n${jd.trim().slice(0, 8000)}`;
  }
  if (tool === "cover-letter-reviewer" && jd?.trim()) {
    return `COVER LETTER:\n${input.slice(0, CHAR_LIMIT)}\n\nJOB DESCRIPTION:\n${jd.trim().slice(0, 8000)}`;
  }
  if (tool === "privacy-policy-translator") {
    return input.slice(0, PRIVACY_CHAR_LIMIT);
  }
  if (tool === "lease-scanner") {
    const jurisdiction = state?.trim() || "Other / Unknown";
    return `STATE/JURISDICTION: ${jurisdiction}\n\nLEASE TEXT:\n${input.slice(0, CHAR_LIMIT)}`;
  }
  return input.slice(0, CHAR_LIMIT);
}

/** Build the tool-specific text instruction appended after a file content block. */
function fileTextContext(tool: string, mimeType: string, jd?: string, state?: string): string {
  const docLabel = mimeType === "application/pdf" ? "document" : "image";
  if (tool === "cosmetic-ingredient-scanner") {
    return `Please analyze the cosmetic ingredient list or product label in the ${docLabel} above.`;
  }
  if (tool === "privacy-policy-translator") {
    return `Please analyze the privacy policy ${docLabel} above and translate it into plain English.`;
  }
  if (tool === "lease-scanner") {
    const jurisdiction = state?.trim() || "Other / Unknown";
    return `STATE/JURISDICTION: ${jurisdiction}\n\nPlease analyze the uploaded lease ${docLabel} above.`;
  }
  if (tool === "resume-reviewer" && jd?.trim()) {
    return `JOB DESCRIPTION:\n${jd.trim().slice(0, 8000)}\n\nPlease analyze the resume ${docLabel} above against this job description.`;
  }
  if (tool === "cover-letter-reviewer" && jd?.trim()) {
    return `JOB DESCRIPTION:\n${jd.trim().slice(0, 8000)}\n\nPlease analyze the cover letter ${docLabel} above against this job description.`;
  }
  return `Please analyze the uploaded ${docLabel} above.`;
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
          error: `Daily limit reached (15 free scans per day). Resets in ~${hoursLeft} hour${hoursLeft === 1 ? "" : "s"}. Bookmark us and come back tomorrow!`,
        },
        { status: 429 }
      );
    }

    const contentType = req.headers.get("content-type") || "";

    let tool: string;
    let jd: string | undefined;
    let state: string | undefined;
    // messageContent is either a plain string or an array of content blocks (PDF/image)
    let messageContent: string | object[];
    // OpenFDA recall fetch — started early, awaited before Anthropic call (food-safety only)
    let fdaPromise: ReturnType<typeof getRelevantRecalls> | null = null;

    // ── Multipart / file-upload path ───────────────────────────────────────────
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      tool = (formData.get("tool") as string) || "";
      const input = (formData.get("input") as string) || "";
      jd = (formData.get("jd") as string) || undefined;
      state = (formData.get("state") as string) || undefined;
      const file = formData.get("file") as File | null;

      if (!tool) {
        return NextResponse.json({ error: "Missing tool" }, { status: 400 });
      }
      if (!file && !input.trim()) {
        return NextResponse.json({ error: "Missing input or file" }, { status: 400 });
      }

      // Start openFDA fetch in parallel with file processing (food-safety only)
      if (tool === "food-safety") {
        fdaPromise = getRelevantRecalls(input);
      }

      if (file) {
        // ── File size guard ──────────────────────────────────────────────────
        if (file.size > FILE_SIZE_LIMIT) {
          return NextResponse.json(
            { error: "File too large. Max 10MB." },
            { status: 400 }
          );
        }

        const mimeType = file.type;

        if (!SUPPORTED_MIME_TYPES.has(mimeType)) {
          return NextResponse.json(
            { error: "Unsupported file type. We accept PDF, DOCX, PNG, JPG, WEBP." },
            { status: 400 }
          );
        }

        const bytes = await file.arrayBuffer();

        // ── DOCX: extract text, treat as pasted input ─────────────────────
        if (
          mimeType ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          const { default: mammoth } = await import("mammoth");
          const extracted = (
            await mammoth.extractRawText({ buffer: Buffer.from(bytes) })
          ).value.slice(0, FILE_TEXT_LIMIT);
          messageContent = buildTextContent(tool, extracted, jd, state);
        } else {
          // ── PDF or image: send as content blocks ──────────────────────────
          const base64 = Buffer.from(bytes).toString("base64");
          const blocks: object[] = [];

          if (mimeType === "application/pdf") {
            blocks.push({
              type: "document",
              source: { type: "base64", media_type: "application/pdf", data: base64 },
            });
          } else {
            blocks.push({
              type: "image",
              source: { type: "base64", media_type: mimeType, data: base64 },
            });
          }

          blocks.push({ type: "text", text: fileTextContext(tool, mimeType, jd, state) });
          messageContent = blocks;
        }
      } else {
        // File slot empty — fall through to text path
        messageContent = buildTextContent(tool, input, jd, state);
      }

    // ── Existing JSON path (no breaking change) ────────────────────────────────
    } else {
      const body = await req.json();
      tool = body.tool;
      const input: string = body.input;
      jd = body.jd;
      state = body.state;

      if (!tool || !input) {
        return NextResponse.json({ error: "Missing tool or input" }, { status: 400 });
      }

      // Start openFDA fetch in parallel with message assembly (food-safety only)
      if (tool === "food-safety") {
        fdaPromise = getRelevantRecalls(input);
      }

      messageContent = buildTextContent(tool, input, jd, state);
    }

    // ── Inject live FDA recall data into the Claude message (food-safety only) ──
    let fdaChecked = false;
    if (fdaPromise) {
      const { recalls, checked } = await fdaPromise;
      fdaChecked = checked;
      if (recalls.length > 0) {
        const recallBlock = formatRecallsBlock(recalls);
        if (typeof messageContent === "string") {
          messageContent = `${messageContent}\n\n${recallBlock}`;
        } else {
          (messageContent as object[]).push({ type: "text", text: recallBlock });
        }
      }
    }

    const systemPrompt = TOOL_PROMPTS[tool];
    if (!systemPrompt) {
      return NextResponse.json({ error: "Unknown tool" }, { status: 400 });
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
        messages: [{ role: "user", content: messageContent }],
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
      // fdaChecked: true means the openFDA live database was successfully queried
      return NextResponse.json({ ...parsed, fdaChecked });
    } catch {
      console.error("Parse error — raw response:", clean.slice(0, 500));
      return NextResponse.json(
        {
          error:
            "Analysis failed: parse_error. The AI returned an unexpected format — please try again.",
        },
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
