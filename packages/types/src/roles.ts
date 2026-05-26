import { PERMISSIONS, PermissionType } from "./permissions.js";
import { Role } from "./enums.js";

export const USER_ROLES = Role;
export type UserRoleType = Role;

export const ROLE_PERMISSIONS: Record<UserRoleType, PermissionType[]> = {
  SUPER_ADMIN: [
    PERMISSIONS.ADD_ADMIN,
    PERMISSIONS.MANAGE_PLATFORM,
    PERMISSIONS.MANAGE_ALL_USERS,
    PERMISSIONS.VIEW_ALL_PROJECTS,
  ],
  ADMIN: [
    PERMISSIONS.MANAGE_ALL_USERS,
    PERMISSIONS.INVITE_USERS,
    PERMISSIONS.VIEW_ALL_PROJECTS,
  ],
  USER: [
    PERMISSIONS.VIEW_OWN_PROJECT,
  ],
};

export const hasPermission = (
  role: UserRoleType,
  permission: PermissionType,
): boolean => (ROLE_PERMISSIONS[role] ?? []).includes(permission);
