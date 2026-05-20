import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getServerUser } from "@/lib/server/auth";
import { ApiError, apiErrorResponse } from "@/lib/server/errors";
import { generateBrandVoiceProfile } from "@/lib/server/brand-voice";
import {
  listGoogleBusinessLocations,
  syncGoogleReviews,
} from "@/lib/server/google-business";
import {
  assertNoLinkedLocation,
  getReviewAccountPublic,
  syncUserRestaurantFromLocation,
} from "@/lib/server/review-platform";
import type { GoogleBusinessLocationOption } from "@/lib/types/reviews-platform";

export const runtime = "nodejs";
export const maxDuration = 120;

interface Body {
  platform_location_id?: string;
}

export async function POST(request: Request) {
  try {
    const user = await getServerUser();
    await assertNoLinkedLocation(user.id);

    const account = await getReviewAccountPublic(user.id);
    if (!account) {
      throw new ApiError(
        401,
        "Conecta tu cuenta de Google Business primero.",
        "google_not_connected",
      );
    }

    const body = (await request.json().catch(() => ({}))) as Body;
    if (!body.platform_location_id) {
      throw new ApiError(400, "Local requerido.");
    }

    const available = await listGoogleBusinessLocations(user.id);
    const selected = available.find(
      (l) => l.platform_location_id === body.platform_location_id,
    );
    if (!selected) {
      throw new ApiError(
        400,
        "El local seleccionado no pertenece a tu cuenta de Google.",
        "invalid_location",
      );
    }

    const location = await linkLocationForUser(user.id, account.id, selected);
    await syncUserRestaurantFromLocation(user.id, location);

    const sync = await syncGoogleReviews(user.id, location.id);
    try {
      await generateBrandVoiceProfile(user.id, location.id);
    } catch {
      // Voz por defecto no bloquea vinculación
    }

    return NextResponse.json({
      ok: true,
      location: {
        id: location.id,
        name: location.name,
        address: location.address,
      },
      sync,
    });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

async function linkLocationForUser(
  userId: string,
  reviewAccountId: string,
  selected: GoogleBusinessLocationOption,
) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("review_locations")
    .insert({
      user_id: userId,
      review_account_id: reviewAccountId,
      platform: "google",
      platform_location_id: selected.platform_location_id,
      google_account_name: selected.google_account_name,
      name: selected.name,
      address: selected.address,
      rating: selected.rating,
      reviews_count: selected.reviews_count,
      connected: true,
      locked_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new ApiError(
        409,
        "Este restaurante ya está vinculado a tu cuenta.",
        "already_locked",
      );
    }
    throw new ApiError(500, "No se pudo vincular el restaurante.");
  }

  return data;
}
