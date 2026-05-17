import { callLLM } from "@/lib/api/llm";
import { buildSystemPrompt } from "@/lib/chat/build-system-prompt";
import type { Analysis, ChatMessage, Place } from "@/lib/types";

export const maxDuration = 120;

export async function POST(request: Request) {
  const body = (await request.json()) as {
    messages: ChatMessage[];
    place?: Place | null;
    analysis?: Analysis | null;
  };

  const { messages, place = null, analysis = null } = body;
  if (!messages?.length) {
    return Response.json({ error: "Mensajes requeridos" }, { status: 400 });
  }

  const system = buildSystemPrompt(place, analysis);

  return callLLM({
    max_tokens: 400,
    system,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });
}
