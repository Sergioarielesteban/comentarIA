import { getServerSupabase, getServerUser } from "@/lib/server/auth";
import { ApiError, apiErrorResponse } from "@/lib/server/errors";
import { fetchReviews } from "@/lib/server/outscraper";
import {
  requireUserRestaurant,
  saveReviews,
} from "@/lib/server/restaurant";
import {
  assertUsageAvailable,
  incrementUsage,
} from "@/lib/server/usage";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Refresca las reseñas del ÚNICO restaurante del usuario.
 * Ignora cualquier query/place_id externo. Fuente de verdad: user_restaurants.
 */
export async function POST() {
  try {
    const user = await getServerUser();
    const restaurant = await requireUserRestaurant(user.id);

    await assertUsageAvailable(user.id, "reviews_refresh");

    const result = await fetchReviews(restaurant.place_id);
    if (!result.reviews.length) {
      throw new ApiError(404, "No se obtuvieron reseñas nuevas.");
    }

    await incrementUsage(user.id, "reviews_refresh");
    await saveReviews(restaurant.id, result.reviews);

    const supabase = await getServerSupabase();
    const updatePayload: Record<string, unknown> = {
      rating: result.place.rating ?? restaurant.rating,
      total_reviews: result.place.total ?? restaurant.total_reviews,
    };
    // Rellenar portada solo si aún no existía (usuarios migrados sin imagen)
    if (!restaurant.cover_image_url && result.cover_image_url) {
      updatePayload.cover_image_url = result.cover_image_url;
      updatePayload.cover_image_source = result.cover_image_source;
      updatePayload.cover_image_updated_at = new Date().toISOString();
    }
    await supabase
      .from("user_restaurants")
      .update(updatePayload)
      .eq("id", restaurant.id);

    return Response.json({
      reviews_count: result.reviews.length,
      place: {
        place_id: restaurant.place_id,
        nombre: restaurant.name,
        direccion: restaurant.address,
        rating: result.place.rating ?? restaurant.rating,
        total: result.place.total ?? restaurant.total_reviews,
        cover_image_url:
          restaurant.cover_image_url ?? result.cover_image_url ?? null,
        cover_image_source:
          restaurant.cover_image_source ?? result.cover_image_source ?? null,
      },
    });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

// GET legado (lectura de reseñas guardadas)
export async function GET() {
  try {
    const user = await getServerUser();
    const restaurant = await requireUserRestaurant(user.id);
    const supabase = await getServerSupabase();
    const { data } = await supabase
      .from("user_restaurant_reviews")
      .select("data, fetched_at")
      .eq("user_restaurant_id", restaurant.id)
      .maybeSingle();
    return Response.json({
      reviews: data?.data ?? [],
      fetched_at: data?.fetched_at ?? null,
    });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
