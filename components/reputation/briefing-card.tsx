"use client";

import Link from "next/link";

export function BriefingCard({
  summary,
  duration = "3 min",
  playing,
  onToggle,
  compact = false,
}: {
  summary?: string;
  duration?: string;
  playing?: boolean;
  onToggle?: () => void;
  compact?: boolean;
}) {
  const excerpt = summary
    ? summary.slice(0, compact ? 120 : 200) + (summary.length > (compact ? 120 : 200) ? "…" : "")
    : null;

  return (
    <article
      className={[
        "rounded-[24px] border border-border bg-card/88 p-5",
        compact ? "" : "sm:p-6",
      ].join(" ")}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-terracotta">
        Briefing de la semana
      </p>
      <p className="mt-2 font-mono text-[10px] text-ink-soft">
        Duración estimada · {duration}
      </p>

      <div className="mt-5 flex items-center gap-4">
        <button
          type="button"
          onClick={onToggle}
          disabled={!summary || !onToggle}
          aria-label={playing ? "Pausar briefing" : "Reproducir briefing"}
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-ink text-cream transition hover:bg-terracotta disabled:opacity-40"
        >
          {playing ? "❚❚" : "▶"}
        </button>
        <div
          className="flex h-10 flex-1 items-end gap-1"
          aria-hidden
        >
          {Array.from({ length: 24 }).map((_, i) => (
            <span
              key={i}
              className={[
                "w-1 rounded-full bg-terracotta/30",
                playing ? "animate-pulse bg-terracotta/70" : "",
              ].join(" ")}
              style={{ height: `${20 + ((i * 7) % 28)}%` }}
            />
          ))}
        </div>
      </div>

      {excerpt ? (
        <p className="mt-5 text-sm leading-6 text-ink-soft">{excerpt}</p>
      ) : (
        <p className="mt-5 text-sm text-ink-soft">
          Genera un análisis para preparar tu briefing ejecutivo.
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        {onToggle && summary ? (
          <button
            type="button"
            onClick={onToggle}
            className="rounded-full bg-terracotta px-5 py-2.5 text-sm font-semibold text-white hover:bg-terracotta-dark"
          >
            {playing ? "Pausar" : "Escuchar briefing"}
          </button>
        ) : null}
        <Link
          href="/audio"
          className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-cream"
        >
          Ver texto completo
        </Link>
      </div>
    </article>
  );
}
