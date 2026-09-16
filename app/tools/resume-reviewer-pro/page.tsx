import type { Metadata } from "next";
import { ResumeProClient } from "./client";

export const metadata: Metadata = {
  title: "Resume Reviewer Pro — Deterministic ATS Score + 90+ AI Rewrite",
  description:
    "Get a deterministic ATS score (same resume always gets the same score), then optimize to 90+ with an AI rewrite tailored to your target company. Free, no signup.",
  keywords: [
    "resume reviewer pro",
    "ATS resume score",
    "resume optimizer",
    "AI resume rewrite",
    "resume keyword match",
    "job description matching",
    "resume 90 score",
    "deterministic resume scorer",
    "company-specific resume",
  ],
};

export default function ResumeReviewerProPage() {
  return <ResumeProClient />;
}
