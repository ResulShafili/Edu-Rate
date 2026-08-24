import { cookies } from "next/headers";
import { readCookieValue } from "./cookies";
import {
  getRemoteSession,
  remoteCredentialCookieName,
} from "./remote-credential";

export type RequestIdentity = {
  email: string;
  displayName: string;
  source: "credential";
  role?: "student" | "mentor" | "teacher" | "admin" | "assistant_admin" | "owner_admin";
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
      return null;
    }
  }
  return null;
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
      return null;
    }
  }
  return null;
}
