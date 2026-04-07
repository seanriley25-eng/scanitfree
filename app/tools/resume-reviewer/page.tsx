import type { Metadata } from "next";
import { ResumeClient } from "./client";

export const metadata: Metadata = {
  title: "Free AI Resume Reviewer — Get Instant Feedback & Score",
  description:
    "Paste your resume and get an instant AI review with scoring, ATS compatibility check, and actionable improvement suggestions. No signup required.",
  keywords: ["resume reviewer", "AI resume score", "ATS checker", "resume feedback free"],
};

export default function ResumeReviewerPage() {
  return <ResumeClient />;
}
