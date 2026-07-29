import { openApiDocument } from "../../lib/api/openapi";
import { ApiHttpError, apiError } from "../../lib/api/http";
import { getRequestIdentity, isAdminEmail } from "../../lib/auth/request-identity";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const identity = await getRequestIdentity(request);
  if (!identity) return apiError(new ApiHttpError(401, "UNAUTHENTICATED", "API sənədləri üçün daxil ol."));
  if (!isAdminEmail(identity.email)) return apiError(new ApiHttpError(403, "FORBIDDEN", "API sənədləri yalnız administrator üçündür."));

  return Response.json(openApiDocument, {
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
