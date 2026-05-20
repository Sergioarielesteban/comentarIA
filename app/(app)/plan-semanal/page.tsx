"use client";

import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { useApp } from "@/components/providers/app-provider";
import { AlertCard, SectionTitle, WeeklyActionCard } from "@/components/reputation";
import { buildReputationAlerts } from "@/lib/analysis/alerts";
import { generateWeeklyActionPlan } from "@/lib/analysis/generate-weekly-action-plan";
import { copy } from "@/lib/copy/es";

export default function PlanSemanalPage() {
  const { analysis } = useApp();
  const actions = generateWeeklyActionPlan(analysis);
  const alerts = buildReputationAlerts(analysis);

  return (
    <PageShell>
      <div className="space-y-10">
        <SectionTitle
          eyebrow="Plan operativo"
          title={copy.weeklyPlan.title}
          body={copy.weeklyPlan.subtitle}
        />

        {!analysis ? (
          <p className="rounded-[24px] border border-dashed border-border bg-card/60 p-8 text-center text-sm text-ink-soft">
            {copy.summary.noAnalysis}{" "}
            <Link href="/insights" className="font-semibold text-terracotta">
              Ir al resumen
            </Link>
          </p>
        ) : (
          <>
            <section className="space-y-4">
              {actions.map((action, index) => (
                <WeeklyActionCard key={action.id} action={action} index={index} />
              ))}
            </section>

            <section id="alertas" className="space-y-4">
              <SectionTitle
                eyebrow="Riesgos y oportunidades"
                title={copy.summary.activeAlerts}
              />
              {alerts.length ? (
                alerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)
              ) : (
                <p className="text-sm text-ink-soft">
                  No hay alertas activas esta semana.
                </p>
              )}
            </section>
          </>
        )}
      </div>
    </PageShell>
  );
}
