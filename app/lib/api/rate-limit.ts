type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitEntry = { count: number; resetAt: number };

const buckets = new Map<string, RateLimitEntry>();

export function checkRateLimit(request: Request, options: RateLimitOptions) {
  const now = Date.now();
  const client = getClientIdentifier(request);
  const bucketKey = `${options.key}:${client}`;
  const current = buckets.get(bucketKey);

  if (!current || current.resetAt <= now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (current.count >= options.limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1_000)),
    };
  }

  current.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const connecting = request.headers.get("cf-connecting-ip")?.trim();
  const value = connecting || forwarded || "unknown";
  return value.replace(/[^a-fA-F0-9:.,-]/g, "").slice(0, 80) || "unknown";
}
