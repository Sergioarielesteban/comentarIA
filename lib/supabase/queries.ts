import type { Analysis, Place, Resena } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

export async function guardarRestaurante(userId: string, place: Place) {
  const supabase = createClient();
  const payload = {
    user_id: userId,
    place_id: place.place_id || null,
    nombre: place.nombre,
    direccion: place.direccion || "",
    rating: place.rating ?? null,
    total_resenas: place.total ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase
    .from("restaurantes")
    .select("id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from("restaurantes")
      .update(payload)
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from("restaurantes")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function obtenerRestaurante(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("restaurantes")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function guardarResenasCache(
  restauranteId: string,
  reviews: Resena[],
) {
  const supabase = createClient();
  const { error } = await supabase.from("resenas_cache").upsert(
    {
      restaurante_id: restauranteId,
      data: reviews,
      fetched_at: new Date().toISOString(),
    },
    { onConflict: "restaurante_id" },
  );
  if (error) throw error;
}

export async function obtenerResenasCache(restauranteId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("resenas_cache")
    .select("data, fetched_at")
    .eq("restaurante_id", restauranteId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function guardarAnalisis(
  userId: string,
  restauranteId: string,
  analysis: Analysis,
  reviewsHash: string,
) {
  const supabase = createClient();
  const payload = {
    user_id: userId,
    restaurante_id: restauranteId,
    data: analysis,
    reviews_hash: reviewsHash,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase
    .from("analisis")
    .select("id")
    .eq("restaurante_id", restauranteId)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from("analisis")
      .update(payload)
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from("analisis")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function obtenerAnalisis(restauranteId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("analisis")
    .select("data, reviews_hash, created_at")
    .eq("restaurante_id", restauranteId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export function rowToPlace(row: {
  place_id: string | null;
  nombre: string;
  direccion: string | null;
  rating: number | null;
  total_resenas: number | null;
}): Place {
  return {
    place_id: row.place_id,
    nombre: row.nombre,
    direccion: row.direccion || "",
    rating: row.rating,
    total: row.total_resenas,
  };
}
