"use client";

import { useState } from "react";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";

interface Section {
  name: string;
  score: number;
  feedback: string;
}

interface Result {
  score: number;
  grade: string;
  sections: Section[];
  atsScore: number;
  topIssues: string[];
  summary: string;
}

const GRADE_COLORS: Record<string, string> = {
  A: "bg-green-600", B: "bg-yellow-600", C: "bg-orange-600", D: "bg-red-600", F: "bg-red-800",
};

export function ResumeClient() {
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
        body: JSON.stringify({ tool: "resume-reviewer", input }),
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
        <span className="text-4xl">📄</span>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-[var(--text)]">Resume Reviewer</h1>
      </div>
      <p className="text-muted text-sm leading-relaxed mb-7">
        Paste your resume text below. Our AI evaluates formatting, impact, ATS compatibility,
        and overall positioning — then gives you specific, actionable feedback.
      </p>

      <AdSlot size="leaderboard" className="mb-6" />

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste your full resume text here..."
        rows={10}
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
        {loading ? "Reviewing..." : "Review My Resume"}
      </button>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
      )}

      {result && (
        <div className="mt-7 bg-surface border border-border rounded-2xl p-7 animate-fade-up">
          {/* Scores row */}
          <div className="flex items-center gap-6 mb-6">
            <div className={`w-[72px] h-[72px] rounded-full ${GRADE_COLORS[result.grade] || "bg-gray-600"} flex flex-col items-center justify-center`}>
              <span className="text-white font-extrabold text-2xl font-heading">{result.grade}</span>
              <span className="text-white/70 text-[11px]">{result.score}/100</span>
            </div>
            <div>
              <h3 className="font-heading text-lg text-[var(--text)]">Overall: {result.score}/100</h3>
              <p className="text-muted text-xs mt-1">ATS Compatibility: {result.atsScore}/100</p>
            </div>
          </div>

          {/* Top issues */}
          {result.topIssues?.length > 0 && (
            <div className="mb-5">
              <h4 className="font-heading text-sm font-semibold text-[var(--text)] mb-2">Top Issues to Fix</h4>
              {result.topIssues.map((issue, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 mb-2 rounded-lg bg-red-500/10 border-l-[3px] border-l-red-500">
                  <span className="text-base mt-0.5">🔴</span>
                  <span className="text-[var(--text)] text-sm leading-relaxed">{issue}</span>
                </div>
              ))}
            </div>
          )}

          {/* Section scores */}
          {result.sections?.length > 0 && (
            <div className="mb-5">
              <h4 className="font-heading text-sm font-semibold text-[var(--text)] mb-3">Section Breakdown</h4>
              {result.sections.map((s, i) => (
                <div key={i} className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-xs text-[var(--text)]">{s.name}</span>
                    <span className="font-mono text-xs text-muted">{s.score}/100</span>
                  </div>
                  <div className="w-full h-1.5 bg-border rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${s.score}%`,
                        background: s.score >= 80 ? "#16a34a" : s.score >= 60 ? "#ca8a04" : "#dc2626",
                      }}
                    />
                  </div>
                  <p className="text-muted text-xs leading-relaxed">{s.feedback}</p>
                </div>
              ))}
            </div>
          )}

          <p className="text-muted text-sm leading-relaxed mt-4">{result.summary}</p>
          <AdSlot size="rectangle" className="mt-5" />
        </div>
      )}

      {/* SEO content */}
      <section className="mt-14 border-t border-border pt-10">
        <h2 className="font-display text-2xl text-[var(--text)] mb-3">How the AI Resume Reviewer works</h2>
        <p className="text-muted text-sm leading-relaxed mb-4">
          Our AI resume reviewer evaluates your resume against current hiring standards used
          by recruiters and applicant tracking systems (ATS). It scores your resume across
          multiple dimensions including formatting clarity, quantified achievements, keyword
          optimization, and overall narrative strength. Each section receives individual
          feedback so you know exactly what to improve.
        </p>
        <p className="text-muted text-xs leading-relaxed italic">
          Disclaimer: This tool provides general resume feedback and is not a substitute for
          professional career counseling. Results may vary based on industry and role.
        </p>
      </section>
    </div>
  );
}
