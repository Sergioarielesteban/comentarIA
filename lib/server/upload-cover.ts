import "server-only";

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB

const ALLOWED_TYPES = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export function validateCoverFile(file: File): { ext: string } | { error: string } {
  if (!file || file.size === 0) {
    return { error: "Selecciona una imagen." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "La imagen no puede superar 4 MB." };
  }
  const ext = ALLOWED_TYPES.get(file.type);
  if (!ext) {
    return { error: "Formato no válido. Usa JPG, PNG o WebP." };
  }
  return { ext };
}

export function buildCoverStoragePath(userId: string, ext: string): string {
  return `${userId}/cover.${ext}`;
}
