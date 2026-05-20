import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { BrandVoiceProfile } from "@/lib/types/reviews-platform";

const DEFAULT_PROFILE = {
  tone: "cercano",
  formality: "media",
  emoji_usage: "moderado",
  response_length: "corta",
  forbidden_phrases: [
    "lamentamos las molestias ocasionadas",
    "su feedback es muy importante para nosotros",
    "estamos a su disposición para cualquier cosa",
  ],
  preferred_phrases: ["gracias por venir", "nos encanta leerte"],
  signature: "",
};

function detectEmojiUsage(texts: string[]): string {
  const emojiRe = /[\u{1F300}-\u{1FAFF}]/u;
  const withEmoji = texts.filter((t) => emojiRe.test(t)).length;
  const ratio = texts.length ? withEmoji / texts.length : 0;
  if (ratio > 0.4) return "frecuente";
  if (ratio > 0.1) return "moderado";
  return "ninguno";
}

function avgLength(texts: string[]): string {
  if (!texts.length) return "corta";
  const avg = texts.reduce((s, t) => s + t.length, 0) / texts.length;
  if (avg > 280) return "larga";
  if (avg > 140) return "media";
  return "corta";
}

export async function generateBrandVoiceProfile(
  userId: string,
  locationId: string,
): Promise<BrandVoiceProfile> {
  const supabase = await createClient();
  const { data: replies } = await supabase
    .from("reviews")
    .select("reply_text")
    .eq("user_id", userId)
    .eq("location_id", locationId)
    .eq("replied", true)
    .not("reply_text", "is", null)
    .limit(40);

  const texts = (replies ?? [])
    .map((r) => (r.reply_text as string)?.trim())
    .filter((t): t is string => Boolean(t && t.length > 8));

  const profile =
    texts.length >= 3
      ? {
          tone: texts.some((t) => /\b(tú|vosotros|chicos)\b/i.test(t))
            ? "cercano"
            : "profesional",
          formality: texts.some((t) => /\b(usted|estimado)\b/i.test(t))
            ? "alta"
            : "media",
          emoji_usage: detectEmojiUsage(texts),
          response_length: avgLength(texts),
          forbidden_phrases: DEFAULT_PROFILE.forbidden_phrases,
          preferred_phrases: DEFAULT_PROFILE.preferred_phrases,
          signature: texts.find((t) => t.includes("\n"))?.split("\n").pop() ?? "",
          profile_json: { source: "historical_replies", sampleSize: texts.length },
        }
      : {
          ...DEFAULT_PROFILE,
          profile_json: { source: "default" },
        };

  const { data, error } = await supabase
    .from("brand_voice_profiles")
    .upsert(
      {
        user_id: userId,
        location_id: locationId,
        ...profile,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "location_id" },
    )
    .select("*")
    .single();

  if (error || !data) {
    throw new Error("No se pudo guardar la voz del restaurante.");
  }

  return data as BrandVoiceProfile;
}
