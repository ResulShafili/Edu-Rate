import { ApiHttpError, apiError, apiSuccess } from "../../../lib/api/http";
import { readRemoteCredentialToken, requestRemoteApi } from "../../../lib/auth/remote-credential";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const token = readRemoteCredentialToken(request);
    if (!token) throw new ApiHttpError(401, "UNAUTHENTICATED", "Klub üzvlüklərini görmək üçün daxil ol.");
    return apiSuccess(await requestRemoteApi<Array<{ slug: string }>>("/api/clubs/memberships/me", { token }));
  } catch (error) {
    return apiError(error);
  }
}
