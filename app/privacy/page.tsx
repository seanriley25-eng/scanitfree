import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — ScanItFree",
  description: "How ScanItFree handles your data and protects your privacy.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-[640px] mx-auto px-6 py-16">
      <h1 className="font-display text-4xl text-[var(--text)] mb-2">Privacy Policy</h1>
      <p className="text-muted text-xs font-mono mb-8">Last updated: May 7, 2026</p>

      <div className="text-muted text-sm leading-relaxed space-y-4">
        <p>
          ScanItFree (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;), operated by Riley Solutions, respects your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit scanitfree.com (the &ldquo;Site&rdquo;) and use our AI-powered tools (the &ldquo;Services&rdquo;). Please read this policy carefully. If you do not agree with the terms of this policy, please do not access the Site.
        </p>

        <h2 className="font-heading text-base font-semibold text-[var(--text)] pt-2">1. Information We Collect</h2>

        <h3 className="font-heading text-sm font-semibold text-[var(--text)]">1.1 Information You Provide to Tools</h3>
        <p>
          Our tools accept text and file inputs (ingredient lists, resume content, lease text, and similar) that you voluntarily submit. This input is transmitted to our AI processing service (Anthropic&apos;s Claude API) for real-time analysis. <strong className="text-[var(--text)]">We do not store, log, or retain the content you submit to our tools.</strong> Inputs are processed in memory and discarded once the analysis is returned to you.
        </p>

        <h3 className="font-heading text-sm font-semibold text-[var(--text)]">1.2 Automatically Collected Information</h3>
        <p>When you visit the Site, we automatically collect certain information about your device and usage, including:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>IP address (anonymized for analytics)</li>
          <li>Browser type and version</li>
          <li>Operating system</li>
          <li>Referring URLs</li>
          <li>Pages viewed and time spent on pages</li>
          <li>Device type (mobile, desktop, tablet)</li>
          <li>Approximate geographic location (country/region level)</li>
        </ul>
        <p>This information is collected through standard web analytics (Google Analytics) and our hosting provider&apos;s logs.</p>

        <h3 className="font-heading text-sm font-semibold text-[var(--text)]">1.3 Cookies and Similar Technologies</h3>
        <p>We and our third-party partners use cookies, pixel tags, and similar tracking technologies to operate the Site, analyze usage, and serve advertising. See Section 4 (Cookies and Tracking) below for details.</p>

        <h2 className="font-heading text-base font-semibold text-[var(--text)] pt-2">2. How We Use Information</h2>
        <p>We use the information we collect to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Operate, maintain, and improve the Site and Services</li>
          <li>Process tool inputs and return analysis results</li>
          <li>Understand aggregate usage patterns and improve user experience</li>
          <li>Detect, prevent, and address technical issues, fraud, or abuse</li>
          <li>Display relevant advertising through our advertising partners</li>
          <li>Comply with legal obligations</li>
        </ul>
        <p>We do <strong className="text-[var(--text)]">not</strong> sell personal information to third parties. We do <strong className="text-[var(--text)]">not</strong> use tool inputs (your resumes, leases, ingredient lists, etc.) to train AI models.</p>

        <h2 className="font-heading text-base font-semibold text-[var(--text)] pt-2">3. How We Share Information</h2>
        <p>We share information only as described below:</p>

        <h3 className="font-heading text-sm font-semibold text-[var(--text)]">3.1 Service Providers</h3>
        <p>We share information with third-party service providers that perform services on our behalf, including:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-[var(--text)]">Anthropic, Inc.</strong> — processes tool inputs through the Claude API to generate analysis. Anthropic&apos;s data handling is governed by their own privacy policy.</li>
          <li><strong className="text-[var(--text)]">Vercel, Inc.</strong> — hosts the Site and processes server logs.</li>
          <li><strong className="text-[var(--text)]">Google LLC</strong> — provides analytics (Google Analytics) and advertising services (Google AdSense).</li>
        </ul>

        <h3 className="font-heading text-sm font-semibold text-[var(--text)]">3.2 Advertising Partners</h3>
        <p>We use third-party advertising services that may collect information about your visits to this and other websites to serve relevant ads. See Section 5 (Advertising) for full details.</p>

        <h3 className="font-heading text-sm font-semibold text-[var(--text)]">3.3 Legal Requirements</h3>
        <p>We may disclose information when required by law, subpoena, court order, or to protect our rights, property, or safety, or that of others.</p>

        <h3 className="font-heading text-sm font-semibold text-[var(--text)]">3.4 Business Transfers</h3>
        <p>If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will notify you before your information becomes subject to a different privacy policy.</p>

        <h2 className="font-heading text-base font-semibold text-[var(--text)] pt-2">4. Cookies and Tracking</h2>

        <h3 className="font-heading text-sm font-semibold text-[var(--text)]">4.1 What We Use</h3>
        <p>We use the following types of cookies:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-[var(--text)]">Essential cookies:</strong> Required for the Site to function (e.g., remembering your cookie preferences).</li>
          <li><strong className="text-[var(--text)]">Analytics cookies:</strong> Help us understand how visitors use the Site (Google Analytics).</li>
          <li><strong className="text-[var(--text)]">Advertising cookies:</strong> Used by our advertising partners to serve relevant ads.</li>
        </ul>

        <h3 className="font-heading text-sm font-semibold text-[var(--text)]">4.2 Your Choices</h3>
        <p>When you first visit the Site, you will see a cookie consent banner allowing you to accept or reject non-essential cookies. You can change your preferences at any time by clicking the &ldquo;Cookie Preferences&rdquo; link in our footer.</p>
        <p>You can also control cookies through your browser settings. Disabling cookies may affect Site functionality.</p>

        <h3 className="font-heading text-sm font-semibold text-[var(--text)]">4.3 Do Not Track</h3>
        <p>We do not currently respond to Do Not Track (&ldquo;DNT&rdquo;) browser signals because there is no industry standard for how to interpret them. We honor user preferences expressed through our cookie consent banner.</p>

        <h2 className="font-heading text-base font-semibold text-[var(--text)] pt-2">5. Advertising</h2>

        <h3 className="font-heading text-sm font-semibold text-[var(--text)]">5.1 Third-Party Advertising</h3>
        <p>The Site is supported by advertising. We use the following advertising services:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-[var(--text)]">Google AdSense</strong> — Google uses cookies (including the DART cookie) to serve ads based on your visits to this Site and other sites on the internet. Learn more about how Google uses information from sites that use its services at: https://policies.google.com/technologies/partner-sites</li>
          <li><strong className="text-[var(--text)]">Other ad networks</strong> — We may also work with additional advertising partners (such as Media.net, Amazon Associates, and others) that use similar technologies.</li>
        </ul>

        <h3 className="font-heading text-sm font-semibold text-[var(--text)]">5.2 Personalized Advertising Opt-Out</h3>
        <p>You can opt out of personalized advertising in several ways:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-[var(--text)]">Google ads:</strong> Visit https://www.google.com/settings/ads to manage Google&apos;s use of cookies for ads.</li>
          <li><strong className="text-[var(--text)]">Network Advertising Initiative:</strong> Opt out of multiple ad networks at https://optout.networkadvertising.org</li>
          <li><strong className="text-[var(--text)]">Digital Advertising Alliance:</strong> Opt out at https://optout.aboutads.info</li>
          <li><strong className="text-[var(--text)]">EU users:</strong> https://www.youronlinechoices.eu</li>
        </ul>

        <h3 className="font-heading text-sm font-semibold text-[var(--text)]">5.3 Google Consent Mode</h3>
        <p>For visitors in the European Economic Area (EEA), United Kingdom, and Switzerland, we implement Google Consent Mode v2. Personalized advertising and analytics are disabled by default until you grant consent through our cookie banner.</p>

        <h2 className="font-heading text-base font-semibold text-[var(--text)] pt-2">6. Your Privacy Rights</h2>

        <h3 className="font-heading text-sm font-semibold text-[var(--text)]">6.1 European Economic Area, United Kingdom, and Switzerland (GDPR)</h3>
        <p>If you are located in the EEA, UK, or Switzerland, you have the following rights under the General Data Protection Regulation (GDPR) and equivalent laws:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-[var(--text)]">Right of access</strong> — request a copy of personal information we hold about you</li>
          <li><strong className="text-[var(--text)]">Right to rectification</strong> — request correction of inaccurate information</li>
          <li><strong className="text-[var(--text)]">Right to erasure</strong> — request deletion of your personal information (&ldquo;right to be forgotten&rdquo;)</li>
          <li><strong className="text-[var(--text)]">Right to restrict processing</strong> — request limits on how we process your information</li>
          <li><strong className="text-[var(--text)]">Right to data portability</strong> — request your information in a portable format</li>
          <li><strong className="text-[var(--text)]">Right to object</strong> — object to processing based on legitimate interests</li>
          <li><strong className="text-[var(--text)]">Right to withdraw consent</strong> — withdraw consent at any time where processing is based on consent</li>
          <li><strong className="text-[var(--text)]">Right to lodge a complaint</strong> — file a complaint with your local data protection authority</li>
        </ul>
        <p>Our legal bases for processing are: (a) consent for advertising and analytics cookies, (b) legitimate interests for site operation and security, and (c) compliance with legal obligations.</p>
        <p>To exercise any of these rights, contact us at <a href="mailto:privacy@scanitfree.com" className="text-accent">privacy@scanitfree.com</a>.</p>

        <h3 className="font-heading text-sm font-semibold text-[var(--text)]">6.2 California Residents (CCPA/CPRA)</h3>
        <p>If you are a California resident, you have the following rights under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA):</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-[var(--text)]">Right to know</strong> what personal information we collect, use, and disclose</li>
          <li><strong className="text-[var(--text)]">Right to delete</strong> personal information we have collected from you</li>
          <li><strong className="text-[var(--text)]">Right to correct</strong> inaccurate personal information</li>
          <li><strong className="text-[var(--text)]">Right to opt-out</strong> of the &ldquo;sale&rdquo; or &ldquo;sharing&rdquo; of personal information</li>
          <li><strong className="text-[var(--text)]">Right to non-discrimination</strong> for exercising your rights</li>
          <li><strong className="text-[var(--text)]">Right to limit</strong> the use of sensitive personal information</li>
        </ul>
        <p>We do not sell personal information for monetary consideration. However, our use of advertising cookies may constitute &ldquo;sharing&rdquo; under the CPRA. You can opt out by rejecting advertising cookies in our cookie banner or by visiting our Do Not Sell or Share My Personal Information page (link in footer).</p>
        <p>To exercise any of these rights, contact us at <a href="mailto:privacy@scanitfree.com" className="text-accent">privacy@scanitfree.com</a>.</p>

        <h3 className="font-heading text-sm font-semibold text-[var(--text)]">6.3 Other US States</h3>
        <p>Residents of states with comprehensive privacy laws (including but not limited to Virginia, Colorado, Connecticut, Utah, Texas, Oregon, and Washington) have similar rights. Contact us at <a href="mailto:privacy@scanitfree.com" className="text-accent">privacy@scanitfree.com</a> to exercise them.</p>

        <h2 className="font-heading text-base font-semibold text-[var(--text)] pt-2">7. Data Retention</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-[var(--text)]">Tool inputs:</strong> Not retained. Discarded immediately after processing.</li>
          <li><strong className="text-[var(--text)]">Analytics data:</strong> Retained for up to 14 months in aggregate form.</li>
          <li><strong className="text-[var(--text)]">Server logs:</strong> Retained for up to 90 days for security and debugging.</li>
          <li><strong className="text-[var(--text)]">Cookie preferences:</strong> Retained for up to 12 months or until you change them.</li>
        </ul>

        <h2 className="font-heading text-base font-semibold text-[var(--text)] pt-2">8. Data Security</h2>
        <p>We use industry-standard security measures including HTTPS encryption for all data transmission and secure cloud infrastructure. Because we do not store user-submitted tool content, there is no database of tool inputs that could be breached.</p>
        <p>No method of transmission over the internet is 100% secure. We cannot guarantee absolute security but make commercially reasonable efforts to protect your information.</p>

        <h2 className="font-heading text-base font-semibold text-[var(--text)] pt-2">9. Children&apos;s Privacy</h2>
        <p>The Site is not directed to children under 13 (or under 16 in the EEA/UK). We do not knowingly collect personal information from children. If we learn that we have collected personal information from a child without verifiable parental consent, we will delete it promptly. If you believe a child has provided us with personal information, contact us at <a href="mailto:privacy@scanitfree.com" className="text-accent">privacy@scanitfree.com</a>.</p>

        <h2 className="font-heading text-base font-semibold text-[var(--text)] pt-2">10. International Data Transfers</h2>
        <p>The Site is operated from the United States. If you are accessing the Site from outside the United States, your information may be transferred to, stored, and processed in the United States or other countries where our service providers operate. For transfers from the EEA, UK, or Switzerland, we rely on appropriate safeguards including Standard Contractual Clauses where required.</p>

        <h2 className="font-heading text-base font-semibold text-[var(--text)] pt-2">11. Third-Party Links</h2>
        <p>The Site may contain links to third-party websites. We are not responsible for the privacy practices of those sites. We encourage you to review their privacy policies before providing any information.</p>

        <h2 className="font-heading text-base font-semibold text-[var(--text)] pt-2">12. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. The &ldquo;Last updated&rdquo; date at the top reflects the most recent revision. Material changes will be communicated through a notice on the Site. Continued use of the Site after changes are posted constitutes acceptance of the updated policy.</p>

        <h2 className="font-heading text-base font-semibold text-[var(--text)] pt-2">13. Contact Us</h2>
        <p>For questions about this Privacy Policy or to exercise your privacy rights:</p>
        <p>
          <strong className="text-[var(--text)]">Email:</strong>{" "}
          <a href="mailto:privacy@scanitfree.com" className="text-accent">privacy@scanitfree.com</a>
          <br />
          <strong className="text-[var(--text)]">Operator:</strong> Riley Solutions
          <br />
          <strong className="text-[var(--text)]">Site:</strong> https://scanitfree.com
        </p>
        <p>For privacy-related inquiries from EU/UK residents, please put &ldquo;GDPR Request&rdquo; in the subject line. For California residents, please put &ldquo;CCPA Request&rdquo; in the subject line.</p>
      </div>
    </div>
  );
}
