import "server-only";

export const GOOGLE_OAUTH_SCOPES = (
  process.env.GOOGLE_BUSINESS_SCOPES ??
  "https://www.googleapis.com/auth/business.manage"
)
  .split(/[\s,]+/)
  .filter(Boolean);

export function getGoogleRedirectUri(): string {
  if (process.env.GOOGLE_REDIRECT_URI) {
    return process.env.GOOGLE_REDIRECT_URI;
  }
  const base =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");
  return `${base.replace(/\/$/, "")}/api/google-business/callback`;
}

export function getGoogleClientConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return null;
  }
  return { clientId, clientSecret };
}

export function isGoogleBusinessConfigured(): boolean {
  return Boolean(
    getGoogleClientConfig() &&
      process.env.APP_ENCRYPTION_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}
