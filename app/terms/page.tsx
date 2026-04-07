import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — ScanItFree",
  description: "Terms of service for using ScanItFree.",
};

export default function TermsPage() {
  return (
    <div className="max-w-[640px] mx-auto px-6 py-16">
      <h1 className="font-display text-4xl text-[var(--text)] mb-2">Terms of Service</h1>
      <p className="text-muted text-xs font-mono mb-8">Last updated: April 2026</p>

      <div className="text-muted text-sm leading-relaxed space-y-4">
        <p>By using ScanItFree, you agree to the following terms.</p>

        <h2 className="font-heading text-base font-semibold text-[var(--text)] pt-2">Service description</h2>
        <p>ScanItFree provides free AI-powered informational tools. Our tools generate
          automated analysis based on AI models and public data sources. Results are for
          informational purposes only.</p>

        <h2 className="font-heading text-base font-semibold text-[var(--text)] pt-2">No professional advice</h2>
        <p>Our tools do not provide medical, legal, financial, or other professional advice.
          The Food Safety Scanner is not a substitute for FDA guidance or medical consultation.
          The Lease Scanner is not a substitute for legal counsel. The Resume Reviewer is not
          a substitute for professional career counseling. Always consult qualified professionals
          for decisions affecting your health, legal rights, or career.</p>

        <h2 className="font-heading text-base font-semibold text-[var(--text)] pt-2">Accuracy</h2>
        <p>While we strive for accuracy, AI-generated analysis may contain errors. We make no
          warranties regarding the completeness or accuracy of results. Users should independently
          verify any information provided by our tools.</p>

        <h2 className="font-heading text-base font-semibold text-[var(--text)] pt-2">Acceptable use</h2>
        <p>You may not use our tools for unlawful purposes, attempt to overload or disrupt our
          services, or use automated systems to access our tools at scale without permission.</p>

        <h2 className="font-heading text-base font-semibold text-[var(--text)] pt-2">Limitation of liability</h2>
        <p>ScanItFree is provided &ldquo;as is&rdquo; without warranty. We are not liable for any
          damages arising from your use of our tools or reliance on their results.</p>

        <h2 className="font-heading text-base font-semibold text-[var(--text)] pt-2">Changes</h2>
        <p>We may update these terms at any time. Continued use of the site constitutes acceptance
          of updated terms.</p>
      </div>
    </div>
  );
}
