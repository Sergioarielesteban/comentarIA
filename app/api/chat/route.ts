import { getServerUser } from "@/lib/server/auth";
import { ApiError, apiErrorResponse } from "@/lib/server/errors";
import { buildSystemPrompt } from "@/lib/chat/build-system-prompt";
import { callLLM } from "@/lib/api/llm";
import {
  CHAT_MAX_INPUT_LENGTH,
  sanitizeChatHistory,
} from "@/lib/server/chat-history";
import {
  getLatestAnalysis,
  requireUserRestaurant,
} from "@/lib/server/restaurant";
import {
  assertUsageAvailable,
  incrementUsage,
} from "@/lib/server/usage";
import type { ChatMessage } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  messages?: ChatMessage[];
}

export async function POST(request: Request) {
  try {
    const user = await getServerUser();
    const restaurant = await requireUserRestaurant(user.id);
    await assertUsageAvailable(user.id, "chat");

    const body = (await request.json().catch(() => ({}))) as Body;

    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      throw new ApiError(400, "Mensajes requeridos.");
    }

    const messages = sanitizeChatHistory(body.messages);
    if (
      messages.length === 0 ||
      messages[messages.length - 1].role !== "user"
    ) {
      throw new ApiError(400, "El último mensaje debe ser del usuario.");
    }
    const lastUserMsg = messages[messages.length - 1];
    if (lastUserMsg.content.length > CHAT_MAX_INPUT_LENGTH) {
      throw new ApiError(400, "Mensaje demasiado largo.");
    }

    const place = {
      place_id: restaurant.place_id,
      nombre: restaurant.name,
      direccion: restaurant.address ?? "",
      rating: restaurant.rating,
      total: restaurant.total_reviews,
    };
    const analysis = await getLatestAnalysis(user.id, restaurant.place_id);
    const system = buildSystemPrompt(place, analysis);

    const llmResponse = await callLLM({
      max_tokens: 400,
      system,
      messages,
    });

    if (!llmResponse.ok) {
      const errPayload = await llmResponse.json().catch(() => ({}));
      const msg =
        (errPayload as { error?: { message?: string } })?.error?.message ||
        "El servicio de IA no respondió.";
      throw new ApiError(llmResponse.status, msg);
    }

    const data = (await llmResponse.json()) as {
      content?: { text?: string }[];
    };
    const text = data?.content?.[0]?.text ?? "";

    // Solo incrementa contador si la IA realmente respondió.
    if (text.trim().length > 0) {
      await incrementUsage(user.id, "chat");
    }

    return Response.json({
      content: [{ text }],
    });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
