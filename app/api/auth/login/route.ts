import { signInCredential } from "../../../lib/api/credential-store";
import { apiError, apiSuccess, readJsonBody } from "../../../lib/api/http";
import {
  createCredentialSession,
  credentialSessionCookie,
  getCredentialSessionCookieOptions,
} from "../../../lib/auth/credential-session";
import type { SignInInput } from "../../../data/user";
import { checkRateLimit } from "../../../lib/api/rate-limit";

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
    const user = await signInCredential(input);
    const token = await createCredentialSession(user);
    const response = apiSuccess({ user });
    response.cookies.set(credentialSessionCookie.name, token, getCredentialSessionCookieOptions(request));
    return response;
  } catch (error) {
    return apiError(error);
  }
}
