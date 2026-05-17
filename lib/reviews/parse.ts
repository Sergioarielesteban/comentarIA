import type { Resena } from "@/lib/types";

/** Parses pasted review text (Google, TripAdvisor, TheFork, plain). */
export function parseReviewText(rawText: string): Pick<Resena, "nota" | "texto">[] {
  if (!rawText?.trim()) return [];

  const text = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const blocks = text
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);

  const reviews: Pick<Resena, "nota" | "texto">[] = [];

  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;

    let nota: number | null = null;
    const textLines: string[] = [];

    for (const line of lines) {
      if (/^[★☆\s]+$/.test(line)) {
        const count = (line.match(/★/g) || []).length;
        if (count >= 1 && count <= 5) nota = nota ?? count;
        continue;
      }

      const fiveMatch = line.match(/(?:^|\s)([1-5])\/5(?:\b|$)/);
      if (fiveMatch && nota === null) nota = parseInt(fiveMatch[1], 10);

      const tenMatch = line.match(/^(\d{1,2})(?:[.,]\d)?\/10/);
      if (tenMatch && nota === null) {
        nota = Math.min(5, Math.round(parseInt(tenMatch[1], 10) / 2));
      }

      if (line.length < 35) {
        const estMatch = line.match(/\b([1-5])\s*estrell[a]s?\b/i);
        if (estMatch && nota === null) nota = parseInt(estMatch[1], 10);
      }

      const numDash = line.match(/^([1-5])\s*[-–:]\s*(.+)/);
      if (numDash) {
        if (nota === null) nota = parseInt(numDash[1], 10);
        textLines.push(numDash[2].trim());
        continue;
      }

      const inlineStars = line.match(/^([★☆]{1,5})\s+(.+)/);
      if (inlineStars) {
        const count = (inlineStars[1].match(/★/g) || []).length;
        if (count >= 1 && count <= 5 && nota === null) nota = count;
        textLines.push(inlineStars[2].trim());
        continue;
      }

      if (
        /^(hace\s+\d|visitad|escrit|reviewed|reseñas?\b|fotos?\b|photos?\b)/i.test(
          line,
        )
      )
        continue;
      if (/^\d+\s+(día|semana|mes|año|day|week|month|year)/i.test(line))
        continue;
      if (/^\d{1,2}\s+de\s+\w+/i.test(line)) continue;
      if (/^(google|tripadvisor|thefork|booking)\b/i.test(line)) continue;
      if (line.length < 4 && !/[a-záéíóúñü]/i.test(line)) continue;

      textLines.push(line);
    }

    const texto = textLines
      .join(" ")
      .replace(/["""''«»]/g, "")
      .trim();

    if (texto.length > 8) {
      reviews.push({
        nota: nota !== null && nota >= 1 && nota <= 5 ? nota : null,
        texto,
      });
    }
  }

  return reviews.slice(0, 200).map((r) => ({
    ...r,
    autor: "Importado",
    hace: "",
  }));
}

export function countDetected(rawText: string): number {
  if (!rawText?.trim()) return 0;
  const blocks = rawText.split(/\n{2,}/).filter((b) => b.trim().length > 20);
  const ratings = (
    rawText.match(/[★]{1,5}|[1-5]\/5|\b[1-5]\s*estrell/gi) || []
  ).length;
  const numDash = (rawText.match(/^[1-5]\s*[-–:]/gm) || []).length;
  return Math.max(blocks.length, ratings, numDash);
}
