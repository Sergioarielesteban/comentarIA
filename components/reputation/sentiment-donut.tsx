"use client";

import { positivePercentFromAnalysis } from "@/components/premium/reputation-components";
import type { Analysis } from "@/lib/types";

export function SentimentDonut({ analysis }: { analysis: Analysis | null }) {
  const positive = positivePercentFromAnalysis(analysis);
  const negative = analysis
    ? Math.min(
        100,
        analysis.temasNegativos.reduce((s, t) => s + t.menciones, 0) > 0
          ? Math.round(
              (analysis.temasNegativos.reduce((s, t) => s + t.menciones, 0) /
                (analysis.temasPositivos.reduce((s, t) => s + t.menciones, 0) +
                  analysis.temasNegativos.reduce((s, t) => s + t.menciones, 0) ||
                  1)) *
                100,
            )
          : 10,
      )
    : 0;
  const neutral = Math.max(0, 100 - positive - negative);

  const segments = [
    { label: "Positivo", pct: positive, color: "#4A6B3A" },
    { label: "Neutro", pct: neutral, color: "#B8872A" },
    { label: "Negativo", pct: negative, color: "#C4531F" },
  ];

  let offset = 0;
  const gradient = segments
    .map((s) => {
      const start = offset;
      offset += s.pct;
      return `${s.color} ${start}% ${offset}%`;
    })
    .join(", ");

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
      <div
        className="grid h-28 w-28 place-items-center rounded-full"
        style={{
          background: `conic-gradient(${gradient || "#E8E2DA 0% 100%"})`,
        }}
      >
        <div className="grid h-[4.5rem] w-[4.5rem] place-items-center rounded-full bg-card text-center">
          <span className="font-display text-2xl font-semibold text-ink">
            {positive}%
          </span>
        </div>
      </div>
      <ul className="space-y-2 text-sm">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-ink">
              {s.label} <span className="text-ink-soft">{s.pct}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
