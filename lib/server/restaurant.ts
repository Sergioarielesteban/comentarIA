import "server-only";
import { createClient } from "@/lib/supabase/server";
import { ApiError } from "@/lib/server/errors";
import type { Analysis, Resena } from "@/lib/types";

export interface UserRestaurantRow {
  id: string;
  user_id: string;
  place_id: string;
  name: string;
  address: string | null;
  rating: number | null;
  total_reviews: number | null;
  locked_at: string;
  created_at: string;
  updated_at: string;
}

export async function getUserRestaurant(
  userId: string,
): Promise<UserRestaurantRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_restaurants")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new ApiError(500, "Error consultando restaurante.");
  return (data as UserRestaurantRow | null) ?? null;
}

export async function requireUserRestaurant(
  userId: string,
): Promise<UserRestaurantRow> {
  const row = await getUserRestaurant(userId);
  if (!row) {
    throw new ApiError(
      403,
      "No tienes un restaurante configurado.",
      "no_restaurant",
    );
  }
  return row;
}

export async function assertRestaurantNotAlreadyLocked(
  userId: string,
): Promise<void> {
  const row = await getUserRestaurant(userId);
  if (row) {
    throw new ApiError(
      409,
      "Tu cuenta ya tiene un restaurante vinculado.",
      "already_locked",
    );
  }
}

export async function getStoredReviews(
  userRestaurantId: string,
): Promise<Resena[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_restaurant_reviews")
    .select("data")
    .eq("user_restaurant_id", userRestaurantId)
    .maybeSingle();
  if (error) throw new ApiError(500, "Error cargando reseñas.");
  const rows = (data?.data as Resena[] | undefined) ?? [];
  return rows;
}

export async function saveReviews(
  userRestaurantId: string,
  reviews: Resena[],
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("user_restaurant_reviews").upsert(
    {
      user_restaurant_id: userRestaurantId,
      data: reviews,
      fetched_at: new Date().toISOString(),
    },
    { onConflict: "user_restaurant_id" },
  );
  if (error) throw new ApiError(500, "Error guardando reseñas.");
}

export async function getLatestAnalysis(
  userId: string,
  placeId: string,
): Promise<Analysis | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("restaurant_analysis_cache")
    .select("analysis_json")
    .eq("user_id", userId)
    .eq("place_id", placeId)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return null;
  return (data?.analysis_json as Analysis | undefined) ?? null;
}

export async function getCachedAnalysisByHash(
  userId: string,
  placeId: string,
  reviewsHash: string,
): Promise<Analysis | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("restaurant_analysis_cache")
    .select("analysis_json")
    .eq("user_id", userId)
    .eq("place_id", placeId)
    .eq("reviews_hash", reviewsHash)
    .maybeSingle();
  if (error) return null;
  return (data?.analysis_json as Analysis | undefined) ?? null;
}

export async function saveAnalysisCache(
  userId: string,
  placeId: string,
  reviewsHash: string,
  analysis: Analysis,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("restaurant_analysis_cache").upsert(
    {
      user_id: userId,
      place_id: placeId,
      reviews_hash: reviewsHash,
      analysis_json: analysis,
      generated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,place_id,reviews_hash" },
  );
  if (error) throw new ApiError(500, "Error guardando análisis.");
}
