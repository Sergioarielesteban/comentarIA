/** Portada por defecto (asset local). Si falla la carga, el componente usa degradado CSS. */
export const DEFAULT_RESTAURANT_COVER = "/restaurant-hero.png";

export const RESTAURANT_COVER_GRADIENT =
  "linear-gradient(135deg, rgba(42,33,27,.92), rgba(196,83,31,.55)), radial-gradient(circle at 70% 30%, rgba(184,135,42,.25), transparent 40%)";

export type CoverImageSource = "outscraper" | "fallback" | "upload";

/**
 * URL efectiva para mostrar: solo URLs sanitizadas del servidor o fallback local.
 * El cliente nunca debe poder inyectar una URL arbitraria en user_restaurants.
 */
export function resolveRestaurantCoverUrl(
  coverImageUrl?: string | null,
): string | null {
  if (!coverImageUrl?.trim()) return null;
  const trimmed = coverImageUrl.trim();
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) return trimmed;
  return null;
}

export function restaurantInitial(name?: string | null): string {
  const n = (name ?? "").trim();
  if (!n) return "?";
  return n.charAt(0).toUpperCase();
}
