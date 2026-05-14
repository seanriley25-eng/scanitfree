# Silent Truncation Audit — Wave 1

**Date:** 2026-05-14  
**Auditor:** Wave 1 automated review  
**Scope:** All three live tools — lease-scanner, food-safety, resume-reviewer

---

## Summary

All three tools shared the same silent truncation bug: the API route (`app/api/analyze/route.ts`) applied `input.slice(0, 8000)` before forwarding to Claude, with no user-facing indication that content was being dropped. Leases routinely run 7,000–17,000 characters; resumes can exceed 10,000; even lengthy ingredient lists could approach the old cap.

---

## Findings

### 1. `app/api/analyze/route.ts` — line 42 (pre-fix)

```ts
messages: [{ role: "user", content: input.slice(0, 8000) }],
```

**All three tools** were affected by this single line. The 8,000-character cap was never communicated to users. Inputs exceeding the cap were silently truncated — the scan would complete and return results, but on potentially incomplete data. For a long lease this could mean entire clauses (security deposit terms, auto-renewal language) being dropped without any warning.

| Tool | Typical input size | Old cap | Risk |
|------|--------------------|---------|------|
| lease-scanner | 7,000–17,000 chars | 8,000 | **HIGH** — many real leases exceeded the cap |
| resume-reviewer | 3,000–12,000 chars | 8,000 | **MEDIUM** — verbose resumes with many positions could be cut |
| food-safety | 200–3,000 chars | 8,000 | **LOW** — ingredient lists rarely approach the old cap |

---

## Fixes Applied

### API route — cap raised to 24,000 characters

`app/api/analyze/route.ts`:
- `input.slice(0, 8000)` → `input.slice(0, CHAR_LIMIT)` where `CHAR_LIMIT = 24000`
- The constant is defined at module scope so it is easy to update in one place.

### All three client components — visible warning added

Each client (`lease-scanner/client.tsx`, `food-safety/client.tsx`, `resume-reviewer/client.tsx`) now:

1. Defines `const CHAR_LIMIT = 24000` (mirrors the API value; a future improvement would share this via a shared constants file).
2. Shows a live character counter below the textarea: `{n} / 24,000 chars` — turns red if the limit is exceeded.
3. Renders a yellow warning banner **before the submit button** if the input exceeds the limit:

   > ⚠️ Your lease is too long — only the first 24,000 characters will be reviewed.
   > Consider splitting it into sections or reviewing the most critical clauses first.

   (Wording is tool-specific for each tool.)

---

## Remaining Limitations

- The `CHAR_LIMIT` constant is duplicated between `route.ts` and each client component. A shared `lib/constants.ts` would be the clean fix — deferred to avoid scope creep.
- 24,000 chars comfortably covers the 99th-percentile lease (~17K chars) with room to spare. If users encounter even longer documents in the future, the single constant can be raised in both places.
- The food-safety tool is effectively unaffected at real-world input sizes, but the warning and counter were added for consistency and future-proofing.
