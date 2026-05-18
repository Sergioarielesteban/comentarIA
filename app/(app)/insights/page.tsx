"use client";

import { useEffect, useRef } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { useApp } from "@/components/providers/app-provider";
import { useAnalysisRunner } from "@/hooks/use-analysis-runner";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { HeroSummaryCard } from "@/components/premium/hero-summary-card";
import {
  OpportunityCard,
  PremiumSectionTitle,
  RestaurantStatus,
  WeeklyActionCard,
  positivePercentFromAnalysis,
} from "@/components/premium/reputation-components";
import {
  calcularScoreReputacion,
  etiquetaSalud,
} from "@/lib/analysis/reputation-score";
import { generateWeeklyActionPlan } from "@/lib/analysis/generate-weekly-action-plan";
import { copy } from "@/lib/copy/es";

export default function InsightsPage() {
  const { place, analysis, loading: appLoading } = useApp();
  const { run, loading, error } = useAnalysisRunner();
  const triggeredRef = useRef(false);

  useEffect(() => {
    if (appLoading || !place || analysis || triggeredRef.current) return;
    triggeredRef.current = true;
    void run(false);
  }, [appLoading, place, analysis, run]);

  const score = place ? calcularScoreReputacion(place, analysis) : 0;
  const health = etiquetaSalud(score);
  const weeklyActions = generateWeeklyActionPlan(analysis);
  const healthLabel =
    health === "healthy"
      ? copy.insights.healthy
      : health === "improve"
        ? copy.insights.improve
        : copy.insights.urgent;
  const topNegative = analysis?.temasNegativos[0];
  const topPositive = analysis?.temasPositivos[0];
  const positivePercent = positivePercentFromAnalysis(analysis);

  return (
    <PageShell>
      {loading && !analysis ? (
        <Spinner label={copy.insights.analyzing} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => run(true)} />
      ) : analysis ? (
        <div className="space-y-12">
          <HeroSummaryCard
            reviewsTotal={place?.total ?? 0}
            restaurantName={place?.nombre}
            coverImageUrl={place?.cover_image_url}
            coverImageSource={place?.cover_image_source}
          />

          <section id="plan-semanal" className="space-y-5">
            <PremiumSectionTitle
              eyebrow="Plan operativo"
              title="Qué hacer esta semana"
              body="Acciones priorizadas para sala, carta y experiencia. Cada una nace de patrones reales en las reseñas."
            />
            <div className="space-y-4">
              {weeklyActions.map((action, index) => (
                <WeeklyActionCard key={action.id} action={action} index={index} />
              ))}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <OpportunityCard
              kind="Alerta prioritaria"
              title={topNegative?.tema || "Señal sensible en la experiencia"}
              body={
                topNegative
                  ? `${topNegative.porQue} La acción recomendada es: ${topNegative.accion}`
                  : "No hay una fricción dominante esta semana. Mantén la escucha activa en sala."
              }
              tone="terracotta"
            >
              <p className="font-display text-2xl text-ink">
                {topNegative ? `${topNegative.menciones} menciones` : "Sin foco crítico"}
              </p>
            </OpportunityCard>
            <OpportunityCard
              kind="Oportunidad detectada"
              title={topPositive?.tema || "Fortaleza para amplificar"}
              body={
                topPositive
                  ? `${topPositive.porQue} Puede convertirse en una palanca comercial esta semana.`
                  : "Cuando aparezcan más señales positivas, aquí verás qué merece más visibilidad."
              }
              tone="olive"
            >
              <p className="font-display text-2xl text-ink">
                {topPositive ? `${topPositive.menciones} menciones favorables` : "En observación"}
              </p>
            </OpportunityCard>
          </section>

          <RestaurantStatus
            place={place}
            score={score}
            healthLabel={healthLabel}
            positivePercent={positivePercent}
          />
        </div>
      ) : (
        <Spinner label={copy.insights.analyzing} />
      )}
    </PageShell>
  );
}
