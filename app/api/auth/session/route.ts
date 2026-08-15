import { apiError, apiSuccess } from "../../../lib/api/http";
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
      return apiSuccess({ user: null });
    }

    const session = await getRemoteSession(token);
    return apiSuccess({ user: mapRemoteUserToProfile(session.user) });
  } catch (error) {
    return apiError(error);
  }
}
