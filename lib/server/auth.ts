import "server-only";
import { createClient } from "@/lib/supabase/server";
import { ApiError } from "@/lib/server/errors";

export interface ServerUser {
  id: string;
  email: string | null;
}

export async function getServerUser(): Promise<ServerUser> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    throw new ApiError(401, "No autenticado.");
  }
  return { id: user.id, email: user.email ?? null };
}

export async function getServerSupabase() {
  return createClient();
}

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
