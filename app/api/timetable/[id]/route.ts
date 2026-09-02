import { ApiHttpError, apiError, apiNoContent, apiSuccess, readJsonBody } from "../../../lib/api/http";
import { assertTrustedMutation } from "../../../lib/api/security";
import { readRemoteCredentialToken, requestRemoteApi } from "../../../lib/auth/remote-credential";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  try {
    assertTrustedMutation(request);
    const token = readRemoteCredentialToken(request);
    if (!token) throw new ApiHttpError(401, "UNAUTHENTICATED", "Cədvəli dəyişmək üçün daxil ol.");
    const { id } = await context.params;
    const body = await readJsonBody<unknown>(request);
    return apiSuccess(await requestRemoteApi<unknown>(`/api/timetable/${encodeURIComponent(id)}`, { method: "PATCH", body, token }));
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    assertTrustedMutation(request);
    const token = readRemoteCredentialToken(request);
    if (!token) throw new ApiHttpError(401, "UNAUTHENTICATED", "Cədvəli dəyişmək üçün daxil ol.");
    const { id } = await context.params;
    await requestRemoteApi<unknown>(`/api/timetable/${encodeURIComponent(id)}`, { method: "DELETE", token });
    return apiNoContent();
  } catch (error) {
    return apiError(error);
  }
}
