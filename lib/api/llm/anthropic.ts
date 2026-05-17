import type { LLMRequestBody } from "@/lib/api/llm/types";

const ANTHROPIC_BASE = "https://api.anthropic.com/v1";
const HEADERS_VERSION = "2023-06-01";

const FALLBACK_MODELS = [
  "claude-haiku-4-5",
  "claude-haiku-4-5-20251001",
  "claude-sonnet-4-6",
  "claude-sonnet-4-5",
];

async function getFirstAvailableModel(apiKey: string): Promise<string | null> {
  try {
    const r = await fetch(`${ANTHROPIC_BASE}/models`, {
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": HEADERS_VERSION,
      },
    });
    if (r.ok) {
      const data = (await r.json()) as { data?: { id: string }[] };
      const ids = (data.data || []).map((m) => m.id);
      if (ids.length > 0) return ids[0];
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** Solo campos que acepta la API de Anthropic (evita "Extra inputs are not permitted"). */
function toAnthropicPayload(body: LLMRequestBody): Record<string, unknown> {
  const messages =
    body.messages
      ?.filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.content })) ?? [];

  const payload: Record<string, unknown> = {
    max_tokens: body.max_tokens ?? 4096,
    messages,
  };

  if (body.system) payload.system = body.system;
  if (body.model) payload.model = body.model;

  return payload;
}

export async function callAnthropic(body: LLMRequestBody): Promise<Response> {
  const apiKey =
    process.env.ANTHROPIC_API_KEY || process.env.anthropic_api_key;
  if (!apiKey) {
    return Response.json(
      { error: { message: "ANTHROPIC_API_KEY no configurada." } },
      { status: 503 },
    );
  }

  const payload = toAnthropicPayload(body);

  if (!payload.model) {
    const discovered = await getFirstAvailableModel(apiKey);
    payload.model = discovered || FALLBACK_MODELS[0];
  }

  const modelsToTry = [
    payload.model as string,
    ...FALLBACK_MODELS.filter((m) => m !== payload.model),
  ];

  for (const model of modelsToTry) {
    try {
      const upstream = await fetch(`${ANTHROPIC_BASE}/messages`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": HEADERS_VERSION,
        },
        body: JSON.stringify({ ...payload, model }),
      });
      const data = await upstream.json();
      if (
        !upstream.ok &&
        (data as { error?: { type?: string } })?.error?.type ===
          "not_found_error"
      ) {
        continue;
      }
      return Response.json(data, { status: upstream.status });
    } catch {
      continue;
    }
  }

  return Response.json(
    {
      error: {
        message: "No hay modelos Anthropic disponibles con tu API key.",
      },
    },
    { status: 502 },
  );
}
