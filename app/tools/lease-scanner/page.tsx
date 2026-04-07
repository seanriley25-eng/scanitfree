import type { Metadata } from "next";
import { LeaseClient } from "./client";

export const metadata: Metadata = {
  title: "Free AI Lease Scanner — Find Red Flags in Your Rental Agreement",
  description:
    "Paste your lease or rental agreement and our AI identifies unfair clauses, hidden fees, and red flags in plain English. Free, no signup.",
  keywords: ["lease scanner", "rental agreement checker", "lease red flags", "unfair lease clauses"],
};

export default function LeaseScannerPage() {
  return <LeaseClient />;
}
