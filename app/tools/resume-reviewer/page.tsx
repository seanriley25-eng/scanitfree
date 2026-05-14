import type { Metadata } from "next";
import { ResumeClient } from "./client";

export const metadata: Metadata = {
  title: "Free AI Resume Reviewer — ATS Keyword Match & Instant Score",
  description:
    "Paste your resume and get an instant AI review with ATS keyword match, job description matching, scoring, and actionable improvement suggestions. No signup required.",
  keywords: ["resume reviewer", "AI resume score", "ATS keyword match", "job description matching", "ATS checker", "resume feedback free", "resume keyword gap"],
};

export default function ResumeReviewerPage() {
  return <ResumeClient />;
}
