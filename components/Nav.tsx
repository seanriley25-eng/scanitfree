import Link from "next/link";

export function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 border-b border-border bg-[rgba(14,14,16,0.85)] backdrop-blur-xl">
      <Link href="/" className="flex items-center gap-2.5 no-underline">
        <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-sm">
          ⚡
        </div>
        <span className="font-heading font-bold text-base text-[var(--text)]">
          ScanItFree
        </span>
        <span className="font-mono text-[10px] text-accent bg-accent-dim px-2 py-0.5 rounded-lg">
          BETA
        </span>
      </Link>
      <div className="flex gap-5 items-center">
        <Link
          href="/"
          className="text-muted text-sm font-mono no-underline hover:text-[var(--text)] transition-colors"
        >
          All Tools
        </Link>
        <Link
          href="/about"
          className="text-muted text-sm font-mono no-underline hover:text-[var(--text)] transition-colors"
        >
          About
        </Link>
      </div>
    </nav>
  );
}
