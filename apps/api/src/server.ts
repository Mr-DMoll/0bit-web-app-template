import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { globalErrorHandler } from "./middleware/error.middleware.js";
import systemRoutes from "./modules/system/system.routes.js";
import authRoutes   from "./modules/auth/auth.routes.js";
import userRoutes   from "./modules/users/user.routes.js";
import adminRoutes  from "./modules/admin/admin.routes.js";
import superAdminRoutes from "./modules/super-admin/super-admin.routes.js";

const app: Express = express();
const isProduction = process.env.NODE_ENV === "production";

// ── 1. SECURITY & LOGGING ─────────────────────────────────────────────────────
app.use(helmet());
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

// ── 4. ROUTES ─────────────────────────────────────────────────────────────────
const API = "/api/v1";

app.use(`${API}/system`,      systemRoutes);
app.use(`${API}/auth`,        authRoutes);
app.use(`${API}/users`,       userRoutes);
app.use(`${API}/admin`,       adminRoutes);
app.use(`${API}/super-admin`, superAdminRoutes);

// ── 5. 404 ────────────────────────────────────────────────────────────────────
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status:  "fail",
    message: `Route ${req.originalUrl} not found`,
  });
});

// ── 6. ERROR HANDLER ──────────────────────────────────────────────────────────
app.use(globalErrorHandler);

// ── 7. START ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n─────────────────────────────────────────`);
  console.log(`🚀  API RUNNING`);
  console.log(`🌍  MODE:   ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗  URL:    http://localhost:${PORT}${API}`);
  console.log(`─────────────────────────────────────────\n`);
});

export default app;
