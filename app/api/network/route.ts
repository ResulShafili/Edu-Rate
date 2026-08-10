import { apiError, apiSuccess } from "../../lib/api/http";
import { requestRemoteApi } from "../../lib/auth/remote-credential";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [announcements, items] = await Promise.all([
      requestRemoteApi<unknown[]>("/api/network/announcements"),
      requestRemoteApi<unknown[]>("/api/network/feed"),
    ]);
    return apiSuccess({ announcements, items });
  } catch (error) {
    return apiError(error);
  }
}
