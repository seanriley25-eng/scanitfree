import type { FaqItem } from "@/components/ToolContent";

export const faq: FaqItem[] = [
  {
    q: "Do I have to paste a job description?",
    a: "No. Without one, the tool still scores the four sections, the length, and the ATS readiness, and it guesses which role the letter is aimed at. Pasting the job description is worth the extra minute because it unlocks the company and role comparison, the missing keywords taken from that posting, and the sentence-level observations.",
  },
  {
    q: "What does the ATS score actually mean?",
    a: "It estimates how well the letter would survive automated keyword screening: how naturally the relevant terms appear, whether the formatting is clean, and whether anything such as a table or image could confuse a parser. It is a reading by the model, not output from a real employer's software, so treat it as a guide to what to fix rather than a prediction.",
  },
  {
    q: "Will it rewrite my cover letter?",
    a: "No. It points at sentences that need work and says why, but it does not write replacements. The letter stays yours, which also keeps it sounding like you when a hiring manager reads it.",
  },
  {
    q: "What can I upload or paste?",
    a: "You can paste up to 24,000 characters of letter text, or upload a PDF or DOCX file up to 10 MB. The job description box accepts up to 8,000 characters; anything beyond that is ignored. A PDF needs a text layer, so a photographed printout will not be readable.",
  },
  {
    q: "Is my cover letter stored?",
    a: "No. The text is sent to the analysis model, the result is returned to your browser, and the input is processed and discarded rather than saved. Close the tab and the review is gone, so copy anything you want to keep.",
  },
  {
    q: "How many letters can I review?",
    a: "Fifteen scans per day from one network address, counted across all ScanItFree tools. The limit keeps the service free, and it resets after 24 hours. If you are comparing two versions of a letter against one job description, each version uses one scan.",
  },
];

