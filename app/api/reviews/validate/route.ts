import {
  moderateReview,
  REVIEW_MAX_LENGTH,
} from "../../../lib/review-moderation";

const criterionKeys = [
  "clarity",
  "subjectKnowledge",
  "objectivity",
  "communication",
] as const;

type ReviewPayload = {
  text?: unknown;
  criteria?: unknown;
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
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return json({ accepted: false, reason: "Sorğu JSON formatında olmalıdır." }, 415);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > REVIEW_MAX_LENGTH * 4) {
    return json({ accepted: false, reason: "Sorğu həddindən artıq böyükdür." }, 413);
  }

  let payload: ReviewPayload;
  try {
    payload = await request.json() as ReviewPayload;
  } catch {
    return json({ accepted: false, reason: "Sorğu oxuna bilmədi." }, 400);
  }

  if (typeof payload.text !== "string") {
    return json({ accepted: false, reason: "Rəy mətni düzgün deyil." }, 400);
  }

  if (!hasValidCriteria(payload.criteria)) {
    return json({
      accepted: false,
      reason: "Dörd tədris meyarının hər birini 1-dən 5-dək qiymətləndir.",
      suggestion: "İzah, fənn biliyi, obyektivlik və ünsiyyət meyarlarını tamamla.",
    }, 422);
  }

  if (payload.text.trim().length < 12) {
    return json({
      accepted: false,
      reason: "Rəy çox qısadır.",
      suggestion: "Dərsdə müşahidə etdiyin konkret bir məqamı ən azı 12 simvolla paylaş.",
    }, 422);
  }

  const result = moderateReview(payload.text);
  if (!result.accepted) {
    return json({
      accepted: false,
      allowed: false,
      reason: result.reason,
      suggestion: result.suggestion,
      issues: result.issues.map(({ code, reason, suggestion }) => ({ code, reason, suggestion })),
    }, 422);
  }

  return json({
    accepted: true,
    allowed: true,
    text: payload.text.trim(),
  }, 200);
}
