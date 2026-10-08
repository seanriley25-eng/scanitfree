import type { FaqItem } from "@/components/ToolContent";

export const faq: FaqItem[] = [
  {
    q: "What is the difference between Resume Reviewer Pro and the free Resume Reviewer?",
    a: "The free reviewer gives written feedback on your resume. Pro scores your resume against one specific job description with fixed rules, then rewrites your bullets, summary, and skills section and re-scores the result, repeating until it reaches 90 or runs out of honest improvements. Use the free tool for a general read, and Pro when you are applying to a particular posting.",
  },
  {
    q: "Will it add skills I do not have to reach 90?",
    a: "No. A missing keyword is added only if you tick a box saying you have it, or write what you did that is comparable. Anything you leave blank is never added, and the tool checks the finished text for those terms and removes any that slip in. If that leaves the score below 90, it stops there and tells you why.",
  },
  {
    q: "Is this the same score a real employer's ATS would give me?",
    a: "No. Employers use many different systems, most of them do not publish how they rank candidates, and many leave the ranking to the recruiter. The score here is a consistent, published measure of how well your text matches a job description. Treat it as a way to find weak spots, not a prediction of any company's filter.",
  },
  {
    q: "Why did my rewrite stop below 90?",
    a: "The ceiling is the best score reachable using only the keywords you confirmed or described as related experience. If the posting asks for several things you have not done, the tool stops at that ceiling instead of inventing experience. The result screen lists which keywords are holding the score back so you can go back and confirm any you do have.",
  },
  {
    q: "What file types and lengths does it accept?",
    a: "You can upload .txt, .docx, .pdf, or .html files, or paste the text directly. Older .doc and .rtf files are not supported, so save them as .docx or .pdf first. The tool reads the first 8,000 characters of your resume and the first 4,000 characters of the job description, which covers a typical two-page resume.",
  },
  {
    q: "How many times can I run it, and is my resume saved?",
    a: "Each address gets 15 requests per day, shared across all ScanItFree tools. A scan, the gap lookup, and a rewrite together use about four of them. ScanItFree does not store your resume or the job description; the text is sent to Anthropic's Claude model to do the analysis and rewrite, and the result returns to your browser.",
  },
];

