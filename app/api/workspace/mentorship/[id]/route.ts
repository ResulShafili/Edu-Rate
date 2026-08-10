import { apiError, apiSuccess, readJsonBody } from "../../../../lib/api/http";
import { assertTrustedMutation } from "../../../../lib/api/security";
import { getRequestIdentity } from "../../../../lib/auth/request-identity";
import { readRemoteCredentialToken, requestRemoteApi } from "../../../../lib/auth/remote-credential";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  try {
    assertTrustedMutation(request);
    const identity = await getRequestIdentity(request);
    const token = readRemoteCredentialToken(request);
    if (!identity || !token) return Response.json({ error: { code: "AUTH_REQUIRED", message: "Daxil olmaq tələb olunur." } }, { status: 401 });
    if (identity.role !== "mentor") return Response.json({ error: { code: "MENTOR_REQUIRED", message: "Bu əməliyyat yalnız mentor üçündür." } }, { status: 403 });
    const { id } = await context.params;
    const body = await readJsonBody<unknown>(request);
    return apiSuccess(await requestRemoteApi<unknown>(`/api/workspace/mentorship/${encodeURIComponent(id)}`, { method: "PATCH", body, token }));
  } catch (error) {
    return apiError(error);
  }
}
