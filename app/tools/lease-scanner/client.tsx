"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";

interface Flag {
  severity: "danger" | "warning" | "info";
  clause: string;
  explanation: string;
  suggestion: string;
}

interface Result {
  score: number;
  grade: string;
  flags: Flag[];
  missingProtections: string[];
  summary: string;
}

const SEV = {
  danger: { bg: "bg-red-500/10", border: "border-l-red-500", icon: "🔴", label: "Red Flag" },
  warning: { bg: "bg-yellow-500/10", border: "border-l-yellow-500", icon: "🟡", label: "Caution" },
  info: { bg: "bg-blue-500/10", border: "border-l-blue-500", icon: "🔵", label: "Note" },
};

const GRADE_COLORS: Record<string, string> = {
  A: "bg-green-600", B: "bg-yellow-600", C: "bg-orange-600", D: "bg-red-600", F: "bg-red-800",
};

const CHAR_LIMIT = 24000;
const FILE_SIZE_LIMIT = 10 * 1024 * 1024;

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming", "District of Columbia",
  "Other / I don't know",
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function LeaseClient() {
  const [input, setInput] = useState("");
  const [state, setState] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasLeaseInput = !!file || !!input.trim();
  const canSubmit = !loading && hasLeaseInput && !!state;

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
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      let res: Response;
      if (file) {
        const formData = new FormData();
        formData.append("tool", "lease-scanner");
        formData.append("input", input);
        formData.append("file", file);
        formData.append("state", state);
        res = await fetch("/api/analyze", { method: "POST", body: formData });
      } else {
        res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tool: "lease-scanner", input, state }),
        });
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[720px] mx-auto px-6 py-10">
      <Link href="/" className="text-accent font-mono text-sm no-underline hover:underline mb-6 inline-block">
        ← Back to all tools
      </Link>

      <div className="flex items-center gap-3.5 mb-2">
        <span className="text-4xl">🔍</span>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-[var(--text)]">Lease Red Flag Scanner</h1>
      </div>
      <p className="text-muted text-sm leading-relaxed mb-7">
        Upload your lease PDF or paste the text below. Our AI identifies unfair clauses,
        hidden fees, missing protections, and anything you should negotiate — explained
        in plain English with state-specific tenant law references.
      </p>

      <AdSlot size="leaderboard" className="mb-6" />

      {/* State selector — required */}
      <div className="mb-5">
        <label htmlFor="state-select" className="block font-heading text-sm font-semibold text-[var(--text)] mb-1">
          Which state is this lease for? <span className="text-red-400">*</span>
        </label>
        <select
          id="state-select"
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-accent transition-colors appearance-none cursor-pointer"
        >
          <option value="" disabled>Select a state…</option>
          {US_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {!state && (
          <p className="mt-1 text-muted text-xs">State is required — tenant law varies significantly by jurisdiction.</p>
        )}
      </div>

      {/* Lease text input — optional when file is uploaded */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={
          file
            ? "Optional: add clause numbers or sections you're most concerned about…"
            : "Paste your lease or rental agreement text here..."
        }
        rows={12}
        className="w-full bg-surface border border-border rounded-xl p-4 text-[var(--text)] font-mono text-sm resize-y outline-none focus:border-accent transition-colors"
      />

      {!file && (
        <div className="flex items-center justify-between mt-2 mb-1">
          <span className={`text-xs font-mono ${input.length > CHAR_LIMIT ? "text-red-400" : "text-muted"}`}>
            {input.length.toLocaleString()} / {CHAR_LIMIT.toLocaleString()} chars
          </span>
        </div>
      )}

      {!file && input.length > CHAR_LIMIT && (
        <div className="mb-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-sm">
          ⚠️ Your lease is too long — only the first {CHAR_LIMIT.toLocaleString()} characters will be reviewed.
          Consider splitting it into sections or reviewing the most critical clauses first.
        </div>
      )}

      {/* File upload */}
      <div className="mt-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
              📎 Or upload a file (PDF, DOCX)
            </button>
            <p className="mt-1.5 text-muted text-xs text-center">
              📄 Upload your lease as PDF, or paste the text. Long leases (10+ pages) are fully supported.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/5 border border-accent/30">
            <span className="text-lg">📄</span>
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

      {!loading && !canSubmit && (
        !state
          ? <p className="mt-4 text-yellow-400 text-sm">⚠️ Select a state first to enable scanning.</p>
          : !hasLeaseInput && <p className="mt-4 text-yellow-400 text-sm">⚠️ Paste lease text or upload a file to scan.</p>
      )}

      <button
        onClick={analyze}
        disabled={!canSubmit}
        className={`mt-3 px-8 py-3 rounded-lg font-heading font-semibold text-sm transition-all ${
          !canSubmit
            ? "bg-border text-muted cursor-not-allowed"
            : "bg-accent text-white hover:brightness-110 cursor-pointer"
        }`}
      >
        {loading ? "Scanning..." : file ? "Scan File" : "Scan for Red Flags"}
      </button>

      <p className="mt-2 text-muted text-xs">🔒 Your input is processed and discarded — we never store your data.</p>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
      )}

      {result && (
        <div className="mt-7 bg-surface border border-border rounded-2xl p-7 animate-fade-up">
          <div className="flex items-center gap-5 mb-6">
            <div className={`w-[72px] h-[72px] rounded-full ${GRADE_COLORS[result.grade] || "bg-gray-600"} flex flex-col items-center justify-center`}>
              <span className="text-white font-extrabold text-2xl font-heading">{result.grade}</span>
              <span className="text-white/70 text-[11px]">{result.score}/100</span>
            </div>
            <div>
              <h3 className="font-heading text-lg text-[var(--text)]">Fairness Score: {result.score}/100</h3>
              <p className="text-muted text-xs mt-1">{result.flags.length} issues found · {state} law applied</p>
            </div>
          </div>

          {/* Flags */}
          {result.flags.map((f, i) => {
            const s = SEV[f.severity];
            return (
              <div key={i} className={`p-4 mb-3 rounded-lg ${s.bg} border-l-[3px] ${s.border}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm">{s.icon}</span>
                  <span className="font-heading text-xs font-semibold text-[var(--text)] uppercase tracking-wide">{s.label}</span>
                </div>
                <p className="text-[var(--text)] text-sm leading-relaxed mb-1.5 font-mono text-xs opacity-80">
                  &ldquo;{f.clause}&rdquo;
                </p>
                <p className="text-[var(--text)] text-sm leading-relaxed mb-1">{f.explanation}</p>
                <p className="text-accent text-xs font-mono">💡 {f.suggestion}</p>
              </div>
            );
          })}

          {/* Missing protections */}
          {result.missingProtections?.length > 0 && (
            <div className="mt-4">
              <h4 className="font-heading text-sm font-semibold text-[var(--text)] mb-2">Missing Protections</h4>
              {result.missingProtections.map((p, i) => (
                <div key={i} className="flex items-start gap-2 p-2 mb-1.5 rounded bg-yellow-500/5">
                  <span className="text-sm">⚠️</span>
                  <span className="text-muted text-sm">{p}</span>
                </div>
              ))}
            </div>
          )}

          <p className="text-muted text-sm leading-relaxed mt-5">{result.summary}</p>
          <AdSlot size="rectangle" className="mt-5" />
        </div>
      )}

      <section className="mt-14 border-t border-border pt-10">
        <h2 className="font-display text-2xl text-[var(--text)] mb-3">How the Lease Scanner works</h2>
        <p className="text-muted text-sm leading-relaxed mb-4">
          Upload your lease PDF or paste the text — our AI handles both. Long leases of 10+
          pages are fully supported via PDF upload. Select your state to get jurisdiction-aware
          analysis — whether that&apos;s California&apos;s deposit caps, New York&apos;s entry notice
          requirements, New Jersey&apos;s deposit interest rules, or Texas&apos;s return deadlines.
          Each red flag is cited to the applicable statute so you can verify it yourself.
        </p>
        <p className="text-muted text-xs leading-relaxed italic">
          Disclaimer: This tool provides informational guidance only and is not legal advice.
          Lease laws vary by state and locality. Consult a tenant rights organization or
          attorney for advice specific to your situation.
        </p>
      </section>
    </div>
  );
}
