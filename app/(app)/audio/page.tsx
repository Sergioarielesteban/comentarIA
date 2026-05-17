"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <PageShell title={copy.audio.title} subtitle={copy.audio.subtitle}>
      <Card className="text-center">
        <p className="text-4xl" aria-hidden>
          🎧
        </p>
        {briefing ? (
          <>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              {briefing.slice(0, 280)}
              {briefing.length > 280 ? "…" : ""}
            </p>
            <Button
              className="mt-6"
              fullWidth
              onClick={playing ? stop : play}
            >
              {playing ? copy.audio.pause : copy.audio.play}
            </Button>
          </>
        ) : (
          <p className="mt-4 text-sm text-ink-soft">{copy.audio.noBriefing}</p>
        )}
        <p className="mt-4 text-xs italic text-ink-soft">
          {placeholders.serverTts}
        </p>
      </Card>
    </PageShell>
  );
}
