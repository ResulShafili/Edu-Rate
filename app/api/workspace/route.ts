import { apiError, apiSuccess } from "../../lib/api/http";
import { getRequestIdentity } from "../../lib/auth/request-identity";
import { readRemoteCredentialToken, requestRemoteApi } from "../../lib/auth/remote-credential";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const identity = await getRequestIdentity(request);
    const token = readRemoteCredentialToken(request);
    if (!identity || !token) return Response.json({ error: { code: "AUTH_REQUIRED", message: "Daxil olmaq tələb olunur." } }, { status: 401 });
    return apiSuccess(await requestRemoteApi<unknown>("/api/workspace", { token }));
  } catch (error) {
    return apiError(error);
  }
}
