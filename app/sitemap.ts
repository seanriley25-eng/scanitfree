import type { MetadataRoute } from "next";
import { ARTICLES } from "@/lib/articles";
import { LIVE_TOOLS } from "@/lib/tools";
import { AUTHOR, SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const fixed: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE.url}/tools`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE.url}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE.url}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE.url}${AUTHOR.url}`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE.url}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE.url}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE.url}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
  const tools: MetadataRoute.Sitemap = LIVE_TOOLS.map((t) => ({
    url: `${SITE.url}${t.href}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.9,
  }));
  const articles: MetadataRoute.Sitemap = ARTICLES.map((a) => ({
    url: `${SITE.url}/blog/${a.slug}`,
    lastModified: new Date(a.reviewed),
    changeFrequency: "monthly",
    priority: 0.7,
  }));
  return [...fixed, ...tools, ...articles];
}
