"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";

// ── Interfaces ────────────────────────────────────────────────────────────────

interface IngredientFlag {
  ingredient: string;
  alsoKnownAs?: string[];
  purpose?: string;
  severity: "danger" | "warning" | "info" | "safe";
  ewgScore?: string;
  concerns?: string[];
  explanation: string;
  citation?: string;
}

interface SpecialConsiderations {
  pregnancySafe: "yes" | "no" | "caution" | "unknown";
  pregnancyNotes?: string;
  sensitiveSkin: "yes" | "no" | "caution" | "unknown";
  fragranceFree: "yes" | "no" | "claims but contains masking fragrance";
  comedogenicRisk: "low" | "moderate" | "high";
  allergenAlerts?: string[];
}

interface ClaimsCheck {
  claim: string;
  verified: "yes" | "partial" | "misleading";
  explanation: string;
}

interface Result {
  score: number;
  grade: string;
  productType: string;
  summary: string;
  flags: IngredientFlag[];
  specialConsiderations: SpecialConsiderations;
  claimsCheck?: ClaimsCheck[];
  topConcerns?: string[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CHAR_LIMIT = 24000;
const FILE_SIZE_LIMIT = 10 * 1024 * 1024;

const GRADE_COLORS: Record<string, string> = {
  A: "bg-green-600",
  B: "bg-yellow-600",
  C: "bg-orange-600",
  D: "bg-red-600",
  F: "bg-red-800",
};

const SEVERITY_STYLES: Record<string, { bg: string; border: string; icon: string }> = {
  danger: { bg: "bg-red-500/10", border: "border-l-red-500", icon: "🔴" },
  warning: { bg: "bg-yellow-500/10", border: "border-l-yellow-500", icon: "🟡" },
  info: { bg: "bg-blue-500/10", border: "border-l-blue-500", icon: "🔵" },
  safe: { bg: "bg-green-500/10", border: "border-l-green-500", icon: "✅" },
};

// EWG 1-2=green, 3-6=yellow, 7-10=red
function ewgColor(score: string): string {
  const n = parseInt(score, 10);
  if (isNaN(n)) return "bg-border text-muted";
  if (n <= 2) return "bg-green-500/20 text-green-400";
  if (n <= 6) return "bg-yellow-500/20 text-yellow-400";
  return "bg-red-500/20 text-red-400";
}

const SAFETY_PILL: Record<string, { label: string; style: string }> = {
  yes: { label: "Yes", style: "bg-green-500/10 border-green-500/20 text-green-400" },
  no: { label: "No", style: "bg-red-500/10 border-red-500/20 text-red-400" },
  caution: { label: "Caution", style: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" },
  unknown: { label: "Unknown", style: "bg-border text-muted border-border" },
};

const RISK_PILL: Record<string, string> = {
  low: "bg-green-500/10 border-green-500/20 text-green-400",
  moderate: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
  high: "bg-red-500/10 border-red-500/20 text-red-400",
};

const VERIFIED_STYLES: Record<string, { icon: string; style: string }> = {
  yes: { icon: "✅", style: "text-green-400" },
  partial: { icon: "⚠️", style: "text-yellow-400" },
  misleading: { icon: "❌", style: "text-red-400" },
};

const SEVERITY_ORDER = { danger: 0, warning: 1, info: 2, safe: 3 };

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CosmeticIngredientClient() {
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [showSafe, setShowSafe] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasInput = !!file || !!input.trim();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (!f) return;
    if (f.size > FILE_SIZE_LIMIT) {
      setError("File too large. Max 10MB.");
      e.target.value = "";
      return;
    }
    setFile(f);
    setError("");
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const analyze = async () => {
    if (!hasInput) return;
    setLoading(true);
    setError("");
    setResult(null);
    setShowSafe(false);

    try {
      let res: Response;
      if (file) {
        const formData = new FormData();
        formData.append("tool", "cosmetic-ingredient-scanner");
        formData.append("input", input);
        formData.append("file", file);
        res = await fetch("/api/analyze", { method: "POST", body: formData });
      } else {
        res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tool: "cosmetic-ingredient-scanner", input }),
        });
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Sort flags: danger → warning → info → safe
  const sortedFlags = result
    ? [...result.flags].sort(
        (a, b) =>
          (SEVERITY_ORDER[a.severity] ?? 4) - (SEVERITY_ORDER[b.severity] ?? 4)
      )
    : [];

  const visibleFlags = showSafe
    ? sortedFlags
    : sortedFlags.filter((f) => f.severity !== "safe");

  const safeCount = sortedFlags.filter((f) => f.severity === "safe").length;
  const flaggedCount = sortedFlags.filter((f) => f.severity !== "safe").length;

  return (
    <div className="max-w-[720px] mx-auto px-6 py-10">
      <Link
        href="/"
        className="text-accent font-mono text-sm no-underline hover:underline mb-6 inline-block"
      >
        ← Back to all tools
      </Link>

      <div className="flex items-center gap-3.5 mb-2">
        <span className="text-4xl">🧴</span>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-[var(--text)]">
          Cosmetic Ingredient Scanner
        </h1>
      </div>
      <p className="text-muted text-sm leading-relaxed mb-7">
        Paste an ingredient list or upload a product label photo. Get EWG-style concern scores,
        pregnancy safety flags, fragrance-free verification, and plain-English explanations for
        every ingredient — in seconds.
      </p>

      <AdSlot size="leaderboard" className="mb-6" />

      {/* Text input */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={
          file
            ? "Optional: add product name or brand for context…"
            : "Paste the full ingredient list here (INCI names)...\n\nExample: Water, Glycerin, Niacinamide, Dimethicone, Cyclopentasiloxane, Fragrance..."
        }
        rows={6}
        className="w-full bg-surface border border-border rounded-xl p-4 text-[var(--text)] font-mono text-sm resize-y outline-none focus:border-accent transition-colors"
      />

      {!file && (
        <div className="flex items-center justify-between mt-2 mb-1">
          <span
            className={`text-xs font-mono ${
              input.length > CHAR_LIMIT ? "text-red-400" : "text-muted"
            }`}
          >
            {input.length.toLocaleString()} / {CHAR_LIMIT.toLocaleString()} chars
          </span>
        </div>
      )}

      {!file && input.length > CHAR_LIMIT && (
        <div className="mb-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-sm">
          ⚠️ Your input is too long — only the first {CHAR_LIMIT.toLocaleString()} characters will
          be analyzed.
        </div>
      )}

      {/* File upload — all formats including photos */}
      <div className="mt-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.png,.jpg,.jpeg,.webp,image/*,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={handleFileChange}
        />
        {!file ? (
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-muted text-sm hover:border-accent hover:text-accent transition-colors w-full justify-center"
            >
              📸 Or upload a label photo (PNG, JPG, WEBP, PDF, DOCX)
            </button>
            <p className="mt-1.5 text-muted text-xs text-center">
              📱 Snap a photo of the back of the bottle — our AI reads the ingredient list
              directly.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/5 border border-accent/30">
            <span className="text-lg">
              {file.type.startsWith("image/") ? "📷" : "📄"}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[var(--text)] font-mono truncate">{file.name}</p>
              <p className="text-xs text-muted">{formatBytes(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="text-xs text-muted hover:text-red-400 transition-colors whitespace-nowrap"
            >
              ✕ Remove
            </button>
          </div>
        )}
      </div>

      <button
        onClick={analyze}
        disabled={loading || !hasInput}
        className={`mt-4 px-8 py-3 rounded-lg font-heading font-semibold text-sm transition-all ${
          loading || !hasInput
            ? "bg-border text-muted cursor-not-allowed"
            : "bg-accent text-white hover:brightness-110 cursor-pointer"
        }`}
      >
        {loading
          ? "Analyzing..."
          : file
          ? "Scan Label"
          : "Scan Ingredients"}
      </button>

      <p className="mt-2 text-muted text-xs">
        🔒 Your input is processed and discarded — we never store your data.
      </p>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* ── Results ── */}
      {result && (
        <div className="mt-7 bg-surface border border-border rounded-2xl p-7 animate-fade-up">
          {/* Header: grade circle + product type + score */}
          <div className="flex items-center gap-5 mb-5">
            <div
              className={`w-[72px] h-[72px] rounded-full ${
                GRADE_COLORS[result.grade] || "bg-gray-600"
              } flex flex-col items-center justify-center shrink-0`}
            >
              <span className="text-white font-extrabold text-2xl font-heading">
                {result.grade}
              </span>
              <span className="text-white/70 text-[11px]">{result.score}/100</span>
            </div>
            <div className="min-w-0">
              {result.productType && (
                <p className="text-xs font-mono text-muted mb-0.5 capitalize">
                  {result.productType}
                </p>
              )}
              <h3 className="font-heading text-lg text-[var(--text)]">
                Safety Score: {result.score}/100
              </h3>
              <p className="text-muted text-xs mt-1">
                Based on EWG Skin Deep data, dermatology research, and FDA cosmetic regulations
              </p>
            </div>
          </div>

          {/* Summary */}
          {result.summary && (
            <div className="mb-5 p-4 rounded-xl bg-accent/5 border border-accent/20">
              <p className="text-[var(--text)] text-sm leading-relaxed">{result.summary}</p>
            </div>
          )}

          {/* Top Concerns chips */}
          {(result.topConcerns?.length ?? 0) > 0 && (
            <div className="mb-5">
              <p className="text-xs font-mono text-muted mb-2">Top ingredients to know about:</p>
              <div className="flex flex-wrap gap-1.5">
                {result.topConcerns!.map((c, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-xs font-mono"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Ingredient flags */}
          {sortedFlags.length > 0 && (
            <div className="mb-5">
              <h4 className="font-heading text-sm font-semibold text-[var(--text)] mb-3">
                Ingredient Analysis{" "}
                <span className="text-muted font-normal">
                  ({flaggedCount} flagged
                  {safeCount > 0 ? `, ${safeCount} clean` : ""})
                </span>
              </h4>

              {visibleFlags.map((flag, i) => {
                const s = SEVERITY_STYLES[flag.severity] || SEVERITY_STYLES.info;
                return (
                  <div
                    key={i}
                    className={`mb-3 p-4 rounded-xl ${s.bg} border-l-[3px] ${s.border}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-base shrink-0 mt-0.5">{s.icon}</span>
                      <div className="flex-1 min-w-0">
                        {/* Ingredient name + aliases + EWG score */}
                        <div className="flex items-baseline gap-2 flex-wrap mb-1">
                          <span className="font-mono text-sm font-semibold text-[var(--text)]">
                            {flag.ingredient}
                          </span>
                          {(flag.alsoKnownAs?.length ?? 0) > 0 && (
                            <span className="text-xs text-muted italic">
                              ({flag.alsoKnownAs!.join(", ")})
                            </span>
                          )}
                          {flag.ewgScore && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-xs font-mono font-semibold ${ewgColor(
                                flag.ewgScore
                              )}`}
                            >
                              EWG {flag.ewgScore}
                            </span>
                          )}
                        </div>
                        {/* Purpose */}
                        {flag.purpose && (
                          <p className="text-xs text-muted mb-1.5">
                            Role:{" "}
                            <span className="text-[var(--text)]">{flag.purpose}</span>
                          </p>
                        )}
                        {/* Explanation */}
                        <p className="text-[var(--text)] text-sm leading-relaxed">
                          {flag.explanation}
                        </p>
                        {/* Concerns chips */}
                        {(flag.concerns?.length ?? 0) > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {flag.concerns!.map((c, j) => (
                              <span
                                key={j}
                                className="px-2 py-0.5 rounded-full bg-surface border border-border text-muted text-xs font-mono"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        )}
                        {/* Citation */}
                        {flag.citation && (
                          <p className="text-xs text-muted italic mt-2">
                            Source: {flag.citation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Show / hide safe ingredients toggle */}
              {safeCount > 0 && (
                <button
                  onClick={() => setShowSafe(!showSafe)}
                  className="mt-1 text-xs font-mono text-accent hover:underline transition-colors"
                >
                  {showSafe
                    ? `▲ Hide ${safeCount} clean ingredient${safeCount !== 1 ? "s" : ""}`
                    : `▼ Show ${safeCount} clean ingredient${safeCount !== 1 ? "s" : ""} with no concerns`}
                </button>
              )}
            </div>
          )}

          {/* Special Considerations */}
          {result.specialConsiderations && (
            <div className="mb-5 pt-5 border-t border-border">
              <h4 className="font-heading text-sm font-semibold text-[var(--text)] mb-3">
                Special Considerations
              </h4>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {(
                  [
                    { key: "pregnancySafe", label: "Pregnancy Safe" },
                    { key: "sensitiveSkin", label: "Sensitive Skin" },
                  ] as const
                ).map(({ key, label }) => {
                  const val = result.specialConsiderations[key] as string;
                  const pill = SAFETY_PILL[val] || SAFETY_PILL.unknown;
                  return (
                    <div
                      key={key}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl border ${pill.style}`}
                    >
                      <span className="text-xs font-mono">{label}</span>
                      <span className="text-xs font-semibold font-mono">{pill.label}</span>
                    </div>
                  );
                })}
                <div
                  className={`flex items-center justify-between px-3 py-2 rounded-xl border ${
                    RISK_PILL[result.specialConsiderations.comedogenicRisk] || ""
                  }`}
                >
                  <span className="text-xs font-mono">Comedogenic Risk</span>
                  <span className="text-xs font-semibold font-mono capitalize">
                    {result.specialConsiderations.comedogenicRisk}
                  </span>
                </div>
                <div
                  className={`flex items-center justify-between px-3 py-2 rounded-xl border ${
                    result.specialConsiderations.fragranceFree === "yes"
                      ? RISK_PILL.low
                      : result.specialConsiderations.fragranceFree ===
                        "claims but contains masking fragrance"
                      ? RISK_PILL.high
                      : RISK_PILL.moderate
                  }`}
                >
                  <span className="text-xs font-mono">Fragrance-Free</span>
                  <span className="text-xs font-semibold font-mono capitalize">
                    {result.specialConsiderations.fragranceFree === "yes"
                      ? "Yes"
                      : result.specialConsiderations.fragranceFree === "no"
                      ? "No"
                      : "Misleading"}
                  </span>
                </div>
              </div>

              {/* Pregnancy notes */}
              {result.specialConsiderations.pregnancyNotes && (
                <div className="mb-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs leading-relaxed">
                  ⚠️ {result.specialConsiderations.pregnancyNotes}
                </div>
              )}

              {/* Allergen alerts */}
              {(result.specialConsiderations.allergenAlerts?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs font-mono text-muted mb-1.5">
                    Contact allergens detected:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.specialConsiderations.allergenAlerts!.map((a, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Claims Check */}
          {(result.claimsCheck?.length ?? 0) > 0 && (
            <div className="pt-5 border-t border-border">
              <h4 className="font-heading text-sm font-semibold text-[var(--text)] mb-3">
                Claims Check
              </h4>
              {result.claimsCheck!.map((claim, i) => {
                const v = VERIFIED_STYLES[claim.verified] || VERIFIED_STYLES.partial;
                return (
                  <div
                    key={i}
                    className="mb-2 p-3 rounded-xl bg-surface border border-border"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{v.icon}</span>
                      <span
                        className={`font-mono text-sm font-semibold capitalize ${v.style}`}
                      >
                        &ldquo;{claim.claim}&rdquo;
                      </span>
                      <span className="text-xs text-muted font-mono ml-auto capitalize">
                        {claim.verified}
                      </span>
                    </div>
                    <p className="text-muted text-xs leading-relaxed ml-6">
                      {claim.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          <AdSlot size="rectangle" className="mt-6" />
        </div>
      )}

      {/* SEO content */}
      <section className="mt-14 border-t border-border pt-10">
        <h2 className="font-display text-2xl text-[var(--text)] mb-3">
          How the Cosmetic Ingredient Scanner works
        </h2>
        <p className="text-muted text-sm leading-relaxed mb-4">
          Paste any INCI ingredient list or snap a photo of the back of the bottle and upload it.
          Our AI identifies every ingredient by its INCI name, cross-references EWG Skin Deep
          concern levels (1–10), and flags known endocrine disruptors, contact allergens, pregnancy
          risks, and comedogenic ingredients in plain English. It also verifies marketing claims like
          &ldquo;natural,&rdquo; &ldquo;clean,&rdquo; and &ldquo;fragrance-free&rdquo; against
          what&apos;s actually in the formula — since these terms have no legal definition under FDA
          cosmetic regulations (21 CFR Part 700).
        </p>
        <h3 className="font-heading text-sm font-semibold text-[var(--text)] mb-2">
          What the safety grades mean
        </h3>
        <p className="text-muted text-sm leading-relaxed mb-4">
          Products scoring 90–100 (A grade) contain mostly low-concern ingredients with no
          significant red flags. Scores of 70–89 (B) indicate minor concerns worth knowing.
          Scores of 50–69 (C) indicate moderate concerns you may want to research further.
          Below 50 indicates ingredients with more significant safety concerns documented in
          dermatology literature or EWG&apos;s Skin Deep database.
        </p>
        <p className="text-muted text-xs leading-relaxed italic">
          Disclaimer: This tool provides general ingredient information and is not medical or
          dermatological advice. Individual sensitivities vary. Consult a dermatologist or
          your healthcare provider before making skincare decisions based on health conditions,
          allergies, or pregnancy.
        </p>
      </section>
    </div>
  );
}
