import type { Analysis } from "@/lib/types";

export type ActionUrgency = "high" | "medium" | "maintain";

export type WeeklyAction = {
  id: string;
  title: string;
  reason: string;
  impact: string;
  estimatedTime: string;
  urgency: ActionUrgency;
  sourceTheme?: string;
};

const NEGATIVE_MATCHERS: Array<{
  re: RegExp;
  action: string;
  impact: string;
  estimatedTime: string;
  urgency: ActionUrgency;
  reason: (theme: string) => string;
}> = [
  {
    re: /alerg|allergen|alérg|intoxic|seguridad alimentaria/i,
    action: "Revisar protocolo de alérgenos",
    impact: "reputación + seguridad + confianza",
    estimatedTime: "45 min",
    urgency: "high",
    reason: (theme) =>
      `${theme} aparece como un punto sensible. Conviene cerrarlo con el equipo antes del fin de semana.`,
  },
  {
    re: /espera|lento|demora|tarda|tiempo/i,
    action: "Ajustar tiempos de servicio",
    impact: "experiencia + rotación + reseñas",
    estimatedTime: "30 min",
    urgency: "high",
    reason: (theme) =>
      `La espera sigue saliendo en ${theme}. Un ajuste rápido puede bajar el ruido en reseñas.`,
  },
  {
    re: /higien|limpi|sucio|aseo/i,
    action: "Repasar rutina de limpieza",
    impact: "confianza + imagen + repetición",
    estimatedTime: "30 min",
    urgency: "high",
    reason: (theme) =>
      `${theme} puede afectar la confianza de entrada. Mejor dejarlo revisado esta semana.`,
  },
  {
    re: /trato malo|maleduc|antip|groser|discute|bord/i,
    action: "Reforzar trato en sala",
    impact: "reputación + fidelidad",
    estimatedTime: "20 min",
    urgency: "medium",
    reason: (theme) =>
      `El tono del servicio aparece en ${theme}. Una reunión breve puede corregirlo rápido.`,
  },
  {
    re: /devoluc|reclam|error|fallo/i,
    action: "Cerrar el origen de las devoluciones",
    impact: "menos incidencias + menos pérdida",
    estimatedTime: "25 min",
    urgency: "medium",
    reason: (theme) =>
      `${theme} ya está generando fricción. Conviene atacar la causa raíz, no solo el síntoma.`,
  },
];

const POSITIVE_MATCHERS: Array<{
  re: RegExp;
  title: string;
  impact: string;
  estimatedTime: string;
  urgency: ActionUrgency;
  reason: (theme: string, mentions: number) => string;
}> = [
  {
    re: /hamburgues|burger|plato estrella|estrella/i,
    title: "Promocionar el plato estrella",
    impact: "ventas + ticket medio + repetición",
    estimatedTime: "15 min",
    urgency: "medium",
    reason: (theme, mentions) =>
      `${theme} aparece con fuerza en ${mentions} menciones positivas. Merece espacio en carta y redes esta semana.`,
  },
  {
    re: /rapidez|rápido|fluido|fluidez/i,
    title: "Mantener el flujo actual de barra",
    impact: "fidelización + experiencia",
    estimatedTime: "sin cambios",
    urgency: "maintain",
    reason: (theme, mentions) =>
      `${theme} es una fortaleza clara en ${mentions} reseñas. Mejor protegerlo y no tocar lo que ya funciona.`,
  },
  {
    re: /trato amable|amable|amabil|cálid|cercan/i,
    title: "Mantener el trato del equipo",
    impact: "reputación + retorno",
    estimatedTime: "sin cambios",
    urgency: "maintain",
    reason: (theme, mentions) =>
      `${theme} recibe señales positivas repetidas (${mentions} menciones). Conviene reconocerlo y sostenerlo.`,
  },
  {
    re: /calidad-precio|calidad precio|precio|valor/i,
    title: "Usar el valor como reclamo",
    impact: "conversión + repetición + visibilidad",
    estimatedTime: "15 min",
    urgency: "medium",
    reason: (theme, mentions) =>
      `${theme} sale en ${mentions} comentarios favorables. Es una palanca comercial muy clara para esta semana.`,
  },
];

function slug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function countMentionsByRegex(list: Array<{ tema: string; menciones: number }>, re: RegExp): number {
  return list.reduce((sum, item) => (re.test(item.tema) ? sum + item.menciones : sum), 0);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function generateWeeklyActionPlan(analysis: Analysis | null | undefined): WeeklyAction[] {
  if (!analysis) return [];

  const negative = [...analysis.temasNegativos].sort((a, b) => b.menciones - a.menciones);
  const positive = [...analysis.temasPositivos].sort((a, b) => b.menciones - a.menciones);
  const actions: WeeklyAction[] = [];
  const seen = new Set<string>();

  const push = (action: WeeklyAction) => {
    if (seen.has(action.title)) return;
    seen.add(action.title);
    actions.push(action);
  };

  for (const t of negative) {
    if (actions.length >= 3) break;
    const rule = NEGATIVE_MATCHERS.find((r) => r.re.test(`${t.tema} ${t.porQue} ${t.accion}`));
    if (!rule) continue;
    push({
      id: `neg-${slug(t.tema)}`,
      title: rule.action,
      reason: rule.reason(t.tema),
      impact: rule.impact,
      estimatedTime: rule.estimatedTime,
      urgency: rule.urgency,
      sourceTheme: t.tema,
    });
  }

  for (const t of positive) {
    if (actions.length >= 3) break;
    const rule = POSITIVE_MATCHERS.find((r) => r.re.test(`${t.tema} ${t.porQue} ${t.accion}`));
    if (!rule) continue;
    push({
      id: `pos-${slug(t.tema)}`,
      title: rule.title,
      reason: rule.reason(t.tema, t.menciones),
      impact: rule.impact,
      estimatedTime: rule.estimatedTime,
      urgency: rule.urgency,
      sourceTheme: t.tema,
    });
  }

  if (actions.length < 3 && analysis.espejo.length > 0) {
    const strongest = [...analysis.espejo].sort((a, b) => b.menciones - a.menciones)[0]!;
    const mentions = countMentionsByRegex(
      analysis.temasPositivos,
      new RegExp(escapeRegExp(strongest.tema), "i"),
    );
    push({
      id: `mirror-${slug(strongest.tema)}`,
      title: strongest.alineacion === "baja" ? "Alinear percepción con clientes" : "Mantener el punto fuerte",
      reason:
        strongest.alineacion === "baja"
          ? `Hay una diferencia clara entre lo que crees y lo que ven los clientes en ${strongest.tema}.`
          : `El punto ${strongest.tema} está alineado con el cliente y acumula ${mentions} menciones positivas. Conviene sostenerlo esta semana.`,
      impact: strongest.alineacion === "baja" ? "claridad + foco + reputación" : "repetición + consistencia",
      estimatedTime: "20 min",
      urgency: strongest.alineacion === "baja" ? "medium" : "maintain",
      sourceTheme: strongest.tema,
    });
  }

  return actions.slice(0, 3);
}
