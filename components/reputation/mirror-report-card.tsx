"use client";

import Link from "next/link";
import type { EspejoItem } from "@/lib/types";

function alignmentBadge(alineacion: EspejoItem["alineacion"]) {
  if (alineacion === "alta")
    return { label: "Alineado", className: "bg-olive/10 text-olive" };
  if (alineacion === "media")
    return { label: "Brecha leve", className: "bg-mustard/12 text-mustard" };
  return { label: "Brecha alta", className: "bg-terracotta/10 text-terracotta" };
}

export function MirrorReportCard({
  alignmentPercent,
  items,
}: {
  alignmentPercent: number;
  items: EspejoItem[];
}) {
  const grouped = {
    alta: items.filter((i) => i.alineacion === "alta").slice(0, 1),
    media: items.filter((i) => i.alineacion === "media").slice(0, 1),
    baja: items.filter((i) => i.alineacion === "baja").slice(0, 1),
  };

  const cards = [
    { key: "alta" as const, title: "Alineados", list: grouped.alta },
    { key: "media" as const, title: "Brecha leve", list: grouped.media },
    { key: "baja" as const, title: "Brecha alta", list: grouped.baja },
  ];

  return (
    <section className="rounded-[28px] border border-border bg-card/78 p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-terracotta">
            Informe espejo
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-none text-ink">
            Alineación dueño–clientes
          </h2>
        </div>
        <p className="font-display text-6xl font-semibold leading-none text-terracotta">
          {alignmentPercent}%
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {cards.map((group) => {
          const item = group.list[0];
          const badge = item ? alignmentBadge(item.alineacion) : null;
          return (
            <article
              key={group.key}
              className="rounded-[22px] border border-border bg-cream/40 p-4"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                {group.title}
              </p>
              {item && badge ? (
                <>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <h3 className="font-display text-2xl font-semibold text-ink">
                      {item.tema}
                    </h3>
                    <span
                      className={[
                        "rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em]",
                        badge.className,
                      ].join(" ")}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <p className="mt-3 text-xs font-semibold text-ink">Tú crees</p>
                  <p className="text-sm leading-6 text-ink-soft">{item.dueno}</p>
                  <p className="mt-3 text-xs font-semibold text-ink">
                    Tus clientes dicen
                  </p>
                  <p className="text-sm leading-6 text-ink">{item.clientes}</p>
                  <p className="mt-3 text-sm text-ink-soft">{item.consejo}</p>
                </>
              ) : (
                <p className="mt-4 text-sm text-ink-soft">
                  Sin datos en esta categoría todavía.
                </p>
              )}
            </article>
          );
        })}
      </div>

      <Link
        href="/espejo"
        className="mt-6 inline-flex rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-terracotta/30"
      >
        Ver informe completo
      </Link>
    </section>
  );
}
