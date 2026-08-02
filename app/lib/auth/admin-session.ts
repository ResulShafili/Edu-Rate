import {
  isAdminAccessRole,
  type AdminAccessRole,
} from "./admin-role";

export type AdminPrincipal = {
  displayName: string;
  email: string;
  role: AdminAccessRole;
};

export type AdminSessionPayloadResult =
  | { status: "granted"; principal: AdminPrincipal }
  | { status: "forbidden" }
  | { status: "invalid" };

type SessionUser = {
  accessRole?: unknown;
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
    typeof user.accessRole === "string" ||
    typeof user.role === "string" ||
    Array.isArray(user.roles);
  if (!hasRoleClaim) return { status: "invalid" };
  const role = readAdminRole(user);
  if (!role) return { status: "forbidden" };

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
      role,
    },
  };
}

function readSessionUser(value: unknown): SessionUser | null {
  if (!isRecord(value)) return null;

  const envelope = isRecord(value.data) ? value.data : value;
  const user = isRecord(envelope.user) ? envelope.user : envelope;
  return user;
}

function readAdminRole(user: SessionUser): AdminAccessRole | null {
  if (isAdminAccessRole(user.accessRole)) return user.accessRole;
  if (isAdminAccessRole(user.role)) return user.role;

  if (!Array.isArray(user.roles)) return null;
  if (user.roles.includes("admin")) return "admin";
  return user.roles.includes("assistant_admin") ? "assistant_admin" : null;
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
