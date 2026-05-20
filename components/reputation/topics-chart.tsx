"use client";

import type { Analysis } from "@/lib/types";

export function TopicsChart({ analysis }: { analysis: Analysis | null }) {
  const topics = [
    ...(analysis?.temasPositivos ?? []).map((t) => ({
      name: t.tema,
      count: t.menciones,
      tone: "olive" as const,
    })),
    ...(analysis?.temasNegativos ?? []).map((t) => ({
      name: t.tema,
      count: t.menciones,
      tone: "terracotta" as const,
    })),
  ]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  if (!topics.length) {
    return (
      <p className="text-sm text-ink-soft">Sin temas detectados todavía.</p>
    );
  }

  const max = Math.max(...topics.map((t) => t.count), 1);

  return (
    <div className="space-y-3">
      {topics.map((t) => (
        <div key={t.name}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-ink">{t.name}</span>
            <span className="font-mono text-[10px] text-ink-soft">
              {Math.round((t.count / max) * 100)}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-cream-muted">
            <div
              className={[
                "h-full rounded-full",
                t.tone === "olive" ? "bg-olive/70" : "bg-terracotta/60",
              ].join(" ")}
              style={{ width: `${(t.count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
