import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServerUser } from "@/lib/server/auth";
import { ApiError, apiErrorResponse } from "@/lib/server/errors";
import { replyToGoogleReview } from "@/lib/server/google-business";
import {
  getReviewForUser,
  requireLinkedLocation,
} from "@/lib/server/review-platform";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_REPLY = 3500;

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface Body {
  replyText?: string;
  draftId?: string;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id: reviewId } = await params;
  const body = (await request.json().catch(() => ({}))) as Body;

  try {
    const user = await getServerUser();
    const replyText = (body.replyText ?? "").trim();

    if (!replyText || replyText.length > MAX_REPLY) {
      throw new ApiError(
        400,
        "Escribe una respuesta válida antes de publicar.",
      );
    }

    const review = await getReviewForUser(user.id, reviewId);
    const location = await requireLinkedLocation(user.id);

    if (review.location_id !== location.id) {
      throw new ApiError(403, "Reseña no pertenece a tu restaurante.");
    }

    if (review.platform !== "google") {
      throw new ApiError(400, "Solo Google Business está disponible por ahora.");
    }

    await replyToGoogleReview(
      user.id,
      {
        platform_review_id: review.platform_review_id,
        google_account_name: location.google_account_name,
        platform_location_id: location.platform_location_id,
      },
      replyText,
    );

    const supabase = await createClient();
    const now = new Date().toISOString();

    await supabase
      .from("reviews")
      .update({
        reply_text: replyText,
        reply_updated_at: now,
        replied: true,
        updated_at: now,
      })
      .eq("id", reviewId)
      .eq("user_id", user.id);

    if (body.draftId) {
      await supabase
        .from("review_reply_drafts")
        .update({
          edited_reply: replyText,
          status: "published",
          published_at: now,
        })
        .eq("id", body.draftId)
        .eq("user_id", user.id);
    }

    return NextResponse.json({ ok: true, published_at: now });
  } catch (err) {
    if (body.draftId) {
      try {
        const user = await getServerUser();
        const supabase = await createClient();
        await supabase
          .from("review_reply_drafts")
          .update({
            status: "failed",
            error_message:
              err instanceof ApiError ? err.message : "Error al publicar",
          })
          .eq("id", body.draftId)
          .eq("user_id", user.id);
      } catch {
        // ignore
      }
    }
    return apiErrorResponse(err);
  }
}
