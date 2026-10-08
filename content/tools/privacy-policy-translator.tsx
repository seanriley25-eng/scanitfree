import type { FaqItem } from "@/components/ToolContent";

export const faq: FaqItem[] = [
  {
    q: "Does the Privacy Policy Translator give legal advice?",
    a: "No. It summarizes what a policy says and points to the laws that usually apply, such as GDPR, CCPA, and COPPA. Treat each citation as a pointer to read in full. If you have a specific dispute or a legal deadline, talk to a privacy attorney or your regulator.",
  },
  {
    q: "What can I paste or upload?",
    a: "You can paste policy text, or upload a PDF or DOCX file up to 10 MB. Pasted text is read up to 50,000 characters, and the counter under the box warns you if you go over. Anything past the limit is ignored, so a very long policy may be only partly analyzed.",
  },
  {
    q: "Is the privacy policy I paste stored anywhere?",
    a: "No. The text is sent to the analysis model, the result comes back to your browser, and the tool does not save your input. Close the tab and the result is gone, so copy anything you want to keep before you leave.",
  },
  {
    q: "What does the score mean, and is a low score always bad?",
    a: "The score runs from 0 to 100, and a higher number means the policy is friendlier to your privacy. A low score means the document gives the company broad freedom to collect and sell your data. It does not prove the company misuses it, but it tells you how much you are trusting them.",
  },
  {
    q: "What does it mean when the governing law says “Not specified”?",
    a: "Some policies never name a privacy law, even though GDPR or CCPA may still apply to you because of where you live. The tool reports only what the policy text says and will not guess. If you live in the EU, California, Canada, or Brazil, look up your own rights separately.",
  },
  {
    q: "Can I use it to compare two apps before choosing one?",
    a: "Yes. Run each policy separately and compare the grades, the data collected, and the red flags side by side. Pay the most attention to who gets your data, how long it is kept, and whether you can delete it.",
  },
];

