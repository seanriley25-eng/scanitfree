# AdSense Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make scanitfree.com pass AdSense review by fixing dead article routes, adding real page content to every tool page, adding author and source signals to every article, removing "AI-run" copy, and making the sitemap and navigation complete.

**Architecture:** Next.js 14 App Router site. Content lives in TSX components under `content/`; registries live in `lib/`. This plan adds a `content/tools/` registry rendered by one shared `ToolContent` server component, extends the article registry with `reviewed` and `sources`, and adds a verification script that runs against a production build. No test framework exists; verification is `tsc`, `next build`, and `scripts/check-site.mjs`.

**Tech Stack:** Next.js 14.2, React 18, TypeScript, Tailwind, `@vercel/analytics`. Node 24.

## Global Constraints

- Byline is exactly `Sean Riley`, role `Founder, Farallone Media LLC`.
- Every tool page must render ≥ 900 words of static visible text outside the form, nav, and footer, with a 6-entry FAQ.
- Every article gets ≥ 3 primary sources (statute text, agency pages, regulator pages, or peer-reviewed research). No blogs, no competitors, no AI-generated pages.
- No page may say the site is "built by AI agents" or "maintained by AI agents". Describing tools as powered by Anthropic's Claude is fine.
- No visible search-volume numbers anywhere.
- `searchVolume` stays in `lib/tools.ts` (internal) but is not rendered.
- Work on branch `adsense-readiness`. Commit after each task. Do not push or open a PR until Task 9.
- Commit messages end with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `scripts/check-articles.mjs` (new) | Build-time guard: every registered article slug has a content file. |
| `scripts/check-site.mjs` (new) | Post-build verifier: routes, word counts, JSON-LD, sitemap, source URLs. |
| `lib/site.ts` (new) | `SITE` and `AUTHOR` constants used by layout, About, author page, JSON-LD. |
| `lib/articles.ts` | Article registry; gains `reviewed` and `sources` on every entry. |
| `lib/tools.ts` | Unchanged shape; `LIVE_TOOLS` helper and `LiveToolId` type added. |
| `content/tools/<id>.tsx` (7 new) | Static page content per tool: `faq` export + default component. |
| `components/ToolContent.tsx` (new) | Renders a tool's content, FAQ, FAQ JSON-LD, and related guides. |
| `components/ToolGrid.tsx` | Remove search-volume line. |
| `components/Nav.tsx` | "All Tools" → `/tools`. |
| `components/Footer.tsx` | Add operator name. |
| `app/tools/page.tsx` (new) | Server-rendered tool index. |
| `app/tools/*/page.tsx` (7) | Append `<ToolContent toolId="…" />`. |
| `app/author/sean-riley/page.tsx` (new) | Author page with Person JSON-LD. |
| `app/blog/[slug]/page.tsx` | Dynamic import by slug; byline, dates, sources, Article JSON-LD. |
| `app/blog/page.tsx` | Byline on cards, Privacy color, 4-topic description. |
| `app/about/page.tsx` | Human-operated copy, author block. |
| `app/page.tsx` | Remove AI-agents callout; computed badge counts. |
| `app/layout.tsx` | Verification meta, `<Analytics />`. |
| `app/sitemap.ts` | Derive from `LIVE_TOOLS`; add `/tools`, author page. |
| `.env.example`, `package.json`, `README.md` | Document env vars, add `check` script, update docs. |

---

### Task 1: Fix dead article routes and guard against recurrence

**Files:**
- Create: `scripts/check-articles.mjs`
- Modify: `app/blog/[slug]/page.tsx:1-28` (remove `CONTENT_MAP`), `:55-60` (dynamic import)
- Modify: `package.json` (scripts)

**Interfaces:**
- Produces: `npm run check:articles` exits 0 when every `ARTICLES` slug has `content/articles/<slug>.tsx`, exits 1 listing missing slugs otherwise. Runs as `prebuild`.

- [ ] **Step 1: Write the guard script**

```js
// scripts/check-articles.mjs
// Fails the build if lib/articles.ts registers a slug with no content file.
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const registry = readFileSync(resolve("lib/articles.ts"), "utf8");
const slugs = [...registry.matchAll(/^\s+slug:\s*'([^']+)'/gm)].map((m) => m[1]);
const missing = slugs.filter((s) => !existsSync(resolve(`content/articles/${s}.tsx`)));

if (slugs.length === 0) {
  console.error("check-articles: no slugs found in lib/articles.ts");
  process.exit(1);
}
if (missing.length) {
  console.error(`check-articles: ${missing.length} registered article(s) have no content file:`);
  for (const s of missing) console.error(`  content/articles/${s}.tsx`);
  process.exit(1);
}
console.log(`check-articles: ${slugs.length} articles registered, all have content files.`);
```

- [ ] **Step 2: Wire it into package.json**

In `package.json` `scripts`, add:

```json
"prebuild": "node scripts/check-articles.mjs",
"check:articles": "node scripts/check-articles.mjs"
```

- [ ] **Step 3: Run it to confirm the current state passes (content files exist; the bug is routing)**

Run: `npm run check:articles`
Expected: `check-articles: 36 articles registered, all have content files.`

- [ ] **Step 4: Reproduce the 404 locally**

Run: `npm run build && npx next start -p 3100 &` then `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3100/blog/pregnancy-safe-skincare`
Expected: `404`. Stop the server afterwards.

- [ ] **Step 5: Replace the hand-typed map with a dynamic import**

In `app/blog/[slug]/page.tsx`, delete the `CONTENT_MAP` constant (lines 7–26) and replace the loader block in `BlogPost` with:

```tsx
export default async function BlogPost({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug);
  if (!article) notFound();

  // Webpack bundles every file matching this template, so a new article only
  // needs a lib/articles.ts entry. scripts/check-articles.mjs guards the pair.
  const { default: Content } = (await import(
    `@/content/articles/${article.slug}`
  )) as { default: React.ComponentType };
  const related = getRelatedArticles(article);
```

Remove the now-unused `ARTICLES` import only if `generateStaticParams` no longer needs it (it does; keep it).

- [ ] **Step 6: Rebuild and verify all 36 routes**

Run:
```bash
npm run build && (npx next start -p 3100 & sleep 4; for s in $(grep -oE "^\s+slug: '[^']+'" lib/articles.ts | sed "s/.*'\(.*\)'/\1/"); do printf "%s %s\n" "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3100/blog/$s)" "$s"; done | sort | uniq -c -w3; kill %1)
```
Expected: one line, `36 200 …`.

