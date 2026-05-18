"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import type { ActionUrgency, WeeklyAction } from "@/lib/analysis/generate-weekly-action-plan";
import type { Analysis, EspejoItem, Place } from "@/lib/types";

type Tone = "terracotta" | "mustard" | "olive";

const toneStyles: Record<Tone, { accent: string; soft: string; text: string; border: string }> = {
  terracotta: {
    accent: "bg-terracotta",
    soft: "bg-terracotta/10",
    text: "text-terracotta",
    border: "border-l-terracotta",
  },
  mustard: {
    accent: "bg-mustard",
    soft: "bg-mustard/12",
    text: "text-mustard",
    border: "border-l-mustard",
  },
  olive: {
    accent: "bg-olive",
    soft: "bg-olive/10",
    text: "text-olive",
    border: "border-l-olive",
  },
};

function actionTone(urgency: ActionUrgency): Tone {
  if (urgency === "high") return "terracotta";
  if (urgency === "medium") return "mustard";
  return "olive";
}

function actionLabel(urgency: ActionUrgency) {
  if (urgency === "high") return "ALTA prioridad";
  if (urgency === "medium") return "Prioridad media";
  return "Mantener";
}

export function PremiumSectionTitle({
  eyebrow,
  title,
  body,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="space-y-1.5">
      {eyebrow ? (
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-terracotta">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display text-[2rem] font-semibold leading-none text-ink sm:text-5xl">
        {title}
      </h2>
      {body ? <p className="max-w-2xl text-sm leading-6 text-ink-soft">{body}</p> : null}
    </div>
  );
}

export function HeroSummaryCard({
  reviewsTotal,
  restaurantName,
}: {
  reviewsTotal: number;
  restaurantName?: string;
}) {
  return (
    <section className="fade-in overflow-hidden rounded-[28px] bg-[#211814] text-white">
      <div className="grid min-h-[430px] md:grid-cols-[1.05fr_.95fr]">
        <div className="relative z-10 flex flex-col justify-between gap-10 p-7 sm:p-10">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-white/62">
              Resumen semanal
            </p>
            <h1 className="mt-5 max-w-xl font-display text-5xl font-semibold leading-[.9] tracking-normal text-white sm:text-7xl">
              Lo más importante de tus clientes
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-white/72">
              Analizamos {reviewsTotal.toLocaleString("es")} reseñas y detectamos patrones que te ayudan a tomar mejores decisiones esta semana.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <a
              href="#resumen-completo"
              className="inline-flex w-fit items-center justify-center rounded-full bg-terracotta px-5 py-3 text-sm font-semibold text-white transition hover:bg-terracotta-dark"
            >
              Ver resumen completo
            </a>
            <p className="text-sm text-white/54">{restaurantName || "Restaurante conectado"}</p>
          </div>
        </div>
        <div className="relative min-h-[260px] md:min-h-full">
          <Image
            src="/restaurant-hero.png"
            alt=""
            fill
            priority
            sizes="(min-width: 768px) 45vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(33,24,20,.82),rgba(33,24,20,.12)_45%,rgba(33,24,20,.2)),linear-gradient(0deg,rgba(196,83,31,.22),rgba(247,243,238,.04))]" />
        </div>
      </div>
    </section>
  );
}

export function WeeklyActionCard({
  action,
  index,
}: {
  action: WeeklyAction;
  index: number;
}) {
  const tone = toneStyles[actionTone(action.urgency)];
  return (
    <article
      className={[
        "group rounded-[24px] border border-border bg-card/88 p-5 transition duration-300 hover:-translate-y-0.5 hover:bg-card",
        "border-l-4",
        tone.border,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-5">
        <p className="font-mono text-xs tracking-[0.22em] text-ink-soft">
          {String(index + 1).padStart(2, "0")}
        </p>
        <span className={["rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em]", tone.soft, tone.text].join(" ")}>
          {actionLabel(action.urgency)}
        </span>
      </div>
      <h3 className="mt-4 max-w-2xl font-display text-3xl font-semibold leading-none text-ink">
        {action.title}
      </h3>
      <div className="mt-5 grid gap-4 text-sm leading-6 text-ink-soft md:grid-cols-[1.3fr_.7fr]">
        <p>
          <span className="font-semibold text-ink">Por qué importa:</span> {action.reason}
        </p>
        <div className="space-y-2">
          <MetaLine label="Impacto" value={action.impact} />
          <MetaLine label="Tiempo estimado" value={action.estimatedTime} />
        </div>
      </div>
    </article>
  );
}

function MetaLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft/80">
        {label}
      </span>
      <span className="text-ink">{value}</span>
    </p>
  );
}

export function OpportunityCard({
  kind,
  title,
  body,
  tone = "terracotta",
  children,
}: {
  kind: string;
  title: string;
  body: string;
  tone?: Tone;
  children?: ReactNode;
}) {
  const styles = toneStyles[tone];
  return (
    <article className="rounded-[26px] border border-border bg-card/82 p-5 transition duration-300 hover:-translate-y-0.5">
      <div className="flex items-center gap-3">
        <span className={["h-2.5 w-2.5 rounded-full", styles.accent].join(" ")} />
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-soft">
          {kind}
        </p>
      </div>
      <h3 className="mt-5 font-display text-3xl font-semibold leading-none text-ink">{title}</h3>
      <p className="mt-4 text-sm leading-6 text-ink-soft">{body}</p>
      {children ? <div className="mt-5">{children}</div> : null}
    </article>
  );
}

export function EditorialMetric({
  label,
  value,
  detail,
  tone = "terracotta",
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: Tone;
}) {
  return (
    <div className="min-w-0 border-t border-border pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">{label}</p>
      <p className={["mt-3 font-display text-5xl font-semibold leading-none", toneStyles[tone].text].join(" ")}>
        {value}
      </p>
      {detail ? <p className="mt-2 text-sm leading-5 text-ink-soft">{detail}</p> : null}
    </div>
  );
}

export function RestaurantStatus({
  place,
  score,
  healthLabel,
  positivePercent,
}: {
  place: Place | null;
  score: number;
  healthLabel: string;
  positivePercent: number;
}) {
  return (
    <section id="resumen-completo" className="rounded-[28px] border border-border bg-card/72 p-6">
      <div className="grid gap-7 md:grid-cols-[1.05fr_repeat(4,1fr)] md:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-terracotta">
            Estado del restaurante
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-none text-ink">
            {place?.nombre || "Tu restaurante"}
          </h2>
          {place?.direccion ? <p className="mt-2 text-sm text-ink-soft">{place.direccion}</p> : null}
        </div>
        <EditorialMetric label="Reputación" value={`${score}`} detail="/100" />
        <EditorialMetric label="Reseñas nuevas" value={(place?.total ?? 0).toLocaleString("es")} detail="base analizada" tone="mustard" />
        <EditorialMetric label="% positivas" value={`${positivePercent}%`} detail="señales favorables" tone="olive" />
        <EditorialMetric label="Salud general" value={healthLabel} detail="lectura semanal" tone={score >= 75 ? "olive" : score >= 55 ? "mustard" : "terracotta"} />
      </div>
    </section>
  );
}

export function ConsultantPromptChip({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-border bg-card/70 px-4 py-2 text-left text-sm text-ink transition hover:border-terracotta/30 hover:bg-card"
    >
      {children}
    </button>
  );
}

export function BriefingCard({
  briefing,
  playing,
  onToggle,
}: {
  briefing?: string;
  playing: boolean;
  onToggle: () => void;
}) {
  const today = new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <section className="rounded-[28px] border border-border bg-card/82 p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-terracotta">
        Briefing ejecutivo semanal
      </p>
      <h1 className="mt-4 font-display text-5xl font-semibold leading-none text-ink">
        Lectura de reputación para esta semana
      </h1>
      <p className="mt-3 text-sm text-ink-soft">{today} · duración estimada 3 min</p>
      {briefing ? (
        <>
          <p className="mt-8 max-w-3xl font-display text-3xl leading-[1.08] text-ink">
            {briefing.slice(0, 260)}
            {briefing.length > 260 ? "..." : ""}
          </p>
          <button
            type="button"
            onClick={onToggle}
            className="mt-8 inline-flex items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-semibold text-cream transition hover:bg-terracotta"
          >
            {playing ? "Pausar briefing" : "Escuchar briefing"}
          </button>
        </>
      ) : (
        <p className="mt-8 text-sm leading-6 text-ink-soft">
          Genera primero un análisis para preparar el briefing ejecutivo de la semana.
        </p>
      )}
    </section>
  );
}

export function MirrorInsightCard({ item }: { item: EspejoItem }) {
  const tone: Tone =
    item.alineacion === "alta" ? "olive" : item.alineacion === "media" ? "mustard" : "terracotta";
  return (
    <article className="rounded-[26px] border border-border bg-card/82 p-5">
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-soft">
          {item.menciones} menciones
        </p>
        <span className={["rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em]", toneStyles[tone].soft, toneStyles[tone].text].join(" ")}>
          {item.alineacion === "alta" ? "Alineado" : item.alineacion === "media" ? "Brecha leve" : "Punto ciego"}
        </span>
      </div>
      <h3 className="mt-5 font-display text-3xl font-semibold leading-none text-ink">{item.tema}</h3>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Perspective label="Percepción interna" text={item.dueno} />
        <Perspective label="Realidad del cliente" text={item.clientes} highlighted />
      </div>
      <p className="mt-5 text-sm leading-6 text-ink-soft">{item.consejo}</p>
    </article>
  );
}

function Perspective({
  label,
  text,
  highlighted = false,
}: {
  label: string;
  text: string;
  highlighted?: boolean;
}) {
  return (
    <div className={["rounded-[18px] p-4", highlighted ? "bg-terracotta/7" : "bg-cream-muted/45"].join(" ")}>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">{label}</p>
      <p className="mt-3 text-sm leading-6 text-ink">{text}</p>
    </div>
  );
}

export function positivePercentFromAnalysis(analysis: Analysis | null) {
  if (!analysis) return 0;
  const positives = analysis.temasPositivos.reduce((sum, item) => sum + item.menciones, 0);
  const negatives = analysis.temasNegativos.reduce((sum, item) => sum + item.menciones, 0);
  const total = positives + negatives;
  if (!total) return 0;
  return Math.round((positives / total) * 100);
}
