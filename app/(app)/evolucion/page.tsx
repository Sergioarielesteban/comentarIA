"use client";

import { PageShell } from "@/components/layout/page-shell";
import { useApp } from "@/components/providers/app-provider";
import { EvolutionChart, SectionTitle } from "@/components/reputation";
import { buildEvolutionSeries } from "@/lib/analysis/evolution-data";
import { copy } from "@/lib/copy/es";

export default function EvolucionPage() {
  const { place, analysis } = useApp();
  const series = buildEvolutionSeries(place, analysis);

  return (
    <PageShell>
      <div className="space-y-6">
        <SectionTitle
          eyebrow="Histórico reputacional"
          title={copy.evolution.title}
          body={copy.evolution.subtitle}
        />
        <div className="rounded-[28px] border border-border bg-card/88 p-6">
          <EvolutionChart series={series} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <RiskCard
            label="Riesgos detectados"
            value={String(analysis?.temasNegativos.filter((t) => t.impacto === "alto").length ?? 0)}
          />
          <RiskCard
            label="Reseñas en base"
            value={String(place?.total ?? 0)}
          />
        </div>
      </div>
    </PageShell>
  );
}

function RiskCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-border bg-card/85 p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
        {label}
      </p>
      <p className="mt-2 font-display text-4xl font-semibold text-ink">{value}</p>
    </div>
  );
}
