"use client";

import { PlatformBadge } from "@/components/reviews/platform-badge";
import type { ReviewRow } from "@/lib/types/reviews-platform";

function formatDate(iso: string | null) {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("es", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

function Stars({ rating }: { rating: number | null }) {
  const n = rating ?? 0;
  return (
    <span className="text-mustard" aria-label={`${n} estrellas`}>
      {"★".repeat(n)}
      <span className="text-border">{"★".repeat(5 - n)}</span>
    </span>
  );
}

export function ReviewCard({
  review,
  onRespond,
}: {
  review: ReviewRow;
  onRespond: (review: ReviewRow) => void;
}) {
  const urgent =
    !review.replied && review.rating !== null && review.rating <= 2;

  return (
    <article className="rounded-[24px] border border-border bg-card/90 p-5 transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-24px_rgba(28,26,24,0.15)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <PlatformBadge platform={review.platform} />
          {urgent ? (
            <span className="rounded-full bg-terracotta/12 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-terracotta">
              Urgente
            </span>
          ) : null}
          {review.replied ? (
            <span className="rounded-full bg-olive/12 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-olive">
              Respondida
            </span>
          ) : (
            <span className="rounded-full bg-mustard/12 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-mustard">
              Sin responder
            </span>
          )}
        </div>
        <time className="font-mono text-[10px] text-ink-soft">
          {formatDate(review.review_date)}
        </time>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="font-semibold text-ink">
          {review.author_name ?? "Cliente"}
        </p>
        <Stars rating={review.rating} />
      </div>

      <p className="mt-3 text-sm leading-6 text-ink-soft">
        {review.text || "Sin comentario de texto."}
      </p>

      {review.reply_text ? (
        <div className="mt-4 rounded-[16px] border border-border/80 bg-cream/60 p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
            Tu respuesta
          </p>
          <p className="mt-2 text-sm leading-6 text-ink">{review.reply_text}</p>
        </div>
      ) : null}

      {!review.replied ? (
        <button
          type="button"
          onClick={() => onRespond(review)}
          className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-terracotta px-4 py-3 text-sm font-semibold text-white transition hover:bg-terracotta-dark sm:w-auto"
        >
          Responder
        </button>
      ) : null}
    </article>
  );
}
