import "server-only";
import type { Resena } from "@/lib/types";

/**
 * Filtra y prioriza reseñas por recencia para que el análisis IA refleje
 * la realidad operativa actual, no patrones de hace años.
 *
 *  - "recent"   ≤ 90 días   → peso alto: acciones de esta semana
 *  - "midterm"  91–365 días → contexto: patrones estructurales
 *  - "archive"  > 365 días  → solo si revelan problemas estructurales
 *  - "undated"  sin fecha   → se tratan como contexto (Google ya las ordena)
 */
export const TIER_RECENT_DAYS = 90;
export const TIER_MIDTERM_DAYS = 365;

const MS_DAY = 86_400_000;

export type ReviewTier = "recent" | "midterm" | "archive";

export interface TieredReviews {
  recent: Resena[];
  midterm: Resena[];
  archive: Resena[];
  undated: Resena[];
}

export function getReviewTimestamp(r: Resena): number | null {
  // Outscraper devuelve `tiempo` como UNIX seconds (10 dígitos) o ISO.
  if (typeof r.tiempo === "number" && r.tiempo > 0) {
    return r.tiempo > 1e12 ? r.tiempo : r.tiempo * 1000;
  }
  if (typeof r.tiempo === "string" && r.tiempo) {
    const asNumber = Number(r.tiempo);
    if (!Number.isNaN(asNumber) && asNumber > 0) {
      return asNumber > 1e12 ? asNumber : asNumber * 1000;
    }
    const parsed = Date.parse(r.tiempo);
    if (!Number.isNaN(parsed)) return parsed;
  }
  if (r.hace) {
    const parsed = Date.parse(r.hace);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return null;
}

export function classifyByAge(
  reviews: Resena[],
  now = Date.now(),
): TieredReviews {
  const recent: Resena[] = [];
  const midterm: Resena[] = [];
  const archive: Resena[] = [];
  const undated: Resena[] = [];

  for (const r of reviews) {
    const ts = getReviewTimestamp(r);
    if (ts == null) {
      undated.push(r);
      continue;
    }
    const daysAgo = (now - ts) / MS_DAY;
    if (daysAgo <= TIER_RECENT_DAYS) recent.push(r);
    else if (daysAgo <= TIER_MIDTERM_DAYS) midterm.push(r);
    else archive.push(r);
  }
  return { recent, midterm, archive, undated };
}

export interface TieredSampleItem {
  review: Resena;
  tier: ReviewTier;
}

export interface TieredSampleStats {
  recent: number;
  midterm: number;
  archive: number;
  undated: number;
  sampled: number;
  sampledRecent: number;
  sampledMidterm: number;
  sampledArchive: number;
}

export interface TieredSample {
  items: TieredSampleItem[];
  stats: TieredSampleStats;
}

/**
 * Construye una muestra priorizada para el prompt:
 *  - hasta ~66% del total se reserva para recientes,
 *  - el resto rellena con midterm, undated, archive en ese orden.
 * Si no hay suficientes recientes, el resto se rellena con el siguiente tier.
 */
export function buildTieredSample(
  reviews: Resena[],
  totalLimit: number,
  options?: { recentLimit?: number; now?: number },
): TieredSample {
  const now = options?.now ?? Date.now();
  const recentLimit =
    options?.recentLimit ?? Math.max(1, Math.floor(totalLimit * 0.66));

  const tiered = classifyByAge(reviews, now);
  const withText = (rs: Resena[]) =>
    rs.filter((r) => typeof r.texto === "string" && r.texto.trim().length > 0);

  const pickRecent = withText(tiered.recent).slice(0, recentLimit);
  let remaining = totalLimit - pickRecent.length;

  const pickMidterm = withText(tiered.midterm).slice(
    0,
    Math.max(0, remaining),
  );
  remaining -= pickMidterm.length;

  const pickUndated =
    remaining > 0 ? withText(tiered.undated).slice(0, remaining) : [];
  remaining -= pickUndated.length;

  const pickArchive =
    remaining > 0 ? withText(tiered.archive).slice(0, remaining) : [];

  const items: TieredSampleItem[] = [
    ...pickRecent.map((review) => ({
      review,
      tier: "recent" as ReviewTier,
    })),
    ...pickMidterm.map((review) => ({
      review,
      tier: "midterm" as ReviewTier,
    })),
    // Las sin fecha se etiquetan como midterm/contexto.
    ...pickUndated.map((review) => ({
      review,
      tier: "midterm" as ReviewTier,
    })),
    ...pickArchive.map((review) => ({
      review,
      tier: "archive" as ReviewTier,
    })),
  ];

  return {
    items,
    stats: {
      recent: tiered.recent.length,
      midterm: tiered.midterm.length,
      archive: tiered.archive.length,
      undated: tiered.undated.length,
      sampled: items.length,
      sampledRecent: pickRecent.length,
      sampledMidterm: pickMidterm.length + pickUndated.length,
      sampledArchive: pickArchive.length,
    },
  };
}
