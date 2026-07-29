import { apiNoContent } from "../../../lib/api/http";
import {
  credentialSessionCookie,
  getCredentialSessionCookieOptions,
} from "../../../lib/auth/credential-session";
import {
  getRemoteCredentialCookieOptions,
  remoteCredentialCookie,
} from "../../../lib/auth/remote-credential";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const response = apiNoContent();
  response.cookies.set(credentialSessionCookie.name, "", {
    ...getCredentialSessionCookieOptions(request),
    maxAge: 0,
  });
  response.cookies.set(remoteCredentialCookie.name, "", {
    ...getRemoteCredentialCookieOptions(request),
    maxAge: 0,
  });
  return response;
}