- [ ] **Step 7: Commit**

```bash
git add scripts/check-articles.mjs "app/blog/[slug]/page.tsx" package.json
git commit -m "fix(blog): route every registered article; guard slug/content pairing at build

18 of 36 articles returned 404 in production because the route's import map
was hand-maintained. Import by slug and fail the build if a slug has no file.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: Site constants, author page, sitemap, verification tags, analytics

**Files:**
- Create: `lib/site.ts`, `app/author/sean-riley/page.tsx`
- Modify: `lib/tools.ts` (append helpers), `app/sitemap.ts`, `app/layout.tsx`, `.env.example`, `package.json`

**Interfaces:**
- Produces: `SITE = { name, url, operator, contactEmail }`, `AUTHOR = { name, role, slug, url, bio, sameAs }` from `lib/site.ts`; `LIVE_TOOLS: Tool[]` and `type LiveToolId` from `lib/tools.ts`.

- [ ] **Step 1: Create `lib/site.ts`**

```ts
export const SITE = {
  name: "ScanItFree",
  url: "https://scanitfree.com",
  operator: "Farallone Media LLC",
  contactEmail: "hello@scanitfree.com",
} as const;

export const AUTHOR = {
  name: "Sean Riley",
  role: "Founder, Farallone Media LLC",
  slug: "sean-riley",
  url: "/author/sean-riley",
  bio:
    "Sean Riley founded Farallone Media LLC and runs ScanItFree. He chooses what each tool checks, writes and reviews the scoring rubrics the AI follows, maintains the public data sources behind the tools, and reviews every guide before it is published.",
  sameAs: [] as string[],
} as const;
```

- [ ] **Step 2: Add live-tool helpers to `lib/tools.ts`** (append at end of file)

```ts
export const LIVE_TOOLS: Tool[] = TOOLS.filter((t) => t.status === "live");

export type LiveToolId =
  | "food-safety"
  | "resume-reviewer"
  | "resume-reviewer-pro"
  | "lease-scanner"
  | "cover-letter-reviewer"
  | "privacy-policy-translator"
  | "cosmetic-ingredient-scanner";

export function getTool(id: string): Tool | undefined {
  return TOOLS.find((t) => t.id === id);
}
```

- [ ] **Step 3: Rewrite `app/sitemap.ts` to derive from the registries**

```ts
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
    lastModified: new Date(a.reviewed ?? a.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));
  return [...fixed, ...tools, ...articles];
}
```

(`a.reviewed` is added in Task 6; until then TypeScript will flag it. Use `a.date` alone in this task and switch to `a.reviewed ?? a.date` in Task 6.)

- [ ] **Step 4: Add verification tags and analytics to `app/layout.tsx`**

Run `npm install @vercel/analytics`. Then in `app/layout.tsx`:

```tsx
import { Analytics } from "@vercel/analytics/react";
```

Extend `metadata`:

```ts
  verification: {
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
      : {}),
    ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { other: { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION } }
      : {}),
  },
