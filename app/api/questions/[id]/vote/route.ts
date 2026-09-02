import { ApiHttpError, apiError, apiSuccess } from "../../../../lib/api/http";
import { assertTrustedMutation } from "../../../../lib/api/security";
import { readRemoteCredentialToken, requestRemoteApi } from "../../../../lib/auth/remote-credential";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  try {
    assertTrustedMutation(request);
    const token = readRemoteCredentialToken(request);
    if (!token) throw new ApiHttpError(401, "UNAUTHENTICATED", "Səs vermək üçün daxil ol.");
    const { id } = await context.params;
    return apiSuccess(
      await requestRemoteApi(`/api/questions/${encodeURIComponent(id)}/vote`, { method: "POST", body: {}, token }),
    );
  } catch (error) {
    return apiError(error);
  }
}
