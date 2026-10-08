import type { FaqItem } from "@/components/ToolContent";

export const faq: FaqItem[] = [
  {
    q: "Is the Resume Reviewer really free?",
    a: "Yes. There is no signup and no payment. The only limit is 15 scans per day from one network address, counted across all ScanItFree tools, which keeps the service free for everyone.",
  },
  {
    q: "Do I need to paste a job description?",
    a: "No, but it makes the feedback much more specific. Without one, the tool guesses the role you are targeting from your resume and lists keywords commonly expected for it. With one, it compares your resume to that exact posting and shows which terms are missing and which already match.",
  },
  {
    q: "What file types can I upload?",
    a: "PDF and DOCX files up to 10 MB, or pasted text up to 24,000 characters. A PDF needs a real text layer. If your PDF is a scan or a picture of a page, the text cannot be read reliably, so paste the text or export a fresh PDF from your word processor.",
  },
  {
    q: "Will the tool rewrite my resume for me?",
    a: "No. The free reviewer diagnoses problems and points at specific bullets, but it does not write replacement text. If you want an automated rewrite, Resume Reviewer Pro has an AI rewrite loop. Otherwise you fix the issues yourself, which also keeps every claim in your own words.",
  },
  {
    q: "Does a high score mean I will pass an ATS?",
    a: "No. The score tells you how clean and keyword-ready the document looks to a reviewer following a checklist. Each employer's applicant tracking system parses files differently, so nobody can guarantee a pass. A high score removes common causes of parsing and readability problems.",
  },
  {
    q: "Is my resume stored?",
    a: "No. Your text or file is sent to the analysis model, the result is returned to your browser, and nothing is saved to a database. Close the tab and it is gone. Avoid pasting anything you would not want sent to a third-party AI service, such as a government ID number.",
  },
];

