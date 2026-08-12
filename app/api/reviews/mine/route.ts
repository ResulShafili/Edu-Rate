import { ApiHttpError, apiError, apiSuccess } from "../../../lib/api/http";
import { readRemoteCredentialToken, requestRemoteApi } from "../../../lib/auth/remote-credential";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const token = readRemoteCredentialToken(request);
    if (!token) throw new ApiHttpError(401, "UNAUTHENTICATED", "Rəy tarixçəsini görmək üçün daxil ol.");
    const semester = new URL(request.url).searchParams.get("semester")?.trim();
    if (!semester) throw new ApiHttpError(400, "SEMESTER_REQUIRED", "Semestr seçilməlidir.");
    const data = await requestRemoteApi<unknown[]>(`/api/reviews/mine?semester=${encodeURIComponent(semester)}`, { token });
    return apiSuccess(data);
  } catch (error) {
    return apiError(error);
  }
}
