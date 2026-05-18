import "server-only";
import type { ChatMessage } from "@/lib/types";

export const CHAT_MAX_HISTORY = 10;
export const CHAT_MAX_INPUT_LENGTH = 1000;

export function sanitizeChatHistory(messages: ChatMessage[]): ChatMessage[] {
  const trimmed = messages
    .filter(
      (m): m is ChatMessage =>
        Boolean(m) &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string",
    )
    .map((m) => ({
      role: m.role,
      content: m.content.slice(0, CHAT_MAX_INPUT_LENGTH).trim(),
    }))
    .filter((m) => m.content.length > 0);

  // Solo últimos N mensajes.
  const recent = trimmed.slice(-CHAT_MAX_HISTORY);

  // Asegura que termina en mensaje de usuario.
  while (recent.length && recent[recent.length - 1].role !== "user") {
    recent.pop();
  }

  return recent;
}
