export type ReviewPlatform =
  | "google"
  | "tripadvisor"
  | "thefork"
  | "booking";

export type ReplyDraftStatus = "draft" | "approved" | "published" | "failed";

export interface ReviewAccountPublic {
  id: string;
  platform: ReviewPlatform;
  account_email: string | null;
  connected_at: string;
  revoked_at: string | null;
  needs_reconnect: boolean;
}

export interface ReviewLocationRow {
  id: string;
  user_id: string;
  review_account_id: string | null;
  platform: ReviewPlatform;
  platform_location_id: string;
  google_account_name: string | null;
  name: string;
  address: string | null;
  rating: number | null;
  reviews_count: number | null;
  cover_image_url: string | null;
  connected: boolean;
  locked_at: string;
  last_sync_at: string | null;
}

export interface ReviewRow {
  id: string;
  user_id: string;
  location_id: string;
  platform: ReviewPlatform;
  platform_review_id: string;
  author_name: string | null;
  rating: number | null;
  text: string | null;
  review_date: string | null;
  update_date: string | null;
  reply_text: string | null;
  reply_updated_at: string | null;
  replied: boolean;
  sentiment: string | null;
  risk_score: number | null;
  themes: unknown;
}

export interface ReviewReplyDraftRow {
  id: string;
  review_id: string;
  suggested_reply: string;
  edited_reply: string | null;
  status: ReplyDraftStatus;
  created_at: string;
  published_at: string | null;
  error_message: string | null;
}

export interface BrandVoiceProfile {
  id: string;
  location_id: string;
  tone: string | null;
  formality: string | null;
  emoji_usage: string | null;
  response_length: string | null;
  forbidden_phrases: string[] | null;
  preferred_phrases: string[] | null;
  signature: string | null;
  profile_json: Record<string, unknown> | null;
}

export interface GoogleBusinessLocationOption {
  platform_location_id: string;
  google_account_name: string;
  name: string;
  address: string | null;
  rating: number | null;
  reviews_count: number | null;
}

export type ReviewFilter =
  | "all"
  | "unanswered"
  | "negative"
  | "five_star"
  | "recent"
  | "answered"
  | "urgent";
