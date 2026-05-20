import type { Analysis, Place } from "@/lib/types";

export type EvolutionPoint = {
  label: string;
  score: number;
  reviews: number;
  sentiment: number;
  risks: number;
};

/**
 * Serie temporal derivada del análisis actual.
 * TODO: sustituir por histórico real en `reputation_snapshots` cuando exista.
 */
export function buildEvolutionSeries(
  place: Place | null,
  analysis: Analysis | null,
): EvolutionPoint[] {
  if (!place || !analysis) return [];

  const baseScore = Math.round(((place.rating ?? 4) / 5) * 100);
  const positives = analysis.temasPositivos.reduce((s, t) => s + t.menciones, 0);
  const negatives = analysis.temasNegativos.reduce((s, t) => s + t.menciones, 0);
  const totalMentions = positives + negatives || 1;
  const sentimentPct = Math.round((positives / totalMentions) * 100);
  const highRisks = analysis.temasNegativos.filter((t) => t.impacto === "alto").length;
  const reviewBase = place.total ?? 0;

  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];
  const len = months.length;

  return months.map((label, i) => {
    const progress = (i + 1) / len;
    const drift = (i - (len - 1) / 2) * 2;
    return {
      label,
      score: Math.min(100, Math.max(0, Math.round(baseScore - 8 + progress * 10 + drift))),
      reviews: Math.max(0, Math.round((reviewBase / len) * (0.6 + progress * 0.7))),
      sentiment: Math.min(100, Math.max(0, Math.round(sentimentPct - 6 + progress * 8))),
      risks: Math.max(0, highRisks + (len - 1 - i)),
    };
  });
}
