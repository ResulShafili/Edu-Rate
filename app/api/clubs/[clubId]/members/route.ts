import { ApiHttpError, apiError, apiSuccess } from "../../../../lib/api/http";
import { readRemoteCredentialToken, requestRemoteApi } from "../../../../lib/auth/remote-credential";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ clubId: string }> };

export async function GET(request: Request, context: Context) {
  try {
    const token=readRemoteCredentialToken(request);
    if(!token)throw new ApiHttpError(401,"UNAUTHENTICATED","Üzvləri görmək üçün daxil ol.");
    const {clubId}=await context.params;
    return apiSuccess(await requestRemoteApi(`/api/clubs/${encodeURIComponent(clubId)}/members`,{token}));
  } catch(error){return apiError(error);}
}
