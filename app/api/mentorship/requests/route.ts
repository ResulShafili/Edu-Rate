import { ApiHttpError, apiError, apiSuccess, readJsonBody } from "../../../lib/api/http";
import { checkRateLimit } from "../../../lib/api/rate-limit";
import { getRequestIdentity } from "../../../lib/auth/request-identity";
import { mentors } from "../../../data/mentors";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const identity = await getRequestIdentity(request);
    if (!identity) throw new ApiHttpError(401, "UNAUTHENTICATED", "Müraciət üçün hesaba daxil olun.");
    const limit = checkRateLimit(request, { key: "mentor-request", limit: 3, windowMs: 24 * 60 * 60_000 });
    if (!limit.allowed) throw new ApiHttpError(429, "RATE_LIMITED", "Bu gün üçün müraciət limitinə çatmısınız.");
    const body = await readJsonBody<{ mentorId?: string }>(request);
    const mentor = mentors.find((item) => item.id === body.mentorId);
    if (!mentor) throw new ApiHttpError(404, "MENTOR_NOT_FOUND", "Mentor tapılmadı.");
    const webhookUrl = process.env.EDURATE_MENTORSHIP_WEBHOOK_URL;
    if (!webhookUrl) throw new ApiHttpError(503, "MENTORSHIP_UNAVAILABLE", "Mentorluq müraciətləri hazırda bağlıdır.");
    const delivery = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mentorId: mentor.id, mentorName: mentor.name, requester: identity, receivedAt: new Date().toISOString() }),
      signal: AbortSignal.timeout(8_000),
    });
    if (!delivery.ok) throw new ApiHttpError(502, "DELIVERY_FAILED", "Müraciət çatdırılmadı. Yenidən yoxlayın.");
    return apiSuccess({ accepted: true }, 201);
  } catch (error) {
    return apiError(error);
  }
}
