import { ANALYSIS_REVIEW_SAMPLE, STORAGE_KEYS } from "@/lib/constants";
import { hashReviews, sanitizeText } from "@/lib/analysis/hash-reviews";
import type { Analysis, Place, Resena } from "@/lib/types";

function buildAnalysisPrompt(
  nombre: string,
  resenas: Resena[],
  avgRating: string | number,
): string {
  const muestra = resenas.filter((r) => r.texto).slice(0, ANALYSIS_REVIEW_SAMPLE);
  const totalConTexto = resenas.filter((r) => r.texto).length;
  const resumenResenas = muestra
    .map(
      (r, i) =>
        `${i + 1}. ${r.nota ? `${r.nota}/5` : "?/5"} — ${sanitizeText(r.texto)}`,
    )
    .join("\n");

  return `Analiza estas reseñas reales de ${nombre} (${resenas.length} reseñas totales, media ${avgRating}/5).

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

RESEÑAS (${muestra.length} de ${totalConTexto} con texto):
${resumenResenas}`;
}

export function getCachedAnalysis(): Analysis | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.analysis);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Analysis;
    const hasPorQue =
      parsed?.temasPositivos?.[0]?.porQue ||
      parsed?.temasNegativos?.[0]?.porQue;
    if (!hasPorQue) {
      clearAnalysisCache();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearAnalysisCache(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.analysis);
  localStorage.removeItem(STORAGE_KEYS.analysisHash);
}

export async function analyzeReviews(
  lugar: Place,
  resenas: Resena[],
  options?: { force?: boolean },
): Promise<Analysis> {
  const hash = hashReviews(resenas);

  if (!options?.force && typeof window !== "undefined") {
    const cachedHash = localStorage.getItem(STORAGE_KEYS.analysisHash);
    if (cachedHash === hash) {
      const cached = getCachedAnalysis();
      if (cached) return cached;
    }
  }

  const nombre = sanitizeText(lugar.nombre || "el restaurante");
  const notadas = resenas.filter((r) => r.nota);
  const avgRating = notadas.length
    ? (notadas.reduce((s, r) => s + (r.nota || 0), 0) / notadas.length).toFixed(1)
    : (lugar.rating ?? "?");

  const res = await fetch("/api/messages", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: buildAnalysisPrompt(nombre, resenas, avgRating),
        },
      ],
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const message =
      (errData as { error?: { message?: string } })?.error?.message ||
      `Error ${res.status} de la API de IA`;
    throw new Error(message);
  }

  const data = await res.json();
  const text =
    (data as { content?: { text?: string }[] })?.content?.[0]?.text || "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`Respuesta sin JSON. Inicio: ${text.slice(0, 100)}`);
  }

  let analysis: Analysis;
  try {
    analysis = JSON.parse(jsonMatch[0]) as Analysis;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "JSON inválido";
    throw new Error(`${msg}. Inicio: ${jsonMatch[0].slice(0, 100)}`);
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.analysis, JSON.stringify(analysis));
    localStorage.setItem(STORAGE_KEYS.analysisHash, hash);
  }

  return analysis;
}
