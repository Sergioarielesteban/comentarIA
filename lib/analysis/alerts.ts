import type { Analysis } from "@/lib/types";

export type AlertLevel = "high" | "medium" | "opportunity" | "maintain";

export type ReputationAlert = {
  id: string;
  level: AlertLevel;
  title: string;
  description: string;
  mentions: number;
  priority: string;
  recommendedAction: string;
};

const LEVEL_PRIORITY: Record<AlertLevel, string> = {
  high: "Prioridad alta",
  medium: "Prioridad media",
  opportunity: "Oportunidad",
  maintain: "Mantener",
};

export function buildReputationAlerts(
  analysis: Analysis | null | undefined,
): ReputationAlert[] {
  if (!analysis) return [];

  const alerts: ReputationAlert[] = [];

  for (const tema of analysis.temasNegativos.slice(0, 3)) {
    alerts.push({
      id: `neg-${tema.tema}`,
      level: tema.impacto === "alto" ? "high" : "medium",
      title: tema.tema,
      description: tema.porQue,
      mentions: tema.menciones,
      priority: LEVEL_PRIORITY[tema.impacto === "alto" ? "high" : "medium"],
      recommendedAction: tema.accion,
    });
  }

  const topPositive = analysis.temasPositivos[0];
  if (topPositive) {
    alerts.push({
      id: `pos-${topPositive.tema}`,
      level: "opportunity",
      title: `Potenciar ${topPositive.tema}`,
      description: topPositive.porQue,
      mentions: topPositive.menciones,
      priority: LEVEL_PRIORITY.opportunity,
      recommendedAction: topPositive.accion,
    });
  }

  const aligned = analysis.espejo.filter((e) => e.alineacion === "alta")[0];
  if (aligned) {
    alerts.push({
      id: `align-${aligned.tema}`,
      level: "maintain",
      title: `Mantener ${aligned.tema}`,
      description: aligned.consejo,
      mentions: aligned.menciones,
      priority: LEVEL_PRIORITY.maintain,
      recommendedAction: "Sostener el mensaje que ya funciona con tus clientes.",
    });
  }

  return alerts.slice(0, 5);
}
