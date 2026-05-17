export const STORAGE_KEYS = {
  place: "ec_place",
  reviews: "ec_reviews",
  analysis: "ec_analysis",
  analysisHash: "ec_analysis_hash",
  chatHistory: "ec_chat_history",
  chatLimit: "ec_chat_limit",
  onboarded: "ec_onboarded",
} as const;

export const CHAT_DAILY_LIMIT = 30;
export const CHAT_MAX_HISTORY = 40;
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
