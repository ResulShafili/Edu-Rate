import { ApiHttpError, apiError, apiSuccess, readJsonBody } from "../../../lib/api/http";
import { assertTrustedMutation } from "../../../lib/api/security";
import { readRemoteCredentialToken, requestRemoteApi } from "../../../lib/auth/remote-credential";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ clubId: string }> };

export async function PATCH(request: Request, context: Context) {
  try {
    assertTrustedMutation(request);
    const token = readRemoteCredentialToken(request);
    if (!token) throw new ApiHttpError(401, "UNAUTHENTICATED", "Klubu dəyişmək üçün daxil ol.");
    const { clubId } = await context.params;
    const body = await readJsonBody<unknown>(request);
    return apiSuccess(await requestRemoteApi(`/api/clubs/${encodeURIComponent(clubId)}`, { method: "PATCH", body, token }));
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    assertTrustedMutation(request);
    const token = readRemoteCredentialToken(request);
    if (!token) throw new ApiHttpError(401, "UNAUTHENTICATED", "Klubu silmək üçün daxil ol.");
    const { clubId } = await context.params;
    await requestRemoteApi(`/api/clubs/${encodeURIComponent(clubId)}`, { method: "DELETE", token });
    return new Response(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}
