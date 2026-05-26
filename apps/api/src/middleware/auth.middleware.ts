import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { HttpStatus, Role } from "@repo/types";
import env from "../config/env.config.js";
import { prisma } from "@repo/database";

// Add AccountStatus enum
export enum AccountStatus {
  ACTIVE = "ACTIVE",
  PENDING = "PENDING",
  SUSPENDED = "SUSPENDED",
  DELETED = "DELETED",
}

interface JwtPayload {
  userId: string;
  role: Role;
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      console.log("🔍 [PROTECT_MIDDLEWARE]: No token found in cookies or headers.");
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    console.log(
      `🔍 [PROTECT_MIDDLEWARE]: JWT Decoded. UserID: ${decoded.userId}`,
    );

    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!currentUser) {
      console.log(
        `🔍 [PROTECT_MIDDLEWARE]: User lookup failed for ID: ${decoded.userId}`,
      );

      // 🚀 KILL THE ZOMBIE COOKIE
      res.clearCookie("token", {
        httpOnly: true,
        secure: env.isProduction,
        sameSite: env.isProduction ? "none" : "lax",
        path: "/",
      });
      
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: "User no longer exists" });
    }

    console.log(
      `🔍 [PROTECT_MIDDLEWARE]: User verified. Status: ${currentUser.accountStatus}, Role: ${currentUser.role}`,
    );

    req.user = {
      userId: currentUser.id,
      role: currentUser.role as Role,
      email: currentUser.email,
    };

    next();
  } catch (error) {
    console.error(
      "🔍 [PROTECT_MIDDLEWARE]: JWT Verification Error:",
      (error as any).message,
    );
    return res
      .status(HttpStatus.UNAUTHORIZED)
      .json({ message: "Invalid or expired session" });
  }
};

export const restrictTo = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role as Role)) {
      console.error(
        `🚫 Access Denied: User role [${req.user?.role}] not in allowed: [${roles.join(", ")}]`,
      );
      return res.status(HttpStatus.FORBIDDEN).json({
        status: "fail",
        message: "Insufficient permissions for this operation",
      });
    }
    next();
  };
};