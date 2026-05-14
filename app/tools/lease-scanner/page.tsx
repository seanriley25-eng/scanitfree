import type { Metadata } from "next";
import { LeaseClient } from "./client";

export const metadata: Metadata = {
  title: "Free AI Lease Scanner — State-Specific Red Flag Analysis",
  description:
    "Paste your lease and select your state for jurisdiction-aware AI analysis. Identifies unfair clauses, hidden fees, and red flags with specific state tenant law citations. Free, no signup.",
  keywords: ["lease scanner", "state lease review", "rental agreement checker", "tenant rights by state", "lease red flags", "state-specific lease analysis"],
};

export default function LeaseScannerPage() {
  return <LeaseClient />;
}
