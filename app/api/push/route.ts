import { ApiHttpError, apiError, apiNoContent, apiSuccess, readJsonBody } from "../../lib/api/http";
import { assertTrustedMutation } from "../../lib/api/security";
import { readRemoteCredentialToken, requestRemoteApi } from "../../lib/auth/remote-credential";

export const dynamic = "force-dynamic";

/** Açıq VAPID açarı — brauzerin abunə olması üçün. */
export async function GET() {
  try {
    return apiSuccess(await requestRemoteApi<{ publicKey: string | null }>("/api/push/key"));
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertTrustedMutation(request);
    const token = readRemoteCredentialToken(request);
    if (!token) throw new ApiHttpError(401, "UNAUTHENTICATED", "Bildirişlər üçün daxil ol.");
    const body = await readJsonBody<{ action?: string; subscription?: unknown; endpoint?: string }>(request);
    if (body.action === "unsubscribe") {
      await requestRemoteApi("/api/push/unsubscribe", { method: "POST", body: { endpoint: body.endpoint }, token });
      return apiNoContent();
    }
    return apiSuccess(
      await requestRemoteApi("/api/push/subscribe", { method: "POST", body: body.subscription, token }),
      201,
    );
  } catch (error) {
    return apiError(error);
  }
}
