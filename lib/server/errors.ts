import "server-only";

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function apiErrorResponse(err: unknown): Response {
  if (err instanceof ApiError) {
    return Response.json(
      { error: { message: err.message, code: err.code } },
      { status: err.status },
    );
  }
  // No exponer stack ni detalles internos.
  return Response.json(
    { error: { message: "Error interno." } },
    { status: 500 },
  );
}
