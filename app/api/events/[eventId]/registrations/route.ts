import { ApiHttpError, apiError, apiSuccess } from "../../../../lib/api/http";
import { readRemoteCredentialToken, requestRemoteApi } from "../../../../lib/auth/remote-credential";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ eventId: string }> };

async function forward(request: Request, context: Context, method: "POST" | "DELETE") {
  try {
    const token = readRemoteCredentialToken(request);
    if (!token) throw new ApiHttpError(401, "UNAUTHENTICATED", "Tədbirə qeydiyyat üçün hesaba daxil ol.");
    const { eventId } = await context.params;
    const result = await requestRemoteApi<{ registered: boolean; event: unknown }>(
      `/api/events/${encodeURIComponent(eventId)}/registrations`,
      { method, token },
    );
    return apiSuccess(result, method === "POST" ? 201 : 200);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request, context: Context) {
  return forward(request, context, "POST");
}

export async function DELETE(request: Request, context: Context) {
  return forward(request, context, "DELETE");
}
