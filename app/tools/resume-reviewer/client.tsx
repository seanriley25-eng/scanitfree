"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";

interface Section {
  name: string;
  score: number;
  feedback: string;
}

interface KeywordGap {
  inferredRole?: string;
  missingKeywords: string[];
  strongOverlaps: string[];
  toneAlignment: string;
  rewriteHints: string[];
}

interface Result {
  score: number;
  grade: string;
  sections: Section[];
  atsScore: number;
  topIssues: string[];
  summary: string;
  keywordGap?: KeywordGap;
}

const GRADE_COLORS: Record<string, string> = {
  A: "bg-green-600", B: "bg-yellow-600", C: "bg-orange-600", D: "bg-red-600", F: "bg-red-800",
};

const CHAR_LIMIT = 24000;
const JD_CHAR_LIMIT = 8000;
const FILE_SIZE_LIMIT = 10 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ResumeClient() {
  const [input, setInput] = useState("");
  const [jd, setJd] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasResumeInput = !!file || !!input.trim();

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
    if (!hasResumeInput) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      let res: Response;
      if (file) {
        const formData = new FormData();
        formData.append("tool", "resume-reviewer");
        formData.append("input", input);
        formData.append("file", file);
        if (jd.trim()) formData.append("jd", jd.trim());
        res = await fetch("/api/analyze", { method: "POST", body: formData });
      } else {
        res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tool: "resume-reviewer", input, jd: jd.trim() || undefined }),
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
        <span className="text-4xl">📄</span>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-[var(--text)]">Resume Reviewer</h1>
      </div>
      <p className="text-muted text-sm leading-relaxed mb-7">
        Upload your resume as PDF or DOCX, or paste the text below. Add a job description
        for targeted ATS keyword matching against that specific role.
      </p>

      <AdSlot size="leaderboard" className="mb-6" />

      {/* Resume text input — optional when file is uploaded */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={
          file
            ? "Optional: paste additional context or a cover letter here…"
            : "Paste your full resume text here..."
        }
        rows={10}
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
          ⚠️ Your resume is too long — only the first {CHAR_LIMIT.toLocaleString()} characters will be reviewed.
          Consider removing non-essential sections or splitting into multiple scans.
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
              💡 Upload your resume as PDF or DOCX, or paste the text above.
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

      {/* Optional JD textarea */}
      <div className="mt-5">
        <label className="block font-heading text-sm font-semibold text-[var(--text)] mb-1">
          Paste a job description <span className="text-muted font-normal">(optional)</span> — get tailored feedback against this role
        </label>
        <p className="text-muted text-xs mb-2">
          Leave blank for general feedback. Paste a JD for ATS keyword matching against that specific role.
        </p>
        <textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          placeholder="Paste the full job description here..."
          rows={6}
          className="w-full bg-surface border border-border rounded-xl p-4 text-[var(--text)] font-mono text-sm resize-y outline-none focus:border-accent transition-colors"
        />
        <div className="flex items-center justify-between mt-2 mb-1">
          <span className={`text-xs font-mono ${jd.length > JD_CHAR_LIMIT ? "text-red-400" : "text-muted"}`}>
            {jd.length.toLocaleString()} / {JD_CHAR_LIMIT.toLocaleString()} chars
          </span>
        </div>
        {jd.length > JD_CHAR_LIMIT && (
          <div className="mb-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-sm">
            ⚠️ Job description is too long — only the first {JD_CHAR_LIMIT.toLocaleString()} characters will be used.
          </div>
        )}
      </div>

      <button
        onClick={analyze}
        disabled={loading || !hasResumeInput}
        className={`mt-4 px-8 py-3 rounded-lg font-heading font-semibold text-sm transition-all ${
          loading || !hasResumeInput
            ? "bg-border text-muted cursor-not-allowed"
            : "bg-accent text-white hover:brightness-110 cursor-pointer"
        }`}
      >
        {loading
          ? "Reviewing..."
          : file
          ? jd.trim() ? "Scan File Against This JD" : "Scan File"
          : jd.trim() ? "Review Against This JD" : "Review My Resume"}
      </button>

      <p className="mt-2 text-muted text-xs">🔒 Your input is processed and discarded — we never store your data.</p>

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

          {/* Keyword gap / JD match section */}
          {result.keywordGap && (
            <div className="mt-5 pt-5 border-t border-border">
              <h4 className="font-heading text-sm font-semibold text-[var(--text)] mb-1">
                {result.keywordGap.inferredRole
                  ? `Missing Keywords for ${result.keywordGap.inferredRole} Roles`
                  : "Match Against This Role"}
              </h4>

              {result.keywordGap.inferredRole && (
                <p className="text-muted text-xs mb-3 italic">
                  💡 We inferred you&apos;re targeting <strong className="text-[var(--text)]">{result.keywordGap.inferredRole}</strong> roles.
                  Paste a specific JD above for more targeted keyword matching.
                </p>
              )}

              {result.keywordGap.missingKeywords?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-mono text-muted mb-1.5">Missing keywords:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.keywordGap.missingKeywords.map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.keywordGap.strongOverlaps?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-mono text-muted mb-1.5">Strong matches:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.keywordGap.strongOverlaps.map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-mono">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.keywordGap.toneAlignment && (
                <p className="text-muted text-sm leading-relaxed mb-3">{result.keywordGap.toneAlignment}</p>
              )}

              {result.keywordGap.rewriteHints?.length > 0 && (
                <div>
                  <p className="text-xs font-mono text-muted mb-1.5">Bullet rewrite opportunities (diagnosis only):</p>
                  {result.keywordGap.rewriteHints.map((hint, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 mb-1.5 rounded-lg bg-accent/5 border-l-[3px] border-l-accent">
                      <span className="text-sm">🎯</span>
                      <span className="text-[var(--text)] text-sm leading-relaxed">{hint}</span>
                    </div>
                  ))}
                </div>
              )}
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
          Upload your resume as a PDF or DOCX file, or paste the text directly. Our AI
          evaluates your resume against current hiring standards used by recruiters and
          applicant tracking systems (ATS). It scores your resume across multiple dimensions
          including formatting clarity, quantified achievements, keyword optimization, and
          overall narrative strength. Paste a job description to unlock ATS keyword match
          analysis — see exactly which keywords the role requires that your resume is missing,
          and which ones you already nail.
        </p>
        <p className="text-muted text-xs leading-relaxed italic">
          Disclaimer: This tool provides general resume feedback and is not a substitute for
          professional career counseling. Results may vary based on industry and role.
        </p>
      </section>
    </div>
  );
}
