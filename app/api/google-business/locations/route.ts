import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/server/auth";
import { apiErrorResponse } from "@/lib/server/errors";
import { listGoogleBusinessLocations } from "@/lib/server/google-business";
import { getLinkedLocation } from "@/lib/server/review-platform";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  try {
    const user = await getServerUser();
    const linked = await getLinkedLocation(user.id);
    if (linked) {
      return NextResponse.json({
        linked: true,
        location: {
          id: linked.id,
          name: linked.name,
          address: linked.address,
        },
      });
    }

    const locations = await listGoogleBusinessLocations(user.id);
    if (locations.length === 0) {
      return NextResponse.json({
        linked: false,
        locations: [],
        message:
          "No encontramos locales asociados a esta cuenta de Google.",
      });
    }

    return NextResponse.json({ linked: false, locations });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
