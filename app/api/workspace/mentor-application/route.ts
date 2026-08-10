import { apiError, apiSuccess, readJsonBody } from "../../../lib/api/http";
import { assertTrustedMutation } from "../../../lib/api/security";
import { getRequestIdentity } from "../../../lib/auth/request-identity";
import { readRemoteCredentialToken, requestRemoteApi } from "../../../lib/auth/remote-credential";

export async function POST(request: Request) {
  try {
    assertTrustedMutation(request);
    const identity = await getRequestIdentity(request);
    const token = readRemoteCredentialToken(request);
    if (!identity || !token) return Response.json({ error: { code: "AUTH_REQUIRED", message: "Daxil olmaq tələb olunur." } }, { status: 401 });
    if (identity.role !== "teacher") return Response.json({ error: { code: "TEACHER_REQUIRED", message: "Bu seçim yalnız müəllimlər üçündür." } }, { status: 403 });
    const body = await readJsonBody(request);
    return apiSuccess(await requestRemoteApi("/api/workspace/mentor-application", { method: "POST", body, token }), 201);
  } catch (error) {
    return apiError(error);
  }
}
