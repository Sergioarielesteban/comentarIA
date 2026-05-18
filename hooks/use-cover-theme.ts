"use client";

import { useEffect, useState } from "react";
import { resolveRestaurantCoverUrl } from "@/lib/restaurant/cover-image";

export type CoverTheme = "dark" | "light";

/** Luminancia relativa 0–1; >0.52 → fondo claro (texto oscuro). */
const LIGHT_THRESHOLD = 0.52;

function sampleLuminance(img: HTMLImageElement): number {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return 0;

  ctx.drawImage(img, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);
  let sum = 0;
  let count = 0;

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 24) continue;
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    sum += 0.2126 * r + 0.7152 * g + 0.0722 * b;
    count++;
  }

  return count > 0 ? sum / count : 0;
}

/**
 * Analiza la portada del restaurante y elige tema de texto:
 * - dark  → letras blancas (fondo/logo oscuro)
 * - light → letras #2A211B (fondo claro)
 */
export function useCoverTheme(coverImageUrl?: string | null) {
  const [theme, setTheme] = useState<CoverTheme>("dark");
  const [ready, setReady] = useState(false);

  const resolved = resolveRestaurantCoverUrl(coverImageUrl);

  useEffect(() => {
    let cancelled = false;
    const setFallback = () => {
      if (cancelled) return;
      setTheme("dark");
      setReady(true);
    };

    if (!resolved) {
      const id = window.setTimeout(setFallback, 0);
      return () => {
        cancelled = true;
        window.clearTimeout(id);
      };
    }

    const loadingId = window.setTimeout(() => {
      if (!cancelled) setReady(false);
    }, 0);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";

    img.onload = () => {
      window.clearTimeout(loadingId);
      if (cancelled) return;
      try {
        const lum = sampleLuminance(img);
        setTheme(lum >= LIGHT_THRESHOLD ? "light" : "dark");
      } catch {
        setTheme("dark");
      }
      setReady(true);
    };

    img.onerror = () => {
      window.clearTimeout(loadingId);
      setFallback();
    };

    img.src = resolved;
    return () => {
      cancelled = true;
      window.clearTimeout(loadingId);
      img.onload = null;
      img.onerror = null;
    };
  }, [resolved]);

  return { theme, ready, isLight: theme === "light" };
}
