"use client";

import { PageShell } from "@/components/layout/page-shell";
import {
  CompetitorComparisonCard,
  SectionTitle,
} from "@/components/reputation";
import { copy } from "@/lib/copy/es";

export default function CompetenciaPage() {
  return (
    <PageShell>
      <div className="space-y-6">
        <SectionTitle
          eyebrow="Benchmark local"
          title={copy.competition.title}
          body="Comparativa estimada a partir de señales en tus reseñas. Los datos de competidores reales se conectarán en fase 2."
        />
        <CompetitorComparisonCard metrics={[]} hasData={false} />
      </div>
    </PageShell>
  );
}
