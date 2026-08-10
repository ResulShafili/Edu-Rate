import { apiError, apiSuccess } from "../../lib/api/http";
import { requestRemoteApi } from "../../lib/auth/remote-credential";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const incoming = new URL(request.url).searchParams;
    const query = new URLSearchParams();
    const teacherId = incoming.get("teacherId")?.trim();
    if (teacherId) query.set("teacherId", teacherId);
    query.set("limit", incoming.get("limit") ?? "30");
    const reviews = await requestRemoteApi<unknown[]>(`/api/reviews?${query.toString()}`);
    return apiSuccess(reviews);
  } catch (error) {
    return apiError(error);
  }
}
