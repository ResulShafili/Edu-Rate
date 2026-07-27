import { registerCredential } from "../../../lib/api/credential-store";
import { apiError, apiSuccess, readJsonBody } from "../../../lib/api/http";
import {
  createCredentialSession,
  credentialSessionCookie,
  getCredentialSessionCookieOptions,
} from "../../../lib/auth/credential-session";
import type { RegisterInput } from "../../../data/user";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
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
