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
  // Prefer headers set by the trusted proxy/platform, which a client cannot
  // spoof (cf-connecting-ip on Cloudflare, x-real-ip on Vercel). The
  // x-forwarded-for chain is client-prependable, so the attacker-controlled
  // leftmost entry must not be trusted — fall back to the last hop instead.
  const connecting = request.headers.get("cf-connecting-ip")?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const forwardedChain = request.headers
    .get("x-forwarded-for")
    ?.split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const value = connecting || realIp || forwardedChain?.at(-1) || "unknown";
  return value.replace(/[^a-fA-F0-9:.,-]/g, "").slice(0, 80) || "unknown";
}
