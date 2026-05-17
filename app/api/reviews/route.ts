import type { Place, Resena } from "@/lib/types";

const OUTSCRAPER_API = "https://api.app.outscraper.com/maps/reviews-v3";

export async function GET(request: Request) {
  const apiKey =
    process.env.OUTSCRAPER_API_KEY || process.env.outscraper_api_key;
  if (!apiKey) {
    return Response.json(
      { error: "Outscraper no configurado en el servidor." },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const place_id = searchParams.get("place_id");
  const query = searchParams.get("query");
  const limit = searchParams.get("limit") || "200";
  const searchQuery = query || place_id;

  if (!searchQuery) {
    return Response.json(
      { error: "Falta place_id o query" },
      { status: 400 },
    );
  }

  try {
    const url = `${OUTSCRAPER_API}?query=${encodeURIComponent(searchQuery)}&reviewsLimit=${limit}&language=es&sort=newest&async=false`;
    const r = await fetch(url, { headers: { "X-API-KEY": apiKey } });
    const data = await r.json();

    if (!r.ok) {
      return Response.json(
        { error: (data as { message?: string })?.message || "Error de Outscraper" },
        { status: r.status },
      );
    }

    const lugar = (data as { data?: Record<string, unknown>[] })?.data?.[0];
    if (!lugar) {
      return Response.json({ error: "No se encontró el lugar." }, { status: 404 });
    }

    const reviewsRaw = (lugar.reviews_data || []) as Record<string, unknown>[];
    const resenas: Resena[] = reviewsRaw.map((rev) => ({
      autor: (rev.author_name || rev.autor_name || "Anónimo") as string,
      nota: (rev.review_rating as number) ?? null,
      texto: (rev.review_text as string) || "",
      hace: (rev.review_datetime_utc as string) || "",
      tiempo: rev.review_timestamp as number | string | undefined,
    }));

    const place: Place = {
      nombre: lugar.name as string,
      direccion: lugar.full_address as string,
      rating: lugar.rating as number,
      total: lugar.reviews as number,
      place_id: lugar.place_id as string,
    };

    return Response.json({
      lugar: place,
      resenas,
      total_descargadas: resenas.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return Response.json(
      { error: `Error al conectar con Outscraper: ${message}` },
      { status: 502 },
    );
  }
}
