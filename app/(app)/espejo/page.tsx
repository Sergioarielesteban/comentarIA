"use client";

import { PageShell } from "@/components/layout/page-shell";
import { useApp } from "@/components/providers/app-provider";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { medidorAlineacion } from "@/lib/analysis/reputation-score";
import { copy } from "@/lib/copy/es";

function alineacionLabel(a: "alta" | "media" | "baja") {
  if (a === "alta") return copy.espejo.aligned;
  if (a === "media") return copy.espejo.gapLight;
  return copy.espejo.blindSpot;
}

export default function EspejoPage() {
  const { place, analysis, reviews } = useApp();
  const espejo = analysis?.espejo ?? [];
  const score = medidorAlineacion(espejo);

  return (
    <PageShell title={copy.espejo.title} subtitle={place?.nombre}>
      <Card className="mb-4 text-center">
        <p className="text-xs text-ink-soft">{copy.espejo.weekly}</p>
        <p className="mt-1 font-display text-3xl font-semibold text-ink">
          {score}%
        </p>
        <p className="text-sm text-ink-soft">alineación dueño–clientes</p>
      </Card>

      {analysis?.datoPositivo ? (
        <Card className="mb-4 border-olive/30 bg-olive/5">
          <p className="text-xs font-medium text-olive">{copy.espejo.positive}</p>
          <p className="mt-1 text-sm text-ink">{analysis.datoPositivo}</p>
        </Card>
      ) : null}

      <div className="space-y-3">
        {espejo.map((item) => (
          <Card key={item.tema}>
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-lg text-ink">{item.tema}</p>
              <Badge
                tone={
                  item.alineacion === "alta"
                    ? "success"
                    : item.alineacion === "media"
                      ? "warning"
                      : "danger"
                }
              >
                {alineacionLabel(item.alineacion)}
              </Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-cream-muted/60 p-3">
                <p className="text-[10px] uppercase tracking-wide text-ink-soft">
                  {copy.espejo.owner}
                </p>
                <p className="mt-1 text-sm text-ink">{item.dueno}</p>
              </div>
              <div className="rounded-xl bg-terracotta/5 p-3">
                <p className="text-[10px] uppercase tracking-wide text-terracotta">
                  {copy.espejo.clients} ({item.menciones})
                </p>
                <p className="mt-1 text-sm text-ink">{item.clientes}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-ink-soft">{item.consejo}</p>
          </Card>
        ))}
      </div>

      {!espejo.length ? (
        <p className="text-center text-sm text-ink-soft">
          Genera un análisis en Insights para ver tu informe espejo.
        </p>
      ) : null}
    </PageShell>
  );
}
