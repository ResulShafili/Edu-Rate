import { ApiHttpError, apiError, apiNoContent, apiSuccess, readJsonBody } from "../../../lib/api/http";
import { getRequestIdentity, isAdminEmail } from "../../../lib/auth/request-identity";
import { readRemoteCredentialToken, requestRemoteApi } from "../../../lib/auth/remote-credential";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ path: string[] }> };

async function handle(request: Request, context: Context) {
  try {
    const identity = await getRequestIdentity(request);
    if (!identity) throw new ApiHttpError(401, "UNAUTHENTICATED", "İdarəetmə API-si üçün daxil olmalısan.");
    if (identity.role !== "admin" && !isAdminEmail(identity.email)) {
      throw new ApiHttpError(403, "FORBIDDEN", "Bu əməliyyat üçün administrator icazəsi yoxdur.");
    }
    const token = readRemoteCredentialToken(request);
    if (!token) throw new ApiHttpError(401, "REMOTE_SESSION_REQUIRED", "Admin sessiyasını yeniləmək üçün yenidən daxil ol.");

    const { path } = await context.params;
    const method = request.method as "GET" | "POST" | "PATCH" | "DELETE";
    const body = method === "POST" || method === "PATCH" ? await readJsonBody<unknown>(request) : undefined;
    const query = new URL(request.url).searchParams.toString();
    const remotePath = `/api/admin/${path.map(encodeURIComponent).join("/")}${query ? `?${query}` : ""}`;
    const data = await requestRemoteApi<unknown>(remotePath, { method, body, token });
    return data === undefined ? apiNoContent() : apiSuccess(data, method === "POST" ? 201 : 200);
  } catch (error) {
    return apiError(error);
  }
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;
