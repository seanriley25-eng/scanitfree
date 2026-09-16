/**
 * Deterministic resume scorer. Pure JS — no side effects, no I/O.
 * Same (resume, keywords) input always produces the same score.
 * Runs identically in browser and Node.
 */

export const POWER_VERBS = new Set([
  "accomplished","achieved","acquired","adapted","addressed","administered","advanced","advocated","analyzed","applied","appointed","appraised","architected","assembled","assessed","assigned","assisted","attained","audited","authored","automated","balanced","briefed","budgeted","built","calculated","catalogued","centralized","championed","clarified","coached","collaborated","communicated","compiled","completed","composed","computed","conceptualized","conducted","conserved","consolidated","constructed","consulted","contributed","controlled","converted","coordinated","counseled","created","cultivated","customized","debugged","decreased","defined","delegated","delivered","demonstrated","deployed","described","designed","detected","determined","developed","devised","diagnosed","directed","discovered","dispatched","documented","drafted","drove","earned","edited","educated","eliminated","enabled","encouraged","enforced","engineered","enhanced","ensured","established","estimated","evaluated","examined","exceeded","executed","exercised","expanded","expedited","experimented","explained","explored","extracted","fabricated","facilitated","finalized","forecasted","formalized","formed","formulated","fortified","fostered","founded","fulfilled","generated","governed","grew","guided","handled","headed","hired","hosted","identified","illustrated","implemented","improved","improvised","inaugurated","increased","influenced","informed","initiated","innovated","inspected","installed","instituted","instructed","integrated","interpreted","interviewed","introduced","invented","investigated","judged","launched","lectured","led","leveraged","liaised","licensed","logged","maintained","managed","mapped","marketed","mastered","maximized","measured","mediated","mentored","merged","migrated","minimized","mobilized","modernized","modified","monitored","motivated","navigated","negotiated","normalized","obtained","onboarded","operated","optimized","orchestrated","ordered","organized","originated","outperformed","overhauled","oversaw","participated","performed","persuaded","piloted","pioneered","planned","predicted","prepared","prescribed","presented","prevented","prioritized","processed","produced","programmed","promoted","proposed","protected","provided","publicized","published","purchased","pursued","qualified","quantified","ranked","realigned","rebuilt","received","recommended","reconciled","recorded","recruited","redesigned","reduced","refined","reformed","regulated","rehabilitated","reinforced","remediated","remodeled","reorganized","repaired","reported","represented","researched","resolved","restored","restructured","retained","retrieved","revamped","reviewed","revised","revitalized","routed","saved","scaled","scheduled","screened","secured","shaped","simplified","solicited","solved","sourced","spearheaded","specialized","specified","staffed","staged","standardized","steered","stimulated","strategized","streamlined","strengthened","structured","studied","submitted","succeeded","summarized","supervised","supplemented","supplied","supported","surpassed","surveyed","sustained","synthesized","systematized","tabulated","targeted","taught","terminated","tested","tracked","traded","trained","transcribed","transferred","transformed","translated","transmitted","triaged","troubleshot","tutored","unified","united","updated","upgraded","utilized","validated","verified","visualized","volunteered","widened","wrote",
]);

export const VAGUE_WORDS = ["various","multiple","several","many","large-scale","numerous","significant","substantial","considerable","extensive"];

export interface SectionScore {
  score: number;
  max: number;
  issues: string[];
}

export interface AtsScore {
  score: number;
  max: number;
  found: string[];
  missing: string[];
}

export interface ScoreResult {
  total: number;
  summary: SectionScore;
  skills: SectionScore;
  bullets: SectionScore;
  ats: AtsScore;
  format: SectionScore;
}

export interface StructuredResume {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  summary?: string;
  skills?: string[];
  experience?: { title?: string; company?: string; dates?: string; bullets?: string[] }[];
  education?: { degree?: string; school?: string; year?: string }[];
  certifications?: string[];
  changes?: string[];
}

