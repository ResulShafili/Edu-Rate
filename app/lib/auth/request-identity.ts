import { cookies } from "next/headers";
import {
  credentialSessionCookieName,
  readCookieValue,
  readCredentialSession,
} from "./credential-session";
import {
  getRemoteSession,
  remoteCredentialCookieName,
} from "./remote-credential";

export type RequestIdentity = {
  email: string;
  displayName: string;
  source: "credential";
  role?: "student" | "mentor" | "teacher" | "admin";
};

export async function getRequestIdentity(request: Request): Promise<RequestIdentity | null> {
  const remoteToken = readCookieValue(
    request.headers.get("cookie"),
    remoteCredentialCookieName,
  );
  if (remoteToken) {
    try {
      const session = await getRemoteSession(remoteToken);
      return {
        email: session.user.email,
        displayName: session.user.name,
        source: "credential",
        role: session.user.role,
      };
    } catch {
      // Köhnə lokal sessiya varsa aşağıda ona keçid edilir.
    }
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
  const cookieStore = await cookies();
  const remoteToken = cookieStore.get(remoteCredentialCookieName)?.value;
  if (remoteToken) {
    try {
      const session = await getRemoteSession(remoteToken);
      return {
        email: session.user.email,
        displayName: session.user.name,
        source: "credential",
        role: session.user.role,
      };
    } catch {
      // Render sessiyası etibarsızdırsa köhnə lokal sessiya yoxlanılır.
    }
  }

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
