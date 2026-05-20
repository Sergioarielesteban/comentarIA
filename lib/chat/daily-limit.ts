import { CHAT_DAILY_LIMIT, STORAGE_KEYS } from "@/lib/constants";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getChatCountToday(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.chatLimit);
    const data = raw ? (JSON.parse(raw) as { fecha: string; count: number }) : null;
    if (data?.fecha === todayKey()) return data.count;
    return 0;
  } catch {
    return 0;
  }
}

export function incrementChatCount(): number {
  const count = getChatCountToday() + 1;
  if (typeof window !== "undefined") {
    localStorage.setItem(
      STORAGE_KEYS.chatLimit,
      JSON.stringify({ fecha: todayKey(), count }),
    );
  }
  return count;
}

export function isChatLimitReached(): boolean {
  return getChatCountToday() >= CHAT_DAILY_LIMIT;
}
