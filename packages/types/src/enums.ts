export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN       = "ADMIN",
  USER        = "USER",
}
8778
export enum AccountStatus {
  PENDING   = "PENDING",
  ACTIVE    = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  DELETED   = "DELETED",
}

export enum RegistrationMode {
  INVITE_ONLY         = "INVITE_ONLY",
  SELF_REGISTER       = "SELF_REGISTER",
  SELF_REGISTER_AUTO  = "SELF_REGISTER_AUTO",
}
