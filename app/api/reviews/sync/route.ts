import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/server/auth";
import { apiErrorResponse } from "@/lib/server/errors";
import { syncGoogleReviews } from "@/lib/server/google-business";
import {
  requireLinkedLocation,
  syncUserRestaurantFromLocation,
} from "@/lib/server/review-platform";
import {
  assertUsageAvailable,
  incrementUsage,
} from "@/lib/server/usage";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST() {
  try {
    const user = await getServerUser();
    const location = await requireLinkedLocation(user.id);
    await assertUsageAvailable(user.id, "review_sync");

    const result = await syncGoogleReviews(user.id, location.id);
    await syncUserRestaurantFromLocation(user.id, location);
    await incrementUsage(user.id, "review_sync");

    return NextResponse.json(result);
  } catch (err) {
    return apiErrorResponse(err);
  }
}
