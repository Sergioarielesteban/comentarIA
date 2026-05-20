"use client";

import Link from "next/link";
import { useApp } from "@/components/providers/app-provider";
import { ComentarIALogo } from "@/components/brand/comentaria-logo";
import { copy } from "@/lib/copy/es";

function formatLastUpdate(date?: string | null) {
  if (!date) return "hace unos minutos";
  try {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "hace un momento";
    if (mins < 60) return `hace ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `hace ${hours} h`;
    return new Intl.DateTimeFormat("es", {
      day: "numeric",
      month: "short",
    }).format(new Date(date));
  } catch {
    return "reciente";
  }
}

export function AppHeader() {
  const { place } = useApp();
  const greeting = copy.summary.greeting;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-cream/90 px-4 py-4 backdrop-blur-xl sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <ComentarIALogo size="lg" />
          <p className="mt-3 font-display text-2xl font-semibold leading-none text-ink sm:text-3xl">
            {greeting}
            <span className="ml-1" aria-hidden>
              👋
            </span>
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            <span className="font-semibold text-ink">
              {place?.nombre ?? "Tu restaurante"}
            </span>
            <span className="mx-2 text-border">·</span>
            {copy.summary.lastUpdate}: {formatLastUpdate(place?.place_id ? undefined : null)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/plan-semanal#alertas"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-terracotta/30"
          >
            <BellIcon />
            Alertas
          </Link>
          <Link
            href="/audio"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-terracotta/30"
          >
            <MicIcon />
            Briefing
          </Link>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 rounded-full bg-terracotta px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-terracotta-dark"
          >
            <SparkleIcon />
            Consultor IA
          </Link>
        </div>
      </div>
    </header>
  );
}

function BellIcon() {
  return (
    <svg
      aria-hidden
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg
      aria-hidden
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l1.4 4.3H18l-3.5 2.5 1.4 4.2L12 10.5 8.1 13l1.4-4.2L6 6.3h4.6L12 2z" />
    </svg>
  );
}
