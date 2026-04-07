"use client";

import { useState } from "react";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";

interface Flag {
  severity: "danger" | "warning" | "info";
  text: string;
}

interface Result {
  score: number;
  grade: string;
  flags: Flag[];
  summary: string;
}

const SEVERITY_STYLES = {
  danger: { bg: "bg-red-500/10", border: "border-l-red-500", icon: "🔴" },
  warning: { bg: "bg-yellow-500/10", border: "border-l-yellow-500", icon: "🟡" },
  info: { bg: "bg-blue-500/10", border: "border-l-blue-500", icon: "🔵" },
};

const GRADE_COLORS: Record<string, string> = {
  A: "bg-green-600",
  B: "bg-yellow-600",
  C: "bg-orange-600",
  D: "bg-red-600",
  F: "bg-red-800",
};

export function FoodSafetyClient() {
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
        body: JSON.stringify({ tool: "food-safety", input }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[720px] mx-auto px-6 py-10">
      <Link
        href="/"
        className="text-accent font-mono text-sm no-underline hover:underline mb-6 inline-block"
      >
        ← Back to all tools
      </Link>

      <div className="flex items-center gap-3.5 mb-2">
        <span className="text-4xl">🛡️</span>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-[var(--text)]">
          Food Safety Scanner
        </h1>
      </div>
      <p className="text-muted text-sm leading-relaxed mb-7">
        Paste an ingredient list, product name, or UPC — our AI cross-references
        FDA recalls, allergen databases, and safety research to give you a clear
        safety score.
      </p>

      <AdSlot size="leaderboard" className="mb-6" />

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={
          "Paste ingredient list, product name, or UPC code...\n\nExample: Doritos Nacho Cheese Tortilla Chips"
        }
        rows={5}
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
        {loading ? "Analyzing..." : "Scan for Safety Issues"}
      </button>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-7 bg-surface border border-border rounded-2xl p-7 animate-fade-up">
          {/* Score */}
          <div className="flex items-center gap-5 mb-5">
            <div
              className={`w-[72px] h-[72px] rounded-full ${
                GRADE_COLORS[result.grade] || "bg-gray-600"
              } flex flex-col items-center justify-center`}
            >
              <span className="text-white font-extrabold text-2xl font-heading">
                {result.grade}
              </span>
              <span className="text-white/70 text-[11px]">
                {result.score}/100
              </span>
            </div>
            <div>
              <h3 className="font-heading text-lg text-[var(--text)]">
                Safety Score: {result.score}/100
              </h3>
              <p className="text-muted text-xs mt-1">
                Based on FDA data, allergen databases, and safety research
              </p>
            </div>
          </div>

          {/* Flags */}
          {result.flags.map((f, i) => {
            const s = SEVERITY_STYLES[f.severity];
            return (
              <div
                key={i}
                className={`flex items-start gap-2.5 p-3 mb-2 rounded-lg ${s.bg} border-l-[3px] ${s.border}`}
              >
                <span className="text-base mt-0.5">{s.icon}</span>
                <span className="text-[var(--text)] text-sm leading-relaxed">
                  {f.text}
                </span>
              </div>
            );
          })}

          <p className="text-muted text-sm leading-relaxed mt-5">
            {result.summary}
          </p>

          <AdSlot size="rectangle" className="mt-5" />
        </div>
      )}

      {/* SEO content */}
      <section className="mt-14 border-t border-border pt-10">
        <h2 className="font-display text-2xl text-[var(--text)] mb-3">
          How the Food Safety Scanner works
        </h2>
        <p className="text-muted text-sm leading-relaxed mb-4">
          Our AI-powered food safety scanner analyzes product names, ingredient
          lists, and UPC codes against multiple data sources to give you an
          instant safety assessment. We cross-reference the FDA enforcement
          action database for active recalls and warning letters, known allergen
          databases for undeclared allergen risks, published research on food
          additives and their safety profiles, and nutritional guidelines for
          excessive sodium, sugar, and harmful fats.
        </p>
        <h3 className="font-heading text-sm font-semibold text-[var(--text)] mb-2">
          What the safety grades mean
        </h3>
        <p className="text-muted text-sm leading-relaxed mb-4">
          Products scoring 90-100 receive an A grade, indicating no known safety
          concerns. Scores of 70-89 (B grade) indicate minor concerns such as
          controversial additives or high sodium content. Scores below 70
          indicate more serious concerns that may include active recalls,
          undeclared allergens, or ingredients with documented health risks.
        </p>
        <p className="text-muted text-xs leading-relaxed italic">
          Disclaimer: This tool provides informational guidance only and is not a
          substitute for professional food safety advice. Always check the FDA
          website directly for the most current recall information. If you have
          food allergies, consult with your healthcare provider.
        </p>
      </section>
    </div>
  );
}
