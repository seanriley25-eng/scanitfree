import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — ScanItFree",
  description: "Learn about ScanItFree, our mission, and how our free AI-powered utilities work.",
};

export default function AboutPage() {
  return (
    <div className="max-w-[640px] mx-auto px-6 py-16">
      <h1 className="font-display text-4xl text-[var(--text)] mb-6">About ScanItFree</h1>

      <div className="text-muted text-sm leading-relaxed space-y-4">
        <p>
          ScanItFree is a suite of free, AI-powered scanning and analysis tools built to
          help people make better everyday decisions. From checking whether a food product
          has been recalled to analyzing a lease agreement, cosmetic ingredients, a resume,
          cover letter, or privacy policy, each tool delivers real, actionable results in
          seconds with no signup required.
        </p>
        <p>
          Every tool combines advanced AI analysis (powered by Anthropic&apos;s Claude API)
          with real public data sources. Our Food Safety Scanner cross-references the FDA
          enforcement action database. Our Lease Scanner checks rental agreements against
          common tenant protection standards. Our Resume Reviewer evaluates against current
          ATS standards and hiring best practices.
        </p>
        <p>
          We believe AI-powered document and label analysis should be accessible to
          everyone, not locked behind paywalls or subscriptions. That&apos;s why every tool
          on ScanItFree is completely free to use. The site is supported by advertising,
          which allows us to keep building and improving these tools.
        </p>
        <p>
          ScanItFree is operated by <strong className="text-[var(--text)]">Farallone Media LLC</strong>.
          All tools are for informational purposes only and do not constitute legal, medical,
          or professional advice of any kind. Always consult a qualified professional for
          decisions that affect your health, legal rights, or financial wellbeing.
        </p>

        <h2 className="font-heading text-lg font-semibold text-[var(--text)] pt-4">Our principles</h2>
        <p>
          <strong className="text-[var(--text)]">Privacy first:</strong> We don&apos;t store your data. Your
          resume text, lease content, and ingredient lists are processed in real-time and
          immediately discarded. We don&apos;t build user profiles or sell data.
        </p>
        <p>
          <strong className="text-[var(--text)]">Real data, not guesses:</strong> Wherever possible, our tools
          reference verified public databases and published research rather than relying
          solely on AI-generated content.
        </p>
        <p>
          <strong className="text-[var(--text)]">Transparency:</strong> Every tool clearly states its
          limitations and includes appropriate disclaimers. Our tools provide informational
          guidance, not professional advice.
        </p>

        <h2 className="font-heading text-lg font-semibold text-[var(--text)] pt-4">Contact</h2>
        <p>
          Questions, feedback, or partnership inquiries? Email us at{" "}
          <a href="mailto:hello@scanitfree.com" className="text-accent">
            hello@scanitfree.com
          </a>
        </p>
      </div>
    </div>
  );
}
