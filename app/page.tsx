import Link from "next/link";
import { TOOLS, CATEGORIES } from "@/lib/tools";
import { AdSlot } from "@/components/AdSlot";
import { ToolGrid } from "@/components/ToolGrid";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <header className="pt-20 pb-12 px-6 max-w-[900px] mx-auto text-center">
        <div className="inline-block bg-accent-dim rounded-full px-4 py-1 text-xs font-mono text-accent tracking-wide mb-5">
          100% FREE · NO SIGNUP · AD-SUPPORTED
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

      {/* Tool grid (client component for filtering) */}
      <ToolGrid tools={TOOLS} categories={CATEGORIES} />

      {/* Mid ad */}
      <div className="max-w-[900px] mx-auto px-6 mt-8">
        <AdSlot size="leaderboard" />
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