export default function Content() {
  return (
    <>
      <h2>What this tool checks</h2>
      <p>
        A hiring manager or recruiter may give a cover letter a few seconds before
        deciding whether to keep reading, and before that an applicant tracking system
        may have already scanned it for keywords. The Cover Letter Reviewer reads your
        letter with both readers in mind. It reviews the opening, the body, the closing,
        and the tone, then gives an overall score, a length verdict, and an ATS score.
        If you paste the job description, it also compares the letter against that
        specific role.
      </p>
      <p>
        It is for people writing a first professional cover letter, people who send one
        letter to many employers and suspect it has gone generic, career changers who
        need to translate past experience into a new field, and anyone who wants a
        second read before pressing send. It is built around US-style business cover
        letters for corporate, nonprofit, and similar roles.
      </p>

      <h2>How it works</h2>
      <p>
        You paste the letter or upload it as a PDF or DOCX file. You can also paste the
        job description, which is optional. The tool sends the text to Anthropic&apos;s
        Claude model together with a written rubric that a person maintains. The model
        applies the rubric and returns scores and notes; nobody reads your letter by
        hand.
      </p>
      <p>The rubric scores four sections, each from 0 to 100:</p>
      <ul>
        <li>
          <strong>Opening Hook:</strong> how strong the first lines are, whether they are
          personalized to the employer or could open any letter, and whether they offer
          the reader something of value immediately.
        </li>
        <li>
          <strong>Body Paragraphs:</strong> whether claims are backed by evidence,
          whether achievements are quantified, and whether the paragraphs build a
          coherent story.
        </li>
        <li>
          <strong>Closing:</strong> how clear the call to action is, how confident it
          sounds, and whether it names a specific next step.
        </li>
        <li>
          <strong>Tone &amp; Voice:</strong> professional register, the balance between
          enthusiasm and formality, and whether the writing sounds authentic rather than
          templated.
        </li>
      </ul>
      <p>
        Length is judged separately. The rubric treats 250 to 400 words as the ideal
        range, marks a letter as too short below 200 words, and as too long above 500.
        The ATS score reflects keyword density, formatting clarity, and the absence of
        tables or images.
      </p>
      <p>
        With a job description, the tool checks company alignment (does the letter show
        knowledge of this employer&apos;s context, values, or challenges) and role
        alignment (does the seniority and tone match the level the posting targets). It
        lists keywords the posting emphasizes that your letter lacks, keywords that
        already overlap well, and three to five diagnostic observations about specific
        sentences. The observations describe a problem; they do not rewrite the
        sentence. Without a job description, it states the role your letter appears to
        target and lists five to eight keywords commonly required for that kind of role.
        When a well-known hiring standard directly supports a point, a short citation is
        added. The model is told to cite only real sources and to skip the citation when
        unsure.
      </p>

      <h2>How to read your results</h2>
      <p>
        The <strong>overall score</strong> runs from 0 to 100 and comes with a letter
        grade from A to F. A high A or B means the letter is in good shape and needs
        polish; a C or lower usually means one or more sections are letting down an
        otherwise usable draft. The score is the model&apos;s judgment under the rubric,
        not a formula, so use it to compare drafts of the same letter rather than to
        compare yourself with other people.
      </p>
      <p>
        The <strong>section scores</strong> matter more than the total. Each of the four
        sections has its own bar and a short note explaining the number. If three bars
        are green and one is red, fix the red one first. The{" "}
        <strong>length verdict</strong> reads appropriate, too short, or too long.
        The <strong>ATS score</strong> is separate from quality; a beautifully written
        letter can score low if it avoids the vocabulary the role uses.
      </p>
      <p>
        <strong>Top issues</strong> is the shortest path to improvement: the most
        important problems, in plain language. Work through them in order, then run the
        letter again.
      </p>
      <p>
        The <strong>match against role</strong> block changes with the mode. With a job
        description you will see company alignment, role alignment, missing keywords,
        strong matches, and the sentence-level observations. Without one you will see
        the inferred role, a list of commonly expected keywords your letter lacks, and
        keywords you already cover. If the inferred role is wrong, your letter is
        unclear about what you are applying for, which is a finding in itself.
      </p>

      <h2>A sample result</h2>
      <p>
        A candidate pastes a letter for a customer success manager role along with the
        job posting. The tool returns an overall score of 78, grade B:
      </p>
      <ul>
        <li>
          <strong>Opening Hook:</strong> flagged as generic. The letter begins
          &ldquo;I am excited to apply for the Customer Success Manager position,&rdquo;
          which could open any letter and offers the reader nothing about this company.
        </li>
        <li>
          <strong>Body Paragraphs:</strong> strong. One paragraph reports raising renewal
          retention for a 40-account book from 84% to 93% in a year, which gives the
          reader a number to remember.
        </li>
        <li>
          <strong>Closing:</strong> weak. It thanks the reader and says the candidate
          &ldquo;looks forward to hearing from you,&rdquo; with no proposed next step.
        </li>
        <li>
          <strong>Length:</strong> 430 words, judged appropriate.
        </li>
        <li>
          <strong>Missing keywords from the posting:</strong> churn, onboarding, NPS.
          Strong matches include renewals and stakeholder management.
        </li>
      </ul>
      <p>
        The top issues repeat the weak opening and closing. One diagnostic observation
        notes that the posting stresses onboarding new accounts, yet the letter never
        mentions it, even though the candidate&apos;s retention story is exactly the
        kind of evidence the role needs.
      </p>

      <h2>Limitations</h2>
      <p>
        The tool cannot verify anything you claim. If the letter says you grew revenue
        by 40%, the reviewer judges whether the claim is specific and well placed, not
        whether it is true. It does not know the hiring manager, the company&apos;s
        culture beyond what the job description says, or whether the role has already
        been filled.
      </p>
      <p>
        Tone norms differ by industry and country. A warm, direct letter that works at a
        startup may read as too casual in banking, and conventions in other countries
        differ from US expectations. The rubric is built for US-style business cover
        letters, so it is not a good fit for academic cover letters, UK or EU personal
        statements, or grant letters, and scores for those would be misleading.
      </p>
      <p>
        It does not write the letter for you, and it will not produce replacement
        sentences. An ATS score is an estimate from a model, not a test against any
        employer&apos;s system. Fifteen scans per day are available across all tools on
        the site. Treat the review as a careful second reader, then use your own
        judgment, and ideally a trusted friend or mentor, before you send the letter.
      </p>
    </>
  );
}
