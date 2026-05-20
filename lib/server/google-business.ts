import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { encryptSecret, decryptSecret } from "@/lib/server/crypto";
import { ApiError } from "@/lib/server/errors";
import {
  getGoogleClientConfig,
  GOOGLE_OAUTH_SCOPES,
} from "@/lib/server/google-config";
import type { GoogleBusinessLocationOption } from "@/lib/types/reviews-platform";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";
const ACCOUNTS_URL =
  "https://mybusinessaccountmanagement.googleapis.com/v1/accounts";
const BUSINESS_INFO_BASE =
  "https://mybusinessbusinessinformation.googleapis.com/v1";
const REVIEWS_BASE = "https://mybusiness.googleapis.com/v4";

interface TokenRow {
  id: string;
  access_token_encrypted: string | null;
  refresh_token_encrypted: string | null;
  expires_at: string | null;
  needs_reconnect: boolean;
  google_account_name: string | null;
}

interface GoogleReviewRaw {
  reviewId?: string;
  name?: string;
  reviewer?: { displayName?: string };
  starRating?: string;
  comment?: string;
  createTime?: string;
  updateTime?: string;
  reviewReply?: { comment?: string; updateTime?: string };
}

function starRatingToInt(star?: string): number | null {
  const map: Record<string, number> = {
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5,
  };
  return star ? (map[star] ?? null) : null;
}

async function getTokenRow(userId: string): Promise<TokenRow | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("review_accounts")
    .select(
      "id, access_token_encrypted, refresh_token_encrypted, expires_at, needs_reconnect, google_account_name",
    )
    .eq("user_id", userId)
    .eq("platform", "google")
    .is("revoked_at", null)
    .maybeSingle();
  return (data as TokenRow | null) ?? null;
}

async function markNeedsReconnect(accountId: string): Promise<void> {
  const admin = createAdminClient();
  await admin
    .from("review_accounts")
    .update({ needs_reconnect: true, updated_at: new Date().toISOString() })
    .eq("id", accountId);
}

