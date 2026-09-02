import { ApiHttpError, apiError, apiSuccess, readJsonBody } from "../../lib/api/http";
import { assertTrustedMutation } from "../../lib/api/security";
import { readRemoteCredentialToken, requestRemoteApi } from "../../lib/auth/remote-credential";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const sort = new URL(request.url).searchParams.get("sort") === "top" ? "top" : "new";
    const token = readRemoteCredentialToken(request);
    return apiSuccess(await requestRemoteApi<unknown[]>(`/api/questions?sort=${sort}`, { token }));
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertTrustedMutation(request);
    const token = readRemoteCredentialToken(request);
    if (!token) throw new ApiHttpError(401, "UNAUTHENTICATED", "Sual vermək üçün daxil ol.");
    const body = await readJsonBody<unknown>(request);
    return apiSuccess(await requestRemoteApi("/api/questions", { method: "POST", body, token }), 201);
  } catch (error) {
    return apiError(error);
  }
}
