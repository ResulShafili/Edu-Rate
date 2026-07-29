import { getServerRequestIdentity, isAdminEmail } from "./request-identity";

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
    const identity = await getServerRequestIdentity();
    if (!identity) return { status: "signed-out", signInHref: "/auth?returnTo=%2Fadmin" };

    return identity.role === "admin" || isAdminEmail(identity.email)
      ? {
          status: "granted",
          principal: {
            displayName: identity.displayName,
            email: identity.email,
          },
        }
      : { status: "forbidden" };
  } catch {
    return { status: "unavailable" };
  }
}
