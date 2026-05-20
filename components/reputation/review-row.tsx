"use client";

import { PlatformBadge } from "@/components/reviews/platform-badge";
import type { ReviewRow } from "@/lib/types/reviews-platform";

function formatRelative(iso: string | null) {
  if (!iso) return "";
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Hoy";
    if (days === 1) return "Ayer";
    if (days < 7) return `Hace ${days} días`;
    return new Intl.DateTimeFormat("es", { day: "numeric", month: "short" }).format(
      new Date(iso),
    );
  } catch {
    return "";
  }
}

function sentimentBadge(sentiment: string | null, rating: number | null) {
  const s = sentiment?.toLowerCase();
  if (s?.includes("pos") || (rating !== null && rating >= 4))
    return { label: "Positiva", className: "bg-olive/10 text-olive" };
  if (s?.includes("neg") || (rating !== null && rating <= 2))
    return { label: "Negativa", className: "bg-terracotta/10 text-terracotta" };
  return { label: "Neutra", className: "bg-mustard/12 text-mustard" };
}

function Stars({ rating }: { rating: number | null }) {
  const n = rating ?? 0;
  return (
    <span className="text-mustard text-sm" aria-label={`${n} estrellas`}>
      {"★".repeat(n)}
      <span className="text-border/80">{"★".repeat(5 - n)}</span>
    </span>
  );
}

export function ReviewRowItem({
  review,
  onRespond,
  onMenu,
}: {
  review: ReviewRow;
  onRespond: (review: ReviewRow) => void;
  onMenu?: (review: ReviewRow) => void;
}) {
  const badge = sentimentBadge(review.sentiment, review.rating);
  const urgent =
    !review.replied && review.rating !== null && review.rating <= 2;

  return (
    <article className="rounded-[20px] border border-border bg-card/90 p-4 transition hover:bg-card sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <PlatformBadge platform={review.platform} />
          <span className="font-semibold text-ink">
            {review.author_name ?? "Cliente"}
          </span>
          <Stars rating={review.rating} />
        </div>
        <time className="font-mono text-[10px] text-ink-soft">
          {formatRelative(review.review_date)}
        </time>
      </div>

      <p className="mt-3 text-sm leading-6 text-ink line-clamp-3">
        {review.text || "Sin comentario de texto."}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <span
          className={[
            "rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]",
            badge.className,
          ].join(" ")}
        >
          {badge.label}
        </span>
        <div className="flex items-center gap-2">
          {urgent ? (
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-terracotta">
              Riesgo alto
            </span>
          ) : null}
          {!review.replied ? (
            <button
              type="button"
              onClick={() => onRespond(review)}
              className="inline-flex items-center gap-1.5 rounded-full bg-terracotta px-4 py-2 text-xs font-semibold text-white hover:bg-terracotta-dark"
            >
              <SparkleIcon />
              Responder
            </button>
          ) : (
            <span className="rounded-full bg-olive/10 px-3 py-1 text-xs font-semibold text-olive">
              Respondida
            </span>
          )}
          {onMenu ? (
            <button
              type="button"
              onClick={() => onMenu(review)}
              aria-label="Más acciones"
              className="grid h-9 w-9 place-items-center rounded-full border border-border text-ink-soft hover:text-ink"
            >
              ⋯
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function SparkleIcon() {
  return (
    <svg
      aria-hidden
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2l1.4 4.3H18l-3.5 2.5 1.4 4.2L12 10.5 8.1 13l1.4-4.2L6 6.3h4.6L12 2z" />
    </svg>
  );
}