async function refreshAccessToken(
  accountId: string,
  refreshToken: string,
): Promise<{ accessToken: string; expiresAt: string }> {
  const cfg = getGoogleClientConfig();
  if (!cfg) throw new ApiError(503, "Google Business no está configurado.");

  const body = new URLSearchParams({
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    await markNeedsReconnect(accountId);
    throw new ApiError(
      401,
      "La conexión con Google ha caducado. Vuelve a conectar.",
      "google_token_expired",
    );
  }

  const json = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };
  const expiresAt = new Date(
    Date.now() + (json.expires_in - 60) * 1000,
  ).toISOString();

  const admin = createAdminClient();
  await admin
    .from("review_accounts")
    .update({
      access_token_encrypted: encryptSecret(json.access_token),
      expires_at: expiresAt,
      needs_reconnect: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", accountId);

  return { accessToken: json.access_token, expiresAt };
}

export async function getValidGoogleAccessToken(
  userId: string,
): Promise<string> {
  const row = await getTokenRow(userId);
  if (!row?.access_token_encrypted) {
    throw new ApiError(
      401,
      "Conecta tu cuenta de Google Business para continuar.",
      "google_not_connected",
    );
  }
  if (row.needs_reconnect) {
    throw new ApiError(
      401,
      "La conexión con Google ha caducado. Vuelve a conectar.",
      "google_needs_reconnect",
    );
  }

  const expiresAt = row.expires_at ? new Date(row.expires_at).getTime() : 0;
  const stillValid = expiresAt > Date.now() + 60_000;

  if (stillValid) {
    return decryptSecret(row.access_token_encrypted);
  }

  if (!row.refresh_token_encrypted) {
    await markNeedsReconnect(row.id);
    throw new ApiError(
      401,
      "La conexión con Google ha caducado. Vuelve a conectar.",
      "google_token_expired",
    );
  }

  const refreshed = await refreshAccessToken(
    row.id,
    decryptSecret(row.refresh_token_encrypted),
  );
  return refreshed.accessToken;
}

export async function storeGoogleTokens(
  userId: string,
  tokens: {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope?: string;
  },
  accountEmail: string | null,
): Promise<void> {
  const admin = createAdminClient();
  const expiresAt = new Date(
    Date.now() + (tokens.expires_in - 60) * 1000,
  ).toISOString();
  const scopes = tokens.scope
    ? tokens.scope.split(" ")
    : [...GOOGLE_OAUTH_SCOPES];

  const payload = {
    user_id: userId,
    platform: "google",
    account_email: accountEmail,
    access_token_encrypted: encryptSecret(tokens.access_token),
    refresh_token_encrypted: tokens.refresh_token
      ? encryptSecret(tokens.refresh_token)
      : null,
    expires_at: expiresAt,
    scopes,
    revoked_at: null,
    needs_reconnect: false,
    connected_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await admin
    .from("review_accounts")
    .select("id")
    .eq("user_id", userId)
    .eq("platform", "google")
    .maybeSingle();

  if (existing) {
    const update: Record<string, unknown> = { ...payload };
    if (!tokens.refresh_token) {
      delete update.refresh_token_encrypted;
    }
    await admin.from("review_accounts").update(update).eq("id", existing.id);
  } else {
    await admin.from("review_accounts").insert(payload);
  }
}

export async function exchangeGoogleCode(
  code: string,
): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
}> {
  const cfg = getGoogleClientConfig();
  if (!cfg) throw new ApiError(503, "Google Business no está configurado.");

  const { getGoogleRedirectUri } = await import("@/lib/server/google-config");
  const body = new URLSearchParams({
    code,
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    redirect_uri: getGoogleRedirectUri(),
    grant_type: "authorization_code",
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    throw new ApiError(400, "No se pudo completar la autorización con Google.");
  }

  return res.json() as Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope?: string;
  }>;
}

export async function fetchGoogleUserEmail(
  accessToken: string,
): Promise<string | null> {
  const res = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { email?: string };
  return json.email ?? null;
}

export async function revokeGoogleConnection(userId: string): Promise<void> {
  const admin = createAdminClient();
  const row = await getTokenRow(userId);
  if (row?.access_token_encrypted) {
    try {
      const token = decryptSecret(row.access_token_encrypted);
      await fetch(`${TOKEN_URL}/revoke?token=${encodeURIComponent(token)}`, {
        method: "POST",
      });
    } catch {
      // Ignorar fallo de revocación remota
    }
  }
  await admin
    .from("review_accounts")
    .update({
      revoked_at: new Date().toISOString(),
      needs_reconnect: true,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("platform", "google");
}

async function googleFetch<T>(
  url: string,
  accessToken: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ApiError(
      res.status === 403 ? 403 : 502,
      res.status === 403
        ? "Necesitas ser propietario o gestor del perfil para conectar este negocio."
        : "No se pudo comunicar con Google Business.",
      "google_api_error",
    );
  }
  return res.json() as Promise<T>;
}

export async function listGoogleBusinessLocations(
  userId: string,
): Promise<GoogleBusinessLocationOption[]> {
  const accessToken = await getValidGoogleAccessToken(userId);
  const accountsRes = await googleFetch<{ accounts?: { name: string }[] }>(
    ACCOUNTS_URL,
    accessToken,
  );

  const accounts = accountsRes.accounts ?? [];
  if (accounts.length === 0) {
    return [];
  }

  const locations: GoogleBusinessLocationOption[] = [];

  for (const account of accounts) {
    const accountName = account.name;
    const url = `${BUSINESS_INFO_BASE}/${accountName}/locations?readMask=name,title,storefrontAddress,averageRating,metadata`;
    let pageToken: string | undefined;

    do {
      const pageUrl = pageToken
        ? `${url}&pageToken=${encodeURIComponent(pageToken)}`
        : url;
      const locRes = await googleFetch<{
        locations?: {
          name: string;
          title?: string;
          storefrontAddress?: {
            addressLines?: string[];
            locality?: string;
          };
          averageRating?: number;
          metadata?: { newReviewCount?: number };
        }[];
        nextPageToken?: string;
      }>(pageUrl, accessToken);

      for (const loc of locRes.locations ?? []) {
        const lines = loc.storefrontAddress?.addressLines ?? [];
        const locality = loc.storefrontAddress?.locality ?? "";
        const address =
          [...lines, locality].filter(Boolean).join(", ") || null;
        locations.push({
          platform_location_id: loc.name,
          google_account_name: accountName,
          name: loc.title ?? "Local sin nombre",
          address,
          rating: loc.averageRating ?? null,
          reviews_count: loc.metadata?.newReviewCount ?? null,
        });
      }
      pageToken = locRes.nextPageToken;
    } while (pageToken);
  }

  return locations;
}

export interface SyncReviewsResult {
  imported: number;
  updated: number;
  total: number;
  last_sync_at: string;
}

export async function syncGoogleReviews(
  userId: string,
  locationId: string,
): Promise<SyncReviewsResult> {
  const admin = createAdminClient();
  const { data: location, error: locErr } = await admin
    .from("review_locations")
    .select("*")
    .eq("id", locationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (locErr || !location) {
    throw new ApiError(404, "Local no encontrado.");
  }

  const accessToken = await getValidGoogleAccessToken(userId);
  const accountName = location.google_account_name as string;
  const locationName = location.platform_location_id as string;

  const reviewParent = `${accountName}/${locationName}`;
  const url = `${REVIEWS_BASE}/${reviewParent}/reviews`;

  let imported = 0;
  let updated = 0;
  const rows: Record<string, unknown>[] = [];

  let pageToken: string | undefined;
  do {
    const pageUrl = pageToken
      ? `${url}?pageToken=${encodeURIComponent(pageToken)}`
      : url;
    const res = await googleFetch<{
      reviews?: GoogleReviewRaw[];
      nextPageToken?: string;
    }>(pageUrl, accessToken);

    for (const r of res.reviews ?? []) {
      const platformReviewId = r.name ?? r.reviewId ?? "";
      if (!platformReviewId) continue;

      const rating = starRatingToInt(r.starRating);
      const replied = Boolean(r.reviewReply?.comment);
      const risk =
        rating !== null && rating <= 2
          ? 0.85
          : rating === 3
            ? 0.45
            : null;

      rows.push({
        user_id: userId,
        location_id: locationId,
        platform: "google",
        platform_review_id: platformReviewId,
        author_name: r.reviewer?.displayName ?? "Cliente",
        rating,
        text: r.comment ?? "",
        review_date: r.createTime ?? null,
        update_date: r.updateTime ?? null,
        reply_text: r.reviewReply?.comment ?? null,
        reply_updated_at: r.reviewReply?.updateTime ?? null,
        replied,
        risk_score: risk,
        raw_json: r,
        updated_at: new Date().toISOString(),
      });
    }
    pageToken = res.nextPageToken;
  } while (pageToken);

  for (const row of rows) {
    const { data: existing } = await admin
      .from("reviews")
      .select("id")
      .eq("location_id", locationId)
      .eq("platform_review_id", row.platform_review_id)
      .maybeSingle();

    if (existing) {
      await admin.from("reviews").update(row).eq("id", existing.id);
      updated++;
    } else {
      await admin.from("reviews").insert(row);
      imported++;
    }
  }

  const lastSync = new Date().toISOString();
  await admin
    .from("review_locations")
    .update({
      last_sync_at: lastSync,
      reviews_count: rows.length,
      updated_at: lastSync,
    })
    .eq("id", locationId);

  return {
    imported,
    updated,
    total: rows.length,
    last_sync_at: lastSync,
  };
}

export async function replyToGoogleReview(
  userId: string,
  review: {
    platform_review_id: string;
    google_account_name: string | null;
    platform_location_id: string;
  },
  replyText: string,
): Promise<void> {
  const accessToken = await getValidGoogleAccessToken(userId);
  const accountName = review.google_account_name;
  if (!accountName) {
    throw new ApiError(400, "Falta la cuenta de Google asociada al local.");
  }

  const reviewName = review.platform_review_id.includes("/")
    ? review.platform_review_id
    : `${accountName}/${review.platform_location_id}/reviews/${review.platform_review_id}`;
  const url = `${REVIEWS_BASE}/${reviewName}/reply`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ comment: replyText }),
  });

  if (!res.ok) {
    throw new ApiError(
      502,
      "No se pudo publicar la respuesta. Revísala e inténtalo de nuevo.",
      "google_publish_failed",
    );
  }
}
