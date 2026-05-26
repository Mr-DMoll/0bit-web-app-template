import { Role } from "@repo/types";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role:   Role;
        email:  string;
      };
      auditLogged?: boolean;
    }
  }
}

export {};
