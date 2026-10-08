import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ARTICLES, getArticleBySlug, getRelatedArticles } from "@/lib/articles";
import { AUTHOR, SITE } from "@/lib/site";

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
    authors: [{ name: AUTHOR.name, url: `${SITE.url}${AUTHOR.url}` }],
    alternates: { canonical: `${SITE.url}/blog/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      publishedTime: article.date,
      modifiedTime: article.reviewed,
      authors: [`${SITE.url}${AUTHOR.url}`],
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    dateModified: article.reviewed,
    author: { "@type": "Person", name: AUTHOR.name, url: `${SITE.url}${AUTHOR.url}` },
    publisher: { "@type": "Organization", name: SITE.operator },
    mainEntityOfPage: `${SITE.url}/blog/${article.slug}`,
  };

  return (
    <div className="max-w-[640px] mx-auto px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
      </div>

      <h1 className="font-display text-3xl md:text-4xl text-[var(--text)] mb-3 leading-tight">
        {article.title}
      </h1>
      <p className="text-muted text-sm leading-relaxed mb-4">
        {article.description}
      </p>

      <p className="text-[12px] text-muted font-mono mb-10">
        By{" "}
        <Link href={AUTHOR.url} className="text-accent no-underline hover:underline">
          {AUTHOR.name}
        </Link>
        {" · "}Published {article.date}
        {" · "}Last reviewed {article.reviewed}
      </p>

      <div className="prose-scanitfree">
        <Content />
      </div>

      <section className="mt-10 border-t border-border pt-6" aria-label="Sources">
        <h2 className="font-heading text-sm font-semibold text-muted uppercase tracking-wide mb-3">
          Sources
        </h2>
        <ol className="list-decimal pl-5 space-y-1.5">
          {article.sources.map((s) => (
            <li key={s.url} className="text-xs text-muted">
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-accent">
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </section>

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
