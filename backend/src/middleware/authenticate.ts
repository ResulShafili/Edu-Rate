import type { NextFunction, Request, Response } from "express";
import { findUserById } from "../db/database.js";
import { ApiError } from "../lib/api-error.js";
import { verifyAccessToken } from "../lib/auth.js";

export async function authenticate(request: Request, _response: Response, next: NextFunction) {
  const authorization = request.header("authorization");
  const [scheme, token] = authorization?.split(" ") ?? [];

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return next(new ApiError(401, "AUTH_REQUIRED", "Daxil olmaq tələb olunur."));
  }

  try {
    const tokenIdentity = verifyAccessToken(token);
    const user = await findUserById(tokenIdentity.userId);
    if (!user) {
      return next(new ApiError(401, "SESSION_USER_NOT_FOUND", "Sessiya istifadəçisi tapılmadı."));
    }
    if (user.status !== "Aktiv") {
      return next(new ApiError(403, "ACCOUNT_RESTRICTED", "Hesab aktiv deyil."));
    }

    request.auth = { userId: user.id, role: user.role };
    next();
  } catch (error) {
    next(error);
  }
}

export function requireAdmin(request: Request, _response: Response, next: NextFunction) {
  if (request.auth?.role !== "admin" && request.auth?.role !== "assistant_admin") {
    return next(new ApiError(403, "ADMIN_REQUIRED", "Bu əməliyyat üçün admin icazəsi lazımdır."));
  }

  next();
}

export function requirePrimaryAdmin(request: Request, _response: Response, next: NextFunction) {
  if (request.auth?.role !== "admin") {
    return next(
      new ApiError(
        403,
        "PRIMARY_ADMIN_REQUIRED",
        "Bu əməliyyat yalnız əsas admin üçün əlçatandır.",
      ),
    );
  }

  next();
}
