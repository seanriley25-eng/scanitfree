import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — ScanItFree",
  description: "Terms of service for using ScanItFree.",
};

export default function TermsPage() {
  return (
    <div className="max-w-[640px] mx-auto px-6 py-16">
      <h1 className="font-display text-4xl text-[var(--text)] mb-2">Terms of Service</h1>
      <p className="text-muted text-xs font-mono mb-8">Last updated: May 7, 2026</p>

      <div className="text-muted text-sm leading-relaxed space-y-4">
        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of scanitfree.com (the &ldquo;Site&rdquo;) and its tools (the &ldquo;Services&rdquo;), operated by Riley Solutions (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). By accessing or using the Site, you agree to be bound by these Terms. If you do not agree, do not use the Site.
        </p>

        <h2 className="font-heading text-base font-semibold text-[var(--text)] pt-2">1. Eligibility</h2>
        <p>You must be at least 13 years old (or 16 in the EEA/UK) to use the Site. By using the Site, you represent that you meet this age requirement and have the legal capacity to enter into these Terms.</p>
        <p>If you are using the Site on behalf of an organization, you represent that you have authority to bind that organization to these Terms.</p>

        <h2 className="font-heading text-base font-semibold text-[var(--text)] pt-2">2. Description of Services</h2>
        <p>The Site provides free, AI-powered informational tools, including but not limited to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-[var(--text)]">Food Safety Scanner</strong> — analyzes ingredient lists and product information against FDA recall data and allergen databases</li>
          <li><strong className="text-[var(--text)]">Resume Reviewer</strong> — provides automated feedback on resume content</li>
          <li><strong className="text-[var(--text)]">Lease Red Flag Scanner</strong> — identifies clauses of potential concern in residential lease agreements</li>
        </ul>
        <p>Tools are provided through automated AI analysis combined with publicly available data sources. Results are generated in real-time and are for <strong className="text-[var(--text)]">informational purposes only</strong>.</p>

        <h2 className="font-heading text-base font-semibold text-[var(--text)] pt-2">3. No Professional Advice</h2>
        <p><strong className="text-[var(--text)]">The Services do not provide professional advice of any kind.</strong> Specifically:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>The Food Safety Scanner is <strong className="text-[var(--text)]">not</strong> medical advice, allergy diagnosis, or a substitute for FDA guidance, healthcare consultation, or professional food safety inspection.</li>
          <li>The Resume Reviewer is <strong className="text-[var(--text)]">not</strong> career counseling, recruiter feedback, or guaranteed employment guidance.</li>
          <li>The Lease Red Flag Scanner is <strong className="text-[var(--text)]">not</strong> legal advice, an attorney-client relationship, or a substitute for review by a licensed attorney in your jurisdiction.</li>
        </ul>
        <p>You should always consult qualified professionals (physicians, attorneys, career counselors, certified inspectors) for decisions that affect your health, legal rights, finances, or career. Do not delay seeking professional advice because of something you read or received from the Services.</p>

        <h2 className="font-heading text-base font-semibold text-[var(--text)] pt-2">4. AI-Generated Content and Accuracy</h2>
        <p>The Services rely on artificial intelligence models (including Anthropic&apos;s Claude API) to generate analysis. AI-generated output may contain errors, omissions, biases, or hallucinations. We make <strong className="text-[var(--text)]">no warranty</strong> that:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Analysis is accurate, complete, or current</li>
          <li>Recommendations are appropriate for your situation</li>
          <li>The Services will identify all relevant issues in your input</li>
          <li>Output is free from errors or fit for any particular purpose</li>
        </ul>
        <p>You are solely responsible for verifying any information provided by the Services before acting on it. <strong className="text-[var(--text)]">Do not rely on the Services as the sole basis for any decision affecting your health, safety, legal rights, or financial wellbeing.</strong></p>

        <h2 className="font-heading text-base font-semibold text-[var(--text)] pt-2">5. Acceptable Use</h2>
        <p>You agree to use the Services only for lawful purposes and in accordance with these Terms. You agree NOT to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Use the Services in any way that violates applicable laws or regulations</li>
          <li>Submit content that is illegal, harmful, threatening, defamatory, obscene, or infringes the rights of others</li>
          <li>Submit personal information of others without their consent</li>
          <li>Submit malicious code, malware, or content designed to harm our systems or other users</li>
          <li>Use automated systems (bots, scrapers, crawlers) to access the Services at scale without our prior written permission</li>
          <li>Attempt to overload, disrupt, reverse engineer, or compromise the Services or underlying infrastructure</li>
          <li>Bypass, disable, or interfere with security or access-control features</li>
          <li>Use the Services to compete with us or to develop a substantially similar service</li>
          <li>Misrepresent your identity or affiliation with any person or organization</li>
          <li>Use the Services to create, train, or improve any AI model without our written permission</li>
        </ul>
        <p>We reserve the right to limit, suspend, or terminate access to the Services for any user who violates these Terms or whose use we determine, in our sole discretion, may harm the Services or other users.</p>

        <h2 className="font-heading text-base font-semibold text-[var(--text)] pt-2">6. Intellectual Property</h2>

        <h3 className="font-heading text-sm font-semibold text-[var(--text)]">6.1 Our Content</h3>
        <p>The Site, including its design, code, text, graphics, logos, and other content (excluding User Inputs and AI-generated output based on User Inputs), is owned by Riley Solutions or its licensors and is protected by copyright, trademark, and other intellectual property laws.</p>
        <p>You are granted a limited, non-exclusive, non-transferable, revocable license to access and use the Site for personal, non-commercial use in accordance with these Terms.</p>

        <h3 className="font-heading text-sm font-semibold text-[var(--text)]">6.2 Your Inputs</h3>
        <p>You retain all rights to content you submit to the Services (&ldquo;User Inputs&rdquo;). By submitting User Inputs, you grant us a limited, non-exclusive license to process those inputs solely to provide the Services to you. We do not store User Inputs after processing and do not use them to train AI models.</p>

        <h3 className="font-heading text-sm font-semibold text-[var(--text)]">6.3 Output</h3>
        <p>Subject to these Terms, we grant you ownership of analysis results generated specifically in response to your User Inputs (&ldquo;Output&rdquo;). You are responsible for verifying Output before use. AI-generated Output may not be eligible for copyright protection in some jurisdictions.</p>

        <h3 className="font-heading text-sm font-semibold text-[var(--text)]">6.4 Feedback</h3>
        <p>If you provide feedback, suggestions, or ideas about the Services, you grant us an unlimited, perpetual, royalty-free license to use that feedback for any purpose without compensation.</p>

        <h2 className="font-heading text-base font-semibold text-[var(--text)] pt-2">7. Third-Party Services and Advertising</h2>
        <p>The Site uses third-party services (including Anthropic, Google AdSense, Google Analytics, Vercel, and others). Your use of those services is subject to their respective terms and privacy policies.</p>
        <p>The Site is supported by advertising. We are not responsible for the content of third-party advertisements displayed on the Site. Advertisements should not be construed as endorsements by us. Your interactions with advertisers are solely between you and the advertiser.</p>

        <h2 className="font-heading text-base font-semibold text-[var(--text)] pt-2">8. Disclaimer of Warranties</h2>
        <p className="uppercase">
          The Services are provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis, without warranties of any kind, either express or implied. To the fullest extent permitted by law, we disclaim all warranties, including but not limited to: warranties of merchantability, fitness for a particular purpose, non-infringement, accuracy, completeness, or reliability of content, uninterrupted or error-free operation, and security or freedom from harmful components.
        </p>
        <p className="uppercase">
          We do not warrant that the Services will meet your requirements, be available at any particular time, or produce results that are accurate or appropriate for your situation.
        </p>

        <h2 className="font-heading text-base font-semibold text-[var(--text)] pt-2">9. Limitation of Liability</h2>
        <p className="uppercase">
          To the fullest extent permitted by law, Riley Solutions, its owners, employees, agents, and affiliates shall not be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages, including but not limited to loss of profits, revenue, data, goodwill, or other intangible losses, arising from: your use of or inability to use the Services, any reliance on output generated by the Services, any unauthorized access to or alteration of your inputs, any third-party conduct or content on the Services, or any other matter relating to the Services.
        </p>
        <p className="uppercase">
          Our total cumulative liability to you for any claim arising out of or relating to these Terms or the Services shall not exceed one hundred U.S. dollars ($100).
        </p>
        <p>Some jurisdictions do not allow the exclusion or limitation of certain damages, so some of these limitations may not apply to you. In such jurisdictions, our liability is limited to the maximum extent permitted by law.</p>

        <h2 className="font-heading text-base font-semibold text-[var(--text)] pt-2">10. Indemnification</h2>
        <p>You agree to indemnify, defend, and hold harmless Riley Solutions, its owners, employees, agents, and affiliates from any claim, demand, loss, liability, damage, or expense (including reasonable attorneys&apos; fees) arising out of or related to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Your use of the Services</li>
          <li>Your violation of these Terms</li>
          <li>Your violation of any law or third-party rights</li>
          <li>Any content you submit to the Services</li>
          <li>Any decision or action you take based on Output from the Services</li>
        </ul>

        <h2 className="font-heading text-base font-semibold text-[var(--text)] pt-2">11. Termination</h2>
        <p>We may suspend or terminate your access to the Services at any time, for any reason, without notice. Upon termination, your right to use the Services ceases immediately. Sections that by their nature should survive termination (including disclaimers, limitations of liability, indemnification, and dispute resolution) will survive.</p>

        <h2 className="font-heading text-base font-semibold text-[var(--text)] pt-2">12. Governing Law and Dispute Resolution</h2>
        <p>These Terms are governed by the laws of the State of Washington, USA, without regard to conflict of law principles. Any dispute arising out of or relating to these Terms or the Services shall be resolved exclusively in the state or federal courts located in King County, Washington, and you consent to the personal jurisdiction of those courts.</p>
        <p>If you reside in a jurisdiction where this provision is unenforceable, the dispute resolution provisions will apply to the maximum extent permitted by your local law.</p>

        <h2 className="font-heading text-base font-semibold text-[var(--text)] pt-2">13. Changes to These Terms</h2>
        <p>We may update these Terms from time to time. The &ldquo;Last updated&rdquo; date at the top reflects the most recent revision. Material changes will be communicated through a notice on the Site. Your continued use of the Services after changes are posted constitutes acceptance of the updated Terms.</p>
        <p>If you do not agree to the updated Terms, you must stop using the Services.</p>

        <h2 className="font-heading text-base font-semibold text-[var(--text)] pt-2">14. Severability</h2>
        <p>If any provision of these Terms is held to be invalid or unenforceable, that provision will be enforced to the maximum extent permissible, and the remaining provisions will remain in full force and effect.</p>

        <h2 className="font-heading text-base font-semibold text-[var(--text)] pt-2">15. Entire Agreement</h2>
        <p>These Terms, together with the Privacy Policy, constitute the entire agreement between you and Riley Solutions regarding the Services and supersede all prior or contemporaneous agreements, understandings, or representations.</p>

        <h2 className="font-heading text-base font-semibold text-[var(--text)] pt-2">16. Contact</h2>
        <p>For questions about these Terms:</p>
        <p>
          <strong className="text-[var(--text)]">Email:</strong>{" "}
          <a href="mailto:legal@scanitfree.com" className="text-accent">legal@scanitfree.com</a>
          <br />
          <strong className="text-[var(--text)]">Operator:</strong> Riley Solutions
          <br />
          <strong className="text-[var(--text)]">Site:</strong> https://scanitfree.com
        </p>
      </div>
    </div>
  );
}
