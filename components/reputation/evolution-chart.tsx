"use client";

import type { EvolutionPoint } from "@/lib/analysis/evolution-data";
import { copy } from "@/lib/copy/es";

export function EvolutionChart({ series }: { series: EvolutionPoint[] }) {
  if (!series.length) {
    return (
      <p className="text-sm text-ink-soft">Sin datos de evolución disponibles.</p>
    );
  }

  const maxScore = Math.max(...series.map((p) => p.score), 1);

  return (
    <div className="space-y-4">
      <p className="text-xs italic text-ink-soft">{copy.evolution.todoNote}</p>
      <div className="flex h-36 items-end gap-2">
        {series.map((point) => (
          <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full max-w-[40px] rounded-t-lg bg-terracotta/75 transition-all"
              style={{ height: `${(point.score / maxScore) * 100}%`, minHeight: 8 }}
              title={`${point.score}/100`}
            />
            <span className="font-mono text-[9px] uppercase text-ink-soft">
              {point.label}
            </span>
          </div>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricPill label="Puntuación" value={`${series.at(-1)?.score ?? 0}/100`} />
        <MetricPill
          label="Reseñas (est.)"
          value={String(series.at(-1)?.reviews ?? 0)}
        />
        <MetricPill
          label="Sentimiento"
          value={`${series.at(-1)?.sentiment ?? 0}%`}
        />
      </div>
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-border bg-cream/50 px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}
