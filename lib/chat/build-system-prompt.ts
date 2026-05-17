import type { Analysis, Place } from "@/lib/types";

const BASE_PROMPT = `Eres un consultor experto en reputación online para restaurantes españoles. Hablas en español, eres directo y das consejos concretos. Nunca uses asteriscos ni markdown. Responde en menos de 150 palabras.`;

export function buildSystemPrompt(
  lugar: Place | null,
  analysis: Analysis | null,
): string {
  if (!lugar) return BASE_PROMPT;

  let prompt = `${BASE_PROMPT}

RESTAURANTE: ${lugar.nombre}
Nota Google: ${lugar.rating ?? "?"}/5 · ${(lugar.total ?? 0).toLocaleString("es")} reseñas totales`;

  if (analysis?.temasPositivos?.length) {
    prompt += `\n\nFORTALEZAS DETECTADAS:\n`;
    prompt += analysis.temasPositivos
      .map((t) => `- ${t.tema} (${t.menciones} menciones): "${t.ejemplo}"`)
      .join("\n");
  }

  if (analysis?.temasNegativos?.length) {
    prompt += `\n\nPROBLEMAS DETECTADOS:\n`;
    prompt += analysis.temasNegativos
      .map(
        (t) =>
          `- ${t.tema} [impacto ${t.impacto}] (${t.menciones} menciones): "${t.ejemplo}"`,
      )
      .join("\n");
  }

  if (analysis?.espejo?.length) {
    prompt += `\n\nANÁLISIS ESPEJO:\n`;
    prompt += analysis.espejo
      .map(
        (e) =>
          `- ${e.tema}: dueño cree "${e.dueno}" pero clientes dicen "${e.clientes}"`,
      )
      .join("\n");
  }

  if (analysis?.datoPositivo) {
    prompt += `\n\nDATO DESTACADO: ${analysis.datoPositivo}`;
  }

  if (analysis?.distribucion?.length) {
    const d = analysis.distribucion;
    const pos =
      (d.find((x) => x.estrellas === 5)?.porcentaje || 0) +
      (d.find((x) => x.estrellas === 4)?.porcentaje || 0);
    prompt += `\n\nDISTRIBUCIÓN: ${pos}% reseñas de 4-5 estrellas`;
  }

  prompt += `\n\nResponde siempre basándote en estos datos reales. Si preguntan algo que no está en los datos, dilo con honestidad.`;
  return prompt;
}
