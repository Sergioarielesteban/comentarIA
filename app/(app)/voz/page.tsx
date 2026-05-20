"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { BrandVoiceCard, SectionTitle } from "@/components/reputation";
import { Spinner } from "@/components/ui/spinner";
import { copy } from "@/lib/copy/es";
import type { BrandVoiceProfile } from "@/lib/types/reviews-platform";

export default function VozRestaurantePage() {
  const [profile, setProfile] = useState<BrandVoiceProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/brand-voice")
      .then((r) => r.json())
      .then((data) => setProfile(data.profile ?? null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageShell>
      <div className="space-y-6">
        <SectionTitle
          eyebrow="Perfil de comunicación"
          title={copy.brandVoice.title}
          body={copy.brandVoice.subtitle}
        />
        {loading ? (
          <Spinner label="Cargando perfil…" />
        ) : (
          <BrandVoiceCard profile={profile} />
        )}
        <p className="text-center text-xs italic text-ink-soft">
          El editor completo del perfil de voz llegará en una próxima versión.
        </p>
      </div>
    </PageShell>
  );
}
