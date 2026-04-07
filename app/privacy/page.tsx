import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — ScanItFree",
  description: "How ScanItFree handles your data and protects your privacy.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-[640px] mx-auto px-6 py-16">
      <h1 className="font-display text-4xl text-[var(--text)] mb-2">Privacy Policy</h1>
      <p className="text-muted text-xs font-mono mb-8">Last updated: April 2026</p>

      <div className="text-muted text-sm leading-relaxed space-y-4">
        <p>
          ScanItFree (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) respects your privacy. This policy explains
          what information we collect and how we use it.
        </p>

        <h2 className="font-heading text-base font-semibold text-[var(--text)] pt-2">Information we collect</h2>
        <p>
          <strong className="text-[var(--text)]">Tool inputs:</strong> Text you submit to our tools (ingredient lists,
          resume text, lease text, etc.) is sent to our AI processing service, analyzed in real-time, and
          immediately discarded. We do not store, log, or retain your tool input data.
        </p>
        <p>
          <strong className="text-[var(--text)]">Analytics:</strong> We use standard web analytics to understand how
          visitors use our site (pages visited, time on site, device type). This data is aggregated and
          does not identify individual users.
        </p>
        <p>
          <strong className="text-[var(--text)]">Advertising:</strong> We use third-party advertising services
          (including Google AdSense) that may use cookies and similar technologies to serve relevant ads.
          These services may collect information about your visits to this and other websites. You can
          opt out of personalized advertising by visiting Google&apos;s Ad Settings.
        </p>

        <h2 className="font-heading text-base font-semibold text-[var(--text)] pt-2">How we use information</h2>
        <p>We use collected information solely to operate and improve our tools, display relevant advertising,
          and understand aggregate usage patterns. We never sell personal data to third parties.</p>

        <h2 className="font-heading text-base font-semibold text-[var(--text)] pt-2">Cookies</h2>
        <p>We use essential cookies for site functionality and advertising cookies through our ad partners.
          You can control cookie settings through your browser preferences.</p>

        <h2 className="font-heading text-base font-semibold text-[var(--text)] pt-2">Data security</h2>
        <p>All data transmission is encrypted via HTTPS. Since we do not store user-submitted content,
          there is no database of personal content that could be breached.</p>

        <h2 className="font-heading text-base font-semibold text-[var(--text)] pt-2">Contact</h2>
        <p>For privacy questions, contact us at{" "}
          <a href="mailto:privacy@scanitfree.com" className="text-accent">privacy@scanitfree.com</a>.
        </p>
      </div>
    </div>
  );
}
