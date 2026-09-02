import { ApiHttpError, apiError, apiSuccess, readJsonBody } from "../../lib/api/http";
import { assertTrustedMutation } from "../../lib/api/security";
import { readRemoteCredentialToken, requestRemoteApi } from "../../lib/auth/remote-credential";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return apiSuccess(await requestRemoteApi<unknown[]>("/api/clubs"));
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertTrustedMutation(request);
    const token = readRemoteCredentialToken(request);
    if (!token) throw new ApiHttpError(401, "UNAUTHENTICATED", "Klub yaratmaq üçün hesaba daxil ol.");
    const body = await readJsonBody<unknown>(request);
    return apiSuccess(await requestRemoteApi("/api/clubs", { method: "POST", body, token }), 201);
  } catch (error) {
    return apiError(error);
  }
}
