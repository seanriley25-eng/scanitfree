"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";

// ── Interfaces ────────────────────────────────────────────────────────────────

interface DataCollectedItem {
  category: string;
  items: string[];
  concern: "low" | "medium" | "high";
}

interface DataSharedItem {
  with: string;
  purpose: string;
  concern: "low" | "medium" | "high";
}

interface UserRights {
  canDelete: boolean;
  canExport: boolean;
  canOptOut: boolean;
  details: string;
}

interface RedFlag {
  clause: string;
  explanation: string;
  severity: "danger" | "warning" | "info";
}

interface Result {
  score: number;
  grade: string;
  service: string;
  summary: string;
  dataCollected: DataCollectedItem[];
  dataShared: DataSharedItem[];
  userRights: UserRights;
  retention: string;
  jurisdiction: string;
  redFlags: RedFlag[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CHAR_LIMIT = 50000;
const FILE_SIZE_LIMIT = 10 * 1024 * 1024;

const GRADE_COLORS: Record<string, string> = {
  A: "bg-green-600",
  B: "bg-yellow-600",
  C: "bg-orange-600",
  D: "bg-red-600",
  F: "bg-red-800",
};

const CONCERN_STYLES: Record<string, string> = {
  low: "bg-green-500/10 border-green-500/20 text-green-400",
  medium: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
  high: "bg-red-500/10 border-red-500/20 text-red-400",
};

const SEVERITY_STYLES: Record<string, { border: string; icon: string; bg: string }> = {
  danger: { border: "border-l-red-500", icon: "🔴", bg: "bg-red-500/10" },
  warning: { border: "border-l-yellow-500", icon: "🟡", bg: "bg-yellow-500/10" },
  info: { border: "border-l-blue-500", icon: "🔵", bg: "bg-blue-500/10" },
};

type Tab = "flags" | "collected" | "shared" | "rights" | "details";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PrivacyPolicyClient() {
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("flags");
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
    try {
      let res: Response;
      if (file) {
        const formData = new FormData();
        formData.append("tool", "privacy-policy-translator");
        formData.append("input", input);
        formData.append("file", file);
        res = await fetch("/api/analyze", { method: "POST", body: formData });
      } else {
        res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tool: "privacy-policy-translator", input }),
        });
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      setActiveTab("flags");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Build tab labels with counts once we have a result
  const TABS: { id: Tab; label: string }[] = result
    ? [
        { id: "flags", label: `Red Flags (${result.redFlags?.length ?? 0})` },
        { id: "collected", label: `Data Collected (${result.dataCollected?.length ?? 0})` },
        { id: "shared", label: `Data Shared (${result.dataShared?.length ?? 0})` },
        { id: "rights", label: "Your Rights" },
        { id: "details", label: "Retention & Jurisdiction" },
      ]
    : [];

  return (
    <div className="max-w-[720px] mx-auto px-6 py-10">
      <Link
        href="/"
        className="text-accent font-mono text-sm no-underline hover:underline mb-6 inline-block"
      >
        ← Back to all tools
      </Link>

      <div className="flex items-center gap-3.5 mb-2">
        <span className="text-4xl">🔓</span>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-[var(--text)]">
          Privacy Policy Translator
        </h1>
      </div>
      <p className="text-muted text-sm leading-relaxed mb-7">
        Paste any privacy policy or upload it as a PDF — we&apos;ll translate the corporate-speak
        into plain English and surface what they actually do with your data, red flags, and your
        rights.
      </p>

      <AdSlot size="leaderboard" className="mb-6" />

      {/* Main textarea */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={
          file
            ? "Optional: add notes or context about this service..."
            : "Paste a privacy policy here, or upload a PDF below. We'll translate the corporate-speak into plain English in 30 seconds."
        }
        rows={10}
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
          ⚠️ Policy text is very long — only the first {CHAR_LIMIT.toLocaleString()} characters
          will be analyzed.
        </div>
      )}

      {/* File upload — PDF and DOCX only; privacy policies are text, not images */}
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
              📎 Or upload the policy as PDF or DOCX
            </button>
            <p className="mt-1.5 text-muted text-xs text-center">
              💡 Try a policy from a service you actually use — Facebook, TikTok, Spotify, your
              bank. Most are 5–15 pages of legalese; we&apos;ll boil it down to what matters.
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

      <button
        onClick={analyze}
        disabled={loading || !hasInput}
        className={`mt-5 px-8 py-3 rounded-lg font-heading font-semibold text-sm transition-all ${
          loading || !hasInput
            ? "bg-border text-muted cursor-not-allowed"
            : "bg-accent text-white hover:brightness-110 cursor-pointer"
        }`}
      >
        {loading
          ? "Translating..."
          : file
          ? "Translate This Policy"
          : "Translate Privacy Policy"}
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
          {/* Header: grade circle + service name */}
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
              {result.service && (
                <p className="text-xs font-mono text-muted mb-0.5">Analyzing policy for</p>
              )}
              <h3 className="font-heading text-lg text-[var(--text)] truncate">
                {result.service || "Unknown Service"}
              </h3>
              <p className="text-muted text-xs mt-0.5">
                Privacy-friendliness score: {result.score}/100
              </p>
            </div>
          </div>

