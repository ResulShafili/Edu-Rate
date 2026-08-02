import { ApiHttpError, apiError, apiSuccess, readJsonBody } from "../../../lib/api/http";
import { checkRateLimit } from "../../../lib/api/rate-limit";
import { readRemoteCredentialToken, requestRemoteApi } from "../../../lib/auth/remote-credential";

export const dynamic = "force-dynamic";

type MentorshipRequest = {
  id: string;
  mentorId: string;
  note: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  createdAt: string;
};

function requireToken(request: Request) {
  const token = readRemoteCredentialToken(request);
  if (!token) throw new ApiHttpError(401, "UNAUTHENTICATED", "Müraciət üçün hesaba daxil ol.");
  return token;
}

export async function GET(request: Request) {
  try {
    const data = await requestRemoteApi<MentorshipRequest[]>("/api/mentorship/requests", {
      token: requireToken(request),
    });
    return apiSuccess(data);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const limit = checkRateLimit(request, { key: "mentor-request", limit: 5, windowMs: 24 * 60 * 60_000 });
    if (!limit.allowed) throw new ApiHttpError(429, "RATE_LIMITED", "Bu gün üçün müraciət limitinə çatmısan.");
    const body = await readJsonBody<{ mentorId?: string; note?: string }>(request);
    if (!body.mentorId?.trim()) throw new ApiHttpError(422, "MENTOR_REQUIRED", "Mentor seçilməlidir.");
    const data = await requestRemoteApi<MentorshipRequest>("/api/mentorship/requests", {
      method: "POST",
      token: requireToken(request),
      body: { mentorId: body.mentorId, note: body.note ?? "" },
    });
    return apiSuccess(data, 201);
  } catch (error) {
    return apiError(error);
  }
}