export function scoreResume(text: string, kwList: string[]): ScoreResult {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const lower = text.toLowerCase();
  const result: ScoreResult = {
    total: 0,
    summary: { score: 0, max: 15, issues: [] },
    skills: { score: 0, max: 20, issues: [] },
    bullets: { score: 0, max: 35, issues: [] },
    ats: { score: 0, max: 15, found: [], missing: [] },
    format: { score: 0, max: 15, issues: [] },
  };

  const findSection = (patterns: RegExp[]): number => {
    for (const p of patterns) {
      const idx = lines.findIndex(l => p.test(l) && l.trim().length < 60);
      if (idx !== -1) return idx;
    }
    for (const p of patterns) {
      const idx = lines.findIndex(l => p.test(l.slice(0, 40)));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const sumIdx = findSection([/^professional\s*summary/i, /^summary$/i, /^profile$/i, /^objective$/i]);
  const skillIdx = findSection([/^skills?\s*[&:]/i, /^skills?\s*$/i, /^skills/i, /^competenc/i, /^qualifications/i, /^key\s*skills/i]);
  const expIdx = findSection([/^(professional\s*)?experience$/i, /^work\s*experience/i, /^employment/i, /^work\s*history/i, /^experience/i]);
  const eduIdx = findSection([/^education/i, /^academic/i]);

  const getNextSection = (afterIdx: number): number => {
    const all = [sumIdx, skillIdx, expIdx, eduIdx, lines.length].filter(i => i > afterIdx).sort((a, b) => a - b);
    return all[0] || lines.length;
  };

  const getSectionText = (idx: number): string => {
    if (idx === -1) return "";
    const line = lines[idx];
    const afterHeader = line.replace(/^.*?(summary|skills|qualifications|competenc|experience|education)[^a-z]*/i, "").trim();
    const nextSec = getNextSection(idx);
    const bodyLines = lines.slice(idx + 1, nextSec);
    return (afterHeader + " " + bodyLines.join(" ")).trim();
  };

  // ── SUMMARY (15 pts) ──
  if (sumIdx === -1) {
    result.summary.issues.push("No summary section found");
    result.summary.score = 2;
  } else {
    const s = result.summary;
    const sumText = getSectionText(sumIdx);
    s.score += 3;
    if (sumText.length <= 350) s.score += 3;
    else if (sumText.length <= 500) { s.score += 1; s.issues.push(`Summary ${sumText.length} chars (target <350)`); }
    else s.issues.push(`Summary ${sumText.length} chars (target <350)`);
    const sentences = sumText.split(/[.!?]+/).filter(t => t.trim().length > 5);
    if (sentences.length >= 1 && sentences.length <= 4) s.score += 3;
    else s.issues.push(`${sentences.length} sentences (best: 2-3)`);
    const kwInSum = kwList.filter(k => sumText.toLowerCase().includes(k.toLowerCase()));
    if (kwInSum.length >= 3) s.score += 3;
    else if (kwInSum.length >= 2) s.score += 2;
    else if (kwInSum.length >= 1) { s.score += 1; s.issues.push(`${kwInSum.length} JD keywords in summary (need 2+)`); }
    else s.issues.push(`0 JD keywords in summary (need 2+)`);
    s.score += Math.min(3, kwInSum.length);
    s.score = Math.min(15, s.score);
  }

  // ── SKILLS (20 pts) ──
  if (skillIdx === -1) {
    result.skills.issues.push("No dedicated Skills section found");
    result.skills.score = 0;
  } else {
    const sk = result.skills;
    sk.score += 5;
    const skillText = getSectionText(skillIdx);
    let skillItems: string[];
    if (skillText.includes("|")) {
      skillItems = skillText.split("|").map(s => s.trim()).filter(s => s.length > 2);
    } else {
      skillItems = skillText.split(/[•●\n]/).flatMap(s => s.split(/,\s*(?=[A-Z])/)).map(s => s.replace(/^[\s\-\*]+/, "").trim()).filter(s => s.length > 2 && s.length < 80);
    }
    const count = skillItems.length;
    if (count >= 8 && count <= 14) sk.score += 5;
    else if (count >= 5 && count <= 18) { sk.score += 3; sk.issues.push(`${count} skills (optimal 8-14)`); }
    else { sk.score += 1; sk.issues.push(`${count} skills (optimal 8-14)`); }
    const kwInSkills = kwList.filter(k => skillText.toLowerCase().includes(k.toLowerCase()));
    const kwPct = kwInSkills.length / Math.max(kwList.length, 1);
    sk.score += Math.round(kwPct * 10);
    sk.score = Math.min(20, sk.score);
  }

  // ── BULLETS (35 pts) ──
  {
    const bu = result.bullets;
    const bullets = lines.filter(l => {
      const trimmed = l.replace(/^[\s•\-\*●]+/, "").trim();
      if (trimmed.length < 15) return false;
      const firstWord = trimmed.split(/\s/)[0].toLowerCase().replace(/[^a-z]/g, "");
      return /^[•\-\*●]/.test(l) || POWER_VERBS.has(firstWord);
    });

    if (bullets.length === 0) {
      bu.score = 5;
      bu.issues.push("No clear bullets found");
    } else {
      let verbCount = 0;
      bullets.forEach(b => {
        const first = b.replace(/^[•\-\*●\s]+/, "").split(/\s/)[0].toLowerCase().replace(/[^a-z]/g, "");
        if (POWER_VERBS.has(first)) verbCount++;
      });
      bu.score += Math.round((verbCount / bullets.length) * 10);

      let metricCount = 0;
      bullets.forEach(b => { if (/\d+/.test(b)) metricCount++; });
      bu.score += Math.round((metricCount / bullets.length) * 10);
      if (metricCount < bullets.length * 0.7) bu.issues.push(`${metricCount}/${bullets.length} bullets have metrics`);

      let truncated = 0;
      bullets.forEach(b => { const t = b.trim(); if (t.endsWith("...") || t.endsWith("..")) truncated++; });
      if (truncated > 0) { bu.score -= Math.min(truncated * 2, 4); bu.issues.push(`${truncated} truncated bullet(s)`); }

      if (bullets.length >= 5) bu.score += 5;
      else { bu.score += 2; bu.issues.push(`Only ${bullets.length} bullets`); }

      const bulletText = bullets.join(" ").toLowerCase();
      const kwInBullets = kwList.filter(k => bulletText.includes(k.toLowerCase()));
      bu.score += Math.min(5, Math.round(Math.min(kwInBullets.length / 6, 1) * 5));

      const vagueFound = VAGUE_WORDS.filter(v => lower.includes(v));
      if (vagueFound.length > 0) { bu.score -= vagueFound.length; bu.issues.push(`${vagueFound.length} vague word(s): ${vagueFound.join(", ")}`); }
    }
    bu.score = Math.max(0, Math.min(35, Math.round(bu.score * 35 / 30)));
  }

  // ── ATS KEYWORDS (15 pts) ──
  {
    const ats = result.ats;
    kwList.forEach(k => {
      if (lower.includes(k.toLowerCase())) ats.found.push(k);
      else ats.missing.push(k);
    });
    ats.score = Math.round((ats.found.length / Math.max(kwList.length, 1)) * 15);
  }

  // ── FORMAT (15 pts) ──
  {
    const fm = result.format;
    const headings = ["summary", "skills", "experience", "education"];
    let headCount = 0;
    headings.forEach(h => { if (lower.includes(h)) headCount++; });
    fm.score += Math.min(5, Math.round((headCount / 4) * 5));
    if (headCount < 4) fm.issues.push(`${headCount}/4 standard sections found`);

    if (eduIdx > -1) fm.score += 3;
    else fm.issues.push("No Education section");

    fm.score += 3;

    const hasInconsistentBullets = /[•]/.test(text) && /[*]/.test(text);
    if (hasInconsistentBullets) { fm.score -= 2; fm.issues.push("Mixed bullet symbols"); }

    fm.score += 4;
    fm.score = Math.max(0, Math.min(15, fm.score));
  }

  result.total = result.summary.score + result.skills.score + result.bullets.score + result.ats.score + result.format.score;
  result.total = Math.max(0, Math.min(100, result.total));
  return result;
}

/**
 * Best score a perfect rewrite can reach given how many JD keywords the candidate
 * can honestly use. Mirrors scoreResume's formula with every non-keyword component maxed.
 * Related keywords never go in the Skills section, so they count toward everything except skills.
 */
export function maxAchievableScore(directCount: number, relatedCount: number, totalKw: number): number {
  const total = Math.max(totalKw, 1);
  const nAll = Math.min(directCount + relatedCount, total);
  const nSkills = Math.min(directCount, total);

  const sumTier = nAll >= 3 ? 3 : nAll >= 2 ? 2 : nAll >= 1 ? 1 : 0;
  const summary = Math.min(15, 9 + sumTier + Math.min(3, nAll));

  const skills = Math.min(20, 10 + Math.round((nSkills / total) * 10));

  const bulletsRaw = 25 + Math.min(5, Math.round(Math.min(nAll / 6, 1) * 5));
  const bullets = Math.min(35, Math.round((bulletsRaw * 35) / 30));

  const ats = Math.round((nAll / total) * 15);
  const format = 15;

  return Math.min(100, summary + skills + bullets + ats + format);
}

/** Case-insensitive whole-term check — "SQL" must not match inside "MySQL". */
export function containsTerm(text: string, term: string): boolean {
  const esc = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${esc}([^a-z0-9]|$)`, "i").test(text);
}

/** Flatten a structured resume back into plain text so the scorer can grade it. */
export function resumeToText(r: StructuredResume): string {
  const sk = r.skills || [];
  const parts: string[] = [
    r.name || "",
    [r.email, r.phone, r.location, r.linkedin].filter(Boolean).join(" | "),
    "\nPROFESSIONAL SUMMARY",
    r.summary || "",
    sk.length > 0 ? `\nSKILLS\n${sk.join(" | ")}` : "",
    "\nEXPERIENCE",
    ...(r.experience || []).map(j => `${j.title || ""} — ${j.company || ""} (${j.dates || ""})\n${(j.bullets || []).map(b => `• ${b}`).join("\n")}`),
    "\nEDUCATION",
    ...(r.education || []).map(e => `${e.degree || ""} — ${e.school || ""} ${e.year || ""}`),
  ];
  if ((r.certifications || []).length > 0) {
    parts.push("\nCERTIFICATIONS", ...(r.certifications || []));
  }
  return parts.filter(Boolean).join("\n");
}

/** Enforce structural rules the scorer checks — trim skills to 12, cap bullets at 7, ensure punctuation. */
export function fixResume(r: StructuredResume): StructuredResume {
  if (r.summary && r.summary.length > 350) {
    const sentences = r.summary.match(/[^.!?]+[.!?]+/g) || [r.summary];
    let trimmed = "";
    for (const s of sentences) {
      if ((trimmed + s).length <= 345) trimmed += s;
      else break;
    }
    r.summary = trimmed.trim() || r.summary.slice(0, 345) + ".";
  }
  if (r.skills && r.skills.length > 12) r.skills = r.skills.slice(0, 12);
  if (r.experience) {
    r.experience.forEach(job => {
      if (job.bullets) {
        if (job.bullets.length > 7) job.bullets = job.bullets.slice(0, 7);
        job.bullets = job.bullets.map(b => {
          b = b.trim();
          if (b && !/[.!?)\d%]$/.test(b)) b += ".";
          return b;
        }).filter(b => b.length > 10);
      }
    });
  }
  return r;
}
