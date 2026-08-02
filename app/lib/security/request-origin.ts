export function isTrustedMutationRequest(request: Request, configuredOrigins: string[] = []) {
  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return true;

  const fetchSite = request.headers.get("sec-fetch-site")?.toLowerCase();
  if (fetchSite === "cross-site") return false;

  const originHeader = request.headers.get("origin");
  if (!originHeader) {
    return !fetchSite || fetchSite === "same-origin" || fetchSite === "same-site" || fetchSite === "none";
  }

  let origin: string;
  try {
    origin = new URL(originHeader).origin;
  } catch {
    return false;
  }

  const trustedOrigins = new Set<string>([new URL(request.url).origin]);
  for (const configured of configuredOrigins) {
    if (!configured.trim()) continue;
    try {
      trustedOrigins.add(new URL(configured.trim()).origin);
    } catch {
      // Yanlış optional origin allowlist-i genişləndirmir.
    }
  }
  return trustedOrigins.has(origin);
}
