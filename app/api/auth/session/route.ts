import { ApiHttpError, apiError, apiSuccess } from "../../../lib/api/http";
import {
  credentialSessionCookieName,
  readCredentialSession,
} from "../../../lib/auth/credential-session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await readCredentialSession(
      readCookie(request.headers.get("cookie"), credentialSessionCookieName),
    );
    if (!session) {
      throw new ApiHttpError(401, "UNAUTHENTICATED", "Sessiya tapılmadı və ya vaxtı bitib.");
    }

    return apiSuccess({ user: session.user });
  } catch (error) {
    return apiError(error);
  }
}

function readCookie(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  const entry = header.split(";").find((value) => value.trim().startsWith(`${name}=`));
  return entry?.split("=").slice(1).join("=").trim();
}
