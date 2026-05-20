import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/server/auth";
import { apiErrorResponse } from "@/lib/server/errors";
import { generateBrandVoiceProfile } from "@/lib/server/brand-voice";
import {
  getBrandVoiceProfile,
  requireLinkedLocation,
} from "@/lib/server/review-platform";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getServerUser();
    const location = await requireLinkedLocation(user.id);
    const profile =
      (await getBrandVoiceProfile(user.id, location.id)) ??
      (await generateBrandVoiceProfile(user.id, location.id));
    return NextResponse.json({ profile });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
