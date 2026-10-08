import type { Metadata } from "next";
import Link from "next/link";
import { AUTHOR, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `About — ${SITE.name}`,
  description:
    "Who runs ScanItFree, how the tools are built, and how AI is used on the site.",
};

export default function AboutPage() {
  return (
    <div className="max-w-[640px] mx-auto px-6 py-16">
      <h1 className="font-display text-4xl text-[var(--text)] mb-6">About ScanItFree</h1>

      <div className="text-muted text-sm leading-relaxed space-y-4">
        <p>
          ScanItFree is run by{" "}
          <strong className="text-[var(--text)]">{SITE.operator}</strong>, founded by{" "}
          <Link href={AUTHOR.url} className="text-accent">
            {AUTHOR.name}
          </Link>
          . It offers free scanning and review tools for everyday documents and labels:
          food ingredient lists, cosmetic ingredients, leases, privacy policies, resumes,
          and cover letters. Every tool is free, needs no account, and discards what you
          upload once the result is shown.
        </p>

        <h2 className="font-heading text-lg font-semibold text-[var(--text)] pt-4">
          How the tools are built
        </h2>
        <p>
          Reading and scoring is done by Anthropic&apos;s Claude model. What the model looks
          for is decided by a person. Each tool follows a written rubric that lists the exact
          clauses, ingredients, or resume signals to flag and the public source behind each
          one, for example the state statute a lease clause violates or the FDA listing for a
          recalled product. Where a live dataset exists, the tool queries it directly: the
          Food Safety Scanner checks the FDA enforcement database on every scan.
        </p>
        <p>
          Rubrics are tested against real documents and corrected when a result is wrong or
          overconfident. Guides are written and reviewed by {AUTHOR.name}, carry a
          last-reviewed date, and list their primary sources.
        </p>

        <h2 className="font-heading text-lg font-semibold text-[var(--text)] pt-4">
          Our principles
        </h2>
        <p>
          <strong className="text-[var(--text)]">Privacy first:</strong> We don&apos;t store
          your data. Your resume text, lease content, and ingredient lists are processed in
          real time and immediately discarded. We don&apos;t build user profiles or sell data.
        </p>
        <p>
          <strong className="text-[var(--text)]">Real data, not guesses:</strong> Wherever a
          public database or statute exists, the tools reference it rather than relying on
          the model alone.
        </p>
        <p>
          <strong className="text-[var(--text)]">Transparency:</strong> Every tool page
          explains what it checks, what it cannot check, and when to consult a professional.
        </p>

        <h2
          className="font-heading text-lg font-semibold text-[var(--text)] pt-4"
          id="author"
        >
          About the author
        </h2>
        <p>{AUTHOR.bio}</p>
        <p>
          <Link href={AUTHOR.url} className="text-accent">
            Read more about {AUTHOR.name} and see all guides →
          </Link>
        </p>

        <h2 className="font-heading text-lg font-semibold text-[var(--text)] pt-4">
          Disclaimer
        </h2>
        <p>
          All tools are for informational purposes only and do not constitute legal, medical,
          or professional advice of any kind. Always consult a qualified professional for
          decisions that affect your health, legal rights, or financial wellbeing. The site is
          supported by advertising.
        </p>

        <h2 className="font-heading text-lg font-semibold text-[var(--text)] pt-4">Contact</h2>
        <p>
          Questions, corrections, or partnership inquiries:{" "}
          <a href={`mailto:${SITE.contactEmail}`} className="text-accent">
            {SITE.contactEmail}
          </a>
        </p>
      </div>
    </div>
  );
}
