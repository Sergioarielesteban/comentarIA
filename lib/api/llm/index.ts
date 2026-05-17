import { callAnthropic } from "@/lib/api/llm/anthropic";
import { callOllama, checkOllamaHealth } from "@/lib/api/llm/ollama";
import { resolveLlmProvider } from "@/lib/api/llm/resolve-provider";
import type { LLMRequestBody } from "@/lib/api/llm/types";

export async function callLLM(body: LLMRequestBody): Promise<Response> {
  const provider = resolveLlmProvider();

  if (provider === "ollama") {
    return callOllama(body);
  }

  if (provider === "anthropic") {
    return callAnthropic(body);
  }

  return Response.json(
    {
      error: {
        message:
          "IA no configurada. Usa Ollama local (gratis) o añade ANTHROPIC_API_KEY.",
      },
    },
    { status: 503 },
  );
}

export async function getLlmStatus() {
  const provider = resolveLlmProvider();
  if (provider === "ollama") {
    const health = await checkOllamaHealth();
    return {
      provider: "ollama",
      ...health,
      model: process.env.OLLAMA_MODEL || "llama3.2",
    };
  }
  if (provider === "anthropic") {
    const key =
      process.env.ANTHROPIC_API_KEY || process.env.anthropic_api_key;
    return { provider: "anthropic", ok: Boolean(key) };
  }
  return { provider: null, ok: false };
}
