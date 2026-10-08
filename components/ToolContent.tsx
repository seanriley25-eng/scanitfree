import Link from "next/link";
import { getArticlesByTool } from "@/lib/articles";
import { getTool, type LiveToolId } from "@/lib/tools";
import { SITE } from "@/lib/site";

export interface FaqItem {
  q: string;
  a: string;
}

interface ToolContentModule {
  default: React.ComponentType;
  faq: FaqItem[];
}

/**
 * Static guide rendered under every tool: what it checks, how it works, how to
 * read results, a sample result, limitations, FAQ (with FAQPage schema), and
 * the article cluster for the tool. Content lives in content/tools/<id>.tsx.
 */
export async function ToolContent({ toolId }: { toolId: LiveToolId }) {
  const tool = getTool(toolId);
  if (!tool) return null;
  const mod = (await import(`@/content/tools/${toolId}`)) as ToolContentModule;
  const Content = mod.default;
  const guides = getArticlesByTool(toolId);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: mod.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    url: `${SITE.url}${tool.href}`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@type": "Organization", name: SITE.operator },
  };

  return (
    <section
      id="guide"
      className="max-w-[640px] mx-auto px-6 pb-16"
      aria-label={`About the ${tool.name}`}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
      />

      <div className="prose-scanitfree">
        <Content />

        <h2>Frequently asked questions</h2>
        {mod.faq.map((f) => (
          <div key={f.q}>
            <h3>{f.q}</h3>
            <p>{f.a}</p>
          </div>
        ))}
      </div>

      {guides.length > 0 && (
        <div className="mt-10">
          <h2 className="font-heading text-sm font-semibold text-muted uppercase tracking-wide mb-4">
            Guides for this tool
          </h2>
          <div className="space-y-3">
            {guides.map((g) => (
              <Link
                key={g.slug}
                href={`/blog/${g.slug}`}
                className="block bg-surface border border-border rounded-lg p-4 no-underline hover:border-accent transition-colors"
              >
                <span className="font-heading text-sm font-semibold text-[var(--text)]">
                  {g.title}
                </span>
                <span className="block text-muted text-xs mt-1">{g.description}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
