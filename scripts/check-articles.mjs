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
