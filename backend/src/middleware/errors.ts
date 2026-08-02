import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { ApiError } from "../lib/api-error.js";

export const notFound: RequestHandler = (request, _response, next) => {
  next(new ApiError(404, "NOT_FOUND", `${request.method} ${request.path} tapılmadı.`));
};

export const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  if (typeof error === "object" && error && "type" in error && error.type === "entity.parse.failed") {
    response.status(400).json({
      error: { code: "INVALID_JSON", message: "Sorğunun JSON məzmunu düzgün deyil." },
      requestId: response.locals.requestId,
    });
    return;
  }

  if (typeof error === "object" && error && "status" in error && error.status === 413) {
    response.status(413).json({
      error: { code: "PAYLOAD_TOO_LARGE", message: "Sorğunun həcmi icazə verilən limiti aşır." },
      requestId: response.locals.requestId,
    });
    return;
  }

  if (error instanceof ZodError) {
    const details = Object.fromEntries(
      error.issues.map((issue) => [issue.path.join(".") || "body", issue.message]),
    );
    response.status(422).json({
      error: { code: "VALIDATION_ERROR", message: "Daxil edilən məlumatlar yanlışdır.", details },
      requestId: response.locals.requestId,
    });
    return;
  }

  if (error instanceof ApiError) {
    response.status(error.status).json({
      error: { code: error.code, message: error.message, details: error.details },
      requestId: response.locals.requestId,
    });
    return;
  }

  if (typeof error === "object" && error && "code" in error && error.code === "23505") {
    const constraint = "constraint" in error ? String(error.constraint) : "";
    const isEmailConflict = constraint.includes("users_email");
    response.status(409).json({
      error: isEmailConflict
        ? { code: "EMAIL_EXISTS", message: "Bu e-poçt artıq istifadə olunur." }
        : { code: "CONFLICT", message: "Bu məlumat artıq mövcuddur." },
      requestId: response.locals.requestId,
    });
    return;
  }

  if (process.env.NODE_ENV === "production") {
    const name = error instanceof Error ? error.name : "UnknownError";
    console.error(`[${response.locals.requestId}] ${name}`);
  } else {
    console.error(`[${response.locals.requestId}]`, error);
  }
  response.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Gözlənilməz server xətası baş verdi." },
    requestId: response.locals.requestId,
  });
};
