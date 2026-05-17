export type LlmProvider = "ollama" | "anthropic";

export function resolveLlmProvider(): LlmProvider | null {
  const forced = process.env.LLM_PROVIDER?.toLowerCase();
  if (forced === "ollama") return "ollama";
  if (forced === "anthropic") return "anthropic";

  if (process.env.OLLAMA_BASE_URL || process.env.LLM_PROVIDER === "ollama") {
    return "ollama";
  }

  if (
    process.env.ANTHROPIC_API_KEY ||
    process.env.anthropic_api_key
  ) {
    return "anthropic";
  }

  // Sin Anthropic: intentar Ollama local por defecto en desarrollo
  if (process.env.NODE_ENV !== "production") {
    return "ollama";
  }

  return null;
}
