import type { Analysis, Place, Resena } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

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

export async function obtenerUserRestaurant(
  userId: string,
): Promise<UserRestaurantRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_restaurants")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as UserRestaurantRow | null) ?? null;
}

export async function obtenerReviews(
  userRestaurantId: string,
): Promise<Resena[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_restaurant_reviews")
    .select("data")
    .eq("user_restaurant_id", userRestaurantId)
    .maybeSingle();
  if (error) throw error;
  return ((data?.data as Resena[] | undefined) ?? []) as Resena[];
}

export async function obtenerAnalisisCacheado(
  userId: string,
  placeId: string,
): Promise<Analysis | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("restaurant_analysis_cache")
    .select("analysis_json, generated_at")
    .eq("user_id", userId)
    .eq("place_id", placeId)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data?.analysis_json as Analysis | undefined) ?? null;
}

export function rowToPlace(row: UserRestaurantRow): Place {
  return {
    place_id: row.place_id,
    nombre: row.name,
    direccion: row.address ?? "",
    rating: row.rating,
    total: row.total_reviews,
  };
}

export interface DailyUsageRow {
  chat_requests: number;
  analysis_runs: number;
  reviews_refreshes: number;
  place_searches: number;
}

export async function obtenerUsoHoy(
  userId: string,
): Promise<DailyUsageRow | null> {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("usage_daily")
    .select(
      "chat_requests, analysis_runs, reviews_refreshes, place_searches",
    )
    .eq("user_id", userId)
    .eq("usage_date", today)
    .maybeSingle();
  if (error) return null;
  return (data as DailyUsageRow | null) ?? null;
}
