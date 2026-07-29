import { ApiHttpError, apiError, apiSuccess, readJsonBody } from "../../../lib/api/http";
import { checkRateLimit } from "../../../lib/api/rate-limit";

export const dynamic = "force-dynamic";

type TicketInput = { name?: string; email?: string; topic?: string; message?: string };

export async function POST(request: Request) {
  try {
    const limit = checkRateLimit(request, { key: "support-ticket", limit: 4, windowMs: 30 * 60_000 });
    if (!limit.allowed) {
      throw new ApiHttpError(429, "RATE_LIMITED", `Çox sayda sorğu göndərilib. ${limit.retryAfterSeconds} saniyə sonra yenidən yoxla.`);
    }

    const input = await readJsonBody<TicketInput>(request);
    const name = input.name?.trim() ?? "";
    const email = input.email?.trim().toLowerCase() ?? "";
    const topic = input.topic?.trim() ?? "";
    const message = input.message?.trim() ?? "";
    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !topic || message.length < 20) {
      throw new ApiHttpError(400, "INVALID_TICKET", "Məcburi xanaları düzgün doldurun.");
    }

    const webhookUrl = process.env.EDURATE_SUPPORT_WEBHOOK_URL;
    if (!webhookUrl) {
      throw new ApiHttpError(503, "SUPPORT_UNAVAILABLE", "Dəstək kanalı hazırda aktiv deyil. support@edurate.az ünvanına yazın.");
    }

    const reference = `EDU-${Date.now().toString(36).toUpperCase()}`;
    const delivery = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reference, name, email, topic, message, receivedAt: new Date().toISOString() }),
      signal: AbortSignal.timeout(8_000),
    });
    if (!delivery.ok) throw new ApiHttpError(502, "DELIVERY_FAILED", "Sorğu çatdırılmadı. Məlumatları qoruduq; yenidən göndərin.");
    return apiSuccess({ reference }, 201);
  } catch (error) {
    return apiError(error);
  }
}
