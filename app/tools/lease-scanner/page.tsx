import type { Metadata } from "next";
import { LeaseClient } from "./client";

export const metadata: Metadata = {
  title: "Free AI Lease Scanner — Upload Lease PDF for State-Specific Red Flag Analysis",
  description:
    "Upload your lease PDF or paste the text and select your state for jurisdiction-aware AI analysis. Identifies unfair clauses, hidden fees, and red flags with state tenant law citations. Free, no signup.",
  keywords: ["lease scanner", "state lease review", "rental agreement checker", "tenant rights by state", "lease red flags", "state-specific lease analysis", "upload lease PDF", "lease PDF scanner"],
};

export default function LeaseScannerPage() {
  return <LeaseClient />;
}