export default function Content() {
  return (
    <>
      <h2>What this tool checks</h2>
      <p>
        A privacy policy is the document that says what a company does with the
        information it collects about you. Most run five to fifteen pages of legal
        language, and almost nobody reads them before tapping &ldquo;I agree.&rdquo; The
        Privacy Policy Translator turns that text into a plain-English summary of what the
        company actually does with your data: what it collects, who receives it, how long
        it keeps it, and what you can do about it.
      </p>
      <p>
        It is built for people about to sign up for an app or service, parents deciding
        whether a game or school tool is safe for a child, and anyone choosing between two
        similar services who wants a quick way to see which one asks for less.
      </p>

      <h2>How it works</h2>
      <p>
        You paste the policy text or upload it as a PDF, then submit. The tool sends the
        text to Anthropic&apos;s Claude model together with a written rubric that a person
        maintains. The model reads the policy against that rubric and returns a structured
        result. It is instructed not to invent company names, practices, or clauses that
        are not in the document.
      </p>
      <p>
        For every policy the rubric asks the model to pull out the same things:
      </p>
      <ul>
        <li>
          <strong>Data collected</strong>, grouped by category, such as personal
          information, location, browsing history, or financial data, with a concern level
          for each group.
        </li>
        <li>
          <strong>Who it is shared with and why</strong>, such as advertising partners,
          analytics providers, data brokers, or government agencies.
        </li>
        <li>
          <strong>Retention</strong>, meaning how long your data is kept and under what
          conditions.
        </li>
        <li>
          <strong>Your rights</strong> to delete your data, export it, and opt out of its
          sale or of targeted ads, plus how to exercise them.
        </li>
        <li>
          <strong>Governing law</strong>: GDPR, CCPA, PIPEDA, LGPD, or &ldquo;Not
          specified&rdquo; if the policy names none.
        </li>
      </ul>
      <p>
        The rubric also lists red flags to look for: unnamed &ldquo;affiliates&rdquo; or
        &ldquo;partners&rdquo;; retention for &ldquo;as long as necessary&rdquo;; using your
        data to train AI models without an opt-in; selling personal information without a
        CCPA opt-out; mandatory arbitration or class-action waivers; a broad license over
        content you upload; the right to change the policy without notifying you; and
        collecting data from children under 13 without COPPA safeguards.
      </p>
      <p>
        Each red flag quotes or closely paraphrases the policy, names the section or
        paragraph it came from, and cites the law that applies when one does: GDPR
        Articles 7 (consent), 17 (erasure), and 20 (portability); CCPA sections 1798.105
        (delete), 1798.110 (right to know), and 1798.120 (opt out of sale); and COPPA at 16
        CFR Part 312. Every plain-English field is written at an 8th-grade reading level.
      </p>

      <h2>How to read your results</h2>
      <p>
        The <strong>score</strong> runs from 0 to 100, and higher means the policy is more
        privacy-friendly. It maps to a letter grade. An A (90 to 100) means strong user
        rights, minimal collection, and no selling. A B (70 to 89) means reasonable
        practices with minor concerns. A C (50 to 69) means moderate concerns and some
        monetization of your data. A D (30 to 49) means significant issues and data that is
        heavily monetized. An F (0 to 29) means serious problems: the company sells data,
        gives you no rights, or keeps data indefinitely.
      </p>
      <p>
        Under the score you get a short plain-English <strong>summary</strong> and five
        tabs. <strong>Red Flags</strong> lists each problem clause with a severity: danger
        for the most serious, warning for practices worth weighing, and info for things to
        be aware of. <strong>Data Collected</strong> is a table of categories, the specific
        items in each, and a low, medium, or high concern label. <strong>Data
        Shared</strong> lists each recipient, the stated purpose, and a concern level.
      </p>
      <p>
        <strong>Your Rights</strong> shows a yes or no for the right to delete, the right
        to export, and the right to opt out, followed by instructions for using them, or
        &ldquo;Not described in this policy&rdquo; when the text says nothing. The last tab,
        <strong> Retention &amp; Jurisdiction</strong>, states how long data is kept (and
        says so plainly when the answer is vague) and which privacy law the policy invokes.
      </p>

      <h2>A sample result</h2>
      <p>
        Someone pastes the privacy policy of a free fitness-tracking app. The tool returns
        a score of 38, grade D, with these findings:
      </p>
      <ul>
        <li>
          <strong>Data collected:</strong> precise location from GPS routes (high
          concern), heart rate and sleep data (high concern), and name, email, and device
          ID (medium concern).
        </li>
        <li>
          <strong>Data shared:</strong> &ldquo;advertising partners&rdquo; and
          &ldquo;affiliates,&rdquo; neither named, to personalize ads and for &ldquo;business
          purposes.&rdquo; Flagged as a warning.
        </li>
        <li>
          <strong>Retention:</strong> your data is kept &ldquo;as long as necessary,&rdquo;
          with no period given. The tool says the answer is vague and flags it as a
          warning.
        </li>
        <li>
          <strong>Red flag, danger:</strong> the policy describes sharing data for
          advertising but has no &ldquo;Do Not Sell or Share&rdquo; link, which CCPA
          section 1798.120 expects.
        </li>
        <li>
          <strong>Red flag, warning:</strong> a mandatory arbitration clause with a
          class-action waiver in the Terms section.
        </li>
        <li>
          <strong>Your rights:</strong> delete, yes, by emailing support; export, no;
          opt-out, no.
        </li>
      </ul>
      <p>
        Summary: a free app that pays for itself by sharing your health and location
        data with unnamed advertisers, with no stated way to leave.
      </p>

      <h2>Limitations</h2>
      <p>
        The tool reads the policy text, not the company&apos;s actual behavior. A strong
        policy does not guarantee good practice, because a company can say one thing and
        do another. A vague policy may also describe a harmless practice in careless
        language, so a bad grade is a reason to look closer, not proof of misuse.
      </p>
      <p>
        A privacy policy is only one document. Terms of service, cookie policies, and
        in-app consent screens are separate and are not analyzed unless you paste them.
        Policies also change, so check the &ldquo;last updated&rdquo; date and run the tool
        again after a revision. Text beyond the 50,000-character limit is not read, so a
        very long policy may be truncated.
      </p>
      <p>
        Legal citations are pointers to read in full, not legal advice. Which laws
        actually protect you depends on where you live, and the tool cannot confirm that.
        If you need to enforce a right or file a complaint, contact the company&apos;s
        privacy address, your data protection authority, or a privacy attorney.
      </p>
    </>
  );
}
