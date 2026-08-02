export type AdminAccessRole = "admin" | "assistant_admin";

export type AdminCapabilities = {
  role: AdminAccessRole;
  canAccessPanel: true;
  canManageContent: true;
  canManageUsers: boolean;
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
    canManageUsers: isPrimaryAdmin,
    canDeleteUsers: isPrimaryAdmin,
    canAssignElevatedRoles: isPrimaryAdmin,
  };
}

export function getAdminRoleLabel(role: AdminAccessRole): string {
  return role === "admin" ? "Əsas administrator" : "Admin köməkçisi";
}
