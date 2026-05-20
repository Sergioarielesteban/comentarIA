import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/server/auth";
import { apiErrorResponse } from "@/lib/server/errors";
import {
  getGoogleClientConfig,
  getGoogleRedirectUri,
  GOOGLE_OAUTH_SCOPES,
  isGoogleBusinessConfigured,
} from "@/lib/server/google-config";
import { saveOAuthState } from "@/lib/server/review-platform";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getServerUser();
    if (!isGoogleBusinessConfigured()) {
      return NextResponse.json(
        {
          error: {
            message:
              "Google Business no está configurado en el servidor. Contacta con soporte.",
            code: "google_not_configured",
          },
        },
        { status: 503 },
      );
    }

    const cfg = getGoogleClientConfig()!;
    const state = randomBytes(24).toString("base64url");
    await saveOAuthState(user.id, state);

    const params = new URLSearchParams({
      client_id: cfg.clientId,
      redirect_uri: getGoogleRedirectUri(),
      response_type: "code",
      scope: GOOGLE_OAUTH_SCOPES.join(" "),
      access_type: "offline",
      prompt: "consent",
      state,
    });

    return NextResponse.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    );
  } catch (err) {
    return apiErrorResponse(err);
  }
}
