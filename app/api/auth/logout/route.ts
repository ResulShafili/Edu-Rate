import { apiError, apiNoContent } from "../../../lib/api/http";
import { assertTrustedMutation } from "../../../lib/api/security";
import {
  getRemoteCredentialCookieOptions,
  remoteCredentialCookie,
  readRemoteCredentialToken,
  requestRemoteApi,
} from "../../../lib/auth/remote-credential";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    assertTrustedMutation(request);
    const token=readRemoteCredentialToken(request);
    if(token)await requestRemoteApi<void>("/api/auth/logout",{method:"POST",token}).catch(()=>undefined);
    const response = apiNoContent();
    response.cookies.set(remoteCredentialCookie.name, "", {
      ...getRemoteCredentialCookieOptions(request),
      maxAge: 0,
    });
    return response;
  } catch (error) {
    return apiError(error);
  }
}