          {/* Plain-English summary */}
          {result.summary && (
            <div className="mb-5 p-4 rounded-xl bg-accent/5 border border-accent/20">
              <p className="text-xs font-mono text-muted mb-1">Plain-English summary</p>
              <p className="text-[var(--text)] text-sm leading-relaxed">{result.summary}</p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 mb-4">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-accent text-white"
                    : "bg-border/50 text-muted hover:text-[var(--text)] hover:bg-border"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Tab: Red Flags ── */}
          {activeTab === "flags" && (
            <div>
              {(result.redFlags?.length ?? 0) === 0 ? (
                <p className="text-muted text-sm italic">No major red flags detected.</p>
              ) : (
                result.redFlags.map((flag, i) => {
                  const style = SEVERITY_STYLES[flag.severity] || SEVERITY_STYLES.info;
                  return (
                    <div
                      key={i}
                      className={`mb-3 p-3.5 rounded-xl ${style.bg} border-l-[3px] ${style.border}`}
                    >
                      <div className="flex items-start gap-2 mb-1.5">
                        <span className="text-sm shrink-0 mt-0.5">{style.icon}</span>
                        <p className="text-[var(--text)] text-sm font-mono leading-snug">
                          &ldquo;{flag.clause}&rdquo;
                        </p>
                      </div>
                      <p className="text-muted text-xs leading-relaxed ml-6">
                        {flag.explanation}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ── Tab: Data Collected ── */}
          {activeTab === "collected" && (
            <div>
              {(result.dataCollected?.length ?? 0) === 0 ? (
                <p className="text-muted text-sm italic">No data collection details found.</p>
              ) : (
                result.dataCollected.map((item, i) => (
                  <div key={i} className="mb-3 p-3.5 rounded-xl bg-surface border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm font-semibold text-[var(--text)]">
                        {item.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full border text-xs font-mono ${
                          CONCERN_STYLES[item.concern] || ""
                        }`}
                      >
                        {item.concern} concern
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {item.items.map((it, j) => (
                        <li key={j} className="flex items-start gap-2 text-muted text-xs">
                          <span className="mt-0.5 shrink-0">•</span>
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── Tab: Data Shared ── */}
          {activeTab === "shared" && (
            <div>
              {(result.dataShared?.length ?? 0) === 0 ? (
                <p className="text-muted text-sm italic">
                  No third-party sharing details found.
                </p>
              ) : (
                result.dataShared.map((item, i) => (
                  <div key={i} className="mb-3 p-3.5 rounded-xl bg-surface border border-border">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-sm font-semibold text-[var(--text)]">
                        {item.with}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full border text-xs font-mono ${
                          CONCERN_STYLES[item.concern] || ""
                        }`}
                      >
                        {item.concern} concern
                      </span>
                    </div>
                    <p className="text-muted text-xs leading-relaxed">{item.purpose}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── Tab: Your Rights ── */}
          {activeTab === "rights" && result.userRights && (
            <div>
              <div className="flex flex-wrap gap-3 mb-4">
                {(
                  [
                    { key: "canDelete", label: "Right to Delete" },
                    { key: "canExport", label: "Right to Export" },
                    { key: "canOptOut", label: "Right to Opt-Out" },
                  ] as const
                ).map(({ key, label }) => {
                  const val = result.userRights[key];
                  return (
                    <div
                      key={key}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
                        val
                          ? "bg-green-500/10 border-green-500/20"
                          : "bg-red-500/10 border-red-500/20"
                      }`}
                    >
                      <span className="text-base">{val ? "✅" : "❌"}</span>
                      <span
                        className={`text-sm font-mono ${
                          val ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
              {result.userRights.details && (
                <div className="p-3.5 rounded-xl bg-surface border border-border">
                  <p className="text-xs font-mono text-muted mb-1">
                    How to exercise your rights:
                  </p>
                  <p className="text-[var(--text)] text-sm leading-relaxed">
                    {result.userRights.details}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Retention & Jurisdiction ── */}
          {activeTab === "details" && (
            <div className="space-y-3">
              {result.retention && (
                <div className="p-3.5 rounded-xl bg-surface border border-border">
                  <p className="text-xs font-mono text-muted mb-1">Data retention</p>
                  <p className="text-[var(--text)] text-sm leading-relaxed">
                    {result.retention}
                  </p>
                </div>
              )}
              {result.jurisdiction && (
                <div className="p-3.5 rounded-xl bg-surface border border-border">
                  <p className="text-xs font-mono text-muted mb-1">Governing privacy law</p>
                  <p className="text-[var(--text)] text-sm leading-relaxed">
                    {result.jurisdiction}
                  </p>
                </div>
              )}
            </div>
          )}

          <AdSlot size="rectangle" className="mt-6" />
        </div>
      )}

      {/* SEO content */}
      <section className="mt-14 border-t border-border pt-10">
        <h2 className="font-display text-2xl text-[var(--text)] mb-3">
          How the Privacy Policy Translator works
        </h2>
        <p className="text-muted text-sm leading-relaxed mb-4">
          Paste any privacy policy or upload it as a PDF or DOCX file. Our AI reads the full
          document and translates complex legal language into plain English at an 8th-grade reading
          level. It surfaces red flags — like vague &ldquo;partners&rdquo; language, indefinite
          data retention, AI training data clauses, or the sale of personal information — and maps
          them to specific sections of the policy so you know exactly what to look for. It also
          identifies what data is collected, who it&apos;s shared with, and your rights under GDPR,
          CCPA, and other applicable laws, along with plain-English instructions for how to actually
          exercise them.
        </p>
        <p className="text-muted text-xs leading-relaxed italic">
          Disclaimer: This tool provides general privacy policy analysis and is not legal advice.
          For questions about your specific rights, consult a qualified privacy attorney or your
          country&apos;s data protection authority.
        </p>
      </section>
    </div>
  );
}
