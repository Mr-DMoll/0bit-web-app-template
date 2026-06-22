export const AuditAction = {
  USER_REGISTERED:              "USER_REGISTERED",
  USER_LOGGED_IN:               "USER_LOGGED_IN",
  USER_PASSWORD_RESET_COMPLETED:"USER_PASSWORD_RESET_COMPLETED",
  SYSTEM_ERROR:                 "SYSTEM_ERROR_OCCURRED",
} as const;

export type AuditActionType = (typeof AuditAction)[keyof typeof AuditAction];