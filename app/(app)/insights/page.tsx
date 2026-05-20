"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { useApp } from "@/components/providers/app-provider";
import { useAnalysisRunner } from "@/hooks/use-analysis-runner";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import {
  AlertCard,
  BriefingCard,
  ConsultantCard,
  EvolutionChart,
  ExecutiveMetricCard,
  MirrorReportCard,
  ProductStarCard,
  ReputationCenter,
  WeeklyActionCard,
} from "@/components/reputation";
import { positivePercentFromAnalysis } from "@/components/premium/reputation-components";
import { buildReputationAlerts } from "@/lib/analysis/alerts";
import { buildEvolutionSeries } from "@/lib/analysis/evolution-data";
import { generateWeeklyActionPlan } from "@/lib/analysis/generate-weekly-action-plan";
import {
  calcularScoreReputacion,
  etiquetaSalud,
  medidorAlineacion,
} from "@/lib/analysis/reputation-score";
import { copy } from "@/lib/copy/es";

export default function ResumenPage() {
  const { place, analysis, loading: appLoading } = useApp();
  const { run, loading, error } = useAnalysisRunner();
  const triggeredRef = useRef(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (appLoading || !place || analysis || triggeredRef.current) return;
    triggeredRef.current = true;
    void run(false);
  }, [appLoading, place, analysis, run]);

  const score = place ? calcularScoreReputacion(place, analysis) : 0;
  const health = etiquetaSalud(score);
  const healthLabel =
    health === "healthy"
      ? copy.insights.healthy
      : health === "improve"
        ? copy.insights.improve
        : copy.insights.urgent;
  const weeklyActions = generateWeeklyActionPlan(analysis);
  const alerts = buildReputationAlerts(analysis);
  const alignment = medidorAlineacion(analysis?.espejo ?? []);
  const evolution = buildEvolutionSeries(place, analysis);
  const topProducts = analysis?.temasPositivos.slice(0, 2) ?? [];
  const positivePercent = positivePercentFromAnalysis(analysis);

  const playBriefing = useCallback(() => {
    const briefing = analysis?.briefing;
    if (!briefing || typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(briefing);
    u.lang = "es-ES";
    u.rate = 0.95;
    u.onend = () => setPlaying(false);
    window.speechSynthesis.speak(u);
    setPlaying(true);
  }, [analysis?.briefing]);

  const stopBriefing = useCallback(() => {
    if (typeof window !== "undefined") window.speechSynthesis.cancel();
    setPlaying(false);
  }, []);

  useEffect(() => () => stopBriefing(), [stopBriefing]);

  return (
    <PageShell>
      {loading && !analysis ? (
        <Spinner label={copy.insights.analyzing} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => run(true)} />
      ) : analysis ? (
        <div className="space-y-10">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ExecutiveMetricCard
              label={copy.summary.healthScore}
              value={`${score}`}
              detail={`/100 · ${healthLabel}`}
              trend={{ value: "+4 esta semana", positive: score >= 60 }}
              tone={score >= 75 ? "olive" : score >= 55 ? "mustard" : "terracotta"}
            >
              <div className="flex h-12 items-end gap-1">
                {evolution.slice(-6).map((p) => (
                  <span
                    key={p.label}
                    className="flex-1 rounded-t bg-terracotta/40"
                    style={{ height: `${(p.score / 100) * 100}%`, minHeight: 4 }}
                  />
                ))}
              </div>
            </ExecutiveMetricCard>

            <ExecutiveMetricCard
              label={copy.summary.weeklyPlan}
              value={`${weeklyActions.length}`}
              detail="acciones priorizadas"
              tone="mustard"
              footer={
                <Link
                  href="/plan-semanal"
                  className="inline-flex rounded-full bg-terracotta px-4 py-2 text-xs font-semibold text-white hover:bg-terracotta-dark"
                >
                  {copy.summary.viewPlan}
                </Link>
              }
            >
              <ul className="space-y-2 text-sm text-ink-soft">
                {weeklyActions.slice(0, 3).map((a) => (
                  <li key={a.id} className="line-clamp-1">
                    · {a.title}
                  </li>
                ))}
              </ul>
            </ExecutiveMetricCard>

            <ExecutiveMetricCard
              label={copy.summary.weeklyBriefing}
              value="3 min"
              detail="resumen ejecutivo con IA"
              tone="terracotta"
              footer={
                <button
                  type="button"
                  onClick={playing ? stopBriefing : playBriefing}
                  className="text-xs font-semibold text-terracotta hover:underline"
                >
                  {copy.summary.listenBriefing}
                </button>
              }
            >
              <p className="line-clamp-3 text-sm leading-5 text-ink-soft">
                {analysis.briefing?.slice(0, 100) ?? copy.audio.noBriefing}
              </p>
            </ExecutiveMetricCard>

            <ExecutiveMetricCard
              label={copy.summary.activeAlerts}
              value={String(alerts.filter((a) => a.level === "high" || a.level === "medium").length)}
              detail="requieren atención"
              tone="terracotta"
              footer={
                <Link
                  href="/plan-semanal#alertas"
                  className="text-xs font-semibold text-terracotta hover:underline"
                >
                  {copy.summary.viewAlerts}
                </Link>
              }
            >
              <ul className="space-y-1 text-sm text-ink-soft">
                {alerts.slice(0, 2).map((a) => (
                  <li key={a.id} className="line-clamp-1">
                    · {a.title}
                  </li>
                ))}
              </ul>
            </ExecutiveMetricCard>
          </section>

          <section>
            <ReputationCenter showSidebar maxReviews={5} />
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <MirrorReportCard
              alignmentPercent={alignment}
              items={analysis.espejo}
            />
            <div className="space-y-4">
              <h2 className="font-display text-3xl font-semibold text-ink">
                {copy.summary.starProducts}
              </h2>
              {topProducts.length ? (
                topProducts.map((t) => (
                  <ProductStarCard
                    key={t.tema}
                    tema={t}
                    positivePercent={positivePercent}
                  />
                ))
              ) : (
                <p className="text-sm text-ink-soft">
                  Aún no hay productos estrella detectados.
                </p>
              )}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            <ConsultantCard />
            <BriefingCard
              summary={analysis.briefing}
              playing={playing}
              onToggle={playing ? stopBriefing : playBriefing}
              compact
            />
            <div className="rounded-[24px] border border-border bg-card/88 p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
                {copy.summary.evolution}
              </p>
              <div className="mt-4">
                <EvolutionChart series={evolution} />
              </div>
              <Link
                href="/evolucion"
                className="mt-4 inline-block text-sm font-semibold text-terracotta"
              >
                Ver evolución completa
              </Link>
            </div>
          </section>

          <section id="plan-preview" className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-display text-4xl font-semibold text-ink">
                {copy.summary.weeklyPlan}
              </h2>
              <Link
                href="/plan-semanal"
                className="text-sm font-semibold text-terracotta"
              >
                Ver plan operativo
              </Link>
            </div>
            <div className="space-y-4">
              {weeklyActions.map((action, index) => (
                <WeeklyActionCard key={action.id} action={action} index={index} />
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
