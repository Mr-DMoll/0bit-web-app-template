import { Request, Response, NextFunction } from "express";
import { prisma } from "@repo/database";

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function deriveAction(method: string, path: string): string {
  const segments = path
    .replace(/^\/api\/v1/, "")
    .replace(/-/g, "_")
    .split("/")
    .filter((s) =>
      s.length > 0 &&
      !/^c[a-z0-9]{20,}$/.test(s) &&               // cuid
      !/^[0-9a-f]{8}-[0-9a-f]{4}-/.test(s) &&      // uuid
      !/^\d+$/.test(s)                              // numeric id
    );
  return `${method}_${segments.join("_")}`.toUpperCase();
}

export function auditLog(req: Request, res: Response, next: NextFunction): void {
  if (!MUTATING.has(req.method)) { next(); return; }

  res.on("finish", () => {
    if (!req.user?.userId)  return;
    if (req.auditLogged)    return;
    if (res.statusCode >= 400) return;

    const action = deriveAction(req.method, req.path);

    prisma.auditLog
      .create({
        data: {
          userId:    req.user.userId,
          action,
          meta:      { path: req.path, method: req.method, status: res.statusCode },
          ip:        req.ip ?? req.socket?.remoteAddress ?? null,
          userAgent: req.headers["user-agent"] ?? null,
        },
      })
      .catch(() => {});
  });

  next();
}
