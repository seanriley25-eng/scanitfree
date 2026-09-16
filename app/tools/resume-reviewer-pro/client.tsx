"use client";

import { useState, useRef } from "react";
import { scoreResume, maxAchievableScore, type ScoreResult, type StructuredResume } from "@/lib/resume-scorer";
import { matchCompany } from "@/lib/resume-prompts";

interface Feedback {
  eye_test?: { impression?: string; red_flags?: string[]; strengths?: string[] };
  job_match?: { match_pct?: number; matched?: string[]; gaps?: string[]; verdict?: string };
  top3_fixes?: string[];
}

interface RewriteState {
  changes: string[];
  pass: number;
  declined: string[];
  related: string[];
  ceiling: number;
  target: number;
  unaddressed: string[];
  warnings: string[];
}

interface GapInfo {
  meaning: string;
  relatedHint: string | null;
}

function generateResumeHTML(r: StructuredResume): string {
  const esc = (s?: string) => (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const ct = [r.email, r.phone, r.location, r.linkedin].filter(Boolean).map(esc).join(" &nbsp;|&nbsp; ");
  const exp = (r.experience || [])
    .map(
      j => `<div class="j"><div class="jh"><div><strong>${esc(j.title)}</strong> — ${esc(j.company)}</div><div class="d">${esc(j.dates)}</div></div><ul>${(j.bullets || []).map(b => `<li>${esc(b)}</li>`).join("")}</ul></div>`
    )
    .join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(r.name)}</title>
<style>@import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&display=swap');*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Source Sans 3',sans-serif;color:#1a1a1a;max-width:780px;margin:0 auto;padding:48px 40px;font-size:11pt;line-height:1.5}.h{text-align:center;border-bottom:2px solid #1a1a1a;padding-bottom:14px;margin-bottom:20px}.h h1{font-size:22pt;font-weight:700;letter-spacing:1px;text-transform:uppercase}.ct{font-size:9.5pt;color:#444}h2{font-size:11pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;border-bottom:1px solid #ccc;padding-bottom:3px;margin:18px 0 10px}.j{margin-bottom:14px}.jh{display:flex;justify-content:space-between;margin-bottom:4px}.d{font-size:9.5pt;color:#555}ul{padding-left:18px;margin:4px 0}li{margin-bottom:3px;font-size:10.5pt}.sk{font-size:10.5pt;line-height:1.8}@media print{body{padding:24px 32px}}</style></head>
<body><div class="h"><h1>${esc(r.name)}</h1><div class="ct">${ct}</div></div>
<section><h2>PROFESSIONAL SUMMARY</h2><p>${esc(r.summary)}</p></section>
<section><h2>SKILLS</h2><div class="sk">${(r.skills || []).map(esc).join(" &nbsp;• &nbsp;")}</div></section>
<section><h2>EXPERIENCE</h2>${exp}</section>
<section><h2>EDUCATION</h2>${(r.education || []).map(e => `<div><strong>${esc(e.degree)}</strong> — ${esc(e.school)}${e.year ? `, ${esc(e.year)}` : ""}</div>`).join("")}</section>
${(r.certifications || []).length ? `<section><h2>CERTIFICATIONS</h2>${(r.certifications || []).map(c => `<div>${esc(c)}</div>`).join("")}</section>` : ""}</body></html>`;
}

function ScoreGauge({
  score,
  size = 130,
  label,
  showDelta,
  delta,
}: {
  score: number;
  size?: number;
  label: string;
  showDelta?: boolean;
  delta?: number;
}) {
  const r = (size - 16) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (score / 100) * c;
  const clr = score >= 90 ? "#10b981" : score >= 75 ? "#22c55e" : score >= 50 ? "#eab308" : "#ef4444";
  return (
    <div style={{ textAlign: "center" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={clr} strokeWidth="8" strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div style={{ marginTop: -size / 2 - 20, fontSize: size * 0.3, fontWeight: 800, color: clr }}>{score}</div>
      {showDelta && (delta || 0) > 0 && <div style={{ fontSize: 13, color: "#10b981", fontWeight: 700, marginTop: size * 0.14 }}>+{delta}</div>}
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: showDelta && (delta || 0) > 0 ? 2 : size * 0.16 }}>{label}</div>
    </div>
  );
}

function Pill({ children, color, bg }: { children: React.ReactNode; color?: string; bg?: string }) {
  return (
    <span
      style={{
        background: bg || "rgba(255,255,255,0.06)",
        color: color || "rgba(255,255,255,0.5)",
        fontSize: 10.5,
        padding: "3px 8px",
        borderRadius: 5,
        fontWeight: 600,
        display: "inline-block",
      }}
    >
      {children}
    </span>
  );
}

function ScoreRow({ label, score, max, issues }: { label: string; score: number; max: number; issues?: string[] }) {
  const pct = (score / max) * 100;
  const clr = pct >= 80 ? "#22c55e" : pct >= 60 ? "#eab308" : "#ef4444";
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 16px", marginBottom: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{label}</span>
        <span style={{ color: clr, fontWeight: 800, fontSize: 13 }}>
          {score}/{max}
        </span>
      </div>
      <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, marginBottom: 6 }}>
        <div style={{ height: 4, background: clr, borderRadius: 2, width: `${pct}%`, transition: "width 0.8s ease" }} />
      </div>
      {(issues || []).map((x, i) => (
        <div key={i} style={{ color: "rgba(255,255,255,0.45)", fontSize: 11.5, paddingLeft: 8, borderLeft: "2px solid rgba(239,68,68,0.3)", marginBottom: 2 }}>
          {x}
        </div>
      ))}
    </div>
  );
}

function ResumePreview({ data }: { data: StructuredResume | null }) {
  if (!data) return null;
  const s = {
    w: { background: "#fff", color: "#1a1a1a", borderRadius: 12, padding: "32px 36px", fontFamily: "'Source Sans 3',sans-serif", fontSize: 13, lineHeight: 1.55, maxHeight: 500, overflowY: "auto" as const },
    h1: { fontSize: 20, fontWeight: 700, letterSpacing: 1.5, textAlign: "center" as const, textTransform: "uppercase" as const, margin: "0 0 4px" },
    ct: { textAlign: "center" as const, fontSize: 11, color: "#555", marginBottom: 14, paddingBottom: 10, borderBottom: "2px solid #1a1a1a" },
    h2: { fontSize: 12, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 1.5, borderBottom: "1px solid #ccc", paddingBottom: 3, margin: "14px 0 8px" },
  };
  return (
    <div style={s.w}>
      <h1 style={s.h1}>{data.name}</h1>
      <div style={s.ct}>{[data.email, data.phone, data.location, data.linkedin].filter(Boolean).join(" | ")}</div>
      <h2 style={s.h2}>PROFESSIONAL SUMMARY</h2>
      <p style={{ fontSize: 12.5 }}>{data.summary}</p>
      <h2 style={s.h2}>SKILLS</h2>
      <div style={{ fontSize: 12.5, lineHeight: 1.8 }}>{(data.skills || []).join("  •  ")}</div>
      <h2 style={s.h2}>EXPERIENCE</h2>
      {(data.experience || []).map((j, i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <strong>{j.title}</strong> — {j.company}
            </div>
            <div style={{ fontSize: 11, color: "#555" }}>{j.dates}</div>
          </div>
          <ul style={{ paddingLeft: 18, margin: "4px 0" }}>
            {(j.bullets || []).map((b, k) => (
              <li key={k} style={{ fontSize: 12.5, marginBottom: 2 }}>
                {b}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <h2 style={s.h2}>EDUCATION</h2>
      {(data.education || []).map((e, i) => (
        <div key={i} style={{ fontSize: 12.5 }}>
          <strong>{e.degree}</strong> — {e.school}
          {e.year ? `, ${e.year}` : ""}
        </div>
      ))}
      {(data.certifications || []).length > 0 && (
        <>
          <h2 style={s.h2}>CERTIFICATIONS</h2>
          {(data.certifications || []).map((c, i) => (
            <div key={i} style={{ fontSize: 12.5 }}>
              {c}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

/** POST to /api/rewrite. Throws on non-2xx. */
async function apiCall<T = any>(payload: object): Promise<T> {
  const res = await fetch("/api/rewrite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data as T;
}

export function ResumeProClient() {
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");
  const [scanning, setScanning] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [rewrite, setRewrite] = useState<RewriteState | null>(null);
  const [finalResume, setFinalResume] = useState<StructuredResume | null>(null);
  const [verifiedScore, setVerifiedScore] = useState<ScoreResult | null>(null);
  const [verifiedText, setVerifiedText] = useState("");
  const [tab, setTab] = useState<"scan" | "gap" | "rewrite" | "resume">("scan");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showText, setShowText] = useState(false);
  const [kwList, setKwList] = useState<string[]>([]);
  const [kwJdHash, setKwJdHash] = useState("");
  const [confirmedSkills, setConfirmedSkills] = useState<Set<string>>(new Set());
  const [companyName, setCompanyName] = useState("");
  const [toolsContext, setToolsContext] = useState("");
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [relatedSkills, setRelatedSkills] = useState<Map<string, string>>(new Map());
  const [expandedRelated, setExpandedRelated] = useState<Set<string>>(new Set());
  const [gapInfo, setGapInfo] = useState<Record<string, GapInfo>>({});
  const [explaining, setExplaining] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const setRelated = (k: string, experience: string) => {
    const next = new Map(relatedSkills);
    if (experience.trim()) next.set(k, experience);
    else next.delete(k);
    setRelatedSkills(next);
    if (experience.trim() && confirmedSkills.has(k)) {
      const c = new Set(confirmedSkills);
      c.delete(k);
      setConfirmedSkills(c);
    }
  };

  const toggleConfirmed = (k: string) => {
    const next = new Set(confirmedSkills);
    if (next.has(k)) next.delete(k);
    else {
      next.add(k);
      if (relatedSkills.has(k)) {
        const r = new Map(relatedSkills);
        r.delete(k);
        setRelatedSkills(r);
      }
    }
    setConfirmedSkills(next);
  };

  const handleFile = async (file: File) => {
    setUploading(true);
    setFileName(file.name);
    setError(null);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      let text = "";

      if (ext === "txt" || ext === "text") {
        text = await file.text();
      } else if (ext === "html" || ext === "htm") {
        const raw = await file.text();
        const doc = new DOMParser().parseFromString(raw, "text/html");
        text = doc.body.innerText || doc.body.textContent || "";
      } else if (ext === "docx") {
        const arrayBuffer = await file.arrayBuffer();
        const mammoth: any = await import("mammoth");
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value || "";
      } else if (ext === "pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = "";
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        const base64 = btoa(binary);
        const r = await apiCall<{ text: string }>({ action: "pdf_extract", base64 });
        text = r.text || "";
      } else if (ext === "doc" || ext === "rtf") {
        setError(`${ext.toUpperCase()} files aren't supported. Save as .docx, .pdf, or .txt and re-upload.`);
        setUploading(false);
        return;
      } else {
        text = await file.text();
      }

      if (text.trim()) setResume(text.trim());
      else setError("Could not extract text from file. Try pasting the text directly.");
    } catch (e: any) {
      setError(`File read error: ${e?.message || e}`);
    }
    setUploading(false);
  };

  const hashJd = (t: string) => t.trim().slice(0, 500) + "||" + t.trim().length;

  const getKeywords = async (jdText: string): Promise<string[]> => {
    const h = hashJd(jdText);
    if (kwList.length > 0 && kwJdHash === h) return kwList;
    const r = await apiCall<{ keywords: string[] }>({ action: "extract_kw", jd: jdText });
    const kws = r.keywords || [];
    setKwList(kws);
    setKwJdHash(h);
    return kws;
  };

  const doScan = async () => {
    if (!resume.trim() || !jd.trim()) return;
    setScanning(true);
    setScoreResult(null);
    setFeedback(null);
    setRewrite(null);
    setFinalResume(null);
    setVerifiedScore(null);
    setVerifiedText("");
    setConfirmedSkills(new Set());
    setRelatedSkills(new Map());
    setExpandedRelated(new Set());
    setGapInfo({});
    setTab("scan");
    setError(null);
    try {
      const kws = await getKeywords(jd);
      const score = scoreResume(resume, kws);
      setScoreResult(score);
      try {
        const fb = await apiCall<Feedback>({ action: "feedback", resume, jd, kwList: kws });
        setFeedback(fb);
      } catch {
        /* feedback is optional */
      }
    } catch (e: any) {
      setError(e?.message || String(e));
    }
    setScanning(false);
  };

  const doScanWithText = async (txt: string) => {
    if (!txt || !jd.trim()) return;
    setScanning(true);
    setScoreResult(null);
    setFeedback(null);
    setRewrite(null);
    setFinalResume(null);
    setVerifiedScore(null);
    setVerifiedText("");
    setConfirmedSkills(new Set());
    setRelatedSkills(new Map());
    setExpandedRelated(new Set());
    setGapInfo({});
    setTab("scan");
    setError(null);
    try {
      const kws = await getKeywords(jd);
      const score = scoreResume(txt, kws);
      setScoreResult(score);
      try {
        const fb = await apiCall<Feedback>({ action: "feedback", resume: txt, jd, kwList: kws });
        setFeedback(fb);
      } catch {
        /* optional */
      }
    } catch (e: any) {
      setError(e?.message || String(e));
    }
    setScanning(false);
  };

  const doRewrite = async () => {
    if (!scoreResult || kwList.length === 0) {
      setError(`Cannot rewrite: ${!scoreResult ? "No scan results" : "No keywords extracted"}. Please run Free Scan first.`);
      return;
    }
    setRewriting(true);
    setGenerating(true);
    setError(null);
    setTab("rewrite");
    try {
      const r = await apiCall<{
        finalResume: StructuredResume;
        changes: string[];
        pass: number;
        verifiedScore: ScoreResult;
        verifiedText: string;
        declined: string[];
        related: string[];
        ceiling: number;
        target: number;
        unaddressed: string[];
        warnings: string[];
      }>({
        action: "rewrite",
        resume,
        jd,
        kwList,
        scoreResult,
        confirmedSkills: Array.from(confirmedSkills),
        relatedSkills: Array.from(relatedSkills, ([keyword, experience]) => ({ keyword, experience })),
        companyName,
        toolsContext,
      });
      setFinalResume(r.finalResume);
      setRewrite({
        changes: r.changes || [],
        pass: r.pass || 1,
        declined: r.declined || [],
        related: r.related || [],
        ceiling: r.ceiling ?? 100,
        target: r.target ?? 90,
        unaddressed: r.unaddressed || [],
        warnings: r.warnings || [],
      });
      setVerifiedScore(r.verifiedScore);
      setVerifiedText(r.verifiedText);
    } catch (e: any) {
      setError(e?.message || String(e));
    }
    setGenerating(false);
    setRewriting(false);
  };

  const doExplainGaps = async () => {
    if (!scoreResult || scoreResult.ats.missing.length === 0) return;
    setExplaining(true);
    setError(null);
    try {
      const r = await apiCall<{ gaps: { keyword: string; meaning: string; relatedHint: string | null }[] }>({
        action: "explain_gaps",
        resume,
        missing: scoreResult.ats.missing,
      });
      const next: Record<string, GapInfo> = {};
      for (const g of r.gaps || []) next[g.keyword] = { meaning: g.meaning, relatedHint: g.relatedHint };
      setGapInfo(next);
    } catch (e: any) {
      setError(e?.message || String(e));
    }
    setExplaining(false);
  };

  const downloadResume = () => {
    if (!finalResume) return;
    const html = generateResumeHTML(finalResume);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(finalResume.name || "resume").replace(/\s+/g, "_")}_optimized.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyText = () => {
    try {
      const ta = document.createElement("textarea");
      ta.value = verifiedText;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setShowText(true);
    }
  };

  const serif = "'Instrument Serif',Georgia,serif";
  const mono = "'JetBrains Mono',monospace";
  const is90Plus = !!scoreResult && scoreResult.total >= 90;
  const is85Plus = !!scoreResult && scoreResult.total >= 85 && scoreResult.total < 90;
  const score = scoreResult?.total || 0;
  const targetScore = score >= 80 ? 93 : 90;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff", fontFamily: "'DM Sans',sans-serif", padding: "28px 16px" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=Instrument+Serif&family=JetBrains+Mono:wght@400;600&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 740, margin: "0 auto 28px", textAlign: "center" }}>
        <div style={{ display: "inline-block", padding: "4px 14px", borderRadius: 20, background: "rgba(99,102,241,0.1)", color: "#8b5cf6", fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 }}>
          ScanItFree · Resume Reviewer Pro
        </div>
        <h1 style={{ fontFamily: serif, fontSize: 34, fontWeight: 400, margin: "0 0 6px" }}>
          Match. Score. <span style={{ color: "#8b5cf6" }}>Optimize to {targetScore}+.</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: 0 }}>Deterministic scoring — same resume always gets the same score</p>
      </div>

      {error && (
        <div style={{ maxWidth: 740, margin: "0 auto 16px", padding: "14px 18px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10 }}>
          <div style={{ color: "#ef4444", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>⚠️ Error</div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, wordBreak: "break-word" }}>{error}</div>
          <button onClick={() => setError(null)} style={{ marginTop: 8, padding: "6px 14px", background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 6, color: "#fff", fontSize: 12, cursor: "pointer" }}>
            Dismiss
          </button>
        </div>
      )}

      <div style={{ maxWidth: 740, margin: "0 auto 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>📋 Job Description</label>
          <textarea placeholder="Paste full JD..." value={jd} onChange={e => setJd(e.target.value)} rows={12} style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#fff", fontSize: 12.5, fontFamily: mono, lineHeight: 1.65, resize: "vertical", outline: "none" }} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>📄 Your Resume</label>
          <div
            onDragOver={e => {
              e.preventDefault();
              (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(99,102,241,0.5)";
            }}
            onDragLeave={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)";
            }}
            onDrop={e => {
              e.preventDefault();
              (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)";
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
            onClick={() => fileRef.current?.click()}
            style={{ padding: "14px", background: "rgba(99,102,241,0.04)", border: "2px dashed rgba(255,255,255,0.08)", borderRadius: 10, textAlign: "center", cursor: "pointer", marginBottom: 6, transition: "border-color 0.2s" }}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.html,.htm,.docx,.doc,.pdf,.rtf"
              style={{ display: "none" }}
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = "";
              }}
            />
            <div style={{ fontSize: 20, marginBottom: 4 }}>{uploading ? "⏳" : "📎"}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
              {uploading ? `Reading ${fileName}...` : fileName ? <span style={{ color: "#8b5cf6" }}>✓ {fileName} loaded</span> : "Drop file or click to upload"}
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>.txt .docx .pdf .html supported</div>
          </div>
          <textarea
            placeholder="...or paste resume text here"
            value={resume}
            onChange={e => {
              setResume(e.target.value);
              setFileName("");
            }}
            rows={8}
            style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#fff", fontSize: 12.5, fontFamily: mono, lineHeight: 1.65, resize: "vertical", outline: "none" }}
          />
        </div>
      </div>

      <div style={{ maxWidth: 740, margin: "0 auto 24px" }}>
        <button
          onClick={doScan}
          disabled={scanning || !resume.trim() || !jd.trim()}
          style={{
            width: "100%",
            padding: "14px",
            fontSize: 15,
            fontWeight: 700,
            border: "none",
            borderRadius: 10,
            cursor: scanning ? "wait" : "pointer",
            background: scanning ? "rgba(255,255,255,0.06)" : "#fff",
            color: scanning ? "rgba(255,255,255,0.35)" : "#0a0a0f",
            opacity: !resume.trim() || !jd.trim() ? 0.4 : 1,
          }}
        >
          {scanning ? (kwList.length > 0 ? "⏳ Scoring..." : "⏳ Extracting keywords & scoring...") : "🔍  Free Resume Scan"}
        </button>
      </div>

      {kwList.length > 0 && scoreResult && !scanning && (
        <div style={{ maxWidth: 740, margin: "0 auto 16px" }}>
          <div style={{ background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.1)", borderRadius: 10, padding: "10px 16px" }}>
            <div style={{ fontSize: 11, color: "#8b5cf6", fontWeight: 700, marginBottom: 6 }}>
              🔑 Locked Keywords ({scoreResult.ats.found.length}/{kwList.length} found)
            </div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {kwList.map((k, i) => {
                const found = scoreResult.ats.found.some(f => f.toLowerCase() === k.toLowerCase());
                return (
                  <Pill key={i} color={found ? "#22c55e" : "#ef4444"} bg={found ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.08)"}>
                    {found ? "✓" : "✗"} {k}
                  </Pill>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {scoreResult && !scanning && (
        <div style={{ maxWidth: 740, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 4, marginBottom: 18, background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 4 }}>
            {[
              { id: "scan", icon: "📊", label: "Score" },
              { id: "gap", icon: "🔑", label: "Skills Gap" },
              { id: "rewrite", icon: "✨", label: `${targetScore}+ Rewrite` },
              { id: "resume", icon: "📄", label: "Resume" },
            ].map(t => {
              const dis = is90Plus && (t.id === "rewrite" || t.id === "resume");
              return (
                <button
                  key={t.id}
                  onClick={() => !dis && setTab(t.id as any)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: dis ? "not-allowed" : "pointer",
                    background: tab === t.id ? "rgba(255,255,255,0.08)" : "transparent",
                    color: dis ? "rgba(255,255,255,0.12)" : tab === t.id ? "#fff" : "rgba(255,255,255,0.3)",
                    opacity: dis ? 0.4 : 1,
                  }}
                >
                  {t.icon} {t.label}
                  {dis ? " ✓" : ""}
                </button>
              );
            })}
          </div>

          {tab === "scan" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 20, background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: "20px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <ScoreGauge score={score} label="Overall" />
                <div style={{ flex: 1 }}>
                  {feedback && <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, lineHeight: 1.6, margin: "0 0 10px" }}>{feedback.eye_test?.impression}</p>}
                  {feedback?.top3_fixes && (
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {feedback.top3_fixes.map((f, i) => (
                        <Pill key={i} color="rgba(239,68,68,0.8)" bg="rgba(239,68,68,0.08)">
                          #{i + 1} {f}
                        </Pill>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {is90Plus && (
                <div style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.08),rgba(34,197,94,0.08))", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 14, padding: "20px 24px", marginBottom: 16, textAlign: "center" }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
                  <div style={{ fontFamily: serif, fontSize: 22, color: "#10b981", fontWeight: 400, marginBottom: 6 }}>Outstanding Resume!</div>
                  <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13.5, margin: "0 0 12px" }}>
                    Score: <strong style={{ color: "#10b981" }}>{score}/100</strong> — top tier. No optimization needed.
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: 0 }}>Try a different JD to tailor for another role.</p>
                </div>
              )}
              {is85Plus && (
                <div style={{ background: "linear-gradient(135deg,rgba(234,179,8,0.06),rgba(245,158,11,0.06))", border: "1px solid rgba(234,179,8,0.2)", borderRadius: 14, padding: "20px 24px", marginBottom: 16, textAlign: "center" }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>💪</div>
                  <div style={{ fontFamily: serif, fontSize: 20, color: "#eab308", fontWeight: 400, marginBottom: 6 }}>Strong Resume — Almost There!</div>
                  <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, lineHeight: 1.6, margin: "0 0 12px", maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
                    Your resume scored <strong style={{ color: "#eab308" }}>{score}/100</strong> — you&apos;re already in great shape. Optimization will fine-tune the remaining gaps to push you to {targetScore}+.
                  </p>
                </div>
              )}

              <ScoreRow label="📝 Summary" score={scoreResult.summary.score} max={15} issues={scoreResult.summary.issues} />
              <ScoreRow label="🛠 Skills" score={scoreResult.skills.score} max={20} issues={scoreResult.skills.issues} />
              <ScoreRow label="📋 Bullets" score={scoreResult.bullets.score} max={35} issues={scoreResult.bullets.issues} />
              <ScoreRow label="🤖 ATS Keywords" score={scoreResult.ats.score} max={15} issues={scoreResult.ats.missing.length > 0 ? [`Missing: ${scoreResult.ats.missing.join(", ")}`] : []} />
              <ScoreRow label="📐 Format" score={scoreResult.format.score} max={15} issues={scoreResult.format.issues} />

              {feedback?.eye_test && (
                <div style={{ background: "rgba(234,179,8,0.04)", border: "1px solid rgba(234,179,8,0.12)", borderRadius: 12, padding: "14px 18px", marginTop: 8 }}>
                  <div style={{ color: "#eab308", fontWeight: 700, fontSize: 13, marginBottom: 8 }}>👁️ Recruiter Eye Test</div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {(feedback.eye_test.red_flags || []).map((f, i) => (
                      <Pill key={`f${i}`} color="#ef4444" bg="rgba(239,68,68,0.08)">
                        🚩 {f}
                      </Pill>
                    ))}
                    {(feedback.eye_test.strengths || []).map((sVal, i) => (
                      <Pill key={`s${i}`} color="#22c55e" bg="rgba(34,197,94,0.08)">
                        ✓ {sVal}
                      </Pill>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "gap" && scoreResult && (
            <div>
              {(() => {
                const found = scoreResult.ats.found || [];
                const missing = scoreResult.ats.missing || [];
                const directCount = found.length + confirmedSkills.size;
                const relatedCount = Array.from(relatedSkills.keys()).filter(k => missing.includes(k) && !confirmedSkills.has(k)).length;
                const notAdded = missing.filter(k => !confirmedSkills.has(k) && !relatedSkills.has(k));
                const ceiling = maxAchievableScore(directCount, relatedCount, kwList.length);
                const hasGapInfo = Object.keys(gapInfo).length > 0;
                return (
                  <>
                    <div style={{ background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.12)", borderRadius: 12, padding: "16px 20px", marginBottom: 16 }}>
                      <div style={{ color: "#8b5cf6", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                        🏢 Company & Tools Context <span style={{ fontWeight: 400, color: "rgba(255,255,255,0.35)" }}>(optional)</span>
                      </div>
                      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, lineHeight: 1.5, margin: "0 0 10px" }}>
                        Knowing the company helps the optimizer use the right tools and terminology. We have tool profiles for 40+ major companies — just type the name.
                      </p>
                      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                        <input
                          type="text"
                          placeholder="Company name (e.g. Microsoft, Google, Amazon)"
                          value={companyName}
                          onChange={e => {
                            setCompanyName(e.target.value);
                            const match = matchCompany(e.target.value);
                            if (match && !toolsContext) setToolsContext(match.tools);
                          }}
                          style={{ flex: 1, padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#fff", fontSize: 13, outline: "none" }}
                        />
                        {(() => {
                          const m = matchCompany(companyName);
                          return m ? (
                            <button
                              onClick={() => setToolsContext(m.tools)}
                              style={{ padding: "8px 14px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 8, color: "#8b5cf6", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
                            >
                              ✨ Auto-fill {m.name}
                            </button>
                          ) : null;
                        })()}
                      </div>
                      {(() => {
                        const m = matchCompany(companyName);
                        return m && !toolsContext.includes(m.tools.slice(0, 30)) ? (
                          <div style={{ padding: "8px 12px", background: "rgba(99,102,241,0.06)", borderRadius: 8, marginBottom: 8, fontSize: 11.5, color: "rgba(99,102,241,0.7)" }}>
                            💡 We have a tool profile for <strong>{m.name}</strong> — click &quot;Auto-fill&quot; to populate, or type your own below.
                          </div>
                        ) : null;
                      })()}
                      <textarea
                        placeholder={"Tools, platforms, or context the optimizer should know (optional)\n\nType a company name above to auto-fill, or enter manually:\n• Bug tracking: Azure DevOps (not Jira)\n• Test management: Visual Studio Test Plans\n• This is a contract role"}
                        value={toolsContext}
                        onChange={e => setToolsContext(e.target.value)}
                        rows={4}
                        style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#fff", fontSize: 12.5, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.55, resize: "vertical", outline: "none" }}
                      />
                      {companyName && (
                        <div style={{ marginTop: 8, fontSize: 11.5, color: "rgba(99,102,241,0.7)" }}>
                          ✓ Optimizer will tailor tools and terminology for <strong>{companyName}</strong>
                        </div>
                      )}
                      {toolsContext && (
                        <button onClick={() => setToolsContext("")} style={{ marginTop: 6, padding: "4px 10px", background: "rgba(255,255,255,0.04)", border: "none", borderRadius: 4, color: "rgba(255,255,255,0.3)", fontSize: 10, cursor: "pointer" }}>
                          Clear tools context
                        </button>
                      )}
                    </div>

                    <div style={{ background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.15)", borderRadius: 12, padding: "16px 20px", marginBottom: 16 }}>
                      <div style={{ color: "#eab308", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>⚠️ Honesty Disclaimer</div>
                      <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12.5, lineHeight: 1.6, margin: 0 }}>
                        Only confirm skills you <strong>genuinely possess</strong> or have direct experience with. Adding skills you don&apos;t have may lead to interview questions you can&apos;t answer, or placement in a role beyond your current capacity. <strong>Your integrity is worth more than a higher score.</strong>
                      </p>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <div style={{ color: "#22c55e", fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
                        ✅ Skills Already on Your Resume ({found.length}/{kwList.length})
                      </div>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {found.map((k, i) => (
                          <Pill key={i} color="#22c55e" bg="rgba(34,197,94,0.1)">
                            ✓ {k}
                          </Pill>
                        ))}
                      </div>
                      {found.length === 0 && <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>No JD keywords found in your current resume.</p>}
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <div style={{ color: "#ef4444", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>❌ Missing Skills ({missing.length} not found)</div>
                      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 10 }}>
                        For each one: check it if you <strong>actually have</strong> it, or add <strong>related experience</strong> if you did something comparable. Anything left blank is never added — the optimizer works around it.
                      </p>
                      {missing.length > 0 && (
                        <button
                          onClick={doExplainGaps}
                          disabled={explaining}
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            marginBottom: 10,
                            background: hasGapInfo ? "rgba(255,255,255,0.04)" : "rgba(99,102,241,0.12)",
                            border: `1px solid ${hasGapInfo ? "rgba(255,255,255,0.08)" : "rgba(99,102,241,0.3)"}`,
                            borderRadius: 10,
                            color: hasGapInfo ? "rgba(255,255,255,0.5)" : "#8b5cf6",
                            fontSize: 12.5,
                            fontWeight: 600,
                            cursor: explaining ? "wait" : "pointer",
                          }}
                        >
                          {explaining
                            ? "⏳ Reading your resume for related experience..."
                            : hasGapInfo
                              ? "🔄 Re-analyze related experience"
                              : "💡 Explain these terms & find related experience in my resume"}
                        </button>
                      )}
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {missing.map((k, i) => {
                          const checked = confirmedSkills.has(k);
                          const relatedText = relatedSkills.get(k) || "";
                          const isRelated = !checked && relatedText.trim().length > 0;
                          const expanded = expandedRelated.has(k) || isRelated;
                          const info = gapInfo[k];
                          const border = checked ? "rgba(99,102,241,0.25)" : isRelated ? "rgba(234,179,8,0.3)" : "rgba(255,255,255,0.06)";
                          const bg = checked ? "rgba(99,102,241,0.08)" : isRelated ? "rgba(234,179,8,0.05)" : "rgba(255,255,255,0.02)";
                          return (
                            <div key={i} style={{ padding: "10px 14px", background: bg, border: `1px solid ${border}`, borderRadius: 10, transition: "all 0.15s" }}>
                              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleConfirmed(k)}
                                  style={{ width: 18, height: 18, accentColor: "#8b5cf6", cursor: "pointer", flexShrink: 0 }}
                                />
                                <span style={{ color: checked || isRelated ? "#fff" : "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: checked || isRelated ? 600 : 400 }}>{k}</span>
                                {checked && <span style={{ marginLeft: "auto", fontSize: 10, color: "#8b5cf6", fontWeight: 600, whiteSpace: "nowrap" }}>WILL BE ADDED</span>}
                                {isRelated && <span style={{ marginLeft: "auto", fontSize: 10, color: "#eab308", fontWeight: 600, whiteSpace: "nowrap" }}>RELATED · ADJACENT FRAMING</span>}
                              </label>
                              {info?.meaning && (
                                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11.5, lineHeight: 1.5, marginTop: 6, paddingLeft: 28 }}>{info.meaning}</div>
                              )}
                              {!checked && (
                                <div style={{ paddingLeft: 28, marginTop: 6 }}>
                                  {info?.relatedHint && !isRelated && (
                                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "8px 10px", background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.15)", borderRadius: 8, marginBottom: 6 }}>
                                      <span style={{ color: "rgba(234,179,8,0.85)", fontSize: 11.5, lineHeight: 1.5, flex: 1 }}>💡 {info.relatedHint}</span>
                                      <button
                                        onClick={() => {
                                          setRelated(k, info.relatedHint || "");
                                          setExpandedRelated(new Set(expandedRelated).add(k));
                                        }}
                                        style={{ padding: "4px 10px", background: "rgba(234,179,8,0.15)", border: "1px solid rgba(234,179,8,0.3)", borderRadius: 6, color: "#eab308", fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
                                      >
                                        Use this
                                      </button>
                                    </div>
                                  )}
                                  {!expanded ? (
                                    <button
                                      onClick={() => setExpandedRelated(new Set(expandedRelated).add(k))}
                                      style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 11, cursor: "pointer", padding: 0 }}
                                    >
                                      + I have related experience ▸
                                    </button>
                                  ) : (
                                    <textarea
                                      value={relatedText}
                                      onChange={e => setRelated(k, e.target.value)}
                                      placeholder={`What did you do that's comparable to "${k}"? Be specific — this becomes a bullet.`}
                                      rows={2}
                                      style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.5, resize: "vertical", outline: "none" }}
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "16px 20px", marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>📈 Best honest score with these selections</span>
                        <span style={{ color: ceiling >= targetScore ? "#10b981" : ceiling >= 80 ? "#eab308" : "#ef4444", fontWeight: 800, fontSize: 20 }}>{ceiling}</span>
                      </div>
                      <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, marginBottom: 8 }}>
                        <div style={{ height: 6, background: ceiling >= targetScore ? "#10b981" : "#eab308", borderRadius: 3, width: `${ceiling}%`, transition: "width 0.4s ease" }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                        <span>Current: {score}</span>
                        <span>
                          <span style={{ color: "#8b5cf6" }}>{directCount} direct</span> · <span style={{ color: "#eab308" }}>{relatedCount} related</span> · {notAdded.length} not added · of {kwList.length}
                        </span>
                        <span>Goal: {targetScore}+</span>
                      </div>
                      {ceiling < targetScore ? (
                        <div style={{ marginTop: 10, padding: "10px 12px", background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.15)", borderRadius: 8 }}>
                          <p style={{ color: "rgba(234,179,8,0.9)", fontSize: 12, lineHeight: 1.55, margin: 0 }}>
                            ⚠️ With what you&apos;ve confirmed, the honest ceiling is <strong>{ceiling}</strong>, not {targetScore}+. The optimizer will stop there rather than invent experience.
                          </p>
                          {notAdded.length > 0 && (
                            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 11.5, lineHeight: 1.55, margin: "6px 0 0" }}>
                              Holding the score back: {notAdded.join(", ")}. Confirm any you have, or add related experience, to raise the ceiling.
                            </p>
                          )}
                        </div>
                      ) : (
                        <p style={{ color: "rgba(16,185,129,0.8)", fontSize: 12, marginTop: 8 }}>
                          ✅ {targetScore}+ is reachable with only the skills you confirmed.
                        </p>
                      )}
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <button
                        onClick={() => {
                          setTab("rewrite");
                          doRewrite();
                        }}
                        disabled={rewriting}
                        style={{
                          background: rewriting ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                          color: "#fff",
                          border: "none",
                          borderRadius: 10,
                          padding: "14px 32px",
                          fontSize: 15,
                          fontWeight: 700,
                          cursor: rewriting ? "wait" : "pointer",
                          boxShadow: "0 4px 24px rgba(99,102,241,0.3)",
                        }}
                      >
                        {rewriting ? "⏳ Optimizing..." : `✨ Optimize — up to ${ceiling}/100`}
                      </button>
                      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 8 }}>
                        Only confirmed and related skills are used. Nothing else gets added.
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {tab === "rewrite" && (
            <div style={{ minHeight: 320 }}>
              {rewrite ? (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 40, marginBottom: 20, background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: "20px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <ScoreGauge score={score} size={100} label="Original" />
                    <div style={{ fontSize: 24, color: "rgba(255,255,255,0.2)" }}>→</div>
                    {verifiedScore ? (
                      <ScoreGauge score={verifiedScore.total} size={100} label="Verified" showDelta delta={verifiedScore.total - score} />
                    ) : (
                      <div style={{ width: 100, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 12 }}>Verifying...</div>
                    )}
                  </div>
                  {verifiedScore && (
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, textAlign: "center", margin: "-12px 0 12px" }}>
                      ✅ Deterministic score — same text will always get {verifiedScore.total}/100
                    </p>
                  )}

                  {verifiedScore && (
                    verifiedScore.total >= targetScore ? (
                      <div style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12, padding: "14px 18px", marginBottom: 10 }}>
                        <div style={{ color: "#10b981", fontWeight: 700, fontSize: 13 }}>🎉 {verifiedScore.total}/100 — using only skills you confirmed</div>
                      </div>
                    ) : (
                      <div style={{ background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.18)", borderRadius: 12, padding: "14px 18px", marginBottom: 10 }}>
                        <div style={{ color: "#eab308", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                          Reached {verifiedScore.total}/100 — honest ceiling was {rewrite.ceiling}
                        </div>
                        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, lineHeight: 1.55, margin: 0 }}>
                          {targetScore}+ isn&apos;t reachable with {kwList.length - rewrite.unaddressed.length}/{kwList.length} usable keywords, so the optimizer stopped at the ceiling instead of inventing experience.
                          {rewrite.unaddressed.length > 0 && (
                            <>
                              {" "}
                              Still missing (by your choice): <strong>{rewrite.unaddressed.join(", ")}</strong>. Go back to <button onClick={() => setTab("gap")} style={{ background: "none", border: "none", color: "#8b5cf6", cursor: "pointer", padding: 0, fontSize: 12, fontWeight: 600 }}>Skills Gap</button> to confirm any you have or add related experience.
                            </>
                          )}
                        </p>
                      </div>
                    )
                  )}

                  {(rewrite.warnings || []).length > 0 && (
                    <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 12, padding: "14px 18px", marginBottom: 10 }}>
                      <div style={{ color: "#ef4444", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>⚠️ Review before using</div>
                      {rewrite.warnings.map((w, i) => (
                        <div key={i} style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, lineHeight: 1.5, paddingLeft: 10, borderLeft: "2px solid rgba(239,68,68,0.3)", marginBottom: 4 }}>
                          {w}
                        </div>
                      ))}
                    </div>
                  )}

                  {(rewrite.related || []).length > 0 && (
                    <div style={{ background: "rgba(234,179,8,0.04)", border: "1px solid rgba(234,179,8,0.12)", borderRadius: 12, padding: "14px 18px", marginBottom: 10 }}>
                      <div style={{ color: "#eab308", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>🔗 Framed as related experience (not claimed directly)</div>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {rewrite.related.map((k, i) => (
                          <Pill key={i} color="rgba(234,179,8,0.85)" bg="rgba(234,179,8,0.08)">
                            ↔ {k}
                          </Pill>
                        ))}
                      </div>
                      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 8 }}>
                        These appear in bullets or the summary with &quot;comparable to&quot; / &quot;transferable to&quot; wording, grounded in what you told us — never as a bare skill.
                      </p>
                    </div>
                  )}

                  {verifiedScore && (
                    <div style={{ marginBottom: 14 }}>
                      <ScoreRow label="📝 Summary" score={verifiedScore.summary.score} max={15} issues={verifiedScore.summary.issues} />
                      <ScoreRow label="🛠 Skills" score={verifiedScore.skills.score} max={20} issues={verifiedScore.skills.issues} />
                      <ScoreRow label="📋 Bullets" score={verifiedScore.bullets.score} max={35} issues={verifiedScore.bullets.issues} />
                      <ScoreRow label="🤖 ATS" score={verifiedScore.ats.score} max={15} issues={verifiedScore.ats.missing.length > 0 ? [`Missing: ${verifiedScore.ats.missing.join(", ")}`] : []} />
                      <ScoreRow label="📐 Format" score={verifiedScore.format.score} max={15} issues={verifiedScore.format.issues} />
                    </div>
                  )}

                  {(rewrite.changes || []).length > 0 && (
                    <div style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.1)", borderRadius: 12, padding: "14px 18px", marginBottom: 10 }}>
                      <div style={{ color: "#22c55e", fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
                        🔧 Changes ({rewrite.pass} pass{rewrite.pass > 1 ? "es" : ""})
                      </div>
                      {rewrite.changes.slice(0, 10).map((c, i) => (
                        <div key={i} style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginBottom: 3, paddingLeft: 10, borderLeft: "2px solid rgba(34,197,94,0.25)" }}>
                          ✓ {c}
                        </div>
                      ))}
                      {rewrite.changes.length > 10 && (
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", paddingLeft: 10 }}>+{rewrite.changes.length - 10} more changes</div>
                      )}
                    </div>
                  )}

                  {(rewrite.declined || []).length > 0 && (
                    <div style={{ background: "rgba(234,179,8,0.04)", border: "1px solid rgba(234,179,8,0.12)", borderRadius: 12, padding: "14px 18px", marginBottom: 10 }}>
                      <div style={{ color: "#eab308", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>⚠️ Skills Not Added (per your request)</div>
                      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11.5, marginBottom: 8 }}>These JD keywords were not added because you indicated you don&apos;t have them:</p>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {rewrite.declined.map((k, i) => (
                          <Pill key={i} color="rgba(234,179,8,0.7)" bg="rgba(234,179,8,0.08)">
                            ✗ {k}
                          </Pill>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: 16, textAlign: "center" }}>
                    <button
                      onClick={() => setTab("resume")}
                      disabled={generating}
                      style={{ background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", border: "none", borderRadius: 10, padding: "14px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 20px rgba(16,185,129,0.3)" }}
                    >
                      {generating ? "⏳ Optimizing..." : "📄 View & Download Resume"}
                    </button>
                  </div>
                </div>
              ) : rewriting ? (
                <div style={{ textAlign: "center", padding: "70px 0", color: "rgba(255,255,255,0.35)" }}>
                  <div style={{ fontSize: 30, marginBottom: 14, animation: "pulse 1.5s ease infinite" }}>⚡</div>
                  <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
                  <div>Rewriting → Scoring → Boosting until {targetScore}+...</div>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "80px 20px", color: "rgba(255,255,255,0.2)", fontSize: 13 }}>
                  Click &quot;Optimize&quot; from the Skills Gap tab to generate an AI-rewritten resume.
                </div>
              )}
            </div>
          )}

          {tab === "resume" && (
            <div style={{ minHeight: 320 }}>
              {finalResume ? (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>📄 Optimized Resume</div>
                    <button onClick={downloadResume} style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                      ⬇️ Download
                    </button>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                    <button onClick={copyText} style={{ flex: 1, padding: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      {copied ? "✅ Copied!" : "📋 Copy Verified Text"}
                    </button>
                    <button
                      onClick={() => {
                        setResume(verifiedText);
                        setTab("scan");
                        setScoreResult(null);
                        setFeedback(null);
                        setRewrite(null);
                        setFinalResume(null);
                        setVerifiedScore(null);
                        setTimeout(() => doScanWithText(verifiedText), 100);
                      }}
                      style={{ flex: 1, padding: "10px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 8, color: "#10b981", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                    >
                      🔄 Re-scan (verify score)
                    </button>
                  </div>
                  {!showText ? (
                    <button onClick={() => setShowText(true)} style={{ width: "100%", padding: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "rgba(255,255,255,0.4)", fontSize: 12, cursor: "pointer", marginBottom: 10 }}>
                      📝 Show text (manual copy)
                    </button>
                  ) : (
                    <div style={{ marginBottom: 10 }}>
                      <button onClick={() => setShowText(false)} style={{ padding: "6px 12px", background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 6, color: "rgba(255,255,255,0.4)", fontSize: 11, cursor: "pointer", marginBottom: 6 }}>
                        Hide ▲
                      </button>
                      <textarea readOnly value={verifiedText} rows={10} style={{ width: "100%", boxSizing: "border-box", padding: "12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12, fontFamily: mono, lineHeight: 1.6, resize: "vertical", outline: "none" }} onFocus={e => e.currentTarget.select()} />
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>Click → Ctrl+A → Ctrl+C</p>
                    </div>
                  )}
                  <ResumePreview data={finalResume} />
                </div>
              ) : generating ? (
                <div style={{ textAlign: "center", padding: "70px 0", color: "rgba(255,255,255,0.35)" }}>
                  <div style={{ fontSize: 30, marginBottom: 14, animation: "pulse 1.5s ease infinite" }}>📄</div>
                  <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
                  <div>Generating...</div>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "80px 20px", color: "rgba(255,255,255,0.2)", fontSize: 13 }}>
                  Complete the rewrite first.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
