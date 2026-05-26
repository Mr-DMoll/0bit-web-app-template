import { Request, Response, NextFunction } from "express";
import { prisma } from "@repo/database";
import jwt from "jsonwebtoken";
import env from "../config/env.config.js";

interface CacheEntry { value: boolean; expiresAt: number; }
let cache: CacheEntry | null = null;
const TTL_MS = 30_000;

async function isMaintenanceActive(): Promise<boolean> {
  if (cache && Date.now() < cache.expiresAt) return cache.value;

  try {
    const row = await prisma.systemSetting.findUnique({
      where: { key: "maintenance_mode" },
    });
    const value = row?.value === "true";
    cache = { value, expiresAt: Date.now() + TTL_MS };
    return value;
  } catch {
    return false;
  }
}

function isSuperAdmin(req: Request): boolean {
  try {
    const token =
      req.cookies?.token ||
      req.headers.authorization?.split(" ")[1];
    if (!token) return false;
    const payload = jwt.verify(token, env.JWT_SECRET) as { role?: string };
    return payload.role === "SUPER_ADMIN";
  } catch {
    return false;
  }
}

export async function maintenanceMode(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const active = await isMaintenanceActive();
  if (!active) { next(); return; }
  if (isSuperAdmin(req)) { next(); return; }

  res.status(503).json({
    status:  "fail",
    message: "The platform is currently undergoing maintenance. Please check back shortly.",
  });
}
