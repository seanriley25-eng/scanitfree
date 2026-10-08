# ScanItFree — Free AI-Powered Utility Hub

Ad-supported website with free AI tools powered by Anthropic's Claude API. Built with Next.js 14, Tailwind CSS, deployed on Vercel.

## Quick Start

```bash
# 1. Clone or copy this project
cd scanitfree

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your Anthropic API key

# 4. Run locally
npm run dev
# Open http://localhost:3000
```

## Deploy to Vercel

```bash
# Option A: Vercel CLI
npm i -g vercel
vercel

# Option B: Push to GitHub and connect to Vercel dashboard
# 1. Create a GitHub repo and push this code
# 2. Go to vercel.com/new → Import your repo
# 3. Add environment variable: ANTHROPIC_API_KEY
# 4. Deploy
```

**Important:** Add `ANTHROPIC_API_KEY` as an environment variable in Vercel's project settings.

## Project Structure

```
scanitfree/
├── app/
│   ├── layout.tsx          # Root layout with Nav, Footer, AdSense placeholder
│   ├── page.tsx            # Home page — hero + tool grid
│   ├── about/page.tsx      # About page (required for AdSense)
│   ├── privacy/page.tsx    # Privacy policy (required for AdSense)
│   ├── terms/page.tsx      # Terms of service (required for AdSense)
│   ├── contact/page.tsx    # Contact page
│   ├── tools/page.tsx      # Tool index (server-rendered)
│   ├── author/sean-riley/  # Author page (Person schema)
│   ├── blog/               # Guides: index + [slug] (imports content/articles/<slug>.tsx by slug)
│   ├── api/
│   │   └── analyze/route.ts  # Claude API endpoint — handles all tools
│   └── tools/
│       ├── food-safety/                     # Food Safety Scanner
│       ├── resume-reviewer/                 # Resume Reviewer
│       ├── lease-scanner/                   # Lease Red Flag Scanner
│       ├── cover-letter-reviewer/           # Cover Letter Reviewer
│       ├── privacy-policy-translator/       # Privacy Policy Translator
│       └── cosmetic-ingredient-scanner/     # Cosmetic Ingredient Scanner
├── components/
│   ├── Nav.tsx
│   ├── Footer.tsx
│   ├── AdSlot.tsx          # Placeholder → swap for real AdSense
│   ├── ToolContent.tsx     # Guide + FAQ schema rendered under every tool
│   └── ToolGrid.tsx        # Filterable tool card grid
├── content/
│   ├── articles/           # One TSX component per guide (slug = filename)
│   └── tools/              # One TSX guide per tool: `faq` export + default component
├── lib/
│   ├── tools.ts            # Central tool registry + SEO metadata (LIVE_TOOLS, LiveToolId)
│   ├── articles.ts         # Guide registry: dates, reviewed date, sources
│   ├── site.ts             # SITE and AUTHOR constants
│   └── openfda.ts          # OpenFDA enforcement API client (food-safety)
├── scripts/
│   ├── check-articles.mjs  # prebuild: every registered slug has a content file
│   └── check-site.mjs      # post-build verifier (see Verification)
└── .env.example
```

## Verification

```bash
npm run build                 # prebuild fails if an article slug has no content file
npx next start -p 3100 &
BASE=http://localhost:3100 npm run check
```

`scripts/check-site.mjs` confirms every tool page has at least 900 words of guide
text and a 6-entry FAQ schema, every article resolves with Article schema and at
least 3 sources, no page carries forbidden copy, the sitemap matches the registries,
and every source URL is reachable (`SKIP_LINKS=1` skips the network check).

## Search Console and analytics

Set these in Vercel → Project → Settings → Environment Variables, then redeploy:

- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` — token from Search Console's HTML-tag method
- `NEXT_PUBLIC_BING_SITE_VERIFICATION` — token from Bing Webmaster Tools' meta-tag method

Then submit `https://scanitfree.com/sitemap.xml` in Search Console and request indexing for
`/`, `/tools`, and each tool page. Enable Web Analytics in Vercel → Project → Analytics
(the `@vercel/analytics` component is already mounted in `app/layout.tsx`).

## Google AdSense

1. The AdSense script and `ads.txt` are live; the account verification meta tag is in `app/layout.tsx`.
2. `AdSlot` renders empty, sized containers. After approval, place `<ins class="adsbygoogle">` tags inside them (or rely on Auto ads).
3. Key ad placements are already wired in:
   - Top of page (leaderboard 728x90)
   - Between content sections (leaderboard)
   - Within tool results (medium rectangle 300x250)

## Adding New Tools

1. Add the tool definition to `lib/tools.ts`
2. Add a prompt to `TOOL_PROMPTS` in `app/api/analyze/route.ts`
3. Create `app/tools/[tool-name]/page.tsx` (server component with metadata)
4. Create `app/tools/[tool-name]/client.tsx` (client component with form + results)
5. Each tool page is a new SEO landing page targeting specific keywords

## Cost Estimates

- **Claude API (Sonnet):** ~$0.003-0.015 per tool use
- **At 1,000 daily users:** ~$3-15/day in API costs
- **Vercel hosting:** Free tier handles ~100K requests/month
- **Domain:** ~$10-90/year depending on TLD

## Revenue Targets

| Monthly Pageviews | RPM   | Monthly Revenue |
|-------------------|-------|-----------------|
| 50,000            | $15   | $750            |
| 100,000           | $20   | $2,000          |
| 200,000           | $25   | $5,000          |
| 333,000           | $30   | $10,000         |

RPM varies by niche. Health, legal, and finance tools command $25-50+ RPM.

## Rate Limiting (Recommended for Production)

Add rate limiting to `app/api/analyze/route.ts` to control API costs:
- Vercel KV or Upstash Redis for tracking requests per IP
- Recommended: 10-20 analyses per IP per day
- Show a friendly message when limit is reached
