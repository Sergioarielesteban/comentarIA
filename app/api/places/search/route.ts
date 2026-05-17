const OUTSCRAPER_API = "https://api.app.outscraper.com/maps/search-v3";

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
  const nombre = searchParams.get("nombre");
  const ubicacion = searchParams.get("ubicacion");

  if (!nombre) {
    return Response.json({ error: "Falta el parámetro nombre" }, { status: 400 });
  }

  const query = ubicacion
    ? `${nombre} ${ubicacion}`
    : `${nombre} restaurante`;

  try {
    const url = `${OUTSCRAPER_API}?query=${encodeURIComponent(query)}&language=es&limit=6&async=false`;
    const r = await fetch(url, { headers: { "X-API-KEY": apiKey } });
    const data = await r.json();

    if (!r.ok) {
      return Response.json(
        { error: (data as { message?: string })?.message || "Error de Outscraper" },
        { status: r.status },
      );
    }

    const places = ((data as { data?: unknown[] })?.data?.[0] || []) as Record<
      string,
      unknown
    >[];

    const results = places.map((p) => ({
      place_id: p.place_id as string,
      name: p.name as string,
      formatted_address: (p.full_address || p.address) as string,
      rating: p.rating as number | undefined,
      user_ratings_total: p.reviews as number | undefined,
    }));

    return Response.json({ results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return Response.json({ error: `Error al buscar: ${message}` }, { status: 502 });
  }
}
