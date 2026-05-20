"use client";

import type { AlertLevel, ReputationAlert } from "@/lib/analysis/alerts";

const levelStyles: Record<
  AlertLevel,
  { dot: string; badge: string; badgeText: string }
> = {
  high: {
    dot: "bg-terracotta",
    badge: "bg-terracotta/10",
    badgeText: "text-terracotta",
  },
  medium: {
    dot: "bg-mustard",
    badge: "bg-mustard/12",
    badgeText: "text-mustard",
  },
  opportunity: {
    dot: "bg-olive",
    badge: "bg-olive/10",
    badgeText: "text-olive",
  },
  maintain: {
    dot: "bg-ink-soft/40",
    badge: "bg-cream-muted",
    badgeText: "text-ink-soft",
  },
};

const levelLabel: Record<AlertLevel, string> = {
  high: "Riesgo alto",
  medium: "Riesgo medio",
  opportunity: "Oportunidad",
  maintain: "Mantener",
};

export function AlertCard({ alert }: { alert: ReputationAlert }) {
  const styles = levelStyles[alert.level];
  return (
    <article className="rounded-[20px] border border-border bg-card/80 p-4">
      <div className="flex items-start gap-3">
        <span
          className={["mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", styles.dot].join(
            " ",
          )}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-ink">{alert.title}</h3>
            <span
              className={[
                "rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em]",
                styles.badge,
                styles.badgeText,
              ].join(" ")}
            >
              {levelLabel[alert.level]}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-ink-soft">{alert.description}</p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
            {alert.mentions} menciones · {alert.priority}
          </p>
          <p className="mt-2 text-sm text-ink">
            <span className="font-semibold">Acción:</span> {alert.recommendedAction}
          </p>
        </div>
      </div>
    </article>
  );
}
