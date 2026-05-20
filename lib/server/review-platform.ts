import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ApiError } from "@/lib/server/errors";
import type {
  BrandVoiceProfile,
  ReviewAccountPublic,
  ReviewFilter,
  ReviewLocationRow,
  ReviewRow,
} from "@/lib/types/reviews-platform";

export async function getReviewAccountPublic(
  userId: string,
): Promise<ReviewAccountPublic | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("review_accounts")
    .select(
      "id, platform, account_email, connected_at, revoked_at, needs_reconnect",
    )
    .eq("user_id", userId)
    .eq("platform", "google")
    .is("revoked_at", null)
    .maybeSingle();
  if (error || !data) return null;
  return data as ReviewAccountPublic;
}

export async function getLinkedLocation(
  userId: string,
): Promise<ReviewLocationRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("review_locations")
    .select("*")
    .eq("user_id", userId)
    .eq("connected", true)
    .maybeSingle();
  if (error || !data) return null;
  return data as ReviewLocationRow;
}

export async function requireLinkedLocation(
  userId: string,
): Promise<ReviewLocationRow> {
  const loc = await getLinkedLocation(userId);
  if (!loc) {
    throw new ApiError(
      403,
      "No tienes un restaurante vinculado. Conecta Google Business.",
      "no_location",
    );
  }
  return loc;
}

export async function assertNoLinkedLocation(userId: string): Promise<void> {
  const loc = await getLinkedLocation(userId);
  if (loc) {
    throw new ApiError(
      409,
      "Este restaurante ya está vinculado a tu cuenta.",
      "already_locked",
    );
  }
}

export async function getReviewForUser(
  userId: string,
  reviewId: string,
): Promise<ReviewRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("id", reviewId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) {
    throw new ApiError(404, "Reseña no encontrada.", "review_not_found");
  }
  return data as ReviewRow;
}

export async function listReviewsForUser(
  userId: string,
  filter: ReviewFilter = "all",
  limit = 50,
): Promise<ReviewRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("reviews")
    .select("*")
    .eq("user_id", userId)
    .order("review_date", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (filter === "unanswered") {
    query = query.eq("replied", false);
  } else if (filter === "answered") {
    query = query.eq("replied", true);
  } else if (filter === "negative") {
    query = query.lte("rating", 2);
  } else if (filter === "five_star") {
    query = query.eq("rating", 5);
  } else if (filter === "urgent") {
    query = query.lte("rating", 2).eq("replied", false);
  }

  const { data, error } = await query;
  if (error) {
    throw new ApiError(500, "No se pudieron cargar las reseñas.");
  }
  return (data ?? []) as ReviewRow[];
}

export async function getBrandVoiceProfile(
  userId: string,
  locationId: string,
): Promise<BrandVoiceProfile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("brand_voice_profiles")
    .select("*")
    .eq("user_id", userId)
    .eq("location_id", locationId)
    .maybeSingle();
  return (data as BrandVoiceProfile | null) ?? null;
}

/** Sincroniza review_locations → user_restaurants para el resto de la app. */
export async function syncUserRestaurantFromLocation(
  userId: string,
  location: ReviewLocationRow,
): Promise<void> {
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("user_restaurants")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  const payload = {
    place_id: location.platform_location_id,
    name: location.name,
    address: location.address,
    rating: location.rating,
    total_reviews: location.reviews_count,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    await admin
      .from("user_restaurants")
      .update({
        rating: payload.rating,
        total_reviews: payload.total_reviews,
        updated_at: payload.updated_at,
      })
      .eq("id", existing.id);
    return;
  }

  await admin.from("user_restaurants").insert({
    user_id: userId,
    ...payload,
    locked_at: new Date().toISOString(),
  });
}

export async function saveOAuthState(
  userId: string,
  stateToken: string,
): Promise<void> {
  const admin = createAdminClient();
  const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  await admin.from("oauth_states").insert({
    user_id: userId,
    state_token: stateToken,
    platform: "google",
    expires_at: expires,
  });
}

export async function consumeOAuthState(
  userId: string,
  stateToken: string,
): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("oauth_states")
    .select("id, expires_at")
    .eq("user_id", userId)
    .eq("state_token", stateToken)
    .maybeSingle();

  if (!data) return false;
  if (new Date(data.expires_at as string) < new Date()) return false;

  await admin.from("oauth_states").delete().eq("id", data.id);
  return true;
}
