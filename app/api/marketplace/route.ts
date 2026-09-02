import { ApiHttpError, apiError, apiSuccess, readJsonBody } from "../../lib/api/http";
import { assertTrustedMutation } from "../../lib/api/security";
import { readRemoteCredentialToken, requestRemoteApi } from "../../lib/auth/remote-credential";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const category = new URL(request.url).searchParams.get("category");
    const token = readRemoteCredentialToken(request);
    const query = category ? `?category=${encodeURIComponent(category)}` : "";
    return apiSuccess(await requestRemoteApi<unknown[]>(`/api/marketplace${query}`, { token }));
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertTrustedMutation(request);
    const token = readRemoteCredentialToken(request);
    if (!token) throw new ApiHttpError(401, "UNAUTHENTICATED", "Elan yerləşdirmək üçün daxil ol.");
    const body = await readJsonBody<unknown>(request);
    return apiSuccess(await requestRemoteApi("/api/marketplace", { method: "POST", body, token }), 201);
  } catch (error) {
    return apiError(error);
  }
}
