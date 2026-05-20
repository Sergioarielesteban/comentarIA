import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/server/auth";
import { apiErrorResponse } from "@/lib/server/errors";
import {
  getLinkedLocation,
  listReviewsForUser,
} from "@/lib/server/review-platform";
import type { ReviewFilter } from "@/lib/types/reviews-platform";

export const runtime = "nodejs";

const FILTERS: ReviewFilter[] = [
  "all",
  "unanswered",
  "negative",
  "five_star",
  "recent",
  "answered",
  "urgent",
];

/** Bandeja del centro de reputación (reseñas importadas por plataforma). */
export async function GET(request: Request) {
  try {
    const user = await getServerUser();
    const location = await getLinkedLocation(user.id);
    if (!location) {
      return NextResponse.json({
        reviews: [],
        location: null,
        needsConnection: true,
      });
    }

    const url = new URL(request.url);
    const filterParam = url.searchParams.get("filter") ?? "all";
    const filter = FILTERS.includes(filterParam as ReviewFilter)
      ? (filterParam as ReviewFilter)
      : "all";

    const reviews = await listReviewsForUser(user.id, filter, 80);

    return NextResponse.json({
      reviews,
      location: {
        id: location.id,
        name: location.name,
        platform: location.platform,
        last_sync_at: location.last_sync_at,
      },
      needsConnection: false,
    });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
