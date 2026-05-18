import { getServerUser } from "@/lib/server/auth";
import { ApiError, apiErrorResponse } from "@/lib/server/errors";
import {
  getCachedAnalysisByHash,
  getStoredReviews,
  requireUserRestaurant,
  saveAnalysisCache,
} from "@/lib/server/restaurant";
import { runAnalysisOnServer } from "@/lib/server/analysis-runner";
import { hashReviews } from "@/lib/analysis/hash-reviews";
import {
  assertUsageAvailable,
  incrementUsage,
} from "@/lib/server/usage";

export const runtime = "nodejs";
export const maxDuration = 120;

interface Body {
  force?: boolean;
}

export async function POST(request: Request) {
  try {
    const user = await getServerUser();
    const restaurant = await requireUserRestaurant(user.id);

    const body = (await request.json().catch(() => ({}))) as Body;
    const force = Boolean(body.force);

    const reviews = await getStoredReviews(restaurant.id);
    if (!reviews.length) {
      throw new ApiError(400, "Aún no hay reseñas guardadas.");
    }

    const reviewsHash = hashReviews(reviews);

    if (!force) {
      const cached = await getCachedAnalysisByHash(
        user.id,
        restaurant.place_id,
        reviewsHash,
      );
      if (cached) {
        return Response.json({
          analysis: cached,
          reviews_hash: reviewsHash,
          cached: true,
        });
      }
    }

    await assertUsageAvailable(user.id, "analysis");

    const place = {
      place_id: restaurant.place_id,
      nombre: restaurant.name,
      direccion: restaurant.address ?? "",
      rating: restaurant.rating,
      total: restaurant.total_reviews,
    };

    const { analysis } = await runAnalysisOnServer(place, reviews);

    await incrementUsage(user.id, "analysis");
    await saveAnalysisCache(user.id, restaurant.place_id, reviewsHash, analysis);

    return Response.json({
      analysis,
      reviews_hash: reviewsHash,
      cached: false,
    });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function GET() {
  try {
    const user = await getServerUser();
    const restaurant = await requireUserRestaurant(user.id);
    const reviews = await getStoredReviews(restaurant.id);
    const reviewsHash = reviews.length ? hashReviews(reviews) : null;

    if (!reviewsHash) {
      return Response.json({ analysis: null, reviews_hash: null });
    }

    const cached = await getCachedAnalysisByHash(
      user.id,
      restaurant.place_id,
      reviewsHash,
    );
    return Response.json({
      analysis: cached,
      reviews_hash: reviewsHash,
      cached: Boolean(cached),
    });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
