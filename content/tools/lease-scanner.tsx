import type { FaqItem } from "@/components/ToolContent";

export const faq: FaqItem[] = [
  {
    q: "Is the Lease Red Flag Scanner legal advice?",
    a: "No. It is an informational review that points out clauses commonly found to be unfair or unenforceable under your state's landlord-tenant statutes. For a decision about signing, breaking, or disputing a lease, talk to a tenant rights organization or an attorney in your state.",
  },
  {
    q: "Which states does it support?",
    a: "All 50 states and the District of Columbia. The rubric includes specific statute references for the most common tenant protections, such as deposit caps and return deadlines, in California, New York, Texas, New Jersey, Florida, Washington, Illinois, and Massachusetts. For other states it applies the Uniform Residential Landlord and Tenant Act principles and tells you when a protection could not be verified.",
  },
  {
    q: "What file types can I upload?",
    a: "PDF and DOCX files up to 10 MB, or pasted text up to 24,000 characters. Scanned leases work if the PDF contains a text layer; a photographed lease without one will not be readable.",
  },
  {
    q: "Is my lease stored?",
    a: "No. The lease text is sent to the analysis model, the result is returned to your browser, and nothing is written to a database or log. Close the tab and it is gone.",
  },
  {
    q: "Why did my lease get a low score when my landlord seems fine?",
    a: "The score reflects the document, not the person. Many landlords use template leases that contain outdated or overreaching clauses they never enforce. A low score is a reason to ask for a clause to be struck or amended before signing, not proof of bad intent.",
  },
  {
    q: "How many scans can I run?",
    a: "Fifteen per day from one network address across all ScanItFree tools. The limit keeps the service free; it resets every 24 hours.",
  },
];

export default function Content() {
  return (
    <>
      <h2>What this tool checks</h2>
      <p>
        A residential lease is a contract written by one side. Most renters sign it in
        minutes, often on a phone, without reading the clauses that decide what happens
        to their deposit, how much notice they get before someone enters, or what they
        owe if they leave early. The Lease Red Flag Scanner reads the whole document and
        flags the clauses that most often cost tenants money or rights, then explains
        each one in plain English and tells you what to ask for instead.
      </p>
      <p>
        It is built for renters reviewing a lease before signing, tenants trying to
        understand a lease they already signed, and anyone deciding whether a landlord&apos;s
        deduction or demand is actually allowed. It works on standard apartment leases,
        single-family rentals, room rentals, and most sublease agreements.
      </p>

      <h2>How it works</h2>
      <p>
        You paste the lease text or upload the PDF or DOCX, pick your state, and submit.
        The tool sends the text to Anthropic&apos;s Claude model together with a rubric we
        maintain. The rubric names the specific clause types to look for, the state
        statutes that govern them, and how severe each problem is. The model is told to
        cite a statute only when it is certain and to say so when a state-specific rule
        could not be verified.
      </p>
      <p>
        The clause types the rubric covers include: security deposit amount and return
        deadline; late fees and their caps; landlord entry notice; automatic renewal and
        notice-to-vacate windows; early termination penalties; joint and several
        liability for roommates; repair and maintenance responsibility; waiver of the
        implied warranty of habitability; waiver of jury trial or class action;
        attorney&apos;s fee clauses that only run one way; pet, guest, and subletting
        restrictions; and any clause that tries to waive a right your state says cannot
        be waived.
      </p>
      <p>
        For eight high-population states the rubric carries exact citations, for example
        California Civil Code § 1950.5 for deposits, New York General Obligations Law § 7-108,
        Texas Property Code § 92.101, New Jersey Statutes § 46:8-19, Florida Statutes
        § 83.49, Washington RCW 59.18.260, 765 ILCS 710 in Illinois, and Massachusetts
        General Laws chapter 186 § 15B. For other states the tool applies the Uniform
        Residential Landlord and Tenant Act framework that most state codes are based
        on, and labels those findings as general rather than state-verified.
      </p>

      <h2>How to read your results</h2>
      <p>
        The result has four parts. The <strong>score</strong> runs from 0 to 100 and is
        mapped to a letter grade: 90 and above is an A, meaning the lease is largely
        balanced; 70 to 89 is a B with minor concerns; 50 to 69 is a C with clauses worth
        negotiating; 30 to 49 is a D with significant problems; below 30 is an F, meaning
        several clauses are likely unenforceable or abusive.
      </p>
      <p>
        <strong>Flags</strong> are the individual findings. Each has a severity: a red
        flag is a clause that likely violates your state&apos;s law or removes a protection
        you cannot waive; a caution is a clause that is legal but unfavorable and worth
        negotiating; a note is something to be aware of, such as a short notice window.
        Each flag quotes the clause, explains the problem, and suggests the language to
        ask for.
      </p>
      <p>
        <strong>Missing protections</strong> lists things a fair lease would include but
        yours does not, such as a move-in inspection checklist, a stated deposit return
        deadline, or a written repair request procedure. The <strong>summary</strong>{" "}
        gives the overall picture in two or three sentences.
      </p>

      <h2>A sample result</h2>
      <p>
        A tenant in Washington uploads a 14-page lease. The tool returns a score of 54,
        grade C, with these findings:
      </p>
      <ul>
        <li>
          <strong>Red flag:</strong> &ldquo;Tenant waives any right to a move-in
          inspection.&rdquo; Washington requires a written move-in checklist signed by
          both parties before a deposit can be collected (RCW 59.18.260). Suggested fix:
          strike the clause and attach a checklist.
        </li>
        <li>
          <strong>Caution:</strong> &ldquo;Landlord may enter at any reasonable time.&rdquo;
          Washington requires two days&apos; written notice for non-emergency entry. Suggested
          fix: replace with the statutory notice period.
        </li>
        <li>
          <strong>Caution:</strong> &ldquo;A late fee of $75 plus $10 per day applies
          after the 1st.&rdquo; Legal, but steep; many landlords accept a flat fee after
          a five-day grace period.
        </li>
        <li>
          <strong>Note:</strong> Lease renews automatically for 12 months unless 60 days&apos;
          notice is given. Put the date in your calendar.
        </li>
      </ul>
      <p>
        Missing protections: no deposit return deadline stated (Washington allows 30
        days), no repair request procedure. Summary: a standard template lease with one
        clause that is unenforceable in Washington and two that are worth negotiating
        before signing.
      </p>

      <h2>Limitations</h2>
      <p>
        The tool reads the lease you give it; it cannot see addenda, house rules, or
        local ordinances that change the picture. City-level rules such as rent
        stabilization in New York City or just-cause eviction in Seattle are not in the
        rubric. It does not know your rental history, the condition of the unit, or what
        was said verbally. A statute citation is a starting point for your own reading
        or a conversation with a tenant rights group, not a legal opinion.
      </p>
      <p>
        If the lease is for commercial space, a mobile home lot, public housing, or a
        unit covered by a housing voucher, different laws apply and the results will be
        incomplete. Scanned PDFs without a text layer cannot be read. Talk to a lawyer
        or a local tenant union before refusing to sign, withholding rent, or breaking a
        lease based on anything you read here.
      </p>
    </>
  );
}
