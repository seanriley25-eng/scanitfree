/**
 * OpenFDA food enforcement recall feed.
 * Queries https://api.fda.gov/food/enforcement.json (no auth required for low volume).
 * Set OPENFDA_API_KEY env var to raise rate limits (free at https://open.fda.gov/apis/authentication/).
 *
 * Graceful degradation: any error or timeout returns { recalls: [], checked: false }
 * so the food-safety scan still completes without live recall data.
 */

export interface Recall {
  recall_number: string;
  product_description: string;
  reason_for_recall: string;
  recall_initiation_date: string;
  classification: string;
  status: string;
  distribution_pattern: string;
}

interface CacheEntry {
  recalls: Recall[];
  fetchedAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const OPENFDA_TIMEOUT_MS = 3000;
const recallCache = new Map<string, CacheEntry>();

/**
 * Extract 3–4 meaningful alphabetic words from the beginning of the input
 * to use as the OpenFDA product_description search term.
 */
function extractSearchTerms(input: string): string {
  return input
    .slice(0, 100)
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z]/g, ""))
    .filter((w) => w.length >= 3)
    .slice(0, 4)
    .join(" ")
    .trim();
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Query the openFDA food enforcement endpoint for recalls matching the input
 * initiated within the last 365 days. Returns up to 5 results.
 *
 * @param input  Raw user input (product name, ingredient list, etc.)
 * @returns      `recalls` array (empty on no match or error) + `checked` flag
 *               indicating whether the openFDA API was successfully reached.
 */
export async function getRelevantRecalls(
  input: string
): Promise<{ recalls: Recall[]; checked: boolean }> {
  const terms = extractSearchTerms(input);
  if (!terms) return { recalls: [], checked: false };

  // Cache hit
  const cached = recallCache.get(terms);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return { recalls: cached.recalls, checked: true };
  }

  const today = toISODate(new Date());
  const oneYearAgo = toISODate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000));

  const searchExpr = `product_description:"${terms}" AND recall_initiation_date:[${oneYearAgo} TO ${today}]`;
  const apiKey = process.env.OPENFDA_API_KEY;
  const url =
    `https://api.fda.gov/food/enforcement.json` +
    `?search=${encodeURIComponent(searchExpr)}&limit=5` +
    (apiKey ? `&api_key=${encodeURIComponent(apiKey)}` : "");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OPENFDA_TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    // openFDA returns HTTP 404 when no results match — not an error, just no data
    if (res.status === 404) {
      recallCache.set(terms, { recalls: [], fetchedAt: Date.now() });
      return { recalls: [], checked: true };
    }

    if (!res.ok) {
      console.error(`[openFDA] HTTP ${res.status} for query: "${terms}"`);
      return { recalls: [], checked: false };
    }

    const data = await res.json();
    const recalls: Recall[] = (data.results ?? []).map(
      (r: Record<string, string>) => ({
        recall_number: r.recall_number ?? "",
        product_description: r.product_description ?? "",
        reason_for_recall: r.reason_for_recall ?? "",
        recall_initiation_date: r.recall_initiation_date ?? "",
        classification: r.classification ?? "",
        status: r.status ?? "",
        distribution_pattern: r.distribution_pattern ?? "",
      })
    );

    recallCache.set(terms, { recalls, fetchedAt: Date.now() });
    return { recalls, checked: true };
  } catch (err: unknown) {
    clearTimeout(timer);
    const isAbort = err instanceof Error && err.name === "AbortError";
    if (!isAbort) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[openFDA] fetch error:", msg);
    }
    return { recalls: [], checked: false };
  }
}

/**
 * Format a list of recalls into a structured text block for injection
 * into the Claude user message.
 */
export function formatRecallsBlock(recalls: Recall[]): string {
  const lines = recalls.map(
    (r) =>
      `- Recall #${r.recall_number}: "${r.product_description.slice(0, 120)}" — ` +
      `${r.reason_for_recall.slice(0, 200)}. ` +
      `Classification: ${r.classification}. Initiated: ${r.recall_initiation_date}.`
  );
  return (
    `FDA_RECALLS (last 365 days, from openFDA enforcement database):\n` +
    lines.join("\n")
  );
}
