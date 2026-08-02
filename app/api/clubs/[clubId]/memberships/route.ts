import { ApiHttpError, apiError, apiSuccess } from "../../../../lib/api/http";
import { assertTrustedMutation } from "../../../../lib/api/security";
import { readRemoteCredentialToken, requestRemoteApi } from "../../../../lib/auth/remote-credential";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ clubId: string }> };

async function forward(request: Request, context: Context, method: "POST" | "DELETE") {
  try {
    assertTrustedMutation(request);
    const token = readRemoteCredentialToken(request);
    if (!token) throw new ApiHttpError(401, "UNAUTHENTICATED", "Kluba qoşulmaq üçün daxil ol.");
    const { clubId } = await context.params;
    const data = await requestRemoteApi<{ joined: boolean; club: unknown }>(`/api/clubs/${encodeURIComponent(clubId)}/memberships`, { method, token });
    return apiSuccess(data, method === "POST" ? 201 : 200);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request, context: Context) { return forward(request, context, "POST"); }
export async function DELETE(request: Request, context: Context) { return forward(request, context, "DELETE"); }
