export type AdminAccessRole = "admin" | "assistant_admin";
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
  return value === "admin" || value === "assistant_admin";
}

export function getAdminCapabilities(role: AdminAccessRole): AdminCapabilities {
  const isPrimaryAdmin = role === "admin";
  return {
    role,
    canAccessPanel: true,
    canManageContent: true,
    canManageUsers: true,
    canCreateUsers: isPrimaryAdmin,
    canEditPrivilegedUsers: isPrimaryAdmin,
    canDeleteUsers: isPrimaryAdmin,
    canAssignElevatedRoles: isPrimaryAdmin,
  };
}

export function isAssignableUserRole(value: unknown): value is AssignableUserRole {
  return value === "student" || value === "mentor" || value === "teacher";
}

export function canEditUserRole(
  actorRole: AdminAccessRole,
  targetRole: string,
): boolean {
  return actorRole === "admin" || isAssignableUserRole(targetRole);
}

export function getAdminRoleLabel(role: AdminAccessRole): string {
  return role === "admin" ? "Əsas administrator" : "Admin köməkçisi";
}
