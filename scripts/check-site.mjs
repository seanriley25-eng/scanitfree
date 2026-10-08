// Post-build verifier. Usage: BASE=http://localhost:3100 node scripts/check-site.mjs
// Assumes `next start` is serving a production build at BASE.
// Checks: tool page depth + FAQ schema, article routes + Article schema + sources,
// fixed pages + forbidden copy, sitemap completeness, source URL reachability.
import { readFileSync } from "node:fs";

const BASE = process.env.BASE ?? "http://localhost:3100";
const MIN_TOOL_WORDS = 900;
const SKIP_LINKS = process.env.SKIP_LINKS === "1";
let failures = 0;
const fail = (msg) => {
  failures++;
  console.error("FAIL " + msg);
};
const ok = (msg) => console.log("ok   " + msg);

const registry = readFileSync("lib/articles.ts", "utf8");
const slugs = [...registry.matchAll(/^\s+slug:\s*'([^']+)'/gm)].map((m) => m[1]);
const sourceUrls = [...new Set([...registry.matchAll(/url:\s*'([^']+)'/g)].map((m) => m[1]))];
const toolsTs = readFileSync("lib/tools.ts", "utf8");
const liveTools = [...toolsTs.matchAll(/id:\s*"([^"]+)",[\s\S]*?status:\s*"(live|coming|planned)"/g)]
  .filter((m) => m[2] === "live")
  .map((m) => m[1]);

const visibleText = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<nav[\s\S]*?<\/nav>/g, " ")
    .replace(/<footer[\s\S]*?<\/footer>/g, " ")
    .replace(/<form[\s\S]*?<\/form>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/g, " ");
const words = (s) => s.split(/\s+/).filter((w) => /[A-Za-z]/.test(w)).length;
const jsonLdBlocks = (html) =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) =>
    JSON.parse(m[1]),
  );

async function get(path) {
  const r = await fetch(BASE + path);
  return { status: r.status, html: await r.text() };
}

// 1. Tool pages
for (const id of liveTools) {
  const { status, html } = await get(`/tools/${id}`);
  if (status !== 200) {
    fail(`/tools/${id} -> ${status}`);
    continue;
  }
  const n = words(visibleText(html));
  n >= MIN_TOOL_WORDS ? ok(`/tools/${id} ${n} words`) : fail(`/tools/${id} only ${n} words`);
  const faq = jsonLdBlocks(html).find((b) => b["@type"] === "FAQPage");
  faq && faq.mainEntity?.length === 6
    ? ok(`/tools/${id} FAQPage x6`)
    : fail(`/tools/${id} FAQPage missing or not 6 entries`);
}

// 2. Articles
for (const slug of slugs) {
  const { status, html } = await get(`/blog/${slug}`);
  if (status !== 200) {
    fail(`/blog/${slug} -> ${status}`);
    continue;
  }
  const art = jsonLdBlocks(html).find((b) => b["@type"] === "Article");
  art?.author?.name
    ? ok(`/blog/${slug} Article schema`)
    : fail(`/blog/${slug} Article schema missing author`);
  const srcBlock = html.match(/aria-label="Sources"[\s\S]*?<\/section>/)?.[0] ?? "";
  const srcCount = (srcBlock.match(/<a /g) ?? []).length;
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
  const extraTools = locs.filter((p) => /^\/tools\/./.test(p) && !expectTools.includes(p));
  missingTools.length || missingArts.length || extraTools.length
    ? fail(
        `sitemap: missing tools [${missingTools}] missing articles [${missingArts}] extra tools [${extraTools}]`,
      )
    : ok(`sitemap ${locs.length} urls, tools and articles complete`);
}

// 5. Source URLs reachable
if (SKIP_LINKS) {
  console.log(`skip source link check (${sourceUrls.length} urls)`);
} else {
  const headers = { "user-agent": "Mozilla/5.0 (compatible; scanitfree link check)" };
  const check = async (url) => {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 20000);
    try {
      let r = await fetch(url, { method: "HEAD", redirect: "follow", headers, signal: ctl.signal });
      if (r.status === 405 || r.status === 403 || r.status === 404) {
        r = await fetch(url, { redirect: "follow", headers, signal: ctl.signal });
      }
      return r.status;
    } finally {
      clearTimeout(t);
    }
  };
  for (const url of sourceUrls) {
    try {
      let s = await check(url);
      if (s >= 400) s = await check(url); // one retry for flaky government hosts
      s < 400 ? ok(`source ${s} ${url}`) : fail(`source ${s} ${url}`);
    } catch (e) {
      fail(`source unreachable ${url} (${e.message})`);
    }
  }
}

console.log(failures ? `\n${failures} failure(s)` : "\nAll checks passed");
process.exit(failures ? 1 : 0);
