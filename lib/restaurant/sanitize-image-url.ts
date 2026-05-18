/**
 * Solo permite URLs http(s) seguras para imágenes de portada.
 * Rechaza javascript:, data:, blob: y strings vacíos.
 */
export function sanitizeImageUrl(url: unknown): string | null {
  if (typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("blob:") ||
    lower.startsWith("file:")
  ) {
    return null;
  }

  if (lower.startsWith("https://") || lower.startsWith("http://")) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return null;
      }
      return parsed.href;
    } catch {
      return null;
    }
  }

  return null;
}
