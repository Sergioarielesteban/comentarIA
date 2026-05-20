"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { useApp } from "@/components/providers/app-provider";
import { BriefingCard, SectionTitle } from "@/components/reputation";
import { copy } from "@/lib/copy/es";
import { placeholders } from "@/lib/placeholders";

export default function BriefingPage() {
  const { analysis } = useApp();
  const [playing, setPlaying] = useState(false);
  const [showFull, setShowFull] = useState(false);
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
        <SectionTitle
          eyebrow="Briefing"
          title="Briefing de la semana"
          body={copy.audio.subtitle}
        />
        <BriefingCard
          summary={briefing}
          duration="3 min"
          playing={playing}
          onToggle={playing ? stop : play}
        />
        {showFull && briefing ? (
          <article className="rounded-[24px] border border-border bg-card/80 p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-soft">
              Texto completo
            </p>
            <p className="mt-4 whitespace-pre-wrap font-display text-2xl leading-relaxed text-ink">
              {briefing}
            </p>
          </article>
        ) : null}
        <button
          type="button"
          onClick={() => setShowFull((v) => !v)}
          disabled={!briefing}
          className="mx-auto block text-sm font-semibold text-terracotta disabled:opacity-40"
        >
          {showFull ? "Ocultar texto" : "Ver texto completo"}
        </button>
        <p className="text-center text-xs italic text-ink-soft">
          {placeholders.serverTts}
        </p>
      </div>
    </PageShell>
  );
}
