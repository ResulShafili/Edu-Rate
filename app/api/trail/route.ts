import { apiError, apiSuccess } from "../../lib/api/http";
import { readRemoteCredentialToken, requestRemoteApi } from "../../lib/auth/remote-credential";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const token = readRemoteCredentialToken(request);
    if (!token) return apiSuccess(null);
    return apiSuccess(await requestRemoteApi<unknown>("/api/trail", { token }));
  } catch (error) {
    return apiError(error);
  }
}
