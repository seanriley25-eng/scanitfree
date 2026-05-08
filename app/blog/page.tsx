import type { Metadata } from "next";
import Link from "next/link";
import { ARTICLES } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Blog — ScanItFree",
  description:
    "Guides and articles on food safety, resume writing, and tenant rights. Practical advice backed by real data.",
};

const CATEGORY_COLORS: Record<string, string> = {
  Health: "bg-green-500/10 text-green-400",
  Career: "bg-blue-500/10 text-blue-400",
  Legal: "bg-purple-500/10 text-purple-400",
};

export default function BlogIndex() {
  return (
    <div className="max-w-[900px] mx-auto px-6 py-16">
      <h1 className="font-display text-4xl text-[var(--text)] mb-3">
        Guides &amp; Articles
      </h1>
      <p className="text-muted text-sm leading-relaxed mb-10 max-w-xl">
        Practical guides on food safety, resume writing, and tenant rights —
        backed by real data sources and written in plain English.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ARTICLES.map((article) => (
          <Link
            key={article.slug}
            href={`/blog/${article.slug}`}
            className="no-underline"
          >
            <article className="bg-surface border border-border rounded-xl p-6 transition-all hover:border-accent hover:-translate-y-0.5">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full uppercase tracking-wide ${
                    CATEGORY_COLORS[article.category] || "bg-gray-500/10 text-gray-400"
                  }`}
                >
                  {article.category}
                </span>
                <span className="text-[11px] text-muted font-mono">
                  {article.date}
                </span>
              </div>
              <h2 className="font-heading text-base font-semibold text-[var(--text)] mb-2 leading-snug">
                {article.title}
              </h2>
              <p className="text-muted text-xs leading-relaxed">
                {article.description}
              </p>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
