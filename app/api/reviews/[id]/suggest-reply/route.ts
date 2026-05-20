import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServerUser } from "@/lib/server/auth";
import { ApiError, apiErrorResponse } from "@/lib/server/errors";
import { getBrandVoiceProfile } from "@/lib/server/review-platform";
import { suggestReviewReply } from "@/lib/server/reply-suggester";
import {
  getReviewForUser,
  requireLinkedLocation,
} from "@/lib/server/review-platform";
import {
  assertUsageAvailable,
  incrementUsage,
} from "@/lib/server/usage";

export const runtime = "nodejs";
export const maxDuration = 60;

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const user = await getServerUser();
    const { id: reviewId } = await params;
    await assertUsageAvailable(user.id, "reply_suggest");

    const review = await getReviewForUser(user.id, reviewId);
    const location = await requireLinkedLocation(user.id);

    if (review.replied) {
      throw new ApiError(400, "Esta reseña ya tiene respuesta publicada.");
    }

    const body = (await request.json().catch(() => ({}))) as { tone?: string };
    const voice = await getBrandVoiceProfile(user.id, location.id);
    const toneHint =
      body.tone === "formal"
        ? "Usa un tono formal y profesional."
        : body.tone === "breve"
          ? "Respuesta breve, máximo 2 frases."
          : "Usa un tono cercano y cálido.";
    const suggested = await suggestReviewReply(
      review,
      location.name,
      voice,
      toneHint,
    );

    const supabase = await createClient();
    const { data: draft, error } = await supabase
      .from("review_reply_drafts")
      .insert({
        user_id: user.id,
        review_id: reviewId,
        suggested_reply: suggested,
        status: "draft",
        tone_profile_used: voice,
      })
      .select("id, suggested_reply, status, created_at")
      .single();

    if (error || !draft) {
      throw new ApiError(500, "No se pudo guardar el borrador.");
    }

    await incrementUsage(user.id, "reply_suggest", 400);

    return NextResponse.json({ draft });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
