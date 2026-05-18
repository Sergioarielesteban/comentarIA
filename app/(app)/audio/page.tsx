"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { useApp } from "@/components/providers/app-provider";
import { BriefingCard, PremiumSectionTitle } from "@/components/premium/reputation-components";
import { copy } from "@/lib/copy/es";
import { placeholders } from "@/lib/placeholders";

export default function AudioPage() {
  const { analysis } = useApp();
  const [playing, setPlaying] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const briefing = analysis?.briefing;

  const stop = useCallback(() => {
    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel();
    }
    setPlaying(false);
  }, []);

  const play = useCallback(() => {
    if (!briefing || typeof window === "undefined") return;
    stop();
    const u = new SpeechSynthesisUtterance(briefing);
    u.lang = "es-ES";
    u.rate = 0.95;
    u.onend = () => setPlaying(false);
    utteranceRef.current = u;
    window.speechSynthesis.speak(u);
    setPlaying(true);
  }, [briefing, stop]);

  useEffect(() => () => stop(), [stop]);

  return (
    <PageShell>
      <div className="space-y-7">
        <PremiumSectionTitle
          eyebrow="Briefing"
          title="El resumen que escucharías antes del servicio"
          body={copy.audio.subtitle}
        />
        <BriefingCard
          briefing={briefing}
          playing={playing}
          onToggle={playing ? stop : play}
        />
        <p className="text-center text-xs italic text-ink-soft">
          {placeholders.serverTts}
        </p>
      </div>
    </PageShell>
  );
}
