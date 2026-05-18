export const STORAGE_KEYS = {
  // Mantenidos solo para compat con onboarding visual; los datos reales viven en Supabase.
  onboarded: "ec_onboarded",
} as const;

export const ANALYSIS_REVIEW_SAMPLE = 60;

export const PROTECTED_PREFIXES = [
  "/insights",
  "/espejo",
  "/audio",
  "/chat",
  "/ajustes",
  "/onboarding",
  "/informe",
] as const;
