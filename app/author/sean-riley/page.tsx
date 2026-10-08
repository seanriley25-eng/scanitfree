import type { Metadata } from "next";
import Link from "next/link";
import { ARTICLES } from "@/lib/articles";
import { AUTHOR, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `${AUTHOR.name} — ${SITE.name}`,
  description: `${AUTHOR.name}, ${AUTHOR.role}. Writes and reviews every guide on ${SITE.name} and maintains the data sources behind its tools.`,
  alternates: { canonical: `${SITE.url}${AUTHOR.url}` },
};

export default function AuthorPage() {
  const byDate = [...ARTICLES].sort((a, b) => (a.date < b.date ? 1 : -1));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: AUTHOR.name,
    jobTitle: AUTHOR.role,
    url: `${SITE.url}${AUTHOR.url}`,
    worksFor: { "@type": "Organization", name: SITE.operator },
    sameAs: AUTHOR.sameAs,
  };

  return (
    <div className="max-w-[640px] mx-auto px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <p className="text-[11px] font-mono uppercase tracking-wide text-muted mb-2">Author</p>
      <h1 className="font-display text-4xl text-[var(--text)] mb-2">{AUTHOR.name}</h1>
      <p className="text-accent font-mono text-sm mb-8">{AUTHOR.role}</p>

      <div className="text-muted text-sm leading-relaxed space-y-4">
        <p>{AUTHOR.bio}</p>
        <p>
          ScanItFree&apos;s tools use Anthropic&apos;s Claude to read documents and labels,
          but what they look for is decided by a person. Sean writes the rubric each tool
          follows, decides which public datasets it checks against, tests the output
          against real leases, labels, and resumes, and fixes the rubric when the result
          is wrong or overconfident.
        </p>
        <p>
          Every guide on the site is reviewed before publication and carries a
          &ldquo;last reviewed&rdquo; date and a list of the primary sources it relies on.
          If you find an error, email{" "}
          <a href={`mailto:${SITE.contactEmail}`} className="text-accent">
            {SITE.contactEmail}
          </a>
          .
        </p>
      </div>

      <h2 className="font-heading text-lg font-semibold text-[var(--text)] mt-12 mb-4">
        Guides by {AUTHOR.name}
      </h2>
      <ul className="space-y-2">
        {byDate.map((a) => (
          <li key={a.slug}>
            <Link
              href={`/blog/${a.slug}`}
              className="text-sm text-[var(--text)] hover:text-accent no-underline"
            >
              {a.title}
            </Link>
            <span className="text-muted text-xs font-mono ml-2">{a.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
