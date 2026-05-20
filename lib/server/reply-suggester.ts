import "server-only";
import { callLLM } from "@/lib/api/llm";
import type { BrandVoiceProfile } from "@/lib/types/reviews-platform";
import type { ReviewRow } from "@/lib/types/reviews-platform";

const MAX_REPLY_CHARS = 1200;

function buildReplyPrompt(
  review: ReviewRow,
  restaurantName: string,
  voice: BrandVoiceProfile | null,
): string {
  const rating = review.rating ?? 0;
  const voiceBlock = voice
    ? `Tono: ${voice.tone ?? "cercano"}. Formalidad: ${voice.formality ?? "media"}. Emojis: ${voice.emoji_usage ?? "moderado"}. Longitud: ${voice.response_length ?? "corta"}.${
        voice.signature ? ` Firma habitual: ${voice.signature}` : ""
      }`
    : "Tono cercano, formalidad media, emojis moderados, respuestas cortas.";

  return `Eres el dueño o gerente de "${restaurantName}" respondiendo una reseña en Google.

${voiceBlock}

Reseña (${rating}/5 estrellas):
"${(review.text ?? "").slice(0, 1500)}"

Reglas estrictas:
- Suena humano y natural en español de España.
- Máximo 3-4 frases cortas. Sin párrafos enormes.
- Agradece siempre.
- Si es negativa (1-3): reconoce sin admitir hechos legales graves; invita a contacto privado (teléfono o email del local) sin prometer compensaciones automáticas; no discutas.
- Si es positiva (4-5): agradece y refuerza algo concreto del comentario si lo mencionan.
- NO uses frases robóticas tipo "lamentamos las molestias ocasionadas" ni "su feedback es muy importante".
- NO exceso de emojis.
- NO lenguaje corporativo frío.
- Devuelve SOLO el texto de la respuesta, sin comillas ni explicaciones.`;
}

export async function suggestReviewReply(
  review: ReviewRow,
  restaurantName: string,
  voice: BrandVoiceProfile | null,
  toneHint?: string,
): Promise<string> {
  const prompt = [
    buildReplyPrompt(review, restaurantName, voice),
    toneHint ? `\nAjuste de tono solicitado: ${toneHint}` : "",
  ].join("");

  const res = await callLLM({
    model: undefined,
    messages: [{ role: "user", content: prompt }],
    max_tokens: 400,
  });

  if (!res.ok) {
    throw new Error("No se pudo generar la sugerencia de respuesta.");
  }

  const json = (await res.json()) as { content?: { text?: string }[] };
  const text = json.content?.[0]?.text ?? "";

  const trimmed = text.trim().slice(0, MAX_REPLY_CHARS);
  if (!trimmed) {
    throw new Error("La IA no generó una respuesta válida.");
  }
  return trimmed;
}
