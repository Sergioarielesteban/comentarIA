"use client";

import Link from "next/link";
import { copy } from "@/lib/copy/es";
import { placeholders } from "@/lib/placeholders";

export type CompetitorMetric = {
  id: string;
  label: string;
  delta: number | null;
};

export function CompetitorComparisonCard({
  metrics,
  hasData = false,
}: {
  metrics: CompetitorMetric[];
  hasData?: boolean;
}) {
  if (!hasData) {
    return (
      <article className="rounded-[24px] border border-dashed border-border bg-card/65 p-8 text-center">
        <p className="font-display text-2xl font-semibold text-ink">
          {copy.competition.empty}
        </p>
        <p className="mx-auto mt-3 max-w-sm text-sm text-ink-soft">
          {placeholders.competitorBenchmark}
        </p>
        <button
          type="button"
          disabled
          className="mt-6 inline-flex cursor-not-allowed rounded-full bg-ink/20 px-6 py-3 text-sm font-semibold text-ink-soft"
        >
          {copy.competition.analyze}
        </button>
      </article>
    );
  }

  return (
    <section className="space-y-4">
      {metrics.map((m) => (
        <article
          key={m.id}
          className="rounded-[22px] border border-border bg-card/85 p-4"
        >
          <p className="text-sm text-ink-soft">{m.label}</p>
          <p className="mt-2 font-display text-3xl font-semibold text-olive">
            {m.delta !== null ? `${m.delta > 0 ? "+" : ""}${m.delta}%` : "—"}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
            {copy.competition.vsMarket}
          </p>
        </article>
      ))}
    </section>
  );
}
