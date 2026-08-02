import { ApiHttpError, apiError } from "../../lib/api/http";
import { getRequestIdentity, isAdminEmail } from "../../lib/auth/request-identity";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const identity = await getRequestIdentity(request);
  if (!identity) return apiError(new ApiHttpError(401, "UNAUTHENTICATED", "API sənədləri üçün daxil ol."));
  if (identity.role !== "admin" && !isAdminEmail(identity.email)) return apiError(new ApiHttpError(403, "FORBIDDEN", "API sənədləri yalnız administrator üçündür."));

  try {
    const baseUrl = (process.env.EDURATE_API_BASE_URL?.trim() || "https://edurate-api.onrender.com").replace(/\/+$/, "");
    const response = await fetch(`${baseUrl}/api/openapi.json`, { cache: "no-store", signal: AbortSignal.timeout(65_000) });
    if (!response.ok) throw new Error("OPENAPI_UNAVAILABLE");
    return new Response(await response.text(), { headers: { "Cache-Control": "private, no-store, max-age=0", "Content-Type": "application/json; charset=utf-8" } });
  } catch {
    return apiError(new ApiHttpError(503, "OPENAPI_UNAVAILABLE", "API sənədləri hazırda yüklənmədi. Bir qədər sonra yenidən yoxla."));
  }
}
