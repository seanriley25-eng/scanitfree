export default function PrivacyPolicyRedFlags() {
  return (
    <>
      <p>
        Most privacy policies are not written to inform you. They are written
        to protect the company. That distinction matters, because it means the
        most consequential things a company does with your data are often the
        things the policy buries, hedges, or describes in language you would
        have to be a lawyer to fully parse. You do not need to read every word
        to spot the five red flags that show up in privacy policies that deserve
        genuine concern. You just need to know what you are looking for.
      </p>

      <h2>Red Flag 1: Vague Third-Party Sharing Language</h2>
      <p>
        The single most important thing a privacy policy can tell you is who
        else gets your data. The single most common way companies avoid telling
        you is by describing those third parties in terms so broad they could
        mean almost anything.
      </p>
      <p>
        Here is the language pattern to watch for:
      </p>
      <ul>
        <li>"We may share your information with our trusted partners."</li>
        <li>"We may disclose your data to affiliates and related companies."</li>
        <li>"We work with third-party service providers who may receive your information."</li>
      </ul>
      <p>
        None of those sentences tells you who the partners are, what they do
        with your data, whether they can share it further, or what "trusted"
        actually means. Compare that to a policy that names specific categories
        of recipients (advertising networks, payment processors, analytics
        providers), explains the purpose of each sharing relationship, and
        specifies whether recipients can use the data for their own purposes.
        The difference between those two approaches tells you something real
        about how the company thinks about disclosure.
      </p>
      <p>
        The worst version of this pattern: "We may share your information with
        third parties in ways not described in this policy." That sentence is
        a direct statement that the policy is not a complete description of
        data sharing practices.
      </p>

      <h2>Red Flag 2: "We Don't Sell Your Data" With Exceptions That Swallow the Rule</h2>
      <p>
        "We do not sell your personal information" became a common reassurance
        after CCPA passed in California, because the law gave California
        residents the right to opt out of the sale of their data. But the
        legal definition of "sell" under CCPA is specific -- and many companies
        that share data with advertisers in ways most people would consider
        selling do so under arrangements technically defined as something else.
      </p>
      <p>
        The pattern to watch for:
      </p>
      <ul>
        <li>
          <strong>"We do not sell your data"</strong> followed several paragraphs
          later by: "we share your information with advertising partners to
          provide personalized ads." Sharing data with advertisers in exchange
          for advertising services is, functionally, a data exchange. The
          semantic distinction matters legally but not practically.
        </li>
        <li>
          <strong>"We do not sell your data to third parties"</strong> but "we
          may share it with affiliates." If the company has dozens of affiliates,
          this exception can be significant.
        </li>
        <li>
          <strong>"De-identified data is not considered personal information"</strong>
          and may therefore be sold or shared without triggering the "we do not
          sell data" commitment. De-identified data can often be re-identified
          -- the reassurance is weaker than it sounds.
        </li>
      </ul>
      <p>
        Read the "sell" commitment and the data sharing section together. If
        they contradict each other at the practical level, trust the sharing
        section over the headline commitment.
      </p>

      <h2>Red Flag 3: "We May Update This Policy" Without Meaningful Notice</h2>
      <p>
        Every privacy policy reserves the right to change. That is not itself
        a red flag -- laws change, products change, and companies have legitimate
        reasons to update their data practices. The red flag is in the notice
        mechanism and the consent model.
      </p>
      <p>
        The version that should concern you looks like this:
      </p>
      <blockquote>
        "We reserve the right to modify this Privacy Policy at any time. Changes
        will be effective immediately upon posting to our website. Your continued
        use of the service after any changes constitutes your acceptance of the
        new policy."
      </blockquote>
      <p>
        Translated: they can change what they do with your data without telling
        you directly, and using the product is treated as consent to the new
        terms. You might not find out for months. By then, the data collected
        under the new policy is already in their systems.
      </p>
      <p>
        A better policy specifies that material changes will be communicated by
        email or prominent in-app notice, and provides a meaningful opt-out
        window before changes take effect for existing users. If the policy
        offers nothing like that, assume changes can happen silently.
      </p>

      <h2>Red Flag 4: Unlimited Data Retention</h2>
      <p>
        Data that a company no longer needs to serve you is data they are
        holding for other purposes -- or that they simply have not gotten around
        to deleting. Indefinite retention increases the risk that your data
        is exposed in a breach, used for purposes you did not anticipate, or
        passed to an acquirer years down the road.
      </p>
      <p>
        The language to watch for:
      </p>
      <ul>
        <li>
          <strong>"We retain your information for as long as necessary to
          fulfill the purposes described in this policy."</strong> This is
          circular. It means they keep it as long as they want to use it, which
          is indefinitely.
        </li>
        <li>
          <strong>"We may retain certain information after account deletion."</strong>
          This is not always alarming -- legal and tax obligations require
          some data retention -- but the scope matters. Retaining your name and
          transaction records for seven years is different from retaining your
          behavioral history.
        </li>
        <li>
          <strong>No retention section at all.</strong> If the policy does not
          address how long they keep your data, that is notable. Better policies
          specify retention periods for different data categories.
        </li>
      </ul>
      <p>
        A trustworthy policy specifies different retention periods for different
        types of data, ties retention to specific legal or operational
        requirements, and describes what happens to your data when you delete
        your account.
      </p>

      <h2>Red Flag 5: Broad Automated Decision-Making Without Explanation</h2>
      <p>
        This red flag is less commonly known but increasingly important as
        companies use AI and machine learning in consequential ways. Automated
        decision-making means using algorithms to make decisions about you --
        credit assessments, content moderation, job application screening,
        insurance pricing, loan approvals -- without meaningful human review.
      </p>
      <p>
        The concern is not that automation exists -- it is whether you know
        it is happening and whether you have any recourse if it affects you
        unfairly. GDPR requires companies to disclose significant automated
        decision-making and provide a right to human review. Many companies
        operating outside strict GDPR jurisdiction do not provide either.
      </p>
      <p>
        Watch for policies that:
      </p>
      <ul>
        <li>
          Mention "automated decision-making" or "profiling" but do not explain
          the contexts in which it is used or its effects on you.
        </li>
        <li>
          Describe "personalization" in ways that involve algorithmic scoring
          or ranking without disclosing that this constitutes profiling.
        </li>
        <li>
          Provide no mechanism to contest or request human review of automated
          decisions.
        </li>
      </ul>
      <p>
        If you are using a service that makes significant decisions about you
        -- financial products, employment platforms, healthcare tools -- and
        the privacy policy is silent on automated decision-making, that silence
        is worth investigating further.
      </p>

      <h2>How to Spot These Red Flags Quickly</h2>
      <p>
        You do not need to read the entire policy to check for these patterns.
        Use Ctrl+F and search for the following terms. Read the surrounding
        paragraph when you find a hit:
      </p>
      <ul>
        <li><strong>"partners"</strong> — who they are matters</li>
        <li><strong>"sell"</strong> — read the commitment and the exceptions together</li>
        <li><strong>"update"</strong> or <strong>"modify"</strong> — what is the notice model?</li>
        <li><strong>"retain"</strong> or <strong>"retention"</strong> — is there a timeframe?</li>
        <li><strong>"automated"</strong> or <strong>"profiling"</strong> — is this disclosed?</li>
        <li><strong>"de-identified"</strong> or <strong>"aggregate"</strong> — read what they claim this exempts</li>
      </ul>
      <p>
        For a broader overview of how to work through a full policy efficiently,
        see our guide on{" "}
        <a href="/blog/how-to-read-a-privacy-policy">
          how to read a privacy policy without falling asleep
        </a>.
      </p>

      <h2>What to Do When You Find a Red Flag</h2>
      <p>
        Finding a red flag does not necessarily mean walking away from the
        service. It means making a more informed decision about what data you
        share with it and whether you are comfortable with the trade-off.
      </p>
      <p>
        Practical responses:
      </p>
      <ul>
        <li>
          Use minimal data where possible -- sign up with an email alias, skip
          optional profile fields, do not connect social accounts unless
          necessary.
        </li>
        <li>
          Exercise your opt-out rights for data sales and targeted advertising
          if they are offered, even if you continue using the service.
        </li>
        <li>
          For high-stakes services, check whether the company has faced
          regulatory enforcement or public scrutiny for data practices -- the
          policy is their statement of intent, not their track record.
        </li>
        <li>
          Consider whether a privacy-focused alternative exists. For many
          common services, there are competitors with significantly more
          transparent data practices.
        </li>
      </ul>

      <hr />

      <h2>Check Any Privacy Policy for Red Flags Automatically</h2>
      <p>
        Reading for these patterns manually takes practice and time. Our{" "}
        <a href="/tools/privacy-policy-translator">Privacy Policy Translator</a>{" "}
        scans any policy and surfaces red flags automatically -- flagging vague
        sharing language, unlimited retention, weak notice for policy changes,
        and other patterns worth your attention. Paste a policy or upload a PDF
        and get a structured breakdown in seconds.
      </p>
      <p>
        You agreed to a lot of policies to get here. It is worth knowing which
        ones contain terms you would not have accepted if you had read them.
        Our{" "}
        <a href="/tools/privacy-policy-translator">Privacy Policy Translator</a>{" "}
        makes that check fast enough that you might actually do it.
      </p>
    </>
  );
}
