"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { useApp } from "@/components/providers/app-provider";
import { useAnalysisRunner } from "@/hooks/use-analysis-runner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { copy } from "@/lib/copy/es";

export default function AjustesPage() {
  const router = useRouter();
  const { place, clearLocalState, refresh } = useApp();
  const { run, loading } = useAnalysisRunner();
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function refreshReviews() {
    setRefreshing(true);
    setNotice(null);
    const res = await fetch("/api/reviews", { method: "POST" });
    const data = await res.json();
    setRefreshing(false);
    if (!res.ok) {
      setNotice(data?.error?.message || copy.errors.generic);
      return;
    }
    await refresh();
    // tras refrescar reseñas, intentamos regenerar análisis (respetando caché/límite)
    const result = await run(true);
    if (result?.limitReached) {
      setNotice(copy.chat.limitReached);
    }
  }

  async function regenerate() {
    setNotice(null);
    const result = await run(true);
    if (result?.limitReached) {
      setNotice(copy.chat.limitReached);
    } else if (result?.cached) {
      setNotice(copy.settings.analysisUpToDate);
    }
  }

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearLocalState();
    router.replace("/login");
    router.refresh();
  }

  const showDevActions = process.env.NODE_ENV === "development";

  return (
    <PageShell>
      <div className="mb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-terracotta">
          {copy.settings.title}
        </p>
        <h1 className="mt-3 font-display text-5xl font-semibold leading-none text-ink">
          Preferencias del restaurante
        </h1>
      </div>

      <Card className="mb-4">
        <p className="text-sm text-ink">{place?.nombre}</p>
        <p className="text-xs text-ink-soft">{place?.direccion}</p>
        {place?.rating ? (
          <p className="mt-2 text-sm text-olive">
            ★ {place.rating} · {place.total?.toLocaleString("es")} reseñas
          </p>
        ) : null}
        <p className="mt-3 text-[11px] leading-5 text-ink-soft">
          {copy.settings.lockedLine}
        </p>
      </Card>

      <Link href="/informe/pdf">
        <Button variant="secondary" fullWidth className="mb-3">
          {copy.settings.pdf}
        </Button>
      </Link>

      <div className="space-y-2">
        <Button
          variant="secondary"
          fullWidth
          onClick={regenerate}
          disabled={loading}
        >
          {copy.settings.regenerate}
        </Button>
        <Button
          variant="secondary"
          fullWidth
          onClick={refreshReviews}
          disabled={refreshing}
        >
          {copy.settings.refreshReviews}
        </Button>
        <Button variant="danger" fullWidth onClick={logout}>
          {copy.settings.logout}
        </Button>
      </div>

      {notice ? (
        <p className="mt-4 rounded-xl bg-mustard/10 px-3 py-2 text-center text-sm text-ink">
          {notice}
        </p>
      ) : null}

      {showDevActions ? (
        <p className="mt-6 text-center text-[10px] uppercase tracking-[0.2em] text-ink-soft/70">
          Modo desarrollo · acciones de admin disponibles vía consola
        </p>
      ) : null}

      <p className="mt-8 text-center text-xs text-ink-soft">
        {copy.brand.footer}
      </p>
    </PageShell>
  );
}
