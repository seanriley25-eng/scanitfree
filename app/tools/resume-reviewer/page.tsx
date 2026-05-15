import type { Metadata } from "next";
import { ResumeClient } from "./client";

export const metadata: Metadata = {
  title: "Free AI Resume Reviewer — Upload PDF or DOCX for ATS Keyword Match",
  description:
    "Upload your resume as PDF or DOCX, or paste the text. Get an instant AI review with ATS keyword match, job description matching, scoring, and actionable improvement suggestions. No signup required.",
  keywords: ["resume reviewer", "AI resume score", "ATS keyword match", "job description matching", "ATS checker", "resume feedback free", "resume keyword gap", "upload resume PDF", "resume DOCX review"],
};

export default function ResumeReviewerPage() {
  return <ResumeClient />;
}
