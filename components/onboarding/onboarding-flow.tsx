"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { copy } from "@/lib/copy/es";
import type { Place, PlaceSearchResult, Resena } from "@/lib/types";

type Step = "intro" | "search" | "select" | "loading";

export function OnboardingFlow() {
  const router = useRouter();
  const { persistRestaurant } = useApp();
  const [step, setStep] = useState<Step>("intro");
  const [nombre, setNombre] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [results, setResults] = useState<PlaceSearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>(copy.onboarding.loadingDiagnosis);

  async function searchPlaces() {
    setStep("search");
    setError(null);
    const params = new URLSearchParams({ nombre });
    if (ciudad) params.set("ubicacion", ciudad);
    const res = await fetch(`/api/places/search?${params}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || copy.errors.generic);
      return;
    }
    setResults(data.results || []);
    setStep("select");
  }

  async function selectPlace(place: PlaceSearchResult) {
    setStep("loading");
    setStatus(copy.onboarding.loadingDiagnosis);
    setError(null);

    const query = place.place_id || `${place.name} ${place.formatted_address}`;
    const res = await fetch(
      `/api/reviews?query=${encodeURIComponent(query)}&limit=200`,
    );
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || copy.errors.generic);
      setStep("select");
      return;
    }

    const lugar: Place = {
      place_id: place.place_id,
      nombre: data.lugar?.nombre || place.name,
      direccion: data.lugar?.direccion || place.formatted_address,
      rating: data.lugar?.rating ?? place.rating,
      total: data.lugar?.total ?? place.user_ratings_total,
    };
    const resenas: Resena[] = data.resenas || [];

    if (!resenas.length) {
      setError(copy.errors.noReviews);
      setStep("select");
      return;
    }

    setStatus(copy.onboarding.savingCloud);
    await persistRestaurant(lugar, resenas);
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
        <Button fullWidth onClick={() => setStep("search")}>
          {copy.onboarding.cta}
        </Button>
      </div>
    );
  }

  if (step === "loading") {
    return <Spinner label={status} />;
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
            />
          </label>
          <label className="block text-sm text-ink-soft">
            {copy.onboarding.searchCity}
            <Input
              className="mt-1"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              placeholder="Ej. Madrid"
            />
          </label>
          <Button fullWidth onClick={searchPlaces} disabled={!nombre.trim()}>
            Buscar restaurante
          </Button>
        </>
      ) : (
        <>
          <h2 className="font-display text-xl text-ink">
            {copy.onboarding.selectTitle}
          </h2>
          <div className="space-y-2">
            {results.map((p) => (
              <button
                key={p.place_id}
                type="button"
                onClick={() => selectPlace(p)}
                className="w-full text-left"
              >
                <Card className="transition hover:border-terracotta/40">
                  <p className="font-medium text-ink">{p.name}</p>
                  <p className="mt-1 text-xs text-ink-soft">
                    {p.formatted_address}
                  </p>
                  {p.rating ? (
                    <p className="mt-1 text-xs text-olive">
                      ★ {p.rating} · {p.user_ratings_total?.toLocaleString("es")}{" "}
                      reseñas
                    </p>
                  ) : null}
                </Card>
              </button>
            ))}
          </div>
        </>
      )}
      {error ? <ErrorState message={error} onRetry={() => setError(null)} /> : null}
    </div>
  );
}
