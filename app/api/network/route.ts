import { apiError, apiSuccess } from "../../lib/api/http";
import { readRemoteCredentialToken, requestRemoteApi } from "../../lib/auth/remote-credential";

export const dynamic = "force-dynamic";

export async function GET(request:Request) {
  try {
    const token=readRemoteCredentialToken(request);
    const [announcements, items] = await Promise.all([
      requestRemoteApi<unknown[]>("/api/network/announcements",{token}),
      requestRemoteApi<unknown[]>("/api/network/feed"),
    ]);
    return apiSuccess({ announcements, items });
  } catch (error) {
    return apiError(error);
  }
}
