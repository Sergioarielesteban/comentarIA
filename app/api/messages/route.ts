import { getServerUser, isAdminEmail } from "@/lib/server/auth";
import { apiErrorResponse, ApiError } from "@/lib/server/errors";
import { callLLM, getLlmStatus } from "@/lib/api/llm";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Endpoint LLM genérico. Restringido:
 *  - en producción: solo admins (ADMIN_EMAILS).
 *  - en dev: cualquier usuario autenticado.
 * No expuesto al flujo normal de cliente.
 */
async function assertAccess(): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    const user = await getServerUser();
    if (!isAdminEmail(user.email)) {
      throw new ApiError(404, "Endpoint no disponible.");
    }
    return;
  }
  await getServerUser();
}

export async function POST(request: Request) {
  try {
    await assertAccess();
    const body = await request.json().catch(() => ({}));

    const messages = Array.isArray(body?.messages) ? body.messages : null;
    if (!messages?.length) {
      throw new ApiError(400, "Mensajes requeridos.");
    }

    // Forzamos máximos del servidor, ignoramos lo que pida cliente.
    return callLLM({
      messages,
      max_tokens: 1024,
      json: false,
    });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return Response.json({ ok: false }, { status: 404 });
  }
  const status = await getLlmStatus();
  return Response.json(status);
}
