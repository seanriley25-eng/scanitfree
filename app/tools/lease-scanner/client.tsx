"use client";

import { useState } from "react";
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

export function LeaseClient() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "lease-scanner", input }),
      });
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
        Paste your lease or rental agreement below. Our AI identifies unfair clauses,
        hidden fees, missing protections, and anything you should negotiate — explained in plain English.
      </p>

      <AdSlot size="leaderboard" className="mb-6" />

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste your lease or rental agreement text here..."
        rows={12}
        className="w-full bg-surface border border-border rounded-xl p-4 text-[var(--text)] font-mono text-sm resize-y outline-none focus:border-accent transition-colors"
      />
      <button
        onClick={analyze}
        disabled={loading || !input.trim()}
        className={`mt-3 px-8 py-3 rounded-lg font-heading font-semibold text-sm transition-all ${
          loading || !input.trim()
            ? "bg-border text-muted cursor-not-allowed"
            : "bg-accent text-white hover:brightness-110 cursor-pointer"
        }`}
      >
        {loading ? "Scanning..." : "Scan for Red Flags"}
      </button>

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
              <p className="text-muted text-xs mt-1">{result.flags.length} issues found</p>
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
          Our AI analyzes your lease text against common tenant protection standards
          and flags clauses that may be unfair, unusual, or potentially unenforceable.
          It checks for excessive fees, unreasonable entry provisions, shifted maintenance
          responsibilities, waived tenant rights, and missing standard protections like
          proper notice periods and security deposit terms.
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
