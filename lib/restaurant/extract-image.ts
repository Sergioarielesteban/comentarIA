import { sanitizeImageUrl } from "@/lib/restaurant/sanitize-image-url";

const IMAGE_KEYS = [
  "photo",
  "photo_url",
  "photos",
  "image",
  "main_image",
  "thumbnail",
  "business_photo",
  "owner_photo",
  "google_photo_url",
  "street_view",
  "logo",
  "cover",
  "cover_image",
  "main_photo",
  "image_url",
  "photo_link",
] as const;

function pickFromValue(value: unknown): string | null {
  if (value == null) return null;

  if (typeof value === "string") {
    return sanitizeImageUrl(value);
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = pickFromValue(item);
      if (found) return found;
    }
    return null;
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const direct =
      sanitizeImageUrl(obj.url) ??
      sanitizeImageUrl(obj.photo_url) ??
      sanitizeImageUrl(obj.image_url) ??
      sanitizeImageUrl(obj.link) ??
      sanitizeImageUrl(obj.src);
    if (direct) return direct;
    for (const nested of Object.values(obj)) {
      const found = pickFromValue(nested);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Extrae la primera URL de imagen usable de un objeto crudo de Outscraper/Google.
 * Tolerante: devuelve null si no hay campo reconocible.
 */
export function extractRestaurantImage(
  rawPlace: Record<string, unknown> | null | undefined,
): string | null {
  if (!rawPlace || typeof rawPlace !== "object") return null;

  for (const key of IMAGE_KEYS) {
    if (!(key in rawPlace)) continue;
    const found = pickFromValue(rawPlace[key]);
    if (found) return found;
  }

  // Búsqueda superficial en claves que contengan "photo" o "image"
  for (const [key, value] of Object.entries(rawPlace)) {
    if (!/photo|image|thumb|logo|cover/i.test(key)) continue;
    const found = pickFromValue(value);
    if (found) return found;
  }

  return null;
}
