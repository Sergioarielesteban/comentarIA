"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { Spinner } from "@/components/ui/spinner";
import { copy } from "@/lib/copy/es";
import type { GoogleBusinessLocationOption } from "@/lib/types/reviews-platform";

type Step = "loading" | "connect" | "pick" | "linked" | "error";

export default function ConectarGooglePage() {
  return (
    <Suspense fallback={<PageShell><Spinner label="Cargando…" /></PageShell>}>
      <ConectarGoogleContent />
    </Suspense>
  );
}

function ConectarGoogleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("loading");
  const [locations, setLocations] = useState<GoogleBusinessLocationOption[]>(
    [],
  );
  const [linkedName, setLinkedName] = useState<string | null>(null);
  const [linking, setLinking] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [configured, setConfigured] = useState(true);

  const loadStatus = useCallback(async () => {
    setStep("loading");
    const statusRes = await fetch("/api/google-business/status");
    const status = await statusRes.json();

    setConfigured(status.configured !== false);

    if (status.location) {
      setLinkedName(status.location.name);
      setStep("linked");
      return;
    }

    if (!status.connected) {
      setStep("connect");
      return;
    }

    const locRes = await fetch("/api/google-business/locations");
    const locData = await locRes.json();
    if (locData.linked) {
      setLinkedName(locData.location?.name ?? null);
      setStep("linked");
      return;
    }

    setLocations(locData.locations ?? []);
    if ((locData.locations ?? []).length === 0) {
      setMessage(
        locData.message ??
          copy.reputation.errors.noLocations,
      );
      setStep("error");
    } else {
      setStep("pick");
    }
  }, []);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "google_denied") {
      setMessage(copy.reputation.errors.denied);
    }
    void loadStatus();
  }, [loadStatus, searchParams]);

  async function linkLocation(platformLocationId: string) {
    setLinking(platformLocationId);
    setMessage(null);
    try {
      const res = await fetch("/api/google-business/link-location", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ platform_location_id: platformLocationId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message ?? copy.reputation.errors.linkFailed);
      }
      router.push("/insights");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : copy.reputation.errors.linkFailed);
    } finally {
      setLinking(null);
    }
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-lg space-y-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-terracotta">
            Vinculación oficial
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-ink">
            Conectar Google Business
          </h1>
          <p className="mt-3 text-sm leading-6 text-ink-soft">
            {copy.reputation.connectBody}
          </p>
        </div>

        {!configured ? (
          <div className="rounded-[24px] border border-mustard/30 bg-mustard/10 p-5 text-sm text-ink">
            {copy.reputation.errors.notConfigured}
          </div>
        ) : null}

        {message ? (
          <p className="rounded-[20px] border border-terracotta/20 bg-terracotta/8 px-4 py-3 text-sm text-terracotta">
            {message}
          </p>
        ) : null}

        {step === "loading" ? <Spinner label="Comprobando conexión…" /> : null}

        {step === "connect" ? (
          <a
            href="/api/google-business/connect"
            className="flex w-full items-center justify-center rounded-full bg-terracotta px-6 py-4 text-sm font-semibold text-white transition hover:bg-terracotta-dark"
          >
            Conectar Google Business
          </a>
        ) : null}

        {step === "pick" ? (
          <div className="space-y-3">
            <p className="text-sm text-ink-soft">{copy.reputation.pickLocation}</p>
            {locations.map((loc) => (
              <button
                key={loc.platform_location_id}
                type="button"
                disabled={linking !== null}
                onClick={() => void linkLocation(loc.platform_location_id)}
                className="w-full rounded-[24px] border border-border bg-card p-5 text-left transition hover:border-terracotta/30 hover:bg-cream/40 disabled:opacity-60"
              >
                <p className="font-display text-xl font-semibold text-ink">
                  {loc.name}
                </p>
                {loc.address ? (
                  <p className="mt-2 text-sm text-ink-soft">{loc.address}</p>
                ) : null}
                <p className="mt-4 text-sm font-semibold text-terracotta">
                  {linking === loc.platform_location_id
                    ? "Vinculando…"
                    : "Vincular este restaurante →"}
                </p>
              </button>
            ))}
            <p className="text-xs leading-5 text-ink-soft">
              {copy.reputation.lockWarning}
            </p>
          </div>
        ) : null}

        {step === "linked" ? (
          <div className="rounded-[24px] border border-olive/25 bg-olive/8 p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-olive">
              Conectado
            </p>
            <p className="mt-3 font-display text-2xl font-semibold text-ink">
              {linkedName}
            </p>
            <p className="mt-3 text-sm text-ink-soft">
              {copy.reputation.alreadyLinked}
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Link
                href="/resenas"
                className="inline-flex justify-center rounded-full bg-terracotta px-5 py-3 text-sm font-semibold text-white"
              >
                Centro de reputación
              </Link>
              <Link
                href="/insights"
                className="inline-flex justify-center rounded-full border border-border px-5 py-3 text-sm font-semibold text-ink"
              >
                Ver resumen
              </Link>
            </div>
          </div>
        ) : null}

        {step === "error" && locations.length === 0 ? (
          <Link
            href="/api/google-business/connect"
            className="inline-flex rounded-full border border-border px-5 py-3 text-sm font-semibold"
          >
            Reintentar conexión
          </Link>
        ) : null}
      </div>
    </PageShell>
  );
}
