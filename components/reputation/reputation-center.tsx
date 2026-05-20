"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SectionTitle } from "@/components/reputation/section-title";
import { ReviewRowItem } from "@/components/reputation/review-row";
import { SentimentDonut } from "@/components/reputation/sentiment-donut";
import { TopicsChart } from "@/components/reputation/topics-chart";
import { ReviewReplyPanel } from "@/components/reviews/review-reply-panel";
import { Spinner } from "@/components/ui/spinner";
import { useApp } from "@/components/providers/app-provider";
import { copy } from "@/lib/copy/es";
import type { ReviewFilter, ReviewPlatform, ReviewRow } from "@/lib/types/reviews-platform";

const FILTERS: { id: ReviewFilter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "unanswered", label: "Sin responder" },
  { id: "negative", label: "Negativas" },
  { id: "urgent", label: "Riesgo alto" },
  { id: "five_star", label: "5 estrellas" },
];

const PLATFORMS: { id: ReviewPlatform | "all"; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "google", label: "Google" },
  { id: "tripadvisor", label: "TripAdvisor" },
  { id: "thefork", label: "TheFork" },
  { id: "booking", label: "Booking" },
];

export function ReputationCenter({
  title,
  showSidebar = true,
  maxReviews = 80,
}: {
  title?: string;
  showSidebar?: boolean;
  maxReviews?: number;
}) {
  const pathname = usePathname();
  const { analysis } = useApp();
  const isFullList = pathname === "/resenas" || maxReviews > 50;
  const [filter, setFilter] = useState<ReviewFilter>("unanswered");
  const [platform, setPlatform] = useState<ReviewPlatform | "all">("all");
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [needsConnection, setNeedsConnection] = useState(false);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [activeReview, setActiveReview] = useState<ReviewRow | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const load = useCallback(async (f: ReviewFilter) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews/inbox?filter=${f}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message);
      setReviews((data.reviews ?? []).slice(0, maxReviews));
      setNeedsConnection(Boolean(data.needsConnection));
      setLocationName(data.location?.name ?? null);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [maxReviews]);

  useEffect(() => {
    void load(filter);
  }, [filter, load]);

  const filteredReviews = useMemo(() => {
    if (platform === "all") return reviews;
    return reviews.filter((r) => r.platform === platform);
  }, [reviews, platform]);

  async function sync() {
    setSyncing(true);
    try {
      const res = await fetch("/api/reviews/sync", { method: "POST" });
      if (res.ok) await load(filter);
    } finally {
      setSyncing(false);
    }
  }

  if (needsConnection) {
    return (
      <section className="rounded-[28px] border border-border bg-card/90 p-8 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-terracotta">
          Centro de reputación
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold text-ink">
          Conecta Google Business
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-ink-soft">
          {copy.reputation.connectHint}
        </p>
        <Link
          href="/conectar-google"
          className="mt-8 inline-flex rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-white hover:bg-terracotta-dark"
        >
          Conectar Google Business
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionTitle
          eyebrow="Centro de reputación"
          title={title ?? locationName ?? copy.reputation.title}
          body={copy.reputation.subtitle}
        />
        <button
          type="button"
          onClick={() => void sync()}
          disabled={syncing}
          className="rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-cream disabled:opacity-50"
        >
          {syncing ? "Sincronizando…" : copy.summary.syncReviews}
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={[
              "shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition",
              filter === f.id
                ? "bg-terracotta text-white"
                : "border border-border bg-card text-ink-soft hover:text-ink",
            ].join(" ")}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPlatform(p.id)}
            className={[
              "shrink-0 rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] transition",
              platform === p.id
                ? "bg-ink text-cream"
                : "border border-border bg-card text-ink-soft",
            ].join(" ")}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div
        className={[
          "grid gap-6",
          showSidebar ? "lg:grid-cols-[1fr_280px]" : "",
        ].join(" ")}
      >
        <div className="space-y-3">
          {loading ? (
            <Spinner label="Cargando reseñas…" />
          ) : filteredReviews.length === 0 ? (
            <p className="rounded-[24px] border border-dashed border-border bg-card/60 p-8 text-center text-sm text-ink-soft">
              No hay reseñas con este filtro.
            </p>
          ) : (
            filteredReviews.map((r) => (
              <ReviewRowItem
                key={r.id}
                review={r}
                onRespond={(review) => {
                  setActiveReview(review);
                  setPanelOpen(true);
                }}
              />
            ))
          )}
          {!loading && filteredReviews.length > 0 && !isFullList ? (
            <Link
              href="/resenas"
              className="block text-center text-sm font-semibold text-terracotta hover:underline"
            >
              Ver todas las reseñas
            </Link>
          ) : null}
        </div>

        {showSidebar ? (
          <aside className="space-y-5">
            <div className="rounded-[22px] border border-border bg-card/85 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                Sentimiento
              </p>
              <div className="mt-4">
                <SentimentDonut analysis={analysis} />
              </div>
            </div>
            <div className="rounded-[22px] border border-border bg-card/85 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                Temas más mencionados
              </p>
              <div className="mt-4">
                <TopicsChart analysis={analysis} />
              </div>
            </div>
          </aside>
        ) : null}
      </div>

      <ReviewReplyPanel
        review={activeReview}
        open={panelOpen}
        onClose={() => {
          setPanelOpen(false);
          setActiveReview(null);
        }}
        onSaved={() => void load(filter)}
      />
    </div>
  );
}
