import { ApiHttpError, apiError, apiNoContent, apiSuccess, readJsonBody } from "../../../../lib/api/http";
import { readRemoteCredentialToken, requestRemoteApi } from "../../../../lib/auth/remote-credential";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ requestId: string }> };

function requireToken(request: Request) {
  const token = readRemoteCredentialToken(request);
  if (!token) throw new ApiHttpError(401, "UNAUTHENTICATED", "Müraciəti idarə etmək üçün hesaba daxil ol.");
  return token;
}

export async function PATCH(request: Request, context: Context) {
  try {
    const { requestId } = await context.params;
    const body = await readJsonBody<{ note?: string }>(request);
    const data = await requestRemoteApi<unknown>(`/api/mentorship/requests/${encodeURIComponent(requestId)}`, {
      method: "PATCH",
      token: requireToken(request),
      body: { note: body.note ?? "" },
    });
    return apiSuccess(data);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    const { requestId } = await context.params;
    await requestRemoteApi<void>(`/api/mentorship/requests/${encodeURIComponent(requestId)}`, {
      method: "DELETE",
      token: requireToken(request),
    });
    return apiNoContent();
  } catch (error) {
    return apiError(error);
  }
}
