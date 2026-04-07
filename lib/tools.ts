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
    desc: "Scan any ingredient list or product for recalls, allergens, and safety concerns",
    icon: "🛡️",
    category: "Health",
    status: "live",
    searchVolume: "14.8K/mo",
    cta: "Check Ingredients",
    href: "/tools/food-safety",
    seoTitle: "Free AI Food Safety Scanner — Check Ingredients & Recalls Instantly",
    seoDesc:
      "Paste any ingredient list, product name, or UPC. Our AI cross-references FDA recalls, allergen databases, and safety research to give you a clear safety score. 100% free.",
  },
  {
    id: "resume-reviewer",
    name: "Resume Reviewer",
    desc: "Get instant AI feedback on your resume with scoring and actionable suggestions",
    icon: "📄",
    category: "Career",
    status: "live",
    searchVolume: "40.5K/mo",
    cta: "Review Resume",
    href: "/tools/resume-reviewer",
    seoTitle: "Free AI Resume Reviewer — Get Instant Feedback & Score",
    seoDesc:
      "Paste your resume and get an instant AI review with scoring, ATS compatibility check, and actionable improvement suggestions. No signup required.",
  },
  {
    id: "lease-scanner",
    name: "Lease Red Flag Scanner",
    desc: "Upload your lease or rental agreement and find hidden clauses and red flags",
    icon: "🔍",
    category: "Legal",
    status: "live",
    searchVolume: "9.2K/mo",
    cta: "Scan Lease",
    href: "/tools/lease-scanner",
    seoTitle: "Free AI Lease Scanner — Find Red Flags in Your Rental Agreement",
    seoDesc:
      "Paste your lease or rental agreement and our AI identifies unfair clauses, hidden fees, and red flags in plain English. Free, no signup.",
  },
  {
    id: "cover-letter",
    name: "Cover Letter Generator",
    desc: "Paste a job listing and your resume — get a tailored cover letter in seconds",
    icon: "✉️",
    category: "Career",
    status: "coming",
    searchVolume: "33.1K/mo",
    cta: "Generate Letter",
    href: "/tools/cover-letter",
    seoTitle: "Free AI Cover Letter Generator — Tailored to Any Job",
    seoDesc: "Paste a job listing and your resume to get a tailored, professional cover letter instantly.",
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

export const CATEGORIES = ["All", "Health", "Career", "Legal", "Safety", "Productivity"];
