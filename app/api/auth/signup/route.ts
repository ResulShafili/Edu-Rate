import type { RegisterInput } from "../../../data/user";
import { checkRateLimit } from "../../../lib/api/rate-limit";
import { apiError, apiSuccess, readJsonBody } from "../../../lib/api/http";
import {
  getRemoteCredentialCookieOptions,
  mapRemoteUserToProfile,
  remoteCredentialCookie,
  requestRemoteApi,
  type RemoteApiUser,
} from "../../../lib/auth/remote-credential";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const rateLimit = checkRateLimit(request, { key: "auth:signup", limit: 5, windowMs: 30 * 60_000 });
    if (!rateLimit.allowed) {
      return Response.json(
        { error: { code: "RATE_LIMITED", message: "Qısa müddətdə çox hesab yaratma cəhdi edildi. Sonra yenidən yoxla." } },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds), "Cache-Control": "no-store" } },
      );
    }

    const input = await readJsonBody<RegisterInput>(request);
    const result = await requestRemoteApi<{ token: string; user: RemoteApiUser }>(
      "/api/auth/signup",
      { method: "POST", body: input },
    );
    const response = apiSuccess({ user: mapRemoteUserToProfile(result.user) }, 201);
    response.cookies.set(
      remoteCredentialCookie.name,
      result.token,
      getRemoteCredentialCookieOptions(request),
    );
    return response;
  } catch (error) {
    return apiError(error);
  }
}
