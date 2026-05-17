"use client";

import { useEffect } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { useApp } from "@/components/providers/app-provider";
import { useAnalysisRunner } from "@/hooks/use-analysis-runner";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  calcularScoreReputacion,
  etiquetaSalud,
} from "@/lib/analysis/reputation-score";
import { copy } from "@/lib/copy/es";
import { placeholders } from "@/lib/placeholders";

export default function InsightsPage() {
  const { place, analysis, loading: appLoading } = useApp();
  const { run, loading, error } = useAnalysisRunner();

  // Esperar sync desde Supabase (móvil/otro dispositivo) antes de analizar
  useEffect(() => {
    if (appLoading || !place || analysis) return;
    run();
  }, [appLoading, place, analysis, run]);

  const score = place ? calcularScoreReputacion(place, analysis) : 0;
  const health = etiquetaSalud(score);
  const healthLabel =
    health === "healthy"
      ? copy.insights.healthy
      : health === "improve"
        ? copy.insights.improve
        : copy.insights.urgent;

  return (
    <PageShell
      title={copy.insights.title}
      subtitle={place?.nombre}
    >
      {loading && !analysis ? (
        <Spinner label={copy.insights.analyzing} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => run(true)} />
      ) : analysis ? (
        <div className="space-y-5">
          <Card>
            <p className="text-xs uppercase tracking-wide text-ink-soft">
              {copy.insights.health}
            </p>
            <p className="mt-1 font-display text-4xl font-semibold text-ink">
              {score}
              <span className="text-lg text-ink-soft">/100</span>
            </p>
            <Badge
              tone={
                health === "healthy"
                  ? "success"
                  : health === "improve"
                    ? "warning"
                    : "danger"
              }
            >
              {healthLabel}
            </Badge>
            <p className="mt-3 text-xs text-ink-soft italic">
              {placeholders.weeklyTrendChart}
            </p>
          </Card>

          <section>
            <h2 className="mb-2 font-display text-lg text-olive">
              {copy.insights.strengths}
            </h2>
            <div className="space-y-2">
              {analysis.temasPositivos.map((t) => (
                <Card key={t.tema}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-ink">{t.tema}</p>
                    <Badge tone="success">{t.menciones}×</Badge>
                  </div>
                  <p className="mt-2 text-sm italic text-ink-soft">
                    “{t.ejemplo || copy.insights.emptyReview}”
                  </p>
                  <p className="mt-2 text-xs text-ink-soft">
                    <strong>Qué pasa:</strong> {t.porQue}
                  </p>
                  <p className="mt-1 text-xs text-terracotta">
                    <strong>Acción:</strong> {t.accion}
                  </p>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-2 font-display text-lg text-terracotta">
              {copy.insights.weaknesses}
            </h2>
            <div className="space-y-2">
              {analysis.temasNegativos.map((t) => (
                <Card key={t.tema}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-ink">{t.tema}</p>
                    <Badge tone="danger">{t.impacto}</Badge>
                  </div>
                  <p className="mt-2 text-sm italic text-ink-soft">
                    “{t.ejemplo || copy.insights.emptyReview}”
                  </p>
                  <p className="mt-2 text-xs text-ink-soft">{t.porQue}</p>
                  <p className="mt-1 text-xs text-terracotta">{t.accion}</p>
                </Card>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <Spinner label={copy.insights.analyzing} />
      )}
    </PageShell>
  );
}
