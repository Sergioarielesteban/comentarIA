import "server-only";
import { callLLM } from "@/lib/api/llm";
import { ANALYSIS_REVIEW_SAMPLE } from "@/lib/constants";
import { hashReviews, sanitizeText } from "@/lib/analysis/hash-reviews";
import { ApiError } from "@/lib/server/errors";
import {
  buildTieredSample,
  TIER_MIDTERM_DAYS,
  TIER_RECENT_DAYS,
  type ReviewTier,
  type TieredSampleStats,
} from "@/lib/server/temporal-filter";
import type { Analysis, Place, Resena } from "@/lib/types";

const TIER_TAG: Record<ReviewTier, string> = {
  recent: "[reciente]",
  midterm: "[contexto]",
  archive: "[histórico]",
};

function buildAnalysisPrompt(
  nombre: string,
  resenas: Resena[],
  avgRating: string | number,
): string {
  const totalConTexto = resenas.filter((r) => r.texto).length;
  const sample = buildTieredSample(resenas, ANALYSIS_REVIEW_SAMPLE);

  const resumenResenas = sample.items
    .map((item, i) => {
      const nota = item.review.nota ? `${item.review.nota}/5` : "?/5";
      const tag = TIER_TAG[item.tier];
      return `${i + 1}. ${tag} ${nota} — ${sanitizeText(item.review.texto)}`;
    })
    .join("\n");

  const distribucion = formatDistribucion(sample.stats);

  return `Analiza estas reseñas reales de ${nombre} (${resenas.length} reseñas totales, media ${avgRating}/5).

ESCALA TEMPORAL (importante para decidir prioridades):
- "[reciente]" = últimos ${TIER_RECENT_DAYS} días → da más peso para acciones de esta semana.
- "[contexto]" = entre ${TIER_RECENT_DAYS} y ${TIER_MIDTERM_DAYS} días → útil para detectar patrones, no urgencias.
- "[histórico]" = más de ${TIER_MIDTERM_DAYS} días → úsalo solo si revela un problema estructural que sigue vigente.

REGLAS DE ANÁLISIS:
- Las "menciones" deben contar SOLO reseñas [reciente] y [contexto], nunca [histórico].
- "tendencia": comparar reciente vs contexto. Si un tema solo aparece en [histórico], no lo incluyas.
- "accion" debe poder ejecutarse esta semana, basada en quejas/fortalezas vigentes.
- Si la situación parece distinta entre [reciente] y [histórico], dilo en el briefing.

DISTRIBUCIÓN DE LA MUESTRA:
${distribucion}

Devuelve SOLO un JSON válido con exactamente esta estructura (sin texto antes ni después):

{
  "temasPositivos": [
    {
      "tema": "string",
      "menciones": 0,
      "ejemplo": "string (cita literal breve)",
      "tendencia": "up|stable|down",
      "porQue": "string (por qué este tema importa para el negocio, 1 frase)",
      "accion": "string (acción concreta que puede hacer esta semana, empieza con verbo)"
    }
  ],
  "temasNegativos": [
    {
      "tema": "string",
      "menciones": 0,
      "ejemplo": "string (cita literal breve)",
      "impacto": "alto|medio|bajo",
      "tendencia": "up|stable|down",
      "porQue": "string (por qué este problema hace perder clientes, 1 frase)",
      "accion": "string (acción concreta urgente, empieza con verbo)"
    }
  ],
  "espejo": [
    {
      "tema": "string",
      "dueno": "string",
      "clientes": "string",
      "menciones": 0,
      "alineacion": "alta|media|baja",
      "consejo": "string"
    }
  ],
  "briefing": "string de 150 palabras max resumiendo la semana",
  "datoPositivo": "string",
  "distribucion": [
    {"estrellas": 5, "total": 0, "porcentaje": 0},
    {"estrellas": 4, "total": 0, "porcentaje": 0},
    {"estrellas": 3, "total": 0, "porcentaje": 0},
    {"estrellas": 2, "total": 0, "porcentaje": 0},
    {"estrellas": 1, "total": 0, "porcentaje": 0}
  ]
}

RESEÑAS (${sample.stats.sampled} muestreadas de ${totalConTexto} con texto):
${resumenResenas}`;
}

function formatDistribucion(stats: TieredSampleStats): string {
  const lines = [
    `- En la muestra: ${stats.sampledRecent} recientes · ${stats.sampledMidterm} de contexto · ${stats.sampledArchive} históricas.`,
    `- En total: ${stats.recent} recientes · ${stats.midterm} contexto · ${stats.archive} históricas · ${stats.undated} sin fecha.`,
  ];
  return lines.join("\n");
}

export interface RunAnalysisResult {
  analysis: Analysis;
  reviewsHash: string;
}

export async function runAnalysisOnServer(
  place: Place,
  reviews: Resena[],
): Promise<RunAnalysisResult> {
  if (!reviews.length) {
    throw new ApiError(400, "No hay reseñas para analizar.");
  }

  const reviewsHash = hashReviews(reviews);
  const nombre = sanitizeText(place.nombre || "el restaurante");

  // La media se calcula con TODAS las reseñas con nota (incluye históricas),
  // para reflejar el rating público real de Google.
  const notadas = reviews.filter((r) => r.nota);
  const avgRating = notadas.length
    ? (notadas.reduce((s, r) => s + (r.nota || 0), 0) / notadas.length).toFixed(
        1,
      )
    : (place.rating ?? "?");

  const llmResponse = await callLLM({
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: buildAnalysisPrompt(nombre, reviews, avgRating),
      },
    ],
    json: true,
  });

  if (!llmResponse.ok) {
    throw new ApiError(502, "El servicio de IA no respondió.");
  }

  const payload = (await llmResponse.json()) as {
    content?: { text?: string }[];
  };
  const text = payload?.content?.[0]?.text ?? "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new ApiError(502, "Respuesta IA inválida.");
  }

  let analysis: Analysis;
  try {
    analysis = JSON.parse(jsonMatch[0]) as Analysis;
  } catch {
    throw new ApiError(502, "Respuesta IA inválida.");
  }

  return { analysis, reviewsHash };
}
