export const STORAGE_KEYS = {
  // Mantenidos solo para compat con onboarding visual; los datos reales viven en Supabase.
  onboarded: "ec_onboarded",
  /** Legacy client cache — preferir Supabase */
  analysis: "ec_analysis",
  analysisHash: "ec_analysis_hash",
  chatLimit: "ec_chat_limit",
} as const;

export const ANALYSIS_REVIEW_SAMPLE = 60;

/** Legacy — límites reales en lib/server/usage.ts */
export const CHAT_DAILY_LIMIT = 20;

export const PROTECTED_PREFIXES = [
  "/insights",
  "/centro",
  "/resenas",
  "/respuestas",
  "/plan-semanal",
  "/conectar-google",
  "/espejo",
  "/audio",
  "/chat",
  "/competencia",
  "/evolucion",
  "/voz",
  "/ajustes",
  "/onboarding",
  "/informe",
] as const;
