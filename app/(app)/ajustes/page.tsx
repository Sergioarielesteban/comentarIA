"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { useApp } from "@/components/providers/app-provider";
import { useAnalysisRunner } from "@/hooks/use-analysis-runner";
import { clearAnalysisCache } from "@/lib/analysis/analyze-reviews";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { copy } from "@/lib/copy/es";
import { placeholders } from "@/lib/placeholders";

export default function AjustesPage() {
  const router = useRouter();
  const { place, clearLocalData, setReviews, persistRestaurant } = useApp();
  const { run, loading } = useAnalysisRunner();
  const [refreshing, setRefreshing] = useState(false);

  async function refreshReviews() {
    if (!place?.place_id && !place?.nombre) return;
    setRefreshing(true);
    const q = place.place_id || `${place.nombre} ${place.direccion || ""}`;
    const res = await fetch(`/api/reviews?query=${encodeURIComponent(q)}`);
    const data = await res.json();
    setRefreshing(false);
    if (res.ok && data.resenas) {
      await persistRestaurant(place, data.resenas);
      clearAnalysisCache();
      await run(true);
    }
  }

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearLocalData();
    router.replace("/login");
    router.refresh();
  }

  function resetOnboarding() {
    clearLocalData();
    clearAnalysisCache();
    router.replace("/onboarding");
    router.refresh();
  }

  const actions = [
    {
      label: copy.settings.regenerate,
      onClick: () => run(true),
      disabled: loading,
    },
    {
      label: copy.settings.refreshReviews,
      onClick: refreshReviews,
      disabled: refreshing,
    },
    {
      label: copy.settings.changeRestaurant,
      onClick: resetOnboarding,
    },
    {
      label: copy.settings.resetOnboarding,
      onClick: resetOnboarding,
      variant: "ghost" as const,
    },
    {
      label: copy.settings.logout,
      onClick: logout,
      variant: "danger" as const,
    },
  ];

  return (
    <PageShell title={copy.settings.title} subtitle={place?.nombre}>
      <Card className="mb-4">
        <p className="text-sm text-ink">{place?.nombre}</p>
        <p className="text-xs text-ink-soft">{place?.direccion}</p>
        {place?.rating ? (
          <p className="mt-2 text-sm text-olive">
            ★ {place.rating} · {place.total?.toLocaleString("es")} reseñas
          </p>
        ) : null}
      </Card>

      <Link href="/informe/pdf">
        <Button variant="secondary" fullWidth className="mb-3">
          {copy.settings.pdf}
        </Button>
      </Link>

      <div className="space-y-2">
        {actions.map((a) => (
          <Button
            key={a.label}
            variant={a.variant || "secondary"}
            fullWidth
            onClick={a.onClick}
            disabled={a.disabled}
          >
            {a.label}
          </Button>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-ink-soft">
        {copy.brand.footer}
      </p>
      <p className="mt-2 text-center text-[10px] text-ink-soft/80">
        {placeholders.manualReviewPaste}
      </p>
    </PageShell>
  );
}
