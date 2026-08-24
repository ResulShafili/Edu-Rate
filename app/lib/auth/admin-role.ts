export type AdminAccessRole = "owner_admin" | "admin" | "assistant_admin";
export type AssignableUserRole = "student" | "mentor" | "teacher";

export type AdminCapabilities = {
  role: AdminAccessRole;
  canAccessPanel: true;
  canManageContent: true;
  canManageUsers: boolean;
  canCreateUsers: boolean;
  canEditPrivilegedUsers: boolean;
  canDeleteUsers: boolean;
  canAssignElevatedRoles: boolean;
};

export function isAdminAccessRole(value: unknown): value is AdminAccessRole {
  return value === "owner_admin" || value === "admin" || value === "assistant_admin";
}

export function getAdminCapabilities(role: AdminAccessRole): AdminCapabilities {
  const isOwner = role === "owner_admin";
  return {
    role,
    canAccessPanel: true,
    canManageContent: true,
    canManageUsers: true,
    canCreateUsers: isOwner,
    canEditPrivilegedUsers: isOwner,
    canDeleteUsers: isOwner,
    canAssignElevatedRoles: isOwner,
  };
}

export function isAssignableUserRole(value: unknown): value is AssignableUserRole {
  return value === "student" || value === "mentor" || value === "teacher";
}

export function canEditUserRole(
  actorRole: AdminAccessRole,
  targetRole: string,
): boolean {
  if (actorRole === "owner_admin") return true;
  if (actorRole === "admin") return targetRole !== "owner_admin";
  return isAssignableUserRole(targetRole);
}

export function getAdminRoleLabel(role: AdminAccessRole): string {
  if (role === "owner_admin") return "Platforma sahibi";
  return role === "admin" ? "Administrator" : "Admin köməkçisi";
}
