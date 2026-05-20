import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/server/auth";
import { apiErrorResponse } from "@/lib/server/errors";
import { revokeGoogleConnection } from "@/lib/server/google-business";

export const runtime = "nodejs";

export async function POST() {
  try {
    const user = await getServerUser();
    await revokeGoogleConnection(user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
