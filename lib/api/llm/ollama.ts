import type { LLMRequestBody, LLMResponseBody } from "@/lib/api/llm/types";

const DEFAULT_BASE = "http://127.0.0.1:11434";
const DEFAULT_MODEL = "llama3.2";

function baseUrl(): string {
  return (process.env.OLLAMA_BASE_URL || DEFAULT_BASE).replace(/\/$/, "");
}

function defaultModel(): string {
  return process.env.OLLAMA_MODEL || DEFAULT_MODEL;
}

function toOllamaMessages(body: LLMRequestBody) {
  const messages: { role: string; content: string }[] = [];
  if (body.system) {
    messages.push({ role: "system", content: body.system });
  }
  for (const m of body.messages ?? []) {
    if (m.role === "system" && !body.system) {
      messages.push({ role: "system", content: m.content });
    } else if (m.role === "user" || m.role === "assistant") {
      messages.push({ role: m.role, content: m.content });
    }
  }
  return messages;
}

export async function callOllama(
  body: LLMRequestBody,
): Promise<Response> {
  const model = body.model || defaultModel();
  const messages = toOllamaMessages(body);

  if (!messages.length) {
    return Response.json(
      { error: { message: "No hay mensajes para el modelo local." } },
      { status: 400 },
    );
  }

  const wantsJson =
    body.json ??
    (body.max_tokens !== undefined && body.max_tokens > 1000);

  try {
    const upstream = await fetch(`${baseUrl()}/api/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        format: wantsJson ? "json" : undefined,
        options: {
          num_predict: body.max_tokens ?? 4096,
          temperature: wantsJson ? 0.2 : 0.6,
        },
      }),
    });

    const data = (await upstream.json()) as {
      message?: { content?: string };
      error?: string;
    };

    if (!upstream.ok) {
      return Response.json(
        {
          error: {
            message:
              data.error ||
              "Ollama no pudo generar respuesta. ¿Está el modelo descargado?",
          },
        },
        { status: upstream.status },
      );
    }

    const text = data.message?.content ?? "";
    const normalized: LLMResponseBody = {
      content: [{ text }],
    };
    return Response.json(normalized);
  } catch {
    return Response.json(
      {
        error: {
          message:
            "No se pudo conectar con Ollama. Instálalo (ollama.com), ejecuta `ollama serve` y descarga un modelo: `ollama pull llama3.2`",
        },
      },
      { status: 503 },
    );
  }
}

export async function checkOllamaHealth(): Promise<{
  ok: boolean;
  models?: string[];
}> {
  try {
    const r = await fetch(`${baseUrl()}/api/tags`);
    if (!r.ok) return { ok: false };
    const data = (await r.json()) as { models?: { name: string }[] };
    return {
      ok: true,
      models: (data.models ?? []).map((m) => m.name),
    };
  } catch {
    return { ok: false };
  }
}
