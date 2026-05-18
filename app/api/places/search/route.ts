import { getServerUser } from "@/lib/server/auth";
import { ApiError, apiErrorResponse } from "@/lib/server/errors";
import { searchPlaces } from "@/lib/server/outscraper";
import { getUserRestaurant } from "@/lib/server/restaurant";
import {
  assertUsageAvailable,
  incrementUsage,
} from "@/lib/server/usage";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(request: Request) {
  try {
    const user = await getServerUser();

    // Solo durante onboarding (sin restaurante vinculado).
    const existing = await getUserRestaurant(user.id);
    if (existing) {
      throw new ApiError(
        403,
        "Tu cuenta ya tiene un restaurante vinculado.",
        "already_locked",
      );
    }

    const { searchParams } = new URL(request.url);
    const nombre = (searchParams.get("nombre") ?? "").trim();
    const ubicacion = (searchParams.get("ubicacion") ?? "").trim();

    if (nombre.length < 2 || nombre.length > 80) {
      throw new ApiError(400, "Nombre inválido (2–80 caracteres).");
    }
    const ubicacionLimpia = ubicacion.slice(0, 80);

    await assertUsageAvailable(user.id, "place_search");
    await incrementUsage(user.id, "place_search");

    const results = await searchPlaces(nombre, ubicacionLimpia || undefined);
    return Response.json({ results });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
