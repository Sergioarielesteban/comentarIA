import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/server/auth";
import { apiErrorResponse } from "@/lib/server/errors";
import { isGoogleBusinessConfigured } from "@/lib/server/google-config";
import {
  getLinkedLocation,
  getReviewAccountPublic,
} from "@/lib/server/review-platform";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getServerUser();
    const configured = isGoogleBusinessConfigured();
    const account = await getReviewAccountPublic(user.id);
    const location = await getLinkedLocation(user.id);

    return NextResponse.json({
      configured,
      connected: Boolean(account && !account.needs_reconnect),
      needsReconnect: account?.needs_reconnect ?? false,
      accountEmail: account?.account_email ?? null,
      location: location
        ? {
            id: location.id,
            name: location.name,
            platform: location.platform,
            last_sync_at: location.last_sync_at,
          }
        : null,
    });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
