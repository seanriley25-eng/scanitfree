# AdSense Readiness Pass — Design

**Date:** 2026-10-08
**Status:** Approved by Sean Riley (byline confirmed), implementation in progress
**Branch:** `adsense-readiness`

## Goal

Make scanitfree.com pass Google AdSense review while the current application is
pending, without adding new tools. Every change here is either something a
reviewer or Googlebot hits directly, or a structural fix that keeps the site
from regressing (sitemap drift, dead article routes).

## Audit findings this design addresses

| # | Finding | Severity |
|---|---------|----------|
| 1 | 18 of 36 articles return 404 in production. `app/blog/[slug]/page.tsx` has a hand-typed `CONTENT_MAP` with 18 entries; the cover-letter, cosmetic, and privacy clusters were registered in `lib/articles.ts` and the sitemap but never added to the map. | Blocker |
| 2 | Site is not indexed by Google or Bing (site: search returns nothing). No Search Console verification tag present. | Blocker |
| 3 | Tool pages render ~220 words of static text around the form. Reviewers open tool pages first. | Blocker |
| 4 | Homepage callout says the site was "built and maintained by AI agents". Google's scaled-content policy treats this as a red flag. | High |
| 5 | Articles have no author, no byline, no sources, no reviewed date. Legal and food-safety topics are YMYL. | High |
| 6 | `app/sitemap.ts` hand-lists 4 of 7 live tools. | Medium |
| 7 | Tool cards show internal keyword-volume estimates ("~14.8K/mo searches") to visitors. | Medium |
| 8 | "All Tools" nav link points at `/`; `/tools` is a 404. | Low |
| 9 | No analytics of any kind (no GA tag, Vercel Web Analytics not enabled). | Medium |
| 10 | Blog index description and category colors only cover 3 of 4 categories. | Low |

## Non-goals

- New tools, ingredient dictionaries, recall tracker (next spec).
- Changing the Claude API economics or the 15-scan daily limit.
- Rewriting existing article bodies. Only metadata, byline, and sources are added.
- Legal page changes. Privacy and Terms already pass the AdSense checklist.

## Design

### 1. Article routing

Replace the hand-typed `CONTENT_MAP` with a single dynamic import keyed by slug:

```ts
const { default: Content } = await import(`@/content/articles/${article.slug}`);
```

Webpack bundles every file in `content/articles/` for this pattern, so new
articles only need a `lib/articles.ts` entry. `generateStaticParams` already
returns every slug, so all 36 routes become static at build time. A build-time
check (section 9) fails the build if any registered slug has no content file.

### 2. Indexing

- `app/sitemap.ts` derives tool entries from `TOOLS.filter(t => t.status === "live")`.
  Add `/tools` and `/author/sean-riley`.
- `app/layout.tsx` metadata gains
  `verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION, other: { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION } }`,
  each rendered only when the variable is set. Sean adds the values in Vercel
  after creating the Search Console and Bing Webmaster properties.
- `.env.example` documents both variables.

Manual steps for Sean after deploy (documented in the PR body):
1. Search Console: add `scanitfree.com` as a Domain property (DNS TXT) or URL
   prefix property (meta tag via the env var). Submit `/sitemap.xml`. Use URL
   Inspection to request indexing for `/`, `/tools`, and each tool page.
2. Bing Webmaster Tools: import from Search Console.
3. Vercel: Project → Analytics → Enable.

### 3. Tool page content

New directory `content/tools/` with one file per live tool, e.g.
`content/tools/lease-scanner.tsx`, exporting:

```ts
export const faq: { q: string; a: string }[];   // 6 entries
export default function Content(): JSX.Element;  // 900–1,200 words
```

Each content component follows one outline so the pages read as a set:

1. **What this tool checks** (what it is for, who it is for)
2. **How it works** (inputs, data sources, what the AI does and does not do)
3. **How to read your results** (score bands, severity levels, each result field)
4. **A sample result** (static, realistic, rendered in the same visual style as
   the live result card so the reviewer sees the output without spending an API call)
5. **Limitations and when to get a professional**
6. **FAQ** (rendered from `faq`, also emitted as `FAQPage` JSON-LD)

A shared server component `components/ToolContent.tsx` takes the tool id,
renders the content component inside `.prose-scanitfree`, the FAQ, the JSON-LD
script, and a "Guides for this tool" list from `getArticlesByTool(toolId)`.
Each `app/tools/*/page.tsx` renders `<Client />` followed by `<ToolContent toolId="…" />`.

The Resume Reviewer Pro page explains how it differs from the free reviewer
(deterministic scorer, rewrite loop, honesty rule about declined skills), so the
two pages are not near-duplicates.

