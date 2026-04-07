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
│   ├── api/
│   │   └── analyze/route.ts  # Claude API endpoint — handles all tools
│   └── tools/
│       ├── food-safety/      # Food Safety Scanner
│       ├── resume-reviewer/  # Resume Reviewer
│       └── lease-scanner/    # Lease Red Flag Scanner
├── components/
│   ├── Nav.tsx
│   ├── Footer.tsx
│   ├── AdSlot.tsx          # Placeholder → swap for real AdSense
│   └── ToolGrid.tsx        # Filterable tool card grid
├── lib/
│   └── tools.ts            # Central tool registry + SEO metadata
└── .env.example
```

## Adding Google AdSense

1. Apply at https://adsense.google.com with your domain
2. Once approved, replace the commented-out script tag in `app/layout.tsx`
3. Replace `AdSlot` component placeholders with real `<ins class="adsbygoogle">` tags
4. Key ad placements are already wired in:
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