export default function Content() {
  return (
    <>
      <h2>What this tool checks</h2>
      <p>
        Resume Reviewer Pro measures how closely one resume matches one specific job
        description. The free <a href="/tools/resume-reviewer">Resume Reviewer</a> gives
        written feedback on a resume in general. Pro adds two things: a deterministic
        score out of 100, and an automatic rewrite loop that edits your summary, skills,
        and bullets and re-scores them until the result reaches 90 or runs out of honest
        ways to improve.
      </p>
      <p>
        &ldquo;Deterministic&rdquo; means the score comes from ordinary code, not from an
        AI opinion. Give the scorer the same resume text and the same keyword list and it
        returns the same number every time. The rewriting is done by Anthropic&apos;s
        Claude model following written rules that a person maintains, but the model never
        grades its own work: the rewritten resume is re-scored by the same code, so the
        &ldquo;after&rdquo; number is verified rather than claimed.
      </p>
      <p>
        It is for people applying to a particular posting who want to see how a
        keyword-matching applicant tracking system (ATS) is likely to read their document,
        and who are willing to edit the output. It is less useful for a general-purpose
        resume with no target job, because everything it measures is relative to the job
        description you paste.
      </p>

      <h2>How it works</h2>
      <p>
        <strong>1. Add your resume.</strong> Upload a .txt, .docx, .pdf, or .html file, or
        paste the text. <strong>2. Paste the job description</strong> and click Free
        Resume Scan. Claude reads the posting and extracts 12 to 18 keywords, meaning the
        exact phrases it uses for tools, technical skills, and domain terms. They are
        shown as locked keywords so the target does not shift between runs.
      </p>
      <p>
        <strong>3. The scorer runs.</strong> It awards up to 100 points across five
        components:
      </p>
      <ul>
        <li>
          <strong>Summary, 15 points:</strong> a summary exists, it is 350 characters or
          fewer, it runs one to four sentences, and it contains keywords from the posting.
        </li>
        <li>
          <strong>Skills, 20 points:</strong> a dedicated skills section, with 8 to 14
          items as the best range, and how many of the locked keywords appear in it.
        </li>
        <li>
          <strong>Bullets, 35 points:</strong> the largest share. It counts how many
          bullets open with an action verb, how many contain a number, whether there are
          at least five, and how many keywords appear inside them. It deducts for
          truncated bullets and for vague words such as &ldquo;various,&rdquo;
          &ldquo;several,&rdquo; and &ldquo;numerous.&rdquo;
        </li>
        <li>
          <strong>ATS keywords, 15 points:</strong> the fraction of locked keywords found
          anywhere in the document.
        </li>
        <li>
          <strong>Format, 15 points:</strong> standard headings (summary, skills,
          experience, education), an education section, and consistent bullet symbols.
        </li>
      </ul>
      <p>
        <strong>4. Add company context (optional).</strong> On the Skills Gap tab you can
        type a company name or describe the tools the team uses. The tool has profiles for
        more than 40 large employers and fills them in for you to edit. This changes the
        vocabulary of the rewrite: for a Microsoft role it will write Azure DevOps rather
        than Jira, and for a Google role it will not mention Azure.
      </p>
      <p>
        <strong>5. Decide on each missing keyword.</strong> When you open the Skills Gap
        tab, the tool automatically asks Claude to explain every missing keyword in plain
        English and to look through your resume for related experience. Then you choose
        what is true for you.
      </p>
      <p>
        <strong>6. The rewrite loop.</strong> Click Optimize. Claude rewrites the summary,
        skills, and bullets under fixed structural rules, and the code re-scores the
        result. If it is still below target, up to three more passes run, each given the
        exact issues the scorer found. The target is 90, or 93 if your original already
        scored 80 or higher. Roles, dates, contact details, education, and certifications
        are copied from your original, not rewritten.
      </p>
      <p>
        The target is capped at an <strong>honest ceiling</strong>: the best score
        possible using only the keywords you confirmed or described as related. A keyword
        you leave unchecked is never added. The finished text is searched for those terms,
        a cleanup pass removes any that slipped in, and a warning appears if one remains.
      </p>

      <h2>How to read your results</h2>
      <p>
        The <strong>Score</strong> tab shows a gauge that is red below 50, yellow from 50,
        green from 75, and bright green at 90 and above. The home page example labels 68
        as a C and 92 as an A; the number is what the tool computes. Beside it are a
        one-line impression and three top fixes from Claude&apos;s qualitative review
        (commentary, not part of the score), then a bar for each of the five components
        with its specific issues, such as how many bullets lack a metric.
      </p>
      <p>
        The <strong>Skills Gap</strong> tab lists keywords the posting uses that your
        resume does not say. A missing keyword does not prove you lack the skill, only
        that a text match cannot find it. You have three options for each one:
      </p>
      <ul>
        <li>
          <strong>You have it:</strong> tick the box. It can then appear in your skills
          section and bullets.
        </li>
        <li>
          <strong>You partly have it:</strong> describe what you did that is comparable.
          It appears only in the summary or a bullet, framed as adjacent experience, never
          as a bare skill.
        </li>
        <li>
          <strong>You do not have it:</strong> leave it blank. It stays out, and a live
          meter shows how that lowers your ceiling.
        </li>
      </ul>
      <p>
        The rewrite tab compares your original score with the verified one, lists the
        changes, notes which keywords were framed as related and which were not added, and
        flags anything to check, such as a dropped role. The <strong>Resume</strong> tab
        shows the formatted result, which you can download as an HTML file or copy as
        text.
      </p>

      <h2>A sample result</h2>
      <p>
        This illustrative run matches the example on the home page: a senior software
        engineer applying for a role at Acme.
      </p>
      <ul>
        <li>The score rose from 68 (C) to 92 (A), a gain of 24 points, verified by re-scoring the rewritten text.</li>
        <li>Six bullets that had no number gained quantified metrics, built from figures already in the resume or stated conservatively.</li>
        <li>
          Four missing keywords (Kubernetes, gRPC, distributed systems, and
          observability) were added only after the user ticked each one as something they
          had done.
        </li>
        <li>
          The skills section was condensed from 27 items to 12, inside the range the
          scorer rewards and short enough to scan quickly.
        </li>
        <li>Keywords the user left unchecked stayed out, and the result screen listed them.</li>
      </ul>

      <h2>Limitations</h2>
      <p>
        A score of 90 or more means your document matches the job description text well.
        It does not mean you are qualified, that you will pass a human screen, or that you
        will be hired. The scorer measures only what is listed above, so an excellent
        resume with plain-spoken bullets or few numbers can score lower than a mediocre
        one that happens to match the wording.
      </p>
      <p>
        Read and edit every rewritten bullet. The tool cannot know what you actually did,
        and a figure or tool name that sounds right may not be true for you, including a
        tool added from the company context. Heavy keyword matching can also read as
        stuffing to a human recruiter, so check the tone before you send it.
      </p>
      <p>
        Each address gets 15 requests per day across all ScanItFree tools. A scan, the
        gap lookup, and a rewrite together use about four, and a PDF upload uses one more.
      </p>
    </>
  );
}
