import { NextResponse } from "next/server";

export class ApiHttpError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: Record<string, string>;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiHttpError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function apiSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(
    { data },
    {
      status,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "Content-Type": "application/json; charset=utf-8",
      },
    },
  );
}

export function apiNoContent(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export function apiError(error: unknown): NextResponse {
  const normalized = error instanceof ApiHttpError
    ? error
    : new ApiHttpError(
      500,
      "INTERNAL_ERROR",
      "Serverdə gözlənilməz xəta baş verdi.",
    );

  return NextResponse.json(
    {
      error: {
        code: normalized.code,
        message: normalized.message,
        ...(normalized.details ? { details: normalized.details } : {}),
      },
    },
    {
      status: normalized.status,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "Content-Type": "application/json; charset=utf-8",
      },
    },
  );
}

export async function readJsonBody<T>(request: Request, maxBytes = 64 * 1024): Promise<T> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLocaleLowerCase("en-US").includes("application/json")) {
    throw new ApiHttpError(
      415,
      "UNSUPPORTED_MEDIA_TYPE",
      "Sorğu JSON formatında göndərilməlidir.",
    );
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new ApiHttpError(413, "PAYLOAD_TOO_LARGE", "Sorğunun həcmi icazə verilən limiti aşır.");
  }

  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > maxBytes) {
      throw new ApiHttpError(413, "PAYLOAD_TOO_LARGE", "Sorğunun həcmi icazə verilən limiti aşır.");
    }
    const value = JSON.parse(raw) as unknown;
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new ApiHttpError(
        400,
        "INVALID_REQUEST_BODY",
        "Sorğu məlumatları düzgün formatda deyil.",
      );
    }

    return value as T;
  } catch (error) {
    if (error instanceof ApiHttpError) throw error;
    throw new ApiHttpError(
      400,
      "INVALID_JSON",
      "Sorğunun JSON məzmununu oxumaq mümkün olmadı.",
    );
  }
}
