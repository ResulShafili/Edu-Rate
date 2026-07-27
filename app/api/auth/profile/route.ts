import { updateCredentialProfile } from "../../../lib/api/credential-store";
import { ApiHttpError, apiError, apiSuccess, readJsonBody } from "../../../lib/api/http";
import {
  createCredentialSession,
  credentialSessionCookie,
  credentialSessionCookieName,
  getCredentialSessionCookieOptions,
  readCredentialSession,
} from "../../../lib/auth/credential-session";
import type { ProfileUpdateInput } from "../../../data/user";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  try {
    const session = await readCredentialSession(
      readCookie(request.headers.get("cookie"), credentialSessionCookieName),
    );
    if (!session) {
      throw new ApiHttpError(401, "UNAUTHENTICATED", "Profil məlumatlarını yeniləmək üçün daxil ol.");
    }

    const input = await readJsonBody<ProfileUpdateInput>(request);
    const user = await updateCredentialProfile(session.user, input);
    const token = await createCredentialSession(user);
    const response = apiSuccess({ user });
    response.cookies.set(credentialSessionCookie.name, token, getCredentialSessionCookieOptions(request));
    return response;
  } catch (error) {
    return apiError(error);
  }
}

function readCookie(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  const entry = header.split(";").find((value) => value.trim().startsWith(`${name}=`));
  return entry?.split("=").slice(1).join("=").trim();
}
