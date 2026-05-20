"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers/app-provider";
import { RestaurantCover } from "@/components/restaurant/restaurant-cover";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { copy } from "@/lib/copy/es";
import type { PlaceSearchResult } from "@/lib/types";

type Step = "intro" | "search" | "select" | "preview" | "loading";

export function OnboardingFlow() {
  const router = useRouter();
  const { refresh } = useApp();
  const [step, setStep] = useState<Step>("intro");
  const [nombre, setNombre] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [results, setResults] = useState<PlaceSearchResult[]>([]);
  const [preview, setPreview] = useState<PlaceSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>(
    copy.onboarding.loadingDiagnosis,
  );

  async function searchPlaces() {
    setStep("search");
    setError(null);
    const params = new URLSearchParams({ nombre });
    if (ciudad) params.set("ubicacion", ciudad);
    const res = await fetch(`/api/places/search?${params}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data?.error?.message || copy.errors.generic);
      setStep("search");
      return;
    }
    setResults(data.results || []);
    setStep("select");
  }

  function openPreview(place: PlaceSearchResult) {
    setPreview(place);
    setStep("preview");
    setError(null);
  }

  async function confirmLink() {
    if (!preview) return;
    setStep("loading");
    setStatus(copy.onboarding.loadingDiagnosis);
    setError(null);

    const res = await fetch("/api/onboarding/restaurant", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        place_id: preview.place_id,
        name: preview.name,
        address: preview.formatted_address,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data?.error?.message || copy.errors.generic);
      setStep("preview");
      return;
    }

    setStatus(copy.onboarding.savingCloud);
    await refresh();
    router.replace("/insights");
    router.refresh();
  }

  if (step === "intro") {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl font-semibold leading-tight text-ink">
          {copy.onboarding.title}
        </h1>
        <ul className="space-y-3 text-sm text-ink-soft">
          {copy.onboarding.steps.map((s, i) => (
            <li key={s} className="flex gap-3">
              <span className="font-mono text-terracotta">{i + 1}.</span>
              {s}
            </li>
          ))}
        </ul>
        <Link
          href="/conectar-google"
          className="flex w-full items-center justify-center rounded-full bg-terracotta px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-terracotta-dark"
        >
          Conectar Google Business
        </Link>
        <Button fullWidth variant="secondary" onClick={() => setStep("search")}>
          {copy.onboarding.cta}
        </Button>
      </div>
    );
  }

  if (step === "loading") {
    return <Spinner label={status} />;
  }

  if (step === "preview" && preview) {
    return (
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => setStep("select")}
          className="text-sm text-ink-soft hover:text-ink"
        >
          ← {copy.onboarding.backToList}
        </button>
        <section className="relative min-h-[220px] overflow-hidden rounded-[28px]">
          <RestaurantCover
            src={preview.cover_image_url}
            alt={preview.name}
            layout="banner"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2A211B]/90 via-[#2A211B]/40 to-transparent" />
          <div className="relative z-10 flex min-h-[220px] flex-col justify-end p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/70">
              {copy.onboarding.previewEyebrow}
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-white">
              {preview.name}
            </h2>
            <p className="mt-1 text-sm text-white/75">
              {preview.formatted_address}
            </p>
            {preview.rating ? (
              <p className="mt-2 text-sm text-white/85">
                ★ {preview.rating} ·{" "}
                {preview.user_ratings_total?.toLocaleString("es")} reseñas
              </p>
            ) : null}
          </div>
        </section>
        <p className="text-xs leading-5 text-ink-soft">
          {copy.onboarding.lockWarning}
        </p>
        <Button fullWidth onClick={confirmLink}>
          {copy.onboarding.confirmLink}
        </Button>
        {error ? (
          <ErrorState message={error} onRetry={() => setError(null)} />
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {step === "search" ? (
        <>
          <label className="block text-sm text-ink-soft">
            {copy.onboarding.searchName}
            <Input
              className="mt-1"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Casa Pepe"
              maxLength={80}
            />
          </label>
          <label className="block text-sm text-ink-soft">
            {copy.onboarding.searchCity}
            <Input
              className="mt-1"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              placeholder="Ej. Madrid"
              maxLength={80}
            />
          </label>
          <Button
            fullWidth
            onClick={searchPlaces}
            disabled={nombre.trim().length < 2}
          >
            Buscar restaurante
          </Button>
        </>
      ) : (
        <>
          <h2 className="font-display text-xl text-ink">
            {copy.onboarding.selectTitle}
          </h2>
          <p className="text-xs text-ink-soft">{copy.onboarding.lockWarning}</p>
          <div className="space-y-2">
            {results.map((p) => (
              <button
                key={p.place_id}
                type="button"
                onClick={() => openPreview(p)}
                className="w-full text-left"
              >
                <Card className="overflow-hidden p-0 transition hover:border-terracotta/40">
                  <div className="flex gap-0 sm:gap-4">
                    <div className="relative hidden h-24 w-28 shrink-0 sm:block">
                      <RestaurantCover
                        src={p.cover_image_url}
                        alt={p.name}
                        layout="fill"
                      />
                    </div>
                    <div className="flex-1 p-4">
                      <p className="font-medium text-ink">{p.name}</p>
                      <p className="mt-1 text-xs text-ink-soft">
                        {p.formatted_address}
                      </p>
                      {p.rating ? (
                        <p className="mt-1 text-xs text-olive">
                          ★ {p.rating} ·{" "}
                          {p.user_ratings_total?.toLocaleString("es")} reseñas
                        </p>
                      ) : null}
                    </div>
                  </div>
                </Card>
              </button>
            ))}
          </div>
        </>
      )}
      {error ? (
        <ErrorState message={error} onRetry={() => setError(null)} />
      ) : null}
    </div>
  );
}
