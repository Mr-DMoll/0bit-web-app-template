import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Override any env vars pnpm or the shell may have pre-loaded with stale values.
dotenv.config({ path: path.resolve(__dirname, "../../../../.env"), override: true });
dotenv.config({ override: true }); // fallback: reads process.cwd()/.env in production

const env = {
  NODE_ENV:           process.env.NODE_ENV || "development",
  PORT:               parseInt(process.env.PORT || "3001", 10),
  JWT_SECRET:         process.env.JWT_SECRET as string,
  JWT_EXPIRES_IN:     "7d",
  BCRYPT_SALT_ROUNDS: 12,
  DATABASE_URL:       process.env.DATABASE_URL as string,
  FRONTEND_URL:       process.env.FRONTEND_URL || "http://localhost:3000",
  API_URL:            process.env.API_URL       || "http://localhost:3001",

  // Mail — Resend
  RESEND_API_KEY: process.env.RESEND_API_KEY as string,
  SENDER_EMAIL:   process.env.SENDER_EMAIL   || "noreply@phoque-orbit.co.za",

  // Google OAuth
  GOOGLE_CLIENT_ID:     process.env.GOOGLE_CLIENT_ID     as string,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,

  // Anthropic — Claude API for automation workers
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY as string,

  // File storage — Cloudflare R2 (add when ready)
  R2_ACCOUNT_ID:        process.env.R2_ACCOUNT_ID        as string,
  R2_ACCESS_KEY_ID:     process.env.R2_ACCESS_KEY_ID     as string,
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY as string,
  R2_BUCKET_NAME:       process.env.R2_BUCKET_NAME       as string,
  R2_PUBLIC_URL:        process.env.R2_PUBLIC_URL         as string,

  get isProduction()  { return this.NODE_ENV === "production";  },
  get isDevelopment() { return this.NODE_ENV === "development"; },
};

// ── FAIL FAST — crash on startup if critical vars are missing ─────────────────
const required = ["DATABASE_URL", "JWT_SECRET", "RESEND_API_KEY", "SUPER_ADMIN_EMAIL"];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌ FATAL: Missing environment variable: ${key}`);
    process.exit(1);
  }
}

export default env;