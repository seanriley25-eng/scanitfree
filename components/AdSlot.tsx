"use client";

type AdSize = "leaderboard" | "rectangle" | "banner";

const DIMENSIONS: Record<AdSize, { minHeight: string; maxWidth: string }> = {
  leaderboard: { minHeight: "90px", maxWidth: "728px" },
  rectangle: { minHeight: "250px", maxWidth: "300px" },
  banner: { minHeight: "100px", maxWidth: "320px" },
};

export function AdSlot({
  size = "leaderboard",
  className = "",
}: {
  size?: AdSize;
  className?: string;
}) {
  const dims = DIMENSIONS[size];

  return (
    <div
      className={`ad-slot ad-slot-${size} ${className}`}
      aria-hidden="true"
      style={{
        minHeight: dims.minHeight,
        width: "100%",
        maxWidth: dims.maxWidth,
        margin: "0 auto",
      }}
    >
      {/* AdSense slot — populated post-approval */}
    </div>
  );
}
