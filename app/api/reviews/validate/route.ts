import { checkRateLimit } from "../../../lib/api/rate-limit";
import { assertTrustedMutation } from "../../../lib/api/security";
import { getRequestIdentity } from "../../../lib/auth/request-identity";
import { readRemoteCredentialToken, requestRemoteApi } from "../../../lib/auth/remote-credential";

const criterionKeys = [
  "clarity",
  "subjectKnowledge",
  "objectivity",
  "communication",
] as const;

type ReviewPayload = {
  criteria?: unknown;
  teacherId?: unknown;
  course?: unknown;
  semester?: unknown;
};

function json(body: unknown, status: number) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function hasValidCriteria(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return criterionKeys.every((key) => {
    const score = record[key];
    return typeof score === "number" && Number.isInteger(score) && score >= 1 && score <= 5;
  });
}

export async function POST(request: Request) {
  try {
    assertTrustedMutation(request);
  } catch {
    return json({ accepted: false, reason: "Sorğunun mənbəyi təsdiqlənmədi." }, 403);
  }
  const identity = await getRequestIdentity(request);
  if (!identity) return json({ accepted: false, reason: "Rəy göndərmək üçün hesaba daxil ol." }, 401);

  const limit = checkRateLimit(request, { key: "teacher-review", limit: 5, windowMs: 60 * 60_000 });
  if (!limit.allowed) return json({ accepted: false, reason: "Çox sayda cəhd edildi. Bir qədər sonra yenidən yoxla." }, 429);

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return json({ accepted: false, reason: "Sorğu JSON formatında olmalıdır." }, 415);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 4_096) {
    return json({ accepted: false, reason: "Sorğu həddindən artıq böyükdür." }, 413);
  }

  let payload: ReviewPayload;
  try {
    payload = await request.json() as ReviewPayload;
  } catch {
    return json({ accepted: false, reason: "Sorğu oxuna bilmədi." }, 400);
  }

  if ("text" in payload) {
    return json({ accepted: false, reason: "Açıq mətn rəyi qəbul edilmir. Yalnız rəqəmsal meyarları seç." }, 400);
  }

  if (typeof payload.teacherId !== "string" || typeof payload.course !== "string" || typeof payload.semester !== "string") {
    return json({ accepted: false, reason: "Müəllim, fənn və semestr məlumatı tam deyil." }, 400);
  }

  if (!hasValidCriteria(payload.criteria)) {
    return json({
      accepted: false,
      reason: "Dörd tədris meyarının hər birini 1-dən 5-dək qiymətləndir.",
      suggestion: "İzah, fənn biliyi, obyektivlik və ünsiyyət meyarlarını tamamla.",
    }, 422);
  }

  const token = readRemoteCredentialToken(request);
  if (!token) return json({ accepted: false, reason: "Sessiyanı yeniləmək üçün yenidən daxil ol." }, 401);

  try {
    await requestRemoteApi("/api/reviews", {
      method: "POST",
      token,
      body: {
        teacherId: payload.teacherId.trim(),
        course: payload.course.trim(),
        semester: payload.semester.trim(),
        criteria: payload.criteria,
      },
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Rəy saxlanmadı. Yenidən yoxla.";
    const status = typeof error === "object" && error && "status" in error ? Number(error.status) : 500;
    return json({ accepted: false, reason }, Number.isFinite(status) ? status : 500);
  }

  return json({
    accepted: true,
    allowed: true,
    status: "pending",
  }, 200);
}
