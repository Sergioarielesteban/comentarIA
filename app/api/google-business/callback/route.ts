import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/server/auth";
import { apiErrorResponse } from "@/lib/server/errors";
import {
  exchangeGoogleCode,
  fetchGoogleUserEmail,
  storeGoogleTokens,
} from "@/lib/server/google-business";
import { consumeOAuthState } from "@/lib/server/review-platform";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await getServerUser();
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const oauthError = url.searchParams.get("error");

    const base = new URL("/conectar-google", url.origin);

    if (oauthError) {
      base.searchParams.set("error", "google_denied");
      return NextResponse.redirect(base);
    }

    if (!code || !state) {
      base.searchParams.set("error", "invalid_callback");
      return NextResponse.redirect(base);
    }

    const validState = await consumeOAuthState(user.id, state);
    if (!validState) {
      base.searchParams.set("error", "invalid_state");
      return NextResponse.redirect(base);
    }

    const tokens = await exchangeGoogleCode(code);
    const email = await fetchGoogleUserEmail(tokens.access_token);
    await storeGoogleTokens(user.id, tokens, email);

    base.searchParams.set("connected", "1");
    return NextResponse.redirect(base);
  } catch (err) {
    const url = new URL(request.url);
    const base = new URL("/conectar-google", url.origin);
    base.searchParams.set("error", "callback_failed");
    try {
      return NextResponse.redirect(base);
    } catch {
      return apiErrorResponse(err);
    }
  }
}
