import { ApiHttpError, apiError, apiSuccess, readJsonBody } from "../../../lib/api/http";
import { checkRateLimit } from "../../../lib/api/rate-limit";
import { assertTrustedMutation } from "../../../lib/api/security";
import { readRemoteCredentialToken, requestRemoteApi } from "../../../lib/auth/remote-credential";

export const dynamic = "force-dynamic";
type TicketInput = { name?: string; email?: string; topic?: string; message?: string };

export async function POST(request: Request) {
  try {
    assertTrustedMutation(request);
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
    const token=readRemoteCredentialToken(request);
    if(!token) throw new ApiHttpError(401,"UNAUTHENTICATED","Dəstək müraciəti üçün hesaba daxil ol.");
    const data = await requestRemoteApi<{ reference: string; status: string }>("/api/support/tickets", { method: "POST", body, token });
    return apiSuccess(data, 201);
  } catch (error) {
    return apiError(error);
  }
}

export async function GET(request:Request) {
  try {
    const token=readRemoteCredentialToken(request);
    if(!token) throw new ApiHttpError(401,"UNAUTHENTICATED","Müraciətləri görmək üçün hesaba daxil ol.");
    return apiSuccess(await requestRemoteApi<unknown[]>("/api/support/tickets/me",{token}));
  } catch(error) { return apiError(error); }
}
