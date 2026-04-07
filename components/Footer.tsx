import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border py-8 px-6 text-center text-muted text-xs font-mono">
      <div>ScanItFree — Free AI utilities for everyday decisions</div>
      <div className="opacity-50 mt-1">
        Tools powered by Claude API · Data from FDA, CPSC, NHTSA · Not a
        substitute for professional advice
      </div>
      <div className="mt-3 flex justify-center gap-4">
        <Link href="/about" className="text-muted hover:text-[var(--text)] no-underline">About</Link>
        <Link href="/privacy" className="text-muted hover:text-[var(--text)] no-underline">Privacy Policy</Link>
        <Link href="/terms" className="text-muted hover:text-[var(--text)] no-underline">Terms</Link>
        <Link href="/contact" className="text-muted hover:text-[var(--text)] no-underline">Contact</Link>
      </div>
    </footer>
  );
}
