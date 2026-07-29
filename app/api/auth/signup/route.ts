import { registerCredential } from "../../../lib/api/credential-store";
import { apiError, apiSuccess, readJsonBody } from "../../../lib/api/http";
import {
  createCredentialSession,
  credentialSessionCookie,
  getCredentialSessionCookieOptions,
} from "../../../lib/auth/credential-session";
import type { RegisterInput } from "../../../data/user";
import { checkRateLimit } from "../../../lib/api/rate-limit";

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
    const user = await registerCredential(input);
    const token = await createCredentialSession(user);
    const response = apiSuccess({ user }, 201);
    response.cookies.set(credentialSessionCookie.name, token, getCredentialSessionCookieOptions(request));
    return response;
  } catch (error) {
    return apiError(error);
  }
}
