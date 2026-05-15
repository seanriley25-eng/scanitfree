import type { Metadata } from "next";
import { PrivacyPolicyClient } from "./client";

export const metadata: Metadata = {
  title: "Free Privacy Policy Translator — Plain English in 30 Seconds",
  description:
    "Paste any privacy policy or upload as PDF. Get a plain-English breakdown of what they actually do with your data, red flags, data sharing partners, and your rights under GDPR and CCPA. Free, no signup.",
  keywords: [
    "privacy policy translator",
    "privacy policy plain English",
    "what do they do with my data",
    "privacy policy checker",
    "decode privacy policy",
    "privacy policy analyzer",
    "GDPR rights checker",
    "CCPA opt out",
    "data privacy checker",
  ],
};

export default function PrivacyPolicyTranslatorPage() {
  return <PrivacyPolicyClient />;
}
