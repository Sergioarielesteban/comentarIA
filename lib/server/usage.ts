import "server-only";
import { createClient } from "@/lib/supabase/server";
import { ApiError } from "@/lib/server/errors";

export type UsageType =
  | "chat"
  | "analysis"
  | "reviews_refresh"
  | "place_search";

export const USAGE_LIMITS: Record<UsageType, number> = {
  chat: 30,
  analysis: 3,
  reviews_refresh: 2,
  place_search: 10,
};

const COLUMN: Record<UsageType, string> = {
  chat: "chat_requests",
  analysis: "analysis_runs",
  reviews_refresh: "reviews_refreshes",
  place_search: "place_searches",
};

export interface DailyUsage {
  chat_requests: number;
  analysis_runs: number;
  reviews_refreshes: number;
  place_searches: number;
  llm_tokens_estimate: number;
}

const EMPTY: DailyUsage = {
  chat_requests: 0,
  analysis_runs: 0,
  reviews_refreshes: 0,
  place_searches: 0,
  llm_tokens_estimate: 0,
};

export async function getDailyUsage(userId: string): Promise<DailyUsage> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("usage_daily")
    .select(
      "chat_requests, analysis_runs, reviews_refreshes, place_searches, llm_tokens_estimate",
    )
    .eq("user_id", userId)
    .eq("usage_date", today)
    .maybeSingle();
  if (error) return EMPTY;
  return (data as DailyUsage | null) ?? EMPTY;
}

export async function assertUsageAvailable(
  userId: string,
  type: UsageType,
): Promise<void> {
  const usage = await getDailyUsage(userId);
  const current = usage[COLUMN[type] as keyof DailyUsage] as number;
  if (current >= USAGE_LIMITS[type]) {
    throw new ApiError(
      429,
      "Has alcanzado el límite diario de consultas. Vuelve mañana o mejora tu plan.",
      `limit_${type}`,
    );
  }
}

export async function incrementUsage(
  _userId: string,
  type: UsageType,
  tokensEstimate = 0,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("increment_usage", {
    p_type: type,
    p_tokens: tokensEstimate,
  });
  if (error) {
    // No bloquear la respuesta principal por un fallo de contador, pero log mínimo.
    console.warn(`[usage] increment_usage(${type}) falló:`, error.message);
  }
}
