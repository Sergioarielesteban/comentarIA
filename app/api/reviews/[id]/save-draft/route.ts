import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServerUser } from "@/lib/server/auth";
import { ApiError, apiErrorResponse } from "@/lib/server/errors";
import { getReviewForUser } from "@/lib/server/review-platform";
import type { ReplyDraftStatus } from "@/lib/types/reviews-platform";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const user = await getServerUser();
    const { id: reviewId } = await params;
    const review = await getReviewForUser(user.id, reviewId);

    if (review.replied) {
      throw new ApiError(400, "Esta reseña ya tiene respuesta publicada.");
    }

    const body = (await request.json()) as {
      replyText?: string;
      draftId?: string | null;
      status?: ReplyDraftStatus;
    };

    const replyText = body.replyText?.trim();
    if (!replyText) {
      throw new ApiError(400, "La respuesta no puede estar vacía.");
    }

    const status: ReplyDraftStatus =
      body.status === "approved" ? "approved" : "draft";

    const supabase = await createClient();

    if (body.draftId) {
      const { data: draft, error } = await supabase
        .from("review_reply_drafts")
        .update({
          edited_reply: replyText,
          status,
          ...(status === "approved"
            ? { approved_at: new Date().toISOString() }
            : {}),
        })
        .eq("id", body.draftId)
        .eq("user_id", user.id)
        .eq("review_id", reviewId)
        .select("id, suggested_reply, edited_reply, status, created_at")
        .single();

      if (error || !draft) {
        throw new ApiError(500, "No se pudo actualizar el borrador.");
      }

      return NextResponse.json({ draft });
    }

    const { data: draft, error } = await supabase
      .from("review_reply_drafts")
      .insert({
        user_id: user.id,
        review_id: reviewId,
        suggested_reply: replyText,
        edited_reply: replyText,
        status,
      })
      .select("id, suggested_reply, edited_reply, status, created_at")
      .single();

    if (error || !draft) {
      throw new ApiError(500, "No se pudo guardar el borrador.");
    }

    return NextResponse.json({ draft });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
