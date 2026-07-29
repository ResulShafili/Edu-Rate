import { getChatGPTAuthContext } from "../../chatgpt-auth";
import { cookies } from "next/headers";
import {
  credentialSessionCookieName,
  readCookieValue,
  readCredentialSession,
} from "./credential-session";

export type RequestIdentity = {
  email: string;
  displayName: string;
  source: "sites" | "credential";
};

export async function getRequestIdentity(request: Request): Promise<RequestIdentity | null> {
  const sitesAuth = await getChatGPTAuthContext();
  if (sitesAuth.user) {
    return {
      email: sitesAuth.user.email,
      displayName: sitesAuth.user.displayName,
      source: "sites",
    };
  }

  const session = await readCredentialSession(
    readCookieValue(request.headers.get("cookie"), credentialSessionCookieName),
  );
  if (!session) return null;

  return {
    email: session.user.email,
    displayName: session.user.name,
    source: "credential",
  };
}

export async function getServerRequestIdentity(): Promise<RequestIdentity | null> {
  const sitesAuth = await getChatGPTAuthContext();
  if (sitesAuth.user) {
    return {
      email: sitesAuth.user.email,
      displayName: sitesAuth.user.displayName,
      source: "sites",
    };
  }

  const cookieStore = await cookies();
  const session = await readCredentialSession(cookieStore.get(credentialSessionCookieName)?.value);
  if (!session) return null;
  return {
    email: session.user.email,
    displayName: session.user.name,
    source: "credential",
  };
}

export function isAdminEmail(email: string): boolean {
  const allowlist = (process.env.EDURATE_ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLocaleLowerCase("en-US"))
    .filter(Boolean);
  return allowlist.includes(email.trim().toLocaleLowerCase("en-US"));
}
