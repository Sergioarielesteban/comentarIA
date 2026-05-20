import "server-only";
import { createClient } from "@/lib/supabase/server";
import { ApiError } from "@/lib/server/errors";

export type UsageType =
  | "chat"
  | "analysis"
  | "reviews_refresh"
  | "place_search"
  | "reply_suggest"
  | "review_sync";

export const USAGE_LIMITS: Record<UsageType, number> = {
  chat: 30,
  analysis: 3,
  reviews_refresh: 2,
  place_search: 10,
  reply_suggest: 50,
  review_sync: 3,
};

const COLUMN: Record<UsageType, string> = {
  chat: "chat_requests",
  analysis: "analysis_runs",
  reviews_refresh: "reviews_refreshes",
  place_search: "place_searches",
  reply_suggest: "reply_suggestions",
  review_sync: "review_syncs",
};

export interface DailyUsage {
  chat_requests: number;
  analysis_runs: number;
  reviews_refreshes: number;
  place_searches: number;
  reply_suggestions: number;
  review_syncs: number;
  llm_tokens_estimate: number;
}

const EMPTY: DailyUsage = {
  chat_requests: 0,
  analysis_runs: 0,
  reviews_refreshes: 0,
  place_searches: 0,
  reply_suggestions: 0,
  review_syncs: 0,
  llm_tokens_estimate: 0,
};

export async function getDailyUsage(userId: string): Promise<DailyUsage> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("usage_daily")
    .select(
      "chat_requests, analysis_runs, reviews_refreshes, place_searches, reply_suggestions, review_syncs, llm_tokens_estimate",
    )
    .eq("user_id", userId)
    .eq("usage_date", today)
    .maybeSingle();
  if (error) return EMPTY;
  const row = data as Record<string, number> | null;
  if (!row) return EMPTY;
  return {
    chat_requests: row.chat_requests ?? 0,
    analysis_runs: row.analysis_runs ?? 0,
    reviews_refreshes: row.reviews_refreshes ?? 0,
    place_searches: row.place_searches ?? 0,
    reply_suggestions: row.reply_suggestions ?? 0,
    review_syncs: row.review_syncs ?? 0,
    llm_tokens_estimate: row.llm_tokens_estimate ?? 0,
  };
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
    console.warn(`[usage] increment_usage(${type}) falló:`, error.message);
  }
}
