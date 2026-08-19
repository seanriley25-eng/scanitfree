import Link from "next/link";
import { TOOLS, CATEGORIES } from "@/lib/tools";
import { AdSlot } from "@/components/AdSlot";
import { ToolGrid } from "@/components/ToolGrid";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <header className="pt-20 pb-12 px-6 max-w-[900px] mx-auto text-center">
        <div className="inline-block bg-accent-dim rounded-full px-4 py-1 text-xs font-mono text-accent tracking-wide mb-3">
          100% FREE · NO SIGNUP · AD-SUPPORTED
        </div>
        <div className="inline-block bg-accent-dim rounded-full px-4 py-1 text-xs font-mono text-accent tracking-wide mb-5">
          6 TOOLS · 36 ARTICLES · POWERED BY CLAUDE
        </div>
        <h1 className="font-display text-4xl md:text-6xl font-normal text-[var(--text)] leading-tight mb-4">
          AI tools that actually{" "}
          <span className="bg-gradient-to-r from-accent to-orange-500 bg-clip-text text-transparent">
            help
          </span>
        </h1>
        <p className="text-base md:text-lg text-muted max-w-xl mx-auto leading-relaxed mb-8">
          Free AI-powered utilities for everyday decisions — food safety,
          resume reviews, lease scanning, and more. No accounts. No paywalls.
          Just answers.
        </p>
      </header>

      {/* Top ad */}
      <div className="max-w-[900px] mx-auto px-6 mb-8">
        <AdSlot size="leaderboard" />
      </div>

      {/* Sample output preview */}
      <section className="max-w-[720px] mx-auto px-6 mb-12">
        <h2 className="font-display text-2xl text-[var(--text)] mb-1">See it in action</h2>
        <p className="text-muted text-sm mb-5">Real-looking output — try it yourself below.</p>
        <div className="bg-surface border border-border rounded-2xl p-6 animate-fade-up">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🛡️</span>
            <span className="font-heading text-sm font-semibold text-[var(--text)]">Food Safety Scanner</span>
            <span className="ml-auto font-mono text-xs text-muted">Pringles Sour Cream &amp; Onion</span>
          </div>

          {/* Score row */}
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-full bg-yellow-600 flex flex-col items-center justify-center flex-shrink-0">
              <span className="text-white font-extrabold text-xl font-heading">B</span>
              <span className="text-white/70 text-[10px]">74/100</span>
            </div>
            <div>
              <h3 className="font-heading text-base text-[var(--text)]">Safety Score: 74/100</h3>
              <p className="text-muted text-xs mt-0.5">Based on FDA data, allergen databases, and safety research</p>
            </div>
          </div>

          {/* Flags */}
          <div className="flex items-start gap-2.5 p-3 mb-2 rounded-lg bg-yellow-500/10 border-l-[3px] border-l-yellow-500">
            <span className="text-base mt-0.5">🟡</span>
            <span className="text-[var(--text)] text-sm leading-relaxed">
              Contains artificial flavors (Disodium Inosinate &amp; Guanylate) — flavor enhancers derived from animal sources, may be unsuitable for vegetarians.
            </span>
          </div>
          <div className="flex items-start gap-2.5 p-3 mb-2 rounded-lg bg-yellow-500/10 border-l-[3px] border-l-yellow-500">
            <span className="text-base mt-0.5">🟡</span>
            <span className="text-[var(--text)] text-sm leading-relaxed">
              Yellow 5 &amp; Yellow 6 — synthetic dyes flagged by EFSA; EU products carry a warning label. Some studies link them to hyperactivity in children.
            </span>
          </div>
          <div className="flex items-start gap-2.5 p-3 mb-2 rounded-lg bg-blue-500/10 border-l-[3px] border-l-blue-500">
            <span className="text-base mt-0.5">🔵</span>
            <span className="text-[var(--text)] text-sm leading-relaxed">
              No known major allergens beyond milk derivatives — safe for most allergen-restricted diets.
            </span>
          </div>

          <p className="text-muted text-xs mt-4 italic">Example output — try your own below.</p>
        </div>

        <div className="mt-4">
          <Link
            href="/tools/food-safety"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-white font-heading font-semibold text-sm hover:brightness-110 transition-all no-underline"
          >
            Try the Food Safety Scanner →
          </Link>
        </div>
      </section>

      {/* Tool grid (client component for filtering) */}
      <ToolGrid tools={TOOLS.filter(t => t.status === 'live')} categories={CATEGORIES} />

      {/* Mid ad */}
      <div className="max-w-[900px] mx-auto px-6 mt-8">
        <AdSlot size="leaderboard" />
      </div>

      {/* AI-built callout */}
      <div className="max-w-[900px] mx-auto px-6 mb-2">
        <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-surface border border-border text-muted text-xs font-mono">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-dim border border-accent/20 text-accent text-[11px] whitespace-nowrap">
            ⚡ AI-built
          </span>
          <span>
            This entire site — tools, content, and code — was built and maintained by AI agents powered by the{" "}
            <a
              href="https://anthropic.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Anthropic Claude API
            </a>
            .
          </span>
        </div>
      </div>

      {/* SEO content */}
      <section className="max-w-[900px] mx-auto px-6 py-14">
        <h2 className="font-display text-3xl text-[var(--text)] mb-4">
          Why free AI tools?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "No signup required",
              text: "Every tool works instantly. No email, no account, no friction. Just paste your data and get results.",
            },
            {
              title: "Real data sources",
              text: "Our tools cross-reference FDA databases, CPSC recalls, and verified public datasets — not just AI guesses.",
            },
            {
              title: "Privacy first",
              text: "Your inputs are processed and discarded. We don't store your resumes, leases, or ingredient lists.",
            },
          ].map((item) => (
            <div key={item.title}>
              <h3 className="font-heading text-sm font-semibold text-[var(--text)] mb-2">
                {item.title}
              </h3>
              <p className="text-muted text-sm leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

        <h2 className="font-display text-3xl text-[var(--text)] mt-14 mb-4">
          How it works
        </h2>
        <p className="text-muted text-sm leading-relaxed max-w-2xl">
          Each tool is powered by Anthropic&apos;s Claude AI combined with real
          government and public data sources. When you scan a food product, we
          cross-reference the FDA enforcement database, known allergen lists,
          and published safety research. When you submit a resume, our AI
          evaluates it against current hiring standards and ATS compatibility
          requirements. Every analysis runs in real-time — your data is never
          stored. This site is free because it&apos;s supported by advertising.
        </p>
      </section>
    </>
  );
}
