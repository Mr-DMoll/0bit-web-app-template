import { Request, Response } from "express";
import { prisma } from "@repo/database";
import env from "../../config/env.config.js";

export const getHealth = async (_req: Request, res: Response) => {
  const start = Date.now();

  // ── DB ────────────────────────────────────────────────────────────────────────
  let dbStatus: "connected" | "error" = "error";
  let dbLatencyMs = 0;
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
    dbStatus = "connected";
  } catch {}

  // ── Memory ────────────────────────────────────────────────────────────────────
  const mem = process.memoryUsage();
  const toMB = (bytes: number) => Math.round(bytes / 1024 / 1024);

  // ── Services ──────────────────────────────────────────────────────────────────
  const services = {
    resend: env.RESEND_API_KEY ? "configured" : "not_configured",
    r2:     env.R2_ACCOUNT_ID  ? "configured" : "not_configured",
  };

  const overallStatus = dbStatus === "connected" ? "healthy" : "degraded";

  res.status(dbStatus === "connected" ? 200 : 503).json({
    status:    overallStatus,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    responseTimeMs: Date.now() - start,
    database: {
      status:    dbStatus,
      latencyMs: dbLatencyMs,
    },
    memory: {
      heapUsedMB:  toMB(mem.heapUsed),
      heapTotalMB: toMB(mem.heapTotal),
      rssMB:       toMB(mem.rss),
    },
    services,
    version: process.env.npm_package_version ?? "unknown",
    environment: env.NODE_ENV,
  });
};
