import { ApiError, type ApiMockRequest } from "../../../lib/api/client";
import { ApiHttpError, apiError, apiNoContent, apiSuccess, readJsonBody } from "../../../lib/api/http";
import { handleAdminMockRequest } from "../../../services/admin.service";

export const dynamic = "force-dynamic";

type Context = {
  params: Promise<{ path: string[] }>;
};

async function handle(request: Request, context: Context) {
  try {
    const { path } = await context.params;
    const method = request.method as ApiMockRequest["method"];
    const body = method === "POST" || method === "PATCH" || method === "PUT"
      ? await readJsonBody<unknown>(request)
      : undefined;
    const url = new URL(request.url);
    const data = await handleAdminMockRequest({
      path: `/admin/${path.map(encodeURIComponent).join("/")}`,
      method,
      query: url.searchParams,
      body,
      headers: request.headers,
    });

    return data === undefined ? apiNoContent() : apiSuccess(data);
  } catch (error) {
    if (error instanceof ApiError) {
      return apiError(new ApiHttpError(
        error.status || 500,
        error.code ?? "ADMIN_API_ERROR",
        error.message,
        isDetailsRecord(error.details) ? stringifyDetails(error.details) : undefined,
      ));
    }
    return apiError(error);
  }
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;

function isDetailsRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringifyDetails(value: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, String(entry)]));
}
