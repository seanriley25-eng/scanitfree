import type { Metadata } from "next";
import { CoverLetterClient } from "./client";

export const metadata: Metadata = {
  title: "Free AI Cover Letter Reviewer — Instant Feedback & ATS Score",
  description:
    "Paste or upload your cover letter for instant AI feedback on opening hook, structure, tone, and ATS keyword gaps. Add a job description for targeted role-match analysis. Free, no signup required.",
  keywords: [
    "cover letter reviewer",
    "AI cover letter feedback",
    "cover letter ATS checker",
    "cover letter scorer",
    "free cover letter review",
    "cover letter keyword match",
    "cover letter checker",
    "AI cover letter analysis",
    "cover letter job description match",
  ],
};

export default function CoverLetterReviewerPage() {
  return <CoverLetterClient />;
}