```

Render `<Analytics />` after `<CookieConsent />` inside `<body>`.

- [ ] **Step 5: Document the env vars in `.env.example`** (append)

```
# Search engine ownership verification (optional). Paste the token only, not the whole meta tag.
# Google Search Console → Settings → Ownership verification → HTML tag
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
# Bing Webmaster Tools → Settings → Verify → HTML meta tag
NEXT_PUBLIC_BING_SITE_VERIFICATION=
```

- [ ] **Step 6: Create the author page `app/author/sean-riley/page.tsx`**

```tsx
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
          <a href={`mailto:${SITE.contactEmail}`} className="text-accent">{SITE.contactEmail}</a>.
        </p>
      </div>

      <h2 className="font-heading text-lg font-semibold text-[var(--text)] mt-12 mb-4">
        Guides by {AUTHOR.name}
      </h2>
      <ul className="space-y-2">
        {byDate.map((a) => (
          <li key={a.slug}>
            <Link href={`/blog/${a.slug}`} className="text-sm text-[var(--text)] hover:text-accent no-underline">
              {a.title}
            </Link>
            <span className="text-muted text-xs font-mono ml-2">{a.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 7: Type-check, build, verify sitemap**

Run: `npx tsc --noEmit && npm run build && (npx next start -p 3100 & sleep 4; curl -s http://localhost:3100/sitemap.xml | grep -c "<loc>"; curl -s http://localhost:3100/sitemap.xml | grep -o "/tools/[a-z-]*" | sort -u; curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3100/author/sean-riley; kill %1)`
Expected: `51` locs (8 fixed + 7 tools + 36 articles), seven `/tools/...` paths, `200` for the author page.

- [ ] **Step 8: Commit**

```bash
git add lib/site.ts lib/tools.ts app/sitemap.ts app/layout.tsx app/author .env.example package.json package-lock.json
git commit -m "feat(seo): derive sitemap from registries, add author page, verification tags, Vercel analytics

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Navigation, tool index, grid, homepage, About, footer copy

**Files:**
- Create: `app/tools/page.tsx`
- Modify: `components/Nav.tsx:16`, `components/ToolGrid.tsx:53-58`, `components/Footer.tsx:8`, `app/page.tsx:14-16,118-139`, `app/about/page.tsx`

- [ ] **Step 1: Nav link**

In `components/Nav.tsx`, change the first `<Link href="/"` inside the right-hand div to `href="/tools"`.

- [ ] **Step 2: Remove search-volume from the grid**

In `components/ToolGrid.tsx`, delete the `<span className="text-[11px] text-muted font-mono opacity-60">~{tool.searchVolume} searches</span>` element. Change the wrapping `flex justify-between` div to `flex justify-end`.

- [ ] **Step 3: Create `app/tools/page.tsx`**

```tsx
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
                  <h3 className="font-heading text-base font-semibold text-[var(--text)] mb-1">{t.name}</h3>
                  <p className="text-muted text-xs leading-relaxed">{t.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <section className="mt-6 text-muted text-sm leading-relaxed max-w-2xl">
        <h2 className="font-heading text-lg font-semibold text-[var(--text)] mb-3">How these tools are built</h2>
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
```

- [ ] **Step 4: Homepage edits in `app/page.tsx`**

Add imports: `import { ARTICLES } from "@/lib/articles"; import { LIVE_TOOLS } from "@/lib/tools";` and replace the `TOOLS` import usage: `<ToolGrid tools={LIVE_TOOLS} categories={CATEGORIES} />`.

Replace the hard-coded badge text with:
```tsx
{LIVE_TOOLS.length} TOOLS · {ARTICLES.length} GUIDES · AI ANALYSIS BY CLAUDE
```

Delete the entire `{/* AI-built callout */}` block (the div containing "built and maintained by AI agents").

In the "How it works" paragraph, change the first sentence to: `Each tool pairs Anthropic's Claude model with a rubric written and maintained by our team, plus real government and public data sources.`

- [ ] **Step 5: Footer operator line**

In `components/Footer.tsx`, change the first div to:
```tsx
<div>ScanItFree — Free AI utilities for everyday decisions · Farallone Media LLC</div>
```

- [ ] **Step 6: Rewrite `app/about/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { AUTHOR, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `About — ${SITE.name}`,
  description: "Who runs ScanItFree, how the tools are built, and how AI is used on the site.",
};

export default function AboutPage() {
  return (
    <div className="max-w-[640px] mx-auto px-6 py-16">
      <h1 className="font-display text-4xl text-[var(--text)] mb-6">About ScanItFree</h1>

      <div className="text-muted text-sm leading-relaxed space-y-4">
        <p>
          ScanItFree is run by <strong className="text-[var(--text)]">{SITE.operator}</strong>,
          founded by <Link href={AUTHOR.url} className="text-accent">{AUTHOR.name}</Link>. It
          offers free scanning and review tools for everyday documents and labels: food
          ingredient lists, cosmetic ingredients, leases, privacy policies, resumes, and cover
          letters. Every tool is free, needs no account, and discards what you upload once the
          result is shown.
        </p>

        <h2 className="font-heading text-lg font-semibold text-[var(--text)] pt-4">How the tools are built</h2>
        <p>
          Reading and scoring is done by Anthropic&apos;s Claude model. What the model looks
          for is decided by a person. Each tool follows a written rubric that lists the exact
          clauses, ingredients, or resume signals to flag and the public source behind each
          one, for example the state statute a lease clause violates or the FDA listing for a
          recalled product. Where a live dataset exists, the tool queries it directly: the Food
          Safety Scanner checks the FDA enforcement database on every scan.
        </p>
        <p>
          Rubrics are tested against real documents and corrected when a result is wrong or
          overconfident. Guides are written and reviewed by {AUTHOR.name}, carry a last-reviewed
          date, and list their primary sources.
        </p>

        <h2 className="font-heading text-lg font-semibold text-[var(--text)] pt-4">Our principles</h2>
        <p>
          <strong className="text-[var(--text)]">Privacy first:</strong> We don&apos;t store your data. Your
          resume text, lease content, and ingredient lists are processed in real time and
          immediately discarded. We don&apos;t build user profiles or sell data.
        </p>
        <p>
          <strong className="text-[var(--text)]">Real data, not guesses:</strong> Wherever a public database or
          statute exists, the tools reference it rather than relying on the model alone.
        </p>
        <p>
          <strong className="text-[var(--text)]">Transparency:</strong> Every tool page explains what it
          checks, what it cannot check, and when to consult a professional.
        </p>

        <h2 className="font-heading text-lg font-semibold text-[var(--text)] pt-4" id="author">About the author</h2>
        <p>{AUTHOR.bio}</p>
        <p>
          <Link href={AUTHOR.url} className="text-accent">Read more about {AUTHOR.name} and see all guides →</Link>
        </p>

        <h2 className="font-heading text-lg font-semibold text-[var(--text)] pt-4">Disclaimer</h2>
        <p>
          All tools are for informational purposes only and do not constitute legal, medical,
          or professional advice of any kind. Always consult a qualified professional for
          decisions that affect your health, legal rights, or financial wellbeing. The site is
          supported by advertising.
        </p>

        <h2 className="font-heading text-lg font-semibold text-[var(--text)] pt-4">Contact</h2>
        <p>
          Questions, corrections, or partnership inquiries:{" "}
          <a href={`mailto:${SITE.contactEmail}`} className="text-accent">{SITE.contactEmail}</a>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Verify no forbidden copy remains**

Run: `grep -rniE "AI agents|AI-built|searches</span>" app components lib`
Expected: no output.

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add components/Nav.tsx components/ToolGrid.tsx components/Footer.tsx app/page.tsx app/about/page.tsx app/tools/page.tsx
git commit -m "feat(site): tools index, human-operated About copy, remove AI-agent callout and search-volume badges

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: ToolContent component and the first tool content (lease scanner)

**Files:**
- Create: `components/ToolContent.tsx`, `content/tools/lease-scanner.tsx`
- Modify: `app/tools/lease-scanner/page.tsx`

**Interfaces:**
- Produces: `content/tools/<id>.tsx` must export `faq: FaqItem[]` (exactly 6) and `default: () => JSX.Element`. `ToolContent({ toolId }: { toolId: LiveToolId })`.

- [ ] **Step 1: Create `components/ToolContent.tsx`**

```tsx
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }} />

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
              <Link key={g.slug} href={`/blog/${g.slug}`} className="block bg-surface border border-border rounded-lg p-4 no-underline hover:border-accent transition-colors">
                <span className="font-heading text-sm font-semibold text-[var(--text)]">{g.title}</span>
                <span className="block text-muted text-xs mt-1">{g.description}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Write `content/tools/lease-scanner.tsx`** (complete; this is the model the other six follow)

```tsx
import type { FaqItem } from "@/components/ToolContent";

export const faq: FaqItem[] = [
  {
    q: "Is the Lease Red Flag Scanner legal advice?",
    a: "No. It is an informational review that points out clauses commonly found to be unfair or unenforceable under your state's landlord-tenant statutes. For a decision about signing, breaking, or disputing a lease, talk to a tenant rights organization or an attorney in your state.",
  },
  {
    q: "Which states does it support?",
    a: "All 50 states and the District of Columbia. The rubric includes specific statute references for the most common tenant protections, such as deposit caps and return deadlines, in California, New York, Texas, New Jersey, Florida, Washington, Illinois, and Massachusetts. For other states it applies the Uniform Residential Landlord and Tenant Act principles and tells you when a protection could not be verified.",
  },
  {
    q: "What file types can I upload?",
    a: "PDF and DOCX files up to 10 MB, or pasted text up to 24,000 characters. Scanned leases work if the PDF contains a text layer; a photographed lease without one will not be readable.",
  },
  {
    q: "Is my lease stored?",
    a: "No. The lease text is sent to the analysis model, the result is returned to your browser, and nothing is written to a database or log. Close the tab and it is gone.",
  },
  {
    q: "Why did my lease get a low score when my landlord seems fine?",
    a: "The score reflects the document, not the person. Many landlords use template leases that contain outdated or overreaching clauses they never enforce. A low score is a reason to ask for a clause to be struck or amended before signing, not proof of bad intent.",
  },
  {
    q: "How many scans can I run?",
    a: "Fifteen per day from one network address across all ScanItFree tools. The limit keeps the service free; it resets every 24 hours.",
  },
];

export default function Content() {
  return (
    <>
      <h2>What this tool checks</h2>
      <p>
        A residential lease is a contract written by one side. Most renters sign it in
        minutes, often on a phone, without reading the clauses that decide what happens
        to their deposit, how much notice they get before someone enters, or what they
        owe if they leave early. The Lease Red Flag Scanner reads the whole document and
        flags the clauses that most often cost tenants money or rights, then explains
        each one in plain English and tells you what to ask for instead.
      </p>
      <p>
        It is built for renters reviewing a lease before signing, tenants trying to
        understand a lease they already signed, and anyone deciding whether a landlord's
        deduction or demand is actually allowed. It works on standard apartment leases,
        single-family rentals, room rentals, and most sublease agreements.
      </p>

      <h2>How it works</h2>
      <p>
        You paste the lease text or upload the PDF or DOCX, pick your state, and submit.
        The tool sends the text to Anthropic's Claude model together with a rubric we
        maintain. The rubric names the specific clause types to look for, the state
        statutes that govern them, and how severe each problem is. The model is told to
        cite a statute only when it is certain and to say so when a state-specific rule
        could not be verified.
      </p>
      <p>
        The clause types the rubric covers include: security deposit amount and return
        deadline; late fees and their caps; landlord entry notice; automatic renewal and
        notice-to-vacate windows; early termination penalties; joint and several
        liability for roommates; repair and maintenance responsibility; waiver of the
        implied warranty of habitability; waiver of jury trial or class action;
        attorney's fee clauses that only run one way; pet, guest, and subletting
        restrictions; and any clause that tries to waive a right your state says cannot
        be waived.
      </p>
      <p>
        For eight high-population states the rubric carries exact citations, for example
        California Civil Code § 1950.5 for deposits, New York Real Property Law § 227-e,
        Texas Property Code § 92.101, New Jersey Statutes § 46:8-19, Florida Statutes
        § 83.49, Washington RCW 59.18.260, 765 ILCS 710 in Illinois, and Massachusetts
        General Laws chapter 186 § 15B. For other states the tool applies the Uniform
        Residential Landlord and Tenant Act framework that most state codes are based
        on, and labels those findings as general rather than state-verified.
      </p>

      <h2>How to read your results</h2>
      <p>
        The result has four parts. The <strong>score</strong> runs from 0 to 100 and is
        mapped to a letter grade: 90 and above is an A, meaning the lease is largely
        balanced; 70 to 89 is a B with minor concerns; 50 to 69 is a C with clauses worth
        negotiating; 30 to 49 is a D with significant problems; below 30 is an F, meaning
        several clauses are likely unenforceable or abusive.
      </p>
      <p>
        <strong>Flags</strong> are the individual findings. Each has a severity: a red
        flag is a clause that likely violates your state's law or removes a protection
        you cannot waive; a caution is a clause that is legal but unfavorable and worth
        negotiating; a note is something to be aware of, such as a short notice window.
        Each flag quotes the clause, explains the problem, and suggests the language to
        ask for.
      </p>
      <p>
        <strong>Missing protections</strong> lists things a fair lease would include but
        yours does not, such as a move-in inspection checklist, a stated deposit return
        deadline, or a written repair request procedure. The <strong>summary</strong>
        gives the overall picture in two or three sentences.
      </p>

      <h2>A sample result</h2>
      <p>
        A tenant in Washington uploads a 14-page lease. The tool returns a score of 54,
        grade C, with these findings:
      </p>
      <ul>
        <li>
          <strong>Red flag:</strong> &ldquo;Tenant waives any right to a move-in
          inspection.&rdquo; Washington requires a written move-in checklist signed by
          both parties before a deposit can be collected (RCW 59.18.260). Suggested fix:
          strike the clause and attach a checklist.
        </li>
        <li>
          <strong>Caution:</strong> &ldquo;Landlord may enter at any reasonable time.&rdquo;
          Washington requires two days' written notice for non-emergency entry. Suggested
          fix: replace with the statutory notice period.
        </li>
        <li>
          <strong>Caution:</strong> &ldquo;A late fee of $75 plus $10 per day applies
          after the 1st.&rdquo; Legal, but steep; many landlords accept a flat fee after
          a five-day grace period.
        </li>
        <li>
          <strong>Note:</strong> Lease renews automatically for 12 months unless 60 days'
          notice is given. Put the date in your calendar.
        </li>
      </ul>
      <p>
        Missing protections: no deposit return deadline stated (Washington allows 30
        days), no repair request procedure. Summary: a standard template lease with one
        clause that is unenforceable in Washington and two that are worth negotiating
        before signing.
      </p>

      <h2>Limitations</h2>
      <p>
        The tool reads the lease you give it; it cannot see addenda, house rules, or
        local ordinances that change the picture. City-level rules such as rent
        stabilization in New York City or just-cause eviction in Seattle are not in the
        rubric. It does not know your rental history, the condition of the unit, or what
        was said verbally. A statute citation is a starting point for your own reading
        or a conversation with a tenant rights group, not a legal opinion.
      </p>
      <p>
        If the lease is for commercial space, a mobile home lot, public housing, or a
        unit covered by a housing voucher, different laws apply and the results will be
        incomplete. Scanned PDFs without a text layer cannot be read. Talk to a lawyer
        or a local tenant union before refusing to sign, withholding rent, or breaking a
        lease based on anything you read here.
      </p>
    </>
  );
}
```

- [ ] **Step 3: Wire it into the page**

`app/tools/lease-scanner/page.tsx`:

```tsx
import type { Metadata } from "next";
import { LeaseClient } from "./client";
import { ToolContent } from "@/components/ToolContent";

export const metadata: Metadata = { /* unchanged */ };

export default function LeaseScannerPage() {
  return (
    <>
      <LeaseClient />
      <ToolContent toolId="lease-scanner" />
    </>
  );
}
```

(Keep the existing `metadata` block exactly as it is; check the client export name in `client.tsx` and use it.)

- [ ] **Step 4: Verify word count and JSON-LD**

Run: `npx tsc --noEmit && npm run build && (npx next start -p 3100 & sleep 4; curl -s http://localhost:3100/tools/lease-scanner | sed 's/<script[^>]*>[^<]*<\/script>//g; s/<[^>]*>/ /g' | wc -w; curl -s http://localhost:3100/tools/lease-scanner | grep -o '"@type":"FAQPage"' ; kill %1)`
Expected: word count ≥ 1,100 (page chrome adds ~200), one `"@type":"FAQPage"`.

- [ ] **Step 5: Commit**

```bash
git add components/ToolContent.tsx content/tools/lease-scanner.tsx app/tools/lease-scanner/page.tsx
git commit -m "feat(tools): shared ToolContent section with FAQ schema; lease scanner guide

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: Content for the remaining six tools

**Files:**
- Create: `content/tools/food-safety.tsx`, `content/tools/cosmetic-ingredient-scanner.tsx`, `content/tools/privacy-policy-translator.tsx`, `content/tools/resume-reviewer.tsx`, `content/tools/resume-reviewer-pro.tsx`, `content/tools/cover-letter-reviewer.tsx`
- Modify: the matching six `app/tools/*/page.tsx` files (same two-line change as Task 4 Step 3)

Each file uses the exact structure of `content/tools/lease-scanner.tsx`: `faq` with 6 items, then a default component with the five H2 sections **What this tool checks**, **How it works**, **How to read your results**, **A sample result**, **Limitations**. 900 to 1,200 words of prose, written for a reader who has never used the tool. Facts each one must cover (taken from the rubrics in `app/api/analyze/route.ts` and `lib/resume-scorer.ts`; read them before writing):

- [ ] **Step 1: `food-safety.tsx`** — inputs: product name, UPC, ingredient list, or label photo/PDF; live query of the openFDA enforcement database on every scan (`lib/openfda.ts`) and how a recall match is shown as a red flag with the FDA recall number; the Big 9 allergens; additives the rubric treats as warnings (BHA, BHT, artificial dyes Red 40, Yellow 5, Blue 1, sodium nitrite, partially hydrogenated oils); score bands A–F; sample result for a packaged snack with a related-recall info flag; limitations: no nutrition analysis, no individual allergy advice, FDA data lags 1–2 days, USDA-regulated meat and poultry recalls are a separate database the tool does not query.
- [ ] **Step 2: `cosmetic-ingredient-scanner.tsx`** — INCI names; EWG Skin Deep style 1–10 concern scores; the pregnancy-flag list (retinoids, salicylic acid over 2%, hydroquinone, formaldehyde releasers such as DMDM hydantoin and quaternium-15); contact allergens (methylisothiazolinone, fragrance/parfum, lanolin, balsam of Peru, PPD); claims check rules ("natural" has no legal definition under 21 CFR Part 700, "fragrance-free" vs masking fragrance components such as linalool and limonene); sample result for a face moisturizer graded B; limitations: concentrations are not on the label so dose is unknown, EWG scores are hazard-based not risk-based, not a substitute for a dermatologist or patch test.
- [ ] **Step 3: `privacy-policy-translator.tsx`** — what it extracts (data collected, who it is shared with, retention, your rights to delete/export/opt out, governing law GDPR/CCPA/other); the red-flag list (unnamed "partners", "as long as necessary" retention, training AI on user data without opt-in, sale without a CCPA opt-out, mandatory arbitration, unilateral policy changes, under-13 data without COPPA safeguards); score bands; sample result for a fitness app policy graded D; limitations: it reads the policy text not the company's behavior, a good policy does not guarantee good practice, legal citations are to GDPR Articles 7, 17, 20 and CCPA §§ 1798.105, .110, .120 and should be read in full.
- [ ] **Step 4: `resume-reviewer.tsx`** — free reviewer: paste or upload PDF/DOCX, optional job description; what the AI scores (formatting for ATS parsing, quantified results, keyword overlap with the JD, summary quality, section headers); score and section feedback; keyword gap list when a JD is supplied; sample result for a marketing coordinator resume scored 71 with three missing keywords; limitations: ATS vendors differ (Workday, Greenhouse, Lever parse differently), the score is a review not a hiring prediction, does not fabricate experience and will not suggest adding skills you do not have.
- [ ] **Step 5: `resume-reviewer-pro.tsx`** — how it differs: a deterministic scorer in `lib/resume-scorer.ts` that gives the same resume and JD the same score every time, an AI rewrite loop that edits bullets until the deterministic score reaches 90 or the honest ceiling, the rule that it never adds a skill you declined or do not have, the company-context field; explain the Skills Gap tab; sample before/after (68 → 92) reusing the homepage example; limitations: a 90+ score means the document is well-matched to the JD text, not that you are qualified; rewrites should be read and edited by you; heavy keyword matching can read as stuffing to a human recruiter, so review tone.
- [ ] **Step 6: `cover-letter-reviewer.tsx`** — four scored sections (opening hook, body, closing, tone and voice); length guidance 250–400 words with too-short below 200 and too-long above 500; ATS score; JD-aware mode with company and role alignment and missing keywords vs no-JD mode with inferred role; sample result graded B with a generic opening flagged; limitations: cannot verify claims, tone preferences differ by industry, not for academic cover letters or UK/EU-style personal statements.
- [ ] **Step 7: Wire each into its page** exactly as in Task 4 Step 3, using each client's export name (`FoodSafetyClient`, `CosmeticIngredientClient`, `PrivacyPolicyClient`, `ResumeClient`, `ResumeProClient`, `CoverLetterClient`; confirm each by reading the `client.tsx` export line).
- [ ] **Step 8: Verify all seven**

Run: `npx tsc --noEmit && npm run build && (npx next start -p 3100 & sleep 4; for t in food-safety resume-reviewer resume-reviewer-pro lease-scanner cover-letter-reviewer privacy-policy-translator cosmetic-ingredient-scanner; do printf "%5s %s\n" "$(curl -s http://localhost:3100/tools/$t | sed 's/<script[^>]*>[^<]*<\/script>//g; s/<[^>]*>/ /g' | wc -w)" $t; done; kill %1)`
Expected: every count ≥ 1,100.

- [ ] **Step 9: Commit**

```bash
git add content/tools app/tools
git commit -m "feat(tools): page guides and FAQ schema for all seven tools

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: Article bylines, reviewed dates, sources, and Article JSON-LD

**Files:**
- Modify: `lib/articles.ts` (interface + every entry), `app/blog/[slug]/page.tsx`, `app/blog/page.tsx`, `app/sitemap.ts` (switch to `a.reviewed ?? a.date`)

**Interfaces:**
- Produces: `Article.reviewed: string` (ISO date), `Article.sources: { title: string; url: string }[]`.

- [ ] **Step 1: Extend the interface in `lib/articles.ts`**

```ts
export interface ArticleSource {
  title: string;
  url: string;
}

export interface Article {
  slug: string;
  title: string;
  description: string;
  date: string;
  reviewed: string;
  category: string;
  keywords: string[];
  toolSlug: string;
  toolName: string;
  relatedSlugs: string[];
  sources: ArticleSource[];
}
```

- [ ] **Step 2: Add `reviewed: '2026-10-08'` and a `sources` array to all 36 entries.** Every URL must be a primary source and must be checked with the script in Task 7 before commit. Use this source pool; pick the 3–6 that the article's text actually relies on, and add article-specific statute links where the text names a state:

Legal cluster (lease-red-flags, security-deposit-laws, get-security-deposit-back, joint-and-several-liability, can-landlord-raise-rent-mid-lease, landlord-wont-make-repairs):
- California Civil Code § 1950.5 — `https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1950.5`
- New York Real Property Law § 227-e — `https://www.nysenate.gov/legislation/laws/RPP/227-E`
- Texas Property Code § 92.101 — `https://statutes.capitol.texas.gov/Docs/PR/htm/PR.92.htm`
- Florida Statutes § 83.49 — `http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0000-0099/0083/Sections/0083.49.html`
- Washington RCW 59.18.260 — `https://app.leg.wa.gov/RCW/default.aspx?cite=59.18.260`
- Massachusetts G.L. c. 186 § 15B — `https://malegislature.gov/Laws/GeneralLaws/PartII/TitleI/Chapter186/Section15B`
- Illinois 765 ILCS 710 — `https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=2201&ChapterID=62`
- HUD Tenant Rights — `https://www.hud.gov/topics/rental_assistance/tenantrights`
- Cornell LII: Landlord-Tenant Law — `https://www.law.cornell.edu/wex/landlord-tenant_law`
- Uniform Law Commission, URLTA — `https://www.uniformlaws.org/committees/community-home?CommunityKey=aea3b3f7-5a2f-4c8e-9b2d-6f0a2e1f2b7c` (if this URL fails the check, use `https://www.uniformlaws.org/acts/urlta`)

Health/food cluster (fda-food-recalls-explained, what-is-bha-in-food, food-allergens-label-reading, food-dyes-safety, natural-vs-organic-food-labels, how-to-read-nutrition-label):
- FDA Recalls, Market Withdrawals & Safety Alerts — `https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts`
- openFDA Food Enforcement API — `https://open.fda.gov/apis/food/enforcement/`
- FDA Food Allergies (FALCPA, FASTER Act) — `https://www.fda.gov/food/food-labeling-nutrition/food-allergies`
- FDA Color Additives in Foods — `https://www.fda.gov/food/food-additives-petitions/color-additives-foods`
- 21 CFR 172.110 (BHA) — `https://www.ecfr.gov/current/title-21/chapter-I/subchapter-B/part-172/subpart-B/section-172.110`
- NTP Report on Carcinogens, BHA — `https://ntp.niehs.nih.gov/whatwestudy/assessments/cancer/roc`
- USDA National Organic Program — `https://www.ams.usda.gov/about-ams/programs-offices/national-organic-program`
- FDA "Natural" on Food Labeling — `https://www.fda.gov/food/food-labeling-nutrition/use-term-natural-food-labeling`
- FDA How to Understand and Use the Nutrition Facts Label — `https://www.fda.gov/food/nutrition-facts-label/how-understand-and-use-nutrition-facts-label`
- California AB 2316 (school food dyes) — `https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202320240AB2316`

Cosmetic cluster (whats-in-your-face-wash, ewg-hazard-scores-explained, parabens-phthalates-sulfates, how-to-read-a-cosmetic-label, pregnancy-safe-skincare, natural-clean-organic-cosmetics):
- FDA Cosmetics Labeling Guide — `https://www.fda.gov/cosmetics/cosmetics-labeling/cosmetics-labeling-guide`
- 21 CFR Part 701 (cosmetic labeling) — `https://www.ecfr.gov/current/title-21/chapter-I/subchapter-G/part-701`
- FDA Parabens in Cosmetics — `https://www.fda.gov/cosmetics/cosmetic-ingredients/parabens-cosmetics`
- FDA Phthalates in Cosmetics — `https://www.fda.gov/cosmetics/cosmetic-ingredients/phthalates-cosmetics`
- FDA Fragrances in Cosmetics — `https://www.fda.gov/cosmetics/cosmetic-ingredients/fragrances-cosmetics`
- EWG Skin Deep methodology — `https://www.ewg.org/skindeep/contents/about-page/`
- ACOG: Skin Conditions During Pregnancy — `https://www.acog.org/womens-health/faqs/skin-conditions-during-pregnancy`
- MoCRA overview (FDA) — `https://www.fda.gov/cosmetics/cosmetics-laws-regulations/modernization-cosmetics-regulation-act-2022-mocra`

Career cluster (beat-ats-resume-filters, resume-keywords, resume-bullet-examples, hard-skills-vs-soft-skills, how-long-should-resume-be, how-to-write-resume-summary, how-to-write-cover-letter, ats-friendly-cover-letter-format, cover-letter-mistakes, how-to-start-a-cover-letter, cover-letter-vs-resume, how-long-should-cover-letter-be):
- Harvard Business School: Hidden Workers report — `https://www.hbs.edu/managing-the-future-of-work/Documents/research/hiddenworkers09032021.pdf`
- U.S. Bureau of Labor Statistics, Occupational Outlook Handbook — `https://www.bls.gov/ooh/`
- O*NET OnLine (skills taxonomy) — `https://www.onetonline.org/`
- CareerOneStop (U.S. Dept. of Labor) resume guide — `https://www.careeronestop.org/JobSearch/Resumes/resumes.aspx`
- CareerOneStop cover letters — `https://www.careeronestop.org/JobSearch/Resumes/cover-letters.aspx`
- EEOC: Prohibited Employment Policies/Practices — `https://www.eeoc.gov/prohibited-employment-policiespractices`
- Ladders eye-tracking study (2018) — `https://www.theladders.com/career-advice/ladders-updates-popular-recruiter-eye-tracking-study-with-new-key-insights-on-how-job-seekers-can-improve-their-resumes`

Privacy cluster (how-to-read-a-privacy-policy, what-does-a-privacy-policy-tell-you, privacy-policy-red-flags, gdpr-vs-ccpa-privacy-policy, how-companies-use-your-data, data-rights-2026):
- GDPR full text (EUR-Lex) — `https://eur-lex.europa.eu/eli/reg/2016/679/oj`
- GDPR Article 17 — `https://gdpr-info.eu/art-17-gdpr/`
- GDPR Article 20 — `https://gdpr-info.eu/art-20-gdpr/`
- California Civil Code § 1798.100 et seq. (CCPA) — `https://leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?division=3.&part=4.&lawCode=CIV&title=1.81.5`
- California Privacy Protection Agency — `https://cppa.ca.gov/`
- FTC: Protecting Consumer Privacy — `https://www.ftc.gov/business-guidance/privacy-security`
- COPPA Rule, 16 CFR Part 312 — `https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-312`
- Pew Research: Americans and Privacy (2023) — `https://www.pewresearch.org/internet/2023/10/18/how-americans-view-data-privacy/`

Example entry after the change:

```ts
  {
    slug: 'security-deposit-laws',
    title: 'Security Deposit Laws by State: How Much Can a Landlord Actually Charge?',
    description: 'State-by-state guide to security deposit caps, return timelines, and interest requirements. Know your rights before signing a lease.',
    date: '2026-05-08',
    reviewed: '2026-10-08',
    category: 'Legal',
    keywords: ['security deposit laws by state', 'how much can landlord charge security deposit', 'security deposit rules', 'deposit return timeline'],
    toolSlug: 'lease-scanner',
    toolName: 'Lease Red Flag Scanner',
    relatedSlugs: ['lease-red-flags', 'get-security-deposit-back'],
    sources: [
      { title: 'California Civil Code § 1950.5', url: 'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1950.5' },
      { title: 'New York Real Property Law § 227-e', url: 'https://www.nysenate.gov/legislation/laws/RPP/227-E' },
      { title: 'Texas Property Code § 92.101', url: 'https://statutes.capitol.texas.gov/Docs/PR/htm/PR.92.htm' },
      { title: 'Massachusetts G.L. c. 186 § 15B', url: 'https://malegislature.gov/Laws/GeneralLaws/PartII/TitleI/Chapter186/Section15B' },
      { title: 'HUD: Tenant Rights', url: 'https://www.hud.gov/topics/rental_assistance/tenantrights' },
    ],
  },
```

- [ ] **Step 3: Update `app/blog/[slug]/page.tsx`** — add imports `import { AUTHOR, SITE } from "@/lib/site";`, extend `generateMetadata` with `authors: [{ name: AUTHOR.name, url: \`${SITE.url}${AUTHOR.url}\` }]` and `openGraph.modifiedTime: article.reviewed`, then replace the header block and add the sources block:

```tsx
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* ← All articles link unchanged */}

      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full uppercase tracking-wide bg-accent-dim text-accent">
          {article.category}
        </span>
      </div>

      <h1 …>{article.title}</h1>
      <p className="text-muted text-sm leading-relaxed mb-4">{article.description}</p>

      <p className="text-[12px] text-muted font-mono mb-10">
        By <Link href={AUTHOR.url} className="text-accent no-underline hover:underline">{AUTHOR.name}</Link>
        {" · "}Published {article.date}
        {" · "}Last reviewed {article.reviewed}
      </p>

      <div className="prose-scanitfree"><Content /></div>

      <section className="mt-10 border-t border-border pt-6" aria-label="Sources">
        <h2 className="font-heading text-sm font-semibold text-muted uppercase tracking-wide mb-3">Sources</h2>
        <ol className="list-decimal pl-5 space-y-1.5">
          {article.sources.map((s) => (
            <li key={s.url} className="text-xs text-muted">
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-accent">{s.title}</a>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA and Related blocks unchanged */}
```

- [ ] **Step 4: Update `app/blog/page.tsx`** — add `Privacy: "bg-amber-500/10 text-amber-400"` to `CATEGORY_COLORS`; change the description to `"Practical guides on food safety, cosmetic ingredients, renting and tenant rights, privacy policies, resumes, and cover letters. Every guide is reviewed, dated, and lists its sources."`; add under the date span: `<span className="text-[11px] text-muted font-mono">· {AUTHOR.name}</span>` with the `AUTHOR` import.

- [ ] **Step 5: Switch the sitemap** to `lastModified: new Date(a.reviewed)`.

- [ ] **Step 6: Type-check and build**

Run: `npx tsc --noEmit && npm run build`
Expected: no errors (any entry missing `reviewed` or `sources` fails type-check).

- [ ] **Step 7: Commit**

```bash
git add lib/articles.ts "app/blog/[slug]/page.tsx" app/blog/page.tsx app/sitemap.ts
git commit -m "feat(blog): bylines, reviewed dates, primary sources, Article schema on every guide

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: Site verification script

**Files:**
- Create: `scripts/check-site.mjs`
- Modify: `package.json` (add `"check": "node scripts/check-site.mjs"`), `README.md`

- [ ] **Step 1: Write `scripts/check-site.mjs`**

```js
// Post-build verifier. Usage: BASE=http://localhost:3100 node scripts/check-site.mjs
// Assumes `next start` is serving a production build at BASE.
import { readFileSync } from "node:fs";

const BASE = process.env.BASE ?? "http://localhost:3100";
const MIN_TOOL_WORDS = 900;
let failures = 0;
const fail = (msg) => { failures++; console.error("FAIL " + msg); };
const ok = (msg) => console.log("ok   " + msg);

const registry = readFileSync("lib/articles.ts", "utf8");
const slugs = [...registry.matchAll(/^\s+slug:\s*'([^']+)'/gm)].map((m) => m[1]);
const sourceUrls = [...new Set([...registry.matchAll(/url:\s*'([^']+)'/g)].map((m) => m[1]))];
const toolsTs = readFileSync("lib/tools.ts", "utf8");
const liveTools = [...toolsTs.matchAll(/id:\s*"([^"]+)",[\s\S]*?status:\s*"live"/g)].map((m) => m[1]);

const visibleText = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<nav[\s\S]*?<\/nav>/g, " ")
    .replace(/<footer[\s\S]*?<\/footer>/g, " ")
    .replace(/<form[\s\S]*?<\/form>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/g, " ");
const words = (s) => s.split(/\s+/).filter((w) => /[A-Za-z]/.test(w)).length;
const jsonLdBlocks = (html) =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));

async function get(path) {
  const r = await fetch(BASE + path);
  return { status: r.status, html: await r.text() };
}

// 1. Tool pages
for (const id of liveTools) {
  const { status, html } = await get(`/tools/${id}`);
  if (status !== 200) { fail(`/tools/${id} -> ${status}`); continue; }
  const n = words(visibleText(html));
  n >= MIN_TOOL_WORDS ? ok(`/tools/${id} ${n} words`) : fail(`/tools/${id} only ${n} words`);
  const faq = jsonLdBlocks(html).find((b) => b["@type"] === "FAQPage");
  faq && faq.mainEntity?.length === 6 ? ok(`/tools/${id} FAQPage x6`) : fail(`/tools/${id} FAQPage missing or not 6`);
}

// 2. Articles
for (const slug of slugs) {
  const { status, html } = await get(`/blog/${slug}`);
  if (status !== 200) { fail(`/blog/${slug} -> ${status}`); continue; }
  const art = jsonLdBlocks(html).find((b) => b["@type"] === "Article");
  art?.author?.name ? ok(`/blog/${slug} Article schema`) : fail(`/blog/${slug} Article schema missing author`);
  const srcCount = (html.match(/aria-label="Sources"[\s\S]*?<\/section>/)?.[0].match(/<a /g) ?? []).length;
  srcCount >= 3 ? ok(`/blog/${slug} ${srcCount} sources`) : fail(`/blog/${slug} only ${srcCount} sources`);
}

// 3. Fixed pages
for (const p of ["/", "/tools", "/blog", "/about", "/author/sean-riley", "/contact", "/privacy", "/terms"]) {
  const { status, html } = await get(p);
  status === 200 ? ok(p) : fail(`${p} -> ${status}`);
  if (/AI agents|AI-built|searches<\/span>/i.test(html)) fail(`${p} contains forbidden copy`);
}

// 4. Sitemap
{
  const { html } = await get("/sitemap.xml");
  const locs = [...html.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  const expectTools = liveTools.map((t) => `/tools/${t}`);
  const missingTools = expectTools.filter((p) => !locs.includes(p));
  const missingArts = slugs.map((s) => `/blog/${s}`).filter((p) => !locs.includes(p));
  const extraTools = locs.filter((p) => p.startsWith("/tools/") && !expectTools.includes(p));
  missingTools.length || missingArts.length || extraTools.length
    ? fail(`sitemap: missing tools ${missingTools} missing articles ${missingArts} extra tools ${extraTools}`)
    : ok(`sitemap ${locs.length} urls, tools and articles complete`);
}

// 5. Source URLs reachable
for (const url of sourceUrls) {
  try {
    let r = await fetch(url, { method: "HEAD", redirect: "follow", headers: { "user-agent": "Mozilla/5.0 (scanitfree link check)" } });
    if (r.status === 405 || r.status === 403) r = await fetch(url, { redirect: "follow", headers: { "user-agent": "Mozilla/5.0 (scanitfree link check)" } });
    r.status < 400 ? ok(`source ${r.status} ${url}`) : fail(`source ${r.status} ${url}`);
  } catch (e) {
    fail(`source unreachable ${url} (${e.message})`);
  }
}

console.log(failures ? `\n${failures} failure(s)` : "\nAll checks passed");
process.exit(failures ? 1 : 0);
```

- [ ] **Step 2: Add the script and document it**

`package.json` scripts: `"check": "node scripts/check-site.mjs"`.

`README.md`: replace the "Adding Google AdSense" section's step 2 and 3 (the script is already live) with a short "Verification" section:

```markdown
## Verification

```bash
npm run build
npx next start -p 3100 &
BASE=http://localhost:3100 npm run check
```

`check-site.mjs` confirms every tool page has ≥ 900 words of guide text and FAQ schema, every article resolves with Article schema and ≥ 3 sources, the sitemap matches the registries, and every source URL is reachable. `prebuild` separately fails the build if an article slug has no content file.
```

Also update the README "Project Structure" tree to add `content/tools/`, `components/ToolContent.tsx`, `app/tools/page.tsx`, `app/author/`, `scripts/`, and `lib/site.ts`, and add the two verification env vars to the Vercel step.

- [ ] **Step 3: Run it against a production build**

Run: `npm run build && (npx next start -p 3100 & sleep 4; BASE=http://localhost:3100 npm run check; kill %1)`
Expected: ends with `All checks passed`. Fix any failing source URL by replacing it with a working primary source, never by deleting the check.

- [ ] **Step 4: Commit**

```bash
git add scripts/check-site.mjs package.json README.md
git commit -m "chore: post-build site verifier (content depth, schema, sitemap, source links)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 8: Browser pass

- [ ] **Step 1:** Start the dev server with `preview_start` (add a `.claude/launch.json` entry `{"name":"scanitfree","runtimeExecutable":"npm","runtimeArgs":["run","dev"],"port":3000}` if missing).
- [ ] **Step 2:** Visit `/`, `/tools`, `/tools/lease-scanner`, `/blog/security-deposit-laws`, `/about`, `/author/sean-riley` at desktop and 375px. Confirm: no console errors; the guide section sits below the tool form; the FAQ renders; the byline and Sources render; no horizontal scroll at 375px.
- [ ] **Step 3:** Fix anything found, re-run `npm run check`, commit as `fix(ui): …`.

---

### Task 9: Push and open the PR

- [ ] **Step 1:** `git push -u origin adsense-readiness`
- [ ] **Step 2:** Open a PR titled `AdSense readiness: fix dead article routes, tool page guides, author and sources, sitemap` with a body that lists the ten audit findings and which commit fixes each, the three manual steps for Sean (Search Console, Bing, Vercel Analytics), and the two Vercel env vars. End the body with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
- [ ] **Step 3:** Bind the PR in the desktop app and report CI status.
