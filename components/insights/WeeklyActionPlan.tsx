"use client";

import React from "react";
import type { ActionUrgency, WeeklyAction } from "@/lib/analysis/generate-weekly-action-plan";

function urgencyTone(urgency: ActionUrgency) {
  switch (urgency) {
    case "high":
      return {
        badge: "bg-terracotta/12 text-terracotta",
        accent: "border-l-terracotta",
      };
    case "medium":
      return {
        badge: "bg-mustard/15 text-mustard",
        accent: "border-l-mustard",
      };
    default:
      return {
        badge: "bg-olive/15 text-olive",
        accent: "border-l-olive",
      };
  }
}

function urgencyLabel(urgency: ActionUrgency) {
  return urgency === "high" ? "ALTA" : urgency === "medium" ? "MEDIA" : "MANTENER";
}

function LoadingSkeleton() {
  return (
    <section className="rounded-[28px] border border-border bg-card p-4 shadow-[0_4px_20px_rgba(58,43,34,.04)]">
      <div className="h-6 w-44 rounded-full bg-cream-muted/80" />
      <div className="mt-2 h-4 w-72 max-w-full rounded-full bg-cream-muted/60" />
      <div className="mt-4 space-y-3">
        <div className="h-28 rounded-[22px] bg-cream-muted/40" />
        <div className="h-28 rounded-[22px] bg-cream-muted/40" />
        <div className="h-28 rounded-[22px] bg-cream-muted/40" />
      </div>
    </section>
  );
}

export function WeeklyActionPlanEmpty() {
  return (
    <section className="rounded-[28px] border border-border bg-card p-4 shadow-[0_4px_20px_rgba(58,43,34,.04)]">
      <p className="font-display text-2xl text-ink">Qué hacer esta semana</p>
      <p className="mt-1 text-sm text-ink-soft">
        Aún necesitamos más reseñas para generar acciones fiables.
      </p>
      <p className="mt-2 text-sm text-ink-soft">Actualiza reseñas o conecta más canales.</p>
    </section>
  );
}

export default function WeeklyActionPlan({
  actions,
  loading = false,
  error = null,
}: {
  actions: WeeklyAction[];
  loading?: boolean;
  error?: string | null;
}) {
  if (loading) return <LoadingSkeleton />;
  if (error) {
    return (
      <section className="rounded-[28px] border border-border bg-card p-4 shadow-[0_4px_20px_rgba(58,43,34,.04)]">
        <p className="font-display text-2xl text-ink">Qué hacer esta semana</p>
        <p className="mt-2 text-sm text-ink-soft">{error}</p>
        <p className="mt-2 text-sm text-ink-soft">Actualiza reseñas o conecta más canales.</p>
      </section>
    );
  }
  if (actions.length === 0) return <WeeklyActionPlanEmpty />;

  return (
    <section className="rounded-[28px] border border-border bg-card p-4 shadow-[0_4px_20px_rgba(58,43,34,.04)]">
      <div className="space-y-1.5">
        <p className="font-display text-2xl text-ink">Qué hacer esta semana</p>
        <p className="text-sm text-ink-soft">3 acciones concretas para mejorar la experiencia del cliente</p>
      </div>
      <div className="mt-4 space-y-3">
        {actions.map((action, idx) => {
          const tone = urgencyTone(action.urgency);
          return (
            <article
              key={action.id}
              className={[
                "rounded-[22px] border border-border bg-card p-4 shadow-[0_4px_20px_rgba(58,43,34,.04)]",
                idx === 0 && action.urgency === "high" ? `border-l-4 ${tone.accent}` : "",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold tracking-[0.22em] text-ink-soft">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <h3 className="min-w-0 flex-1 text-base font-semibold text-ink">{action.title}</h3>
                  </div>
                </div>
                <span className={["shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.16em]", tone.badge].join(" ")}>
                  {urgencyLabel(action.urgency)}
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-ink-soft">
                <span className="font-semibold text-ink">Por qué importa:</span> {action.reason}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-cream-muted px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-ink">
                  Impacto
                </span>
                <span className="text-sm text-ink">{action.impact}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-cream-muted px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-ink">
                  Tiempo
                </span>
                <span className="text-sm text-ink">{action.estimatedTime}</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
