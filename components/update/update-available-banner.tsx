"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const CHECK_INTERVAL_MS = 60_000;
const RELOAD_DELAY_SECONDS = 12;

type VersionResponse = {
  version?: string;
};

export function UpdateAvailableBanner() {
  const initialVersionRef = useRef<string | null>(null);
  const reloadingRef = useRef(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RELOAD_DELAY_SECONDS);

  const reload = useCallback(() => {
    if (reloadingRef.current) return;
    reloadingRef.current = true;
    window.location.reload();
  }, []);

  const checkVersion = useCallback(async () => {
    if (reloadingRef.current) return;

    try {
      const response = await fetch(`/api/version?t=${Date.now()}`, {
        cache: "no-store",
      });
      if (!response.ok) return;

      const data = (await response.json()) as VersionResponse;
      if (!data.version) return;

      if (!initialVersionRef.current) {
        initialVersionRef.current = data.version;
        return;
      }

      if (data.version !== initialVersionRef.current) {
        setUpdateAvailable(true);
      }
    } catch {
      // Version checks should never interrupt normal app use.
    }
  }, []);

  useEffect(() => {
    const firstCheckId = window.setTimeout(() => {
      void checkVersion();
    }, 0);
    const intervalId = window.setInterval(() => {
      void checkVersion();
    }, CHECK_INTERVAL_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void checkVersion();
      }
    };

    window.addEventListener("focus", checkVersion);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearTimeout(firstCheckId);
      window.clearInterval(intervalId);
      window.removeEventListener("focus", checkVersion);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [checkVersion]);

  useEffect(() => {
    if (!updateAvailable) return;

    const countdownId = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(countdownId);
          reload();
          return 0;
        }
        return current - 1;
      });
    }, 1_000);

    return () => window.clearInterval(countdownId);
  }, [reload, updateAvailable]);

  if (!updateAvailable) return null;

  return (
    <div className="fixed inset-x-3 top-3 z-50 mx-auto max-w-lg rounded-[22px] border border-border bg-card/95 p-4 shadow-[0_18px_44px_rgba(28,26,24,.12)] backdrop-blur-xl">
      <div className="flex items-start gap-3">
        <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-terracotta" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-2xl font-semibold leading-none text-ink">
            Hay una actualización disponible
          </p>
          <p className="mt-2 text-sm leading-5 text-ink-soft">
            ComentarIA se actualizará automáticamente en {secondsLeft} segundos para mostrarte la última versión en este dispositivo.
          </p>
          <button
            type="button"
            onClick={reload}
            className="mt-3 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-cream transition hover:bg-terracotta"
          >
            Actualizar ahora
          </button>
        </div>
      </div>
    </div>
  );
}
