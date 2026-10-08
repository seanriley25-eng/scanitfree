import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORIES, LIVE_TOOLS } from "@/lib/tools";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `All Free Tools — ${SITE.name}`,
  description:
    "Every free scanner and reviewer on ScanItFree: food labels, cosmetic ingredients, leases, privacy policies, resumes, and cover letters. No signup, no paywall.",
  alternates: { canonical: `${SITE.url}/tools` },
};

export default function ToolsIndex() {
  const groups = CATEGORIES.filter((c) => c !== "All").map((cat) => ({
    cat,
    tools: LIVE_TOOLS.filter((t) => t.category === cat),
  }));

  return (
    <div className="max-w-[900px] mx-auto px-6 py-16">
      <h1 className="font-display text-4xl text-[var(--text)] mb-3">All tools</h1>
      <p className="text-muted text-sm leading-relaxed max-w-2xl mb-3">
        Each tool on this page takes something you already have, such as a lease, a food
        label, a privacy policy, or a resume, and tells you what it means and what to watch
        for. Paste text or upload a file, get a scored result in a few seconds, and read the
        guide under the tool to understand the score.
      </p>
      <p className="text-muted text-sm leading-relaxed max-w-2xl mb-10">
        Every tool is free and needs no account. Uploads are analysed and discarded. Each
        page explains exactly what the tool checks, what it cannot check, and when you
        should talk to a professional instead.
      </p>

      {groups.map(({ cat, tools }) => (
        <section key={cat} className="mb-10">
          <h2 className="font-heading text-lg font-semibold text-[var(--text)] mb-4">{cat}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tools.map((t) => (
              <Link key={t.id} href={t.href} className="no-underline">
                <div className="bg-surface border border-border rounded-xl p-5 h-full hover:border-accent transition-colors">
                  <div className="text-2xl mb-2">{t.icon}</div>
                  <h3 className="font-heading text-base font-semibold text-[var(--text)] mb-1">
                    {t.name}
                  </h3>
                  <p className="text-muted text-xs leading-relaxed">{t.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <section className="mt-6 text-muted text-sm leading-relaxed max-w-2xl">
        <h2 className="font-heading text-lg font-semibold text-[var(--text)] mb-3">
          How these tools are built
        </h2>
        <p>
          The reading and scoring is done by Anthropic&apos;s Claude model. What it looks for
          is written by a person: each tool follows a rubric that names the specific clauses,
          ingredients, or resume signals to flag, and cites the public source behind each one.
          Where a live dataset exists, such as the FDA enforcement database for food recalls,
          the tool queries it directly rather than relying on the model&apos;s memory.
        </p>
      </section>
    </div>
  );
}
