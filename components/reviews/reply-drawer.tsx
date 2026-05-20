"use client";

import { ReviewReplyPanel } from "@/components/reviews/review-reply-panel";
import type { ReviewRow } from "@/lib/types/reviews-platform";

/** Wrapper de compatibilidad — usar ReviewReplyPanel en código nuevo. */
export function ReplyDrawer({
  review,
  open,
  onClose,
  onPublished,
}: {
  review: ReviewRow | null;
  open: boolean;
  onClose: () => void;
  onPublished: () => void;
}) {
  return (
    <ReviewReplyPanel
      review={review}
      open={open}
      onClose={onClose}
      onSaved={onPublished}
    />
  );
}
