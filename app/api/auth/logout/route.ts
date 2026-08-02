import { apiError, apiNoContent } from "../../../lib/api/http";
import { assertTrustedMutation } from "../../../lib/api/security";
import {
  getRemoteCredentialCookieOptions,
  remoteCredentialCookie,
} from "../../../lib/auth/remote-credential";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    assertTrustedMutation(request);
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
