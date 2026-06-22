import { Request, Response, NextFunction } from "express";
import { HttpStatus, Role } from "@repo/types";

export const authorize = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: "User not identified" });
    }

    if (!allowedRoles.includes(req.user.role as Role)) {
      return res.status(HttpStatus.FORBIDDEN).json({
        message: `Access denied. Requires one of: ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
};
