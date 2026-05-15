export interface Tool {
  id: string;
  name: string;
  desc: string;
  icon: string;
  category: string;
  status: "live" | "coming" | "planned";
  searchVolume: string;
  cta: string;
  href: string;
  seoTitle: string;
  seoDesc: string;
}

export const TOOLS: Tool[] = [
  {
    id: "food-safety",
    name: "Food Safety Scanner",
    desc: "Upload a food label photo or scan any ingredient list for recalls, allergens, and safety concerns",
    icon: "🛡️",
    category: "Health",
    status: "live",
    searchVolume: "14.8K/mo",
    cta: "Check Ingredients",
    href: "/tools/food-safety",
    seoTitle: "Free AI Food Safety Scanner — Scan Ingredient Labels by Photo or Text",
    seoDesc:
      "Upload a photo of any food label or paste an ingredient list, product name, or UPC. Our AI cross-references FDA recalls, allergen databases, and safety research to give you a clear safety score. 100% free.",
  },
  {
    id: "resume-reviewer",
    name: "Resume Reviewer",
    desc: "Upload your resume PDF or DOCX — get instant AI feedback with ATS keyword match, JD comparison, and scoring",
    icon: "📄",
    category: "Career",
    status: "live",
    searchVolume: "40.5K/mo",
    cta: "Review Resume",
    href: "/tools/resume-reviewer",
    seoTitle: "Free AI Resume Reviewer — Upload PDF or DOCX for ATS Keyword Match",
    seoDesc:
      "Upload your resume as PDF or DOCX, or paste the text. Get an instant AI review with ATS keyword match, job description matching, scoring, and actionable improvement suggestions. No signup required.",
  },
  {
    id: "lease-scanner",
    name: "Lease Red Flag Scanner",
    desc: "Upload your lease PDF or paste the text, select your state, and get jurisdiction-aware AI analysis of red flags",
    icon: "🔍",
    category: "Legal",
    status: "live",
    searchVolume: "9.2K/mo",
    cta: "Scan Lease",
    href: "/tools/lease-scanner",
    seoTitle: "Free AI Lease Scanner — Upload Lease PDF for State-Specific Red Flag Analysis",
    seoDesc:
      "Upload your lease PDF or paste the text and select your state for jurisdiction-aware AI analysis. Identifies unfair clauses, hidden fees, and red flags with state tenant law citations. Free, no signup.",
  },
  {
    id: "cover-letter-reviewer",
    name: "Cover Letter Reviewer",
    desc: "Paste or upload your cover letter — get instant AI feedback on hook, structure, ATS score, and role match",
    icon: "✉️",
    category: "Career",
    status: "live",
    searchVolume: "33.1K/mo",
    cta: "Review Cover Letter",
    href: "/tools/cover-letter-reviewer",
    seoTitle: "Free AI Cover Letter Reviewer — Instant Feedback & ATS Score",
    seoDesc:
      "Paste or upload your cover letter for instant AI feedback on opening hook, structure, tone, and ATS keyword gaps. Add a job description for targeted role-match analysis. Free, no signup required.",
  },
  {
    id: "privacy-policy-translator",
    name: "Privacy Policy Translator",
    desc: "Paste any privacy policy or upload as PDF — plain-English breakdown of what they do with your data, red flags, and your rights",
    icon: "🔓",
    category: "Privacy",
    status: "live",
    searchVolume: "21.0K/mo",
    cta: "Translate Policy",
    href: "/tools/privacy-policy-translator",
    seoTitle: "Free Privacy Policy Translator — Plain English in 30 Seconds",
    seoDesc:
      "Paste any privacy policy or upload as PDF. Get a plain-English breakdown of what they actually do with your data, red flags, data sharing, and your rights under GDPR and CCPA. Free, no signup.",
  },
  {
    id: "pet-symptom",
    name: "Pet Symptom Checker",
    desc: "Describe your pet's symptoms and get guidance on urgency and next steps",
    icon: "🐾",
    category: "Health",
    status: "coming",
    searchVolume: "22.0K/mo",
    cta: "Check Symptoms",
    href: "/tools/pet-symptom",
    seoTitle: "Free AI Pet Symptom Checker — Should You See a Vet?",
    seoDesc: "Describe your pet's symptoms and get AI-powered guidance on urgency level and next steps.",
  },
  {
    id: "recall-tracker",
    name: "Product Recall Tracker",
    desc: "Search any product or brand for active FDA, CPSC, and NHTSA recalls",
    icon: "⚠️",
    category: "Safety",
    status: "coming",
    searchVolume: "18.3K/mo",
    cta: "Search Recalls",
    href: "/tools/recall-tracker",
    seoTitle: "Free Product Recall Search — FDA, CPSC & NHTSA Database",
    seoDesc: "Search any product or brand for active recalls across FDA, CPSC, and NHTSA databases.",
  },
  {
    id: "email-writer",
    name: "Professional Email Writer",
    desc: "Describe the situation, get a polished email draft ready to send",
    icon: "📧",
    category: "Productivity",
    status: "planned",
    searchVolume: "27.6K/mo",
    cta: "Write Email",
    href: "/tools/email-writer",
    seoTitle: "Free AI Email Writer — Professional Emails in Seconds",
    seoDesc: "Describe the situation and get a polished, professional email draft. Free and instant.",
  },
  {
    id: "contract-review",
    name: "Contract Clause Checker",
    desc: "Paste any contract and get plain-English explanations of every clause",
    icon: "⚖️",
    category: "Legal",
    status: "planned",
    searchVolume: "12.4K/mo",
    cta: "Review Contract",
    href: "/tools/contract-review",
    seoTitle: "Free AI Contract Review — Plain-English Clause Explanations",
    seoDesc: "Paste any contract and get plain-English explanations of every clause with risk flags.",
  },
];

export const CATEGORIES = ["All", "Health", "Career", "Legal", "Privacy"];
