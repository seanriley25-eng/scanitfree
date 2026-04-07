"use client";

import { useState } from "react";
import Link from "next/link";
import type { Tool } from "@/lib/tools";

const STATUS_COLORS = {
  live: { bg: "bg-green-400", text: "text-green-950" },
  coming: { bg: "bg-yellow-300", text: "text-yellow-950" },
  planned: { bg: "bg-gray-400", text: "text-gray-900" },
};

const STATUS_LABELS = {
  live: "Live",
  coming: "Coming Soon",
  planned: "Planned",
};

export function ToolGrid({
  tools,
  categories,
}: {
  tools: Tool[];
  categories: string[];
}) {
  const [active, setActive] = useState("All");
  const filtered =
    active === "All" ? tools : tools.filter((t) => t.category === active);

  return (
    <div className="max-w-[900px] mx-auto px-6">
      {/* Category pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`px-4 py-1.5 rounded-full font-mono text-xs transition-all border ${
              active === cat
                ? "border-accent bg-accent-dim text-accent"
                : "border-border text-muted hover:border-muted"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((tool) => {
          const colors = STATUS_COLORS[tool.status];
          const isLive = tool.status === "live";

          const Card = (
            <div
              className={`bg-surface border border-border rounded-xl p-6 transition-all ${
                isLive
                  ? "hover:border-accent hover:-translate-y-0.5 cursor-pointer"
                  : ""
              } ${tool.status === "planned" ? "opacity-50" : ""}`}
            >
              <div className="flex justify-between items-start">
                <span className="text-3xl">{tool.icon}</span>
                <span
                  className={`${colors.bg} ${colors.text} text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full uppercase tracking-wide`}
                >
                  {STATUS_LABELS[tool.status]}
                </span>
              </div>
              <h3 className="font-heading text-base font-semibold text-[var(--text)] mt-3 mb-1.5">
                {tool.name}
              </h3>
              <p className="text-muted text-xs leading-relaxed mb-4">
                {tool.desc}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-muted font-mono opacity-60">
                  ~{tool.searchVolume} searches
                </span>
                {isLive && (
                  <span className="text-xs text-accent font-mono font-semibold">
                    {tool.cta} →
                  </span>
                )}
              </div>
            </div>
          );

          return isLive ? (
            <Link key={tool.id} href={tool.href} className="no-underline">
              {Card}
            </Link>
          ) : (
            <div key={tool.id}>{Card}</div>
          );
        })}
      </div>
    </div>
  );
}
