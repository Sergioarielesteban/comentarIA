import { copy } from "@/lib/copy/es";

type AuthErrorLike = {
  message?: string;
  code?: string;
  status?: number;
};

export function mapAuthError(error: AuthErrorLike): string {
  const code = error.code ?? "";
  const msg = (error.message ?? "").toLowerCase();

  const byCode: Record<string, string> = {
    invalid_credentials: copy.auth.errors.invalidCredentials,
    user_already_exists: copy.auth.errors.userExists,
    email_exists: copy.auth.errors.userExists,
    email_address_invalid: copy.auth.errors.invalidEmail,
    weak_password: copy.auth.errors.weakPassword,
    over_email_send_rate_limit: copy.auth.errors.rateLimit,
    email_rate_limit_exceeded: copy.auth.errors.rateLimit,
    signup_disabled: copy.auth.errors.signupDisabled,
  };

  if (byCode[code]) return byCode[code];

  if (msg.includes("invalid") && msg.includes("credentials")) {
    return copy.auth.errors.invalidCredentials;
  }
  if (msg.includes("already") || msg.includes("registered")) {
    return copy.auth.errors.userExists;
  }
  if (msg.includes("password")) {
    return copy.auth.errors.weakPassword;
  }
  if (msg.includes("email") && msg.includes("invalid")) {
    return copy.auth.errors.invalidEmail;
  }
  if (msg.includes("rate limit")) {
    return copy.auth.errors.rateLimit;
  }
  if (msg.includes("fetch")) {
    return copy.auth.errors.connection;
  }

  return error.message || copy.auth.errors.generic;
}
