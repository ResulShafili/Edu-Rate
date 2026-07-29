import type { SignInInput } from "../../../data/user";
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
    const rateLimit = checkRateLimit(request, { key: "auth:login", limit: 10, windowMs: 15 * 60_000 });
    if (!rateLimit.allowed) {
      return Response.json(
        { error: { code: "RATE_LIMITED", message: "Çox sayda giriş cəhdi edildi. Bir qədər sonra yenidən yoxla." } },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds), "Cache-Control": "no-store" } },
      );
    }

    const input = await readJsonBody<SignInInput>(request);
    const result = await requestRemoteApi<{ token: string; user: RemoteApiUser }>(
      "/api/auth/login",
      { method: "POST", body: input },
    );
    const response = apiSuccess({ user: mapRemoteUserToProfile(result.user) });
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
