import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact — ScanItFree" };

export default function ContactPage() {
  return (
    <div className="max-w-[640px] mx-auto px-6 py-16">
      <h1 className="font-display text-4xl text-[var(--text)] mb-6">Contact Us</h1>
      <p className="text-muted text-sm leading-relaxed mb-4">
        Have feedback, questions, or a tool suggestion? We&apos;d love to hear from you.
      </p>
      <p className="text-muted text-sm">
        Email: <a href="mailto:hello@scanitfree.com" className="text-accent">hello@scanitfree.com</a>
      </p>
    </div>
  );
}
