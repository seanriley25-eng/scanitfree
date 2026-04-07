"use client";

type AdSize = "leaderboard" | "rectangle" | "banner";

const SIZES: Record<AdSize, string> = {
  leaderboard: "728×90 LEADERBOARD",
  rectangle: "300×250 MEDIUM RECTANGLE",
  banner: "320×100 MOBILE BANNER",
};

export function AdSlot({
  size = "leaderboard",
  className = "",
}: {
  size?: AdSize;
  className?: string;
}) {
  // In production, replace this div with actual AdSense code:
  // <ins className="adsbygoogle" data-ad-client="ca-pub-XXX" data-ad-slot="XXX" .../>
  // <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>

  return (
    <div
      className={`bg-surface border border-dashed border-border rounded-lg py-3.5 text-center text-muted text-xs font-mono tracking-wider ${className}`}
    >
      ADVERTISEMENT — {SIZES[size]}
    </div>
  );
}
