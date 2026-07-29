import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../lib/api-error.js";
import { verifyAccessToken } from "../lib/auth.js";

export function authenticate(request: Request, _response: Response, next: NextFunction) {
  const authorization = request.header("authorization");
  const [scheme, token] = authorization?.split(" ") ?? [];

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return next(new ApiError(401, "AUTH_REQUIRED", "Daxil olmaq tələb olunur."));
  }

  request.auth = verifyAccessToken(token);
  next();
}

export function requireAdmin(request: Request, _response: Response, next: NextFunction) {
  if (request.auth?.role !== "admin") {
    return next(new ApiError(403, "ADMIN_REQUIRED", "Bu əməliyyat üçün admin icazəsi lazımdır."));
  }

  next();
}
