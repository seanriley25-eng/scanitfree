import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ARTICLES, getArticleBySlug, getRelatedArticles } from "@/lib/articles";

export function generateStaticParams() {
  return ARTICLES.map((article) => ({ slug: article.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const article = getArticleBySlug(params.slug);
  if (!article) return {};

  return {
    title: `${article.title} — ScanItFree`,
    description: article.description,
    keywords: article.keywords,
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      publishedTime: article.date,
    },
  };
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug);
  if (!article) notFound();

  // Webpack bundles every file matching this template, so a new article only
  // needs a lib/articles.ts entry. scripts/check-articles.mjs guards the pair.
  const { default: Content } = (await import(
    `@/content/articles/${article.slug}`
  )) as { default: React.ComponentType };
  const related = getRelatedArticles(article);

  return (
    <div className="max-w-[640px] mx-auto px-6 py-16">
      <Link
        href="/blog"
        className="text-accent font-mono text-sm no-underline hover:underline mb-6 inline-block"
      >
        ← All articles
      </Link>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full uppercase tracking-wide bg-accent-dim text-accent">
          {article.category}
        </span>
        <span className="text-[11px] text-muted font-mono">{article.date}</span>
      </div>

      <h1 className="font-display text-3xl md:text-4xl text-[var(--text)] mb-3 leading-tight">
        {article.title}
      </h1>
      <p className="text-muted text-sm leading-relaxed mb-10">
        {article.description}
      </p>

      <div className="prose-scanitfree">
        <Content />
      </div>

      {/* CTA */}
      <div className="mt-12 bg-surface border border-border rounded-xl p-6 text-center">
        <p className="font-heading text-base font-semibold text-[var(--text)] mb-2">
          Try the {article.toolName}
        </p>
        <p className="text-muted text-sm mb-4">
          Free, instant, no signup required.
        </p>
        <Link
          href={`/tools/${article.toolSlug}`}
          className="inline-block bg-accent text-white px-6 py-2.5 rounded-lg font-heading font-semibold text-sm hover:brightness-110 no-underline transition-all"
        >
          Open {article.toolName} →
        </Link>
      </div>

      {/* Related articles */}
      {related.length > 0 && (
        <div className="mt-10">
          <h2 className="font-heading text-sm font-semibold text-muted uppercase tracking-wide mb-4">
            Related articles
          </h2>
          <div className="space-y-3">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/blog/${r.slug}`}
                className="block bg-surface border border-border rounded-lg p-4 no-underline hover:border-accent transition-colors"
              >
                <span className="font-heading text-sm font-semibold text-[var(--text)]">
                  {r.title}
                </span>
                <span className="block text-muted text-xs mt-1">
                  {r.description}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
