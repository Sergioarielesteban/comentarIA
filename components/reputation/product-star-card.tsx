"use client";

import type { TemaPositivo } from "@/lib/types";

export function ProductStarCard({
  tema,
  positivePercent,
}: {
  tema: TemaPositivo;
  positivePercent: number;
}) {
  return (
    <article className="rounded-[22px] border border-border bg-card/85 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-olive">
            Producto estrella
          </p>
          <h3 className="mt-2 font-display text-2xl font-semibold leading-none text-ink">
            {tema.tema}
          </h3>
        </div>
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[16px] bg-olive/10 font-display text-xl text-olive">
          ★
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <p>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
            Menciones
          </span>
          <span className="ml-2 font-semibold text-ink">{tema.menciones}</span>
        </p>
        <p>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
            Positivas
          </span>
          <span className="ml-2 font-semibold text-olive">{positivePercent}%</span>
        </p>
      </div>
      <p className="mt-3 text-sm leading-6 text-ink-soft">{tema.accion}</p>
    </article>
  );
}
