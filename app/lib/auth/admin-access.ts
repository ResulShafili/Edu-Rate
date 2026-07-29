import { headers } from "next/headers";
import { getChatGPTAuthContext } from "../../chatgpt-auth";
import {
  credentialSessionCookieName,
  readCookieValue,
  readCredentialSession,
} from "./credential-session";
import { isAdminEmail } from "./request-identity";

export type AdminPrincipal = {
  displayName: string;
  email: string;
};

export type AdminAccess =
  | { status: "granted"; principal: AdminPrincipal }
  | { status: "signed-out"; signInHref: string }
  | { status: "forbidden" }
  | { status: "unavailable" };

/**
 * Server-only authorization boundary for administrator pages. The browser never
 * supplies a role and production never falls back to a demo administrator.
 */
export async function resolveAdminAccess(): Promise<AdminAccess> {
  try {
    const sitesAuth = await getChatGPTAuthContext();
    if (sitesAuth.user) {
      return isAdminEmail(sitesAuth.user.email)
        ? {
            status: "granted",
            principal: {
              displayName: sitesAuth.user.displayName,
              email: sitesAuth.user.email,
            },
          }
        : { status: "forbidden" };
    }

    const requestHeaders = await headers();
    const session = await readCredentialSession(
      readCookieValue(
        requestHeaders.get("cookie"),
        credentialSessionCookieName,
      ),
    );
    if (!session) return { status: "signed-out", signInHref: "/auth?returnTo=%2Fadmin" };

    return isAdminEmail(session.user.email)
      ? {
          status: "granted",
          principal: {
            displayName: session.user.name,
            email: session.user.email,
          },
        }
      : { status: "forbidden" };
  } catch {
    return { status: "unavailable" };
  }
}