export default function Content() {
  return (
    <>
      <h2>What this tool checks</h2>
      <p>
        Most resumes are read twice before a person decides anything: once by software
        that extracts the text into a database, and once by a recruiter or hiring manager
        who spends a short time skimming it. The Resume Reviewer gives you a free review
        of both views. It looks at whether the document is easy to parse and easy to read,
        whether your achievements are backed by numbers, and whether the language matches
        the kind of job you are applying for.
      </p>
      <p>
        It is for job seekers who want a second opinion before sending an application:
        recent graduates writing a first resume, people changing careers, and experienced
        candidates who have not updated their document in years. You do not need an
        account, and you do not need a job posting to get a useful result.
      </p>
      <p>
        The free reviewer differs from <a href="/tools/resume-reviewer-pro">Resume Reviewer Pro</a>{" "}
        in what it hands back. This tool gives you a review: scores, feedback, and a list
        of issues, with no rewriting. Pro adds a deterministic scorer, so the same resume
        always receives the same score, plus an AI rewrite loop that produces revised text.
        If you want a diagnosis and prefer to write your own fixes, start here.
      </p>

      <h2>How it works</h2>
      <p>
        You paste your resume text, up to 24,000 characters, or upload a PDF or DOCX file.
        You can also paste a job description of up to 8,000 characters. The text is sent
        to Anthropic&apos;s Claude model together with a rubric that a person maintains.
        The model reads your document against that rubric and returns structured scores
        and comments. It does not make up experience, employers, or credentials; it can
        only comment on what is in the document you gave it.
      </p>
      <p>The rubric covers these areas:</p>
      <ul>
        <li><strong>Formatting and readability:</strong> layout that a parser and a person can both follow.</li>
        <li><strong>Quantified achievements:</strong> whether bullets state results with numbers rather than just duties.</li>
        <li><strong>ATS keyword optimization:</strong> whether the terms employers search for appear in your text.</li>
        <li><strong>Section completeness:</strong> whether the usual sections are present and clearly labeled.</li>
        <li><strong>Grammar and consistency:</strong> typos, tense changes, and uneven formatting.</li>
        <li><strong>Overall positioning:</strong> whether the resume tells a coherent story for one kind of role.</li>
      </ul>
      <p>
        When you add a job description, the tool runs a keyword gap analysis. It lists
        the terms the posting asks for that your resume lacks, and the terms that appear
        in both. It also comments on whether your seniority and tone fit the level the
        posting targets, and gives three to five diagnostic observations about specific
        bullets, such as noting that a bullet has no measurable outcome while the posting
        stresses cost reduction. These are observations only, not rewritten sentences.
        Without a job description, the tool infers the role you seem to be targeting and
        lists five to ten keywords commonly expected for it that your resume does not use.
      </p>

      <h2>How to read your results</h2>
      <p>
        You get an <strong>overall score</strong> from 0 to 100 with a letter grade from A
        to F, and a separate <strong>ATS compatibility score</strong> from 0 to 100. The
        rubric does not publish fixed cutoffs for each letter, so treat the grade as a
        quick label and read the comments behind it. A higher number means fewer problems
        found; it is not a percentage chance of getting an interview.
      </p>
      <p>
        <strong>Top issues</strong> is a short list of the most important things to fix
        first. Start there. The <strong>section breakdown</strong> gives each part of the
        resume its own score and a paragraph of feedback; the progress bar is green at 80
        and above, yellow from 60 to 79, and red below 60, so you can see at a glance
        where the weak spots are.
      </p>
      <p>
        The <strong>keyword lists</strong> show missing keywords in red and strong matches
        in green. Only add a missing keyword if it honestly describes work you have done.
        The <strong>summary</strong> closes the result with two or three sentences on the
        overall picture. If you supplied a job description, you also see the tone
        comment and the bullet-level observations.
      </p>

      <h2>A sample result</h2>
      <p>
        A marketing coordinator pastes a two-page resume and a job description for a
        marketing specialist role. The tool returns an overall score of 71, grade B, with
        these findings:
      </p>
      <ul>
        <li>
          <strong>Strength:</strong> a clean single-column layout with standard section
          headings, so the ATS score is high and the text extracts without trouble.
        </li>
        <li>
          <strong>Strength:</strong> a clear career progression from intern to coordinator,
          with consistent dates and verb tense.
        </li>
        <li>
          <strong>Weakness:</strong> unquantified bullets. &ldquo;Managed social media
          accounts&rdquo; says what the person did but not the result. The review suggests
          adding follower growth, engagement rates, or leads generated.
        </li>
        <li>
          <strong>Weakness:</strong> a generic summary. &ldquo;Hard-working marketing
          professional seeking growth&rdquo; could describe anyone and does not mention
          the channels or industry the posting cares about.
        </li>
        <li>
          <strong>Missing keywords:</strong> HubSpot, A/B testing, campaign attribution.
          Strong overlaps include email marketing, content calendar, and SEO.
        </li>
      </ul>
      <p>
        The summary says the resume is well organized but undersells measurable impact,
        and that adding the missing terms where they are true would close most of the gap
        with this posting.
      </p>

      <h2>Limitations</h2>
      <p>
        Applicant tracking systems do not all behave the same way. Workday, Greenhouse,
        Lever, and iCIMS each parse files in their own way, and employers configure them
        differently, so no tool can promise your resume will pass. The score is a review
        of the document, not a prediction of whether you will be hired. Recruiters weigh
        referrals, timing, and the other applicants in ways no document check can see.
      </p>
      <p>
        The tool cannot judge whether your claims are true, and it does not know the
        hiring manager&apos;s unstated priorities, the team&apos;s culture, or what was
        said in a networking conversation. A PDF made from an image or a scan has no text
        layer and cannot be read, so paste the text or export a new PDF from your word
        processor. You can run 15 scans per day across all ScanItFree tools. Use the
        feedback as a prompt for your own editing, and check every change against what you
        actually did.
      </p>
    </>
  );
}
