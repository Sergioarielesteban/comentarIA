"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { SectionTitle } from "@/components/reputation";
import { ReviewReplyPanel } from "@/components/reviews/review-reply-panel";
import { ReviewRowItem } from "@/components/reputation/review-row";
import { Spinner } from "@/components/ui/spinner";
import { copy } from "@/lib/copy/es";
import type { ReviewRow } from "@/lib/types/reviews-platform";

export default function RespuestasPage() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeReview, setActiveReview] = useState<ReviewRow | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reviews/inbox?filter=unanswered");
      const data = await res.json();
      if (res.ok) setReviews(data.reviews ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <PageShell>
      <div className="space-y-6">
        <SectionTitle
          eyebrow="Gestión de respuestas"
          title={copy.replies.title}
          body={copy.replies.subtitle}
        />

        {loading ? (
          <Spinner label="Cargando…" />
        ) : reviews.length === 0 ? (
          <p className="rounded-[24px] border border-dashed border-border bg-card/60 p-8 text-center text-sm text-ink-soft">
            {copy.replies.empty}{" "}
            <Link href="/centro" className="font-semibold text-terracotta">
              Ir al centro de reputación
            </Link>
          </p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <ReviewRowItem
                key={r.id}
                review={r}
                onRespond={(review) => {
                  setActiveReview(review);
                  setPanelOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      <ReviewReplyPanel
        review={activeReview}
        open={panelOpen}
        onClose={() => {
          setPanelOpen(false);
          setActiveReview(null);
        }}
        onSaved={() => void load()}
      />
    </PageShell>
  );
}
