export type AdminPrincipal = {
  displayName: string;
  email: string;
};

export type AdminSessionPayloadResult =
  | { status: "granted"; principal: AdminPrincipal }
  | { status: "forbidden" }
  | { status: "invalid" };

type SessionUser = {
  displayName?: unknown;
  email?: unknown;
  name?: unknown;
  role?: unknown;
  roles?: unknown;
};

export function parseAdminSessionPayload(
  value: unknown,
): AdminSessionPayloadResult {
  const user = readSessionUser(value);
  if (!user) return { status: "invalid" };

  const hasRoleClaim =
    typeof user.role === "string" || Array.isArray(user.roles);
  if (!hasRoleClaim) return { status: "invalid" };
  if (!hasAdminRole(user)) return { status: "forbidden" };

  const email = readIdentityValue(user.email);
  if (!email) return { status: "invalid" };

  return {
    status: "granted",
    principal: {
      displayName:
        readIdentityValue(user.displayName) ??
        readIdentityValue(user.name) ??
        email,
      email,
    },
  };
}

function readSessionUser(value: unknown): SessionUser | null {
  if (!isRecord(value)) return null;

  const envelope = isRecord(value.data) ? value.data : value;
  const user = isRecord(envelope.user) ? envelope.user : envelope;
  return user;
}

function hasAdminRole(user: SessionUser): boolean {
  if (user.role === "admin") return true;

  return (
    Array.isArray(user.roles) &&
    user.roles.some((role) => role === "admin")
  );
}

function readIdentityValue(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const normalized = value.trim();
  if (!normalized || normalized.length > 254 || /[\r\n\u0000]/.test(normalized)) {
    return null;
  }
  return normalized;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
