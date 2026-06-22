process.on("unhandledRejection", (reason: unknown) => {
  console.error("🔴 [UnhandledRejection]", reason);
  process.exit(1);
});
process.on("uncaughtException", (err: Error) => {
  console.error("🔴 [UncaughtException]", err.message, err.stack);
  process.exit(1);
});

import "./config/env.config.js";
import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { runMigrationsAndSeed } from "./db/migrate.js";
import { globalErrorHandler }  from "./middleware/error.middleware.js";
import { authRateLimiter, globalRateLimiter } from "./middleware/security.middleware.js";
import { auditLog }            from "./middleware/audit.middleware.js";
import { maintenanceMode }     from "./middleware/maintenance.middleware.js";
import systemRoutes       from "./modules/system/system.routes.js";
import authRoutes         from "./modules/auth/auth.routes.js";
import userRoutes         from "./modules/users/user.routes.js";
import adminRoutes        from "./modules/admin/admin.routes.js";
import superAdminRoutes   from "./modules/super-admin/super-admin.routes.js";
import notificationRoutes from "./modules/notifications/notification.routes.js";

const app: Express = express();
const isProduction = process.env.NODE_ENV === "production";

// ── 1. SECURITY & LOGGING ─────────────────────────────────────────────────────
app.use(helmet());
app.use(globalRateLimiter);
app.use(morgan(isProduction ? "combined" : "dev"));

// ── 2. CORS ───────────────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL ?? "",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.some((allowed) =>
        origin.startsWith(allowed)
      );
      if (isAllowed) {
        callback(null, true);
      } else {
        console.error(`🔴 CORS Blocked: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials:    true,
    methods:        ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── 3. PARSERS ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── 4. CROSS-CUTTING MIDDLEWARE ───────────────────────────────────────────────
app.use(maintenanceMode);
app.use(auditLog);

// ── 5. ROUTES ─────────────────────────────────────────────────────────────────
const API = "/api/v1";

app.use(`${API}/system`,        systemRoutes);
app.use(`${API}/auth`,          authRateLimiter, authRoutes);
app.use(`${API}/users`,         userRoutes);
app.use(`${API}/admin`,         adminRoutes);
app.use(`${API}/super-admin`,   superAdminRoutes);
app.use(`${API}/notifications`, notificationRoutes);

// ── 6. 404 ────────────────────────────────────────────────────────────────────
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status:  "fail",
    message: `Route ${req.originalUrl} not found`,
  });
});

// ── 7. ERROR HANDLER ──────────────────────────────────────────────────────────
app.use(globalErrorHandler);

// ── 8. START ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;

(async () => {
  await runMigrationsAndSeed();

  app.listen(PORT, () => {
    console.log(`\n─────────────────────────────────────────`);
    console.log(`🚀  API RUNNING`);
    console.log(`🌍  MODE:   ${process.env.NODE_ENV || "development"}`);
    console.log(`🔗  URL:    http://localhost:${PORT}${API}`);
    console.log(`─────────────────────────────────────────\n`);
  });
})().catch((err: unknown) => {
  console.error("🔴 [Fatal] Server failed to start:", err);
  process.exit(1);
});

export default app;
