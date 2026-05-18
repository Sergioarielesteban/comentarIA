"use client";

import { PageShell } from "@/components/layout/page-shell";
import { useApp } from "@/components/providers/app-provider";
import {
  MirrorInsightCard,
  OpportunityCard,
  PremiumSectionTitle,
} from "@/components/premium/reputation-components";
import { medidorAlineacion } from "@/lib/analysis/reputation-score";
import { copy } from "@/lib/copy/es";

export default function EspejoPage() {
  const { place, analysis } = useApp();
  const espejo = analysis?.espejo ?? [];
  const score = medidorAlineacion(espejo);
  const headline =
    score >= 75
      ? "Tu intuición está cerca de lo que vive el cliente."
      : score >= 55
        ? "Hay señales que tu equipo percibe, pero no con la misma intensidad."
        : "Tus clientes están viendo algo distinto a lo que crees.";

  return (
    <PageShell>
      <div className="space-y-8">
        <section className="rounded-[28px] border border-border bg-card/78 p-6 sm:p-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-terracotta">
            {copy.espejo.weekly}
          </p>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="max-w-3xl font-display text-5xl font-semibold leading-none text-ink sm:text-6xl">
                {headline}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-ink-soft">
                El espejo compara lo que crees que define a {place?.nombre || "tu restaurante"} con lo que los clientes repiten en sus reseñas.
              </p>
            </div>
            <div className="lg:text-right">
              <p className="font-display text-7xl font-semibold leading-none text-terracotta">
                {score}%
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                alineación
              </p>
            </div>
          </div>
        </section>

        {analysis?.datoPositivo ? (
          <OpportunityCard
            kind={copy.espejo.positive}
            title="Una señal que conviene proteger"
            body={analysis.datoPositivo}
            tone="olive"
          />
        ) : null}

        <div className="space-y-5">
          <PremiumSectionTitle
            eyebrow="Contrastes"
            title="Percepción frente a realidad"
            body="Cada tarjeta muestra dónde hay alineación, brecha leve o un punto ciego estratégico."
          />
          <div className="space-y-4">
            {espejo.map((item) => (
              <MirrorInsightCard key={item.tema} item={item} />
            ))}
          </div>
        </div>

      {!espejo.length ? (
        <p className="rounded-[24px] border border-border bg-card/70 p-6 text-center text-sm text-ink-soft">
          Genera un análisis en Resumen para ver tu informe espejo.
        </p>
      ) : null}
      </div>
    </PageShell>
  );
}
