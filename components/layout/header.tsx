"use client";

import Link from "next/link";
import { useApp } from "@/components/providers/app-provider";
import { RestaurantAvatar } from "@/components/restaurant/restaurant-avatar";
import { ComentarIALogo } from "@/components/brand/comentaria-logo";

export function AppHeader() {
  const { place } = useApp();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-cream/86 px-4 py-3 backdrop-blur-xl sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <Link href="/insights" className="flex min-w-0 items-center gap-3">
          {place ? (
            <RestaurantAvatar
              src={place.cover_image_url}
              name={place.nombre}
              size="md"
            />
          ) : null}
          <div className="min-w-0">
            <ComentarIALogo size="md" />
            <div className="mt-1 flex min-w-0 items-center gap-2 text-xs text-ink-soft">
              <span className="truncate">
                {place?.nombre ?? "Sin restaurante vinculado"}
              </span>
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${place ? "bg-olive" : "bg-terracotta"}`}
                title={
                  place ? "Restaurante vinculado" : "Completa el onboarding"
                }
              />
              <span className="hidden shrink-0 sm:inline">
                {place ? "Tu panel" : "Pendiente de vincular"}
              </span>
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Notificaciones"
            className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card/60 text-ink-soft transition hover:border-terracotta/30 hover:text-ink"
          >
            <BellIcon />
          </button>
          <Link
            href="/chat"
            className="rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-cream transition hover:bg-terracotta"
          >
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
      aria-hidden="true"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
