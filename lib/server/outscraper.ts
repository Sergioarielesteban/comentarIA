import "server-only";
import { extractRestaurantImage } from "@/lib/restaurant/extract-image";
import type { CoverImageSource } from "@/lib/restaurant/cover-image";
import type { Place, PlaceSearchResult, Resena } from "@/lib/types";
import { ApiError } from "@/lib/server/errors";

const SEARCH_API = "https://api.app.outscraper.com/maps/search-v3";
const REVIEWS_API = "https://api.app.outscraper.com/maps/reviews-v3";

export const OUTSCRAPER_REVIEWS_LIMIT = 200;

function getApiKey(): string {
  const key =
    process.env.OUTSCRAPER_API_KEY || process.env.outscraper_api_key;
  if (!key) {
    throw new ApiError(503, "El servicio de reseñas no está configurado.");
  }
  return key;
}

function coverFromRaw(
  raw: Record<string, unknown>,
): { url: string | null; source: CoverImageSource } {
  const url = extractRestaurantImage(raw);
  return { url, source: url ? "outscraper" : "fallback" };
}

export async function searchPlaces(
  nombre: string,
  ubicacion?: string,
): Promise<PlaceSearchResult[]> {
  const apiKey = getApiKey();
  const query = ubicacion
    ? `${nombre} ${ubicacion}`
    : `${nombre} restaurante`;
  const url = `${SEARCH_API}?query=${encodeURIComponent(query)}&language=es&limit=6&async=false`;

  let r: Response;
  try {
    r = await fetch(url, { headers: { "X-API-KEY": apiKey } });
  } catch {
    throw new ApiError(502, "No se pudo conectar con el servicio de reseñas.");
  }
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    throw new ApiError(
      r.status === 429 ? 429 : 502,
      "Error consultando el servicio de reseñas.",
    );
  }

  const places = ((data as { data?: unknown[] })?.data?.[0] || []) as Record<
    string,
    unknown
  >[];

  return places.map((p) => {
    const { url } = coverFromRaw(p);
    return {
      place_id: String(p.place_id ?? ""),
      name: String(p.name ?? ""),
      formatted_address: String(p.full_address ?? p.address ?? ""),
      rating: p.rating as number | undefined,
      user_ratings_total: p.reviews as number | undefined,
      cover_image_url: url,
    };
  });
}

export interface ReviewsResult {
  place: Place;
  reviews: Resena[];
  cover_image_url: string | null;
  cover_image_source: CoverImageSource;
}

export async function fetchReviews(query: string): Promise<ReviewsResult> {
  const apiKey = getApiKey();
  const url = `${REVIEWS_API}?query=${encodeURIComponent(query)}&reviewsLimit=${OUTSCRAPER_REVIEWS_LIMIT}&language=es&sort=newest&async=false`;

  let r: Response;
  try {
    r = await fetch(url, { headers: { "X-API-KEY": apiKey } });
  } catch {
    throw new ApiError(502, "No se pudo conectar con el servicio de reseñas.");
  }
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    throw new ApiError(
      r.status === 429 ? 429 : 502,
      "Error consultando el servicio de reseñas.",
    );
  }

  const lugar = (data as { data?: Record<string, unknown>[] })?.data?.[0];
  if (!lugar) {
    throw new ApiError(404, "No se encontró el restaurante.");
  }

  const reviewsRaw = (lugar.reviews_data || []) as Record<string, unknown>[];
  const reviews: Resena[] = reviewsRaw.map((rev) => ({
    autor: String(rev.author_name ?? rev.autor_name ?? "Anónimo"),
    nota: (rev.review_rating as number) ?? null,
    texto: String(rev.review_text ?? ""),
    hace: String(rev.review_datetime_utc ?? ""),
    tiempo: rev.review_timestamp as number | string | undefined,
  }));

  const { url: coverUrl, source: coverSource } = coverFromRaw(lugar);

  const place: Place = {
    place_id: String(lugar.place_id ?? ""),
    nombre: String(lugar.name ?? ""),
    direccion: String(lugar.full_address ?? ""),
    rating: lugar.rating as number,
    total: lugar.reviews as number,
    cover_image_url: coverUrl,
    cover_image_source: coverSource,
  };

  return {
    place,
    reviews,
    cover_image_url: coverUrl,
    cover_image_source: coverSource,
  };
}
