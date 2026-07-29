import { ApiHttpError, apiError, apiSuccess } from "../../../lib/api/http";
import {
  getRemoteSession,
  mapRemoteUserToProfile,
  readRemoteCredentialToken,
} from "../../../lib/auth/remote-credential";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const token = readRemoteCredentialToken(request);
    if (!token) {
      throw new ApiHttpError(401, "UNAUTHENTICATED", "Sessiya tapılmadı və ya vaxtı bitib.");
    }

    const session = await getRemoteSession(token);
    return apiSuccess({ user: mapRemoteUserToProfile(session.user) });
  } catch (error) {
    return apiError(error);
  }
}
