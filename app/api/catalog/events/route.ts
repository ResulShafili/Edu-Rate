import { apiError, apiSuccess } from "../../../lib/api/http";
import { requestRemoteApi } from "../../../lib/auth/remote-credential";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const events = await requestRemoteApi<unknown[]>("/api/events");
    return apiSuccess(events);
  } catch (error) {
    return apiError(error);
  }
}
