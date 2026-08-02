import { ApiHttpError, apiError, apiSuccess, readJsonBody } from "../../../lib/api/http";
import { checkRateLimit } from "../../../lib/api/rate-limit";
import { requestRemoteApi } from "../../../lib/auth/remote-credential";

export const dynamic = "force-dynamic";
type TicketInput = { name?: string; email?: string; topic?: string; message?: string };

export async function POST(request: Request) {
  try {
    const limit = checkRateLimit(request, { key: "support-ticket", limit: 4, windowMs: 30 * 60_000 });
    if (!limit.allowed) throw new ApiHttpError(429, "RATE_LIMITED", `Çox sayda sorğu göndərilib. ${limit.retryAfterSeconds} saniyə sonra yenidən yoxla.`);
    const input = await readJsonBody<TicketInput>(request);
    const body = {
      name: input.name?.trim() ?? "",
      email: input.email?.trim().toLowerCase() ?? "",
      topic: input.topic?.trim() ?? "",
      message: input.message?.trim() ?? "",
    };
    if (body.name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) || body.topic.length < 2 || body.message.length < 20) {
      throw new ApiHttpError(422, "INVALID_TICKET", "Məcburi xanaları düzgün doldurun.");
    }
    const data = await requestRemoteApi<{ reference: string; status: string }>("/api/support/tickets", { method: "POST", body });
    return apiSuccess(data, 201);
  } catch (error) {
    return apiError(error);
  }
}
