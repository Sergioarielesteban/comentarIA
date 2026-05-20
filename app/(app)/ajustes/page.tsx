"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { useApp } from "@/components/providers/app-provider";
import { useAnalysisRunner } from "@/hooks/use-analysis-runner";
import { ComentarIALogo } from "@/components/brand/comentaria-logo";
import { RestaurantAvatar } from "@/components/restaurant/restaurant-avatar";
import { RestaurantCover } from "@/components/restaurant/restaurant-cover";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UploadRestaurantCover } from "@/components/settings/upload-restaurant-cover";
import { copy } from "@/lib/copy/es";

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-terracotta">
        {title}
      </p>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

export default function AjustesPage() {
  const router = useRouter();
  const { place, clearLocalState, refresh } = useApp();
  const { run, loading } = useAnalysisRunner();
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    void createClient()
      .auth.getUser()
      .then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

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

  return (
    <PageShell>
      <Card className="overflow-hidden p-0">
        <div className="relative min-h-[160px]">
          <RestaurantCover
            src={place?.cover_image_url}
            alt={place?.nombre ?? "Restaurante"}
            layout="fill"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2A211B]/92 via-[#2A211B]/50 to-[#2A211B]/20" />
          <div className="relative z-10 flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-4">
              <RestaurantAvatar
                src={place?.cover_image_url}
                name={place?.nombre}
                size="md"
              />
              <div>
                <ComentarIALogo size="sm" />
                <p className="mt-2 font-display text-2xl font-semibold text-white">
                  {place?.nombre ?? "—"}
                </p>
                {place?.rating ? (
                  <p className="mt-1 text-sm text-white/80">
                    ★ {place.rating} ·{" "}
                    {place.total?.toLocaleString("es")} reseñas
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-border p-4">
          <p className="text-xs leading-5 text-ink-soft">
            {copy.settings.lockedLine}
          </p>
        </div>
      </Card>

      <div className="mt-8 space-y-8">
        <SettingsSection title={copy.settings.sectionAnalysis}>
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
          <Link href="/informe/pdf">
            <Button variant="secondary" fullWidth>
              {copy.settings.pdf}
            </Button>
          </Link>
        </SettingsSection>

        <SettingsSection title={copy.settings.sectionAccount}>
          <Card>
            <p className="text-xs text-ink-soft">{copy.settings.accountEmail}</p>
            <p className="mt-1 text-sm text-ink">{email ?? "—"}</p>
          </Card>
          <Card>
            <p className="text-xs text-ink-soft">{copy.settings.subscription}</p>
            <p className="mt-1 text-sm text-ink">
              {copy.settings.subscriptionSoon}
            </p>
          </Card>
          <Button variant="danger" fullWidth onClick={logout}>
            {copy.settings.logout}
          </Button>
        </SettingsSection>

        <SettingsSection title={copy.reputation.brandVoiceTitle}>
          <Card>
            <p className="text-sm leading-6 text-ink-soft">
              {copy.reputation.brandVoiceBody}
            </p>
            <Link
              href="/voz"
              className="mt-4 inline-flex text-sm font-semibold text-terracotta"
            >
              {copy.brandVoice.edit} →
            </Link>
            <Link
              href="/centro"
              className="mt-2 block text-sm font-semibold text-ink"
            >
              Centro de reputación →
            </Link>
          </Card>
        </SettingsSection>

        <SettingsSection title={copy.settings.sectionRestaurant}>
          <UploadRestaurantCover />
          <Card>
            <p className="text-sm font-medium text-ink">{place?.nombre}</p>
            <p className="mt-1 text-xs text-ink-soft">{place?.direccion}</p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-olive">
              {copy.settings.restaurantLocked}
            </p>
          </Card>
          <p className="text-xs leading-5 text-ink-soft">
            {copy.settings.oneRestaurantPolicy}
          </p>
        </SettingsSection>
      </div>

      {notice ? (
        <p className="mt-6 rounded-xl bg-mustard/10 px-3 py-2 text-center text-sm text-ink">
          {notice}
        </p>
      ) : null}

      <p className="mt-10 text-center text-xs text-ink-soft">
        {copy.brand.footer}
      </p>
    </PageShell>
  );
}