### 4. Author and trust signals

- `lib/site.ts` exports `SITE` (name, url, operator "Farallone Media LLC") and
  `AUTHOR` (name "Sean Riley", role "Founder, Farallone Media LLC",
  url `/author/sean-riley`, sameAs: [] until Sean supplies profile links).
- New page `app/author/sean-riley/page.tsx`: short bio, what Sean does on the
  site (chooses topics, reviews every article and tool rubric, maintains the
  data sources), how AI is used, contact link, list of all articles. Emits
  `Person` JSON-LD.
- `Article` interface gains `reviewed: string` (ISO date) and
  `sources: { title: string; url: string }[]` (3–6 per article, every URL a
  primary source: statute text on a state legislature site or law.cornell.edu,
  FDA/USDA/CPSC/FTC pages, EU/CA regulator pages, peer-reviewed or agency
  research). A script HEAD-checks every URL before merge.
- `app/blog/[slug]/page.tsx` renders: byline linking to the author page,
  "Published" and "Last reviewed" dates, a **Sources** section after the body,
  and `Article` JSON-LD with `author`, `datePublished`, `dateModified`,
  `publisher`.
- Blog index shows the byline on cards and adds the Privacy category color and
  a description that names all four topics.

### 5. About page and homepage copy

- About page: lead with who runs the site (Farallone Media LLC, founded by Sean
  Riley) and how it is built (tools use Anthropic's Claude for analysis; a person
  chooses what the tools check, writes the rubrics, and reviews the content).
  Add an "About the author" block that links to the author page. Keep the
  principles, disclaimer, and contact sections.
- Homepage: remove the "AI-built … maintained by AI agents" callout. Replace
  the hard-coded "7 TOOLS · 36 ARTICLES" badge with computed counts. Keep the
  Resume Reviewer Pro sample section.
- Footer: unchanged except the first line gains "by Farallone Media LLC".

### 6. Navigation and tool grid

- New server page `app/tools/page.tsx`: H1, two-paragraph intro, the live tools
  grouped by category with name, description, and link, plus a short "How these
  tools are built" paragraph. No client-side filtering.
- `Nav.tsx` "All Tools" → `/tools`.
- `ToolGrid.tsx`: remove the search-volume line. `searchVolume` stays in
  `lib/tools.ts` as internal planning data but is no longer rendered anywhere.

### 7. Analytics

Add `@vercel/analytics` and render `<Analytics />` in `app/layout.tsx`. It is
cookie-free and sends no personal data, so the consent banner needs no change.
Sean enables Web Analytics in the Vercel project.

### 8. Error handling

- Missing content file for a registered slug: build fails via the check script,
  never a runtime 404.
- Missing verification env vars: tags are omitted, no empty `content=""`.
- `ToolContent` with an unknown tool id: TypeScript error, since the id is a
  union of live tool ids.

### 9. Verification

`scripts/check-site.mjs` (run with `npm run check`, after `next build` and
against `next start` on a local port):

- Every `ARTICLES` slug has `content/articles/<slug>.tsx` (also run as a
  prebuild step).
- Every article route and every live tool route returns 200.
- Every live tool page has ≥ 900 words of visible text outside `<form>` and
  `<nav>`/`<footer>`, and contains a parseable `FAQPage` JSON-LD block with 6
  entries.
- Every article page contains `Article` JSON-LD with an author and a Sources
  section with ≥ 3 links.
- `/sitemap.xml` contains exactly the live tool URLs plus every article slug,
  `/tools`, and the author page.
- Every URL in every `sources` list responds 2xx/3xx to a HEAD or GET.

Plus: `tsc --noEmit`, `next build`, and a manual browser pass of the homepage,
`/tools`, one tool page, one article, About, and the author page at desktop and
375px width.

## Files touched

New: `lib/site.ts`, `components/ToolContent.tsx`, `content/tools/*.tsx` (7),
`app/tools/page.tsx`, `app/author/sean-riley/page.tsx`, `scripts/check-site.mjs`.

Modified: `app/blog/[slug]/page.tsx`, `app/blog/page.tsx`, `app/sitemap.ts`,
`app/layout.tsx`, `app/page.tsx`, `app/about/page.tsx`, `app/tools/*/page.tsx`
(7), `components/Nav.tsx`, `components/ToolGrid.tsx`, `components/Footer.tsx`,
`lib/articles.ts`, `.env.example`, `package.json`, `README.md`.

## Open items for Sean

- Profile URLs for the author `sameAs` list (LinkedIn, GitHub) if wanted.
- Search Console, Bing, and Vercel Analytics toggles after deploy.
