import { getServerSupabase, getServerUser } from "@/lib/server/auth";
import { ApiError, apiErrorResponse } from "@/lib/server/errors";
import { fetchReviews } from "@/lib/server/outscraper";
import {
  assertRestaurantNotAlreadyLocked,
  saveReviews,
} from "@/lib/server/restaurant";
import {
  assertUsageAvailable,
  incrementUsage,
} from "@/lib/server/usage";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  place_id?: string;
  name?: string;
  address?: string;
}

export async function POST(request: Request) {
  try {
    const user = await getServerUser();
    await assertRestaurantNotAlreadyLocked(user.id);

    const body = (await request.json().catch(() => ({}))) as Body;
    const placeId = String(body.place_id ?? "").trim();
    const name = String(body.name ?? "").trim().slice(0, 200);
    const address = String(body.address ?? "").trim().slice(0, 300);

    if (!placeId && !name) {
      throw new ApiError(400, "Faltan datos del restaurante.");
    }

    await assertUsageAvailable(user.id, "reviews_refresh");
    await incrementUsage(user.id, "reviews_refresh");

    const query = placeId || `${name} ${address}`.trim();
    const result = await fetchReviews(query);

    if (!result.reviews.length) {
      throw new ApiError(404, "No hay reseñas para analizar.");
    }

    const supabase = await getServerSupabase();
    const coverUrl = result.cover_image_url;
    const coverSource = result.cover_image_source;
    const now = new Date().toISOString();

    const { data: inserted, error: insertError } = await supabase
      .from("user_restaurants")
      .insert({
        user_id: user.id,
        place_id: result.place.place_id || placeId,
        name: result.place.nombre || name,
        address: result.place.direccion || address || null,
        rating: result.place.rating ?? null,
        total_reviews: result.place.total ?? null,
        cover_image_url: coverUrl,
        cover_image_source: coverSource,
        cover_image_updated_at: coverUrl ? now : null,
      })
      .select()
      .single();

    if (insertError || !inserted) {
      // unique_violation = ya tiene restaurante (race condition)
      if ((insertError as { code?: string })?.code === "23505") {
        throw new ApiError(
          409,
          "Tu cuenta ya tiene un restaurante vinculado.",
          "already_locked",
        );
      }
      throw new ApiError(500, "No se pudo guardar el restaurante.");
    }

    await saveReviews(inserted.id, result.reviews);

    return Response.json({
      restaurant: inserted,
      reviews_count: result.reviews.length,
    });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
