import { signInCredential } from "../../../lib/api/credential-store";
import { apiError, apiSuccess, readJsonBody } from "../../../lib/api/http";
import {
  createCredentialSession,
  credentialSessionCookie,
  getCredentialSessionCookieOptions,
} from "../../../lib/auth/credential-session";
import type { SignInInput } from "../../../data/user";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
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
