import { callLLM, getLlmStatus } from "@/lib/api/llm";

export const maxDuration = 120;

export async function POST(request: Request) {
  const body = await request.json();
  return callLLM({
    messages: body.messages,
    max_tokens: body.max_tokens ?? 4096,
    model: body.model,
    json: true, // solo Ollama; Anthropic lo ignora en toAnthropicPayload
  });
}

export async function GET() {
  const status = await getLlmStatus();
  return Response.json(status);
}
