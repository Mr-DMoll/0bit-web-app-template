/**
 * PERMISSIONS
 * Agency platform — O-Bit
 * These map to real actions users can perform in the system.
 */
export const PERMISSIONS = {
  // ── Super Admin ───────────────────────────────────────────
  ADD_ADMIN:          "add_admin",
  MANAGE_PLATFORM:    "manage_platform",

  // ── Admin ─────────────────────────────────────────────────
  MANAGE_BILLING:     "manage_billing",
  VIEW_ALL_PROJECTS:  "view_all_projects",
  MANAGE_ALL_USERS:   "manage_all_users",

  // ── Manager ───────────────────────────────────────────────
  INVITE_USERS:       "invite_users",      // add developers and clients
  CREATE_PROJECT:     "create_project",
  MANAGE_PROJECT:     "manage_project",    // edit milestones, tasks, docs
  APPROVE_MILESTONE:  "approve_milestone", // triggers invoice
  VIEW_INVOICES:      "view_invoices",
  MANAGE_DOCUMENTS:   "manage_documents",

  // ── Developer ─────────────────────────────────────────────
  VIEW_ASSIGNED_PROJECTS: "view_assigned_projects",
  UPDATE_TASKS:       "update_tasks",
  UPLOAD_DOCUMENTS:   "upload_documents",

  // ── Client ────────────────────────────────────────────────
  VIEW_OWN_PROJECT:   "view_own_project",
  APPROVE_DESIGN:     "approve_design",
  VIEW_OWN_INVOICES:  "view_own_invoices",
  LEAVE_COMMENTS:     "leave_comments",
} as const;

export type PermissionType = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];