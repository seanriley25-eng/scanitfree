import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ARTICLES, getArticleBySlug, getRelatedArticles } from "@/lib/articles";

// Dynamic import map for article content components
const CONTENT_MAP: Record<string, () => Promise<{ default: React.ComponentType }>> = {
  'lease-red-flags': () => import('@/content/articles/lease-red-flags'),
  'beat-ats-resume-filters': () => import('@/content/articles/beat-ats-resume-filters'),
  'fda-food-recalls-explained': () => import('@/content/articles/fda-food-recalls-explained'),
  'security-deposit-laws': () => import('@/content/articles/security-deposit-laws'),
  'resume-keywords': () => import('@/content/articles/resume-keywords'),
  'what-is-bha-in-food': () => import('@/content/articles/what-is-bha-in-food'),
  'food-allergens-label-reading': () => import('@/content/articles/food-allergens-label-reading'),
  'food-dyes-safety': () => import('@/content/articles/food-dyes-safety'),
  'resume-bullet-examples': () => import('@/content/articles/resume-bullet-examples'),
  'hard-skills-vs-soft-skills': () => import('@/content/articles/hard-skills-vs-soft-skills'),
  'get-security-deposit-back': () => import('@/content/articles/get-security-deposit-back'),
  'joint-and-several-liability': () => import('@/content/articles/joint-and-several-liability'),
  'natural-vs-organic-food-labels': () => import('@/content/articles/natural-vs-organic-food-labels'),
  'how-to-read-nutrition-label': () => import('@/content/articles/how-to-read-nutrition-label'),
  'how-long-should-resume-be': () => import('@/content/articles/how-long-should-resume-be'),
  'how-to-write-resume-summary': () => import('@/content/articles/how-to-write-resume-summary'),
  'can-landlord-raise-rent-mid-lease': () => import('@/content/articles/can-landlord-raise-rent-mid-lease'),
  'landlord-wont-make-repairs': () => import('@/content/articles/landlord-wont-make-repairs'),
};

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

  const loader = CONTENT_MAP[params.slug];
  if (!loader) notFound();

  const { default: Content } = await loader();
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
