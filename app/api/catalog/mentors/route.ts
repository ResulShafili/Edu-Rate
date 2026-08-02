import { apiError, apiSuccess } from "../../../lib/api/http";
import { requestRemoteApi } from "../../../lib/auth/remote-credential";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const mentors = await requestRemoteApi<unknown[]>("/api/mentors");
    return apiSuccess(mentors);
  } catch (error) {
    return apiError(error);
  }
}
