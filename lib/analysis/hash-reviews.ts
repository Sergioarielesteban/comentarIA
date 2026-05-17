import type { Resena } from "@/lib/types";

export function hashReviews(resenas: Resena[]): string {
  return `${resenas.length}_${resenas[0]?.tiempo ?? ""}_${resenas[resenas.length - 1]?.tiempo ?? ""}`;
}

export function sanitizeText(text: string): string {
  if (!text) return "";
  return text.replace(/"/g, "'").replace(/[\n\r]/g, " ").trim();
}
