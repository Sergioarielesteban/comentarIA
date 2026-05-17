import type { Analysis, Place } from "@/lib/types";

export function calcularScoreReputacion(
  lugar: Place,
  analysis: Analysis | null,
): number {
  const rating = lugar.rating ?? 0;
  let score = Math.round((rating / 5) * 100);

  if (!analysis) return Math.min(100, Math.max(0, score));

  const penalizacionNegativos = (analysis.temasNegativos || [])
    .filter((t) => t.impacto === "alto")
    .reduce((acc, t) => acc + Math.min(12, t.menciones * 2), 0);

  const bonusPositivos = (analysis.temasPositivos || [])
    .slice(0, 2)
    .reduce((acc, t) => acc + Math.min(6, t.menciones), 0);

  score = score - penalizacionNegativos + bonusPositivos;
  return Math.min(100, Math.max(0, score));
}

export function etiquetaSalud(score: number): "healthy" | "improve" | "urgent" {
  if (score >= 75) return "healthy";
  if (score >= 55) return "improve";
  return "urgent";
}

export function medidorAlineacion(
  espejo: Analysis["espejo"],
): number {
  if (!espejo?.length) return 0;
  const map = { alta: 100, media: 60, baja: 20 } as const;
  const total = espejo.reduce((s, e) => s + map[e.alineacion], 0);
  return Math.round(total / espejo.length);
}
