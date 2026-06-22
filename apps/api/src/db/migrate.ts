/**
 * Self-contained database migration + seed runner.
 *
 * Runs automatically on every API startup (called from server.ts).
 * Uses raw pg — NOT Prisma — so it works with the transaction-mode pooler
 * (pgbouncer=true) without needing a direct database connection.
 *
 * Every statement is idempotent:
 *   CREATE TABLE IF NOT EXISTS
 *   ALTER TABLE ... ADD COLUMN IF NOT EXISTS
 *   CREATE INDEX IF NOT EXISTS
 *   INSERT ... ON CONFLICT DO NOTHING
 *
 * This means it is safe to run on every restart — existing data is never touched.
 */

import { randomBytes } from "crypto";
import pg from "pg";
import bcrypt from "bcryptjs";
export async function runMigrationsAndSeed(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.warn("⚠️  [MIGRATE] DATABASE_URL not set — skipping migrations");
    return;
  }

  const pool   = new pg.Pool({ connectionString, max: 1, idleTimeoutMillis: 10_000 });
  const client = await pool.connect();

  try {
    console.log("🔄 [MIGRATE] Running startup migrations...");

    // ── Enums ────────────────────────────────────────────────────────────────
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "AccountStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'DELETED');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "RegistrationMode" AS ENUM ('INVITE_ONLY', 'SELF_REGISTER', 'SELF_REGISTER_AUTO');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    // ── Tables ───────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id"                   TEXT          NOT NULL,
        "email"                TEXT          NOT NULL,
        "password"             TEXT          NOT NULL,
        "role"                 "Role"        NOT NULL DEFAULT 'USER',
        "accountStatus"        "AccountStatus" NOT NULL DEFAULT 'PENDING',
        "firstName"            TEXT,
        "lastName"             TEXT,
        "displayName"          TEXT,
        "avatarUrl"            TEXT,
        "phone"                TEXT,
        "verificationCode"     TEXT,
        "verificationExpires"  TIMESTAMP(3),
        "passwordResetToken"   TEXT,
        "passwordResetExpires" TIMESTAMP(3),
        "lastActiveAt"         TIMESTAMP(3),
        "city"                 TEXT,
        "country"              TEXT,
        "language"             TEXT,
        "dateOfBirth"          TIMESTAMP(3),
        "googleId"             TEXT,
        "googleRefreshToken"   TEXT,
        "invitedById"          TEXT,
        "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "AuditLog" (
        "id"        TEXT NOT NULL,
        "userId"    TEXT NOT NULL,
        "action"    TEXT NOT NULL,
        "meta"      JSONB,
        "ip"        TEXT,
        "userAgent" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "Notification" (
        "id"        TEXT    NOT NULL,
        "userId"    TEXT    NOT NULL,
        "title"     TEXT    NOT NULL,
        "body"      TEXT    NOT NULL,
        "read"      BOOLEAN NOT NULL DEFAULT false,
        "link"      TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "SystemSetting" (
        "id"        TEXT NOT NULL,
        "key"       TEXT NOT NULL,
        "value"     TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
      );
    `);

    // ── Idempotent column additions (for databases created before these fields) ─
    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "city"        TEXT;`);
    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "country"     TEXT;`);
    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "language"    TEXT;`);
    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "dateOfBirth" TIMESTAMP(3);`);
    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone"       TEXT;`);

    // ── Indexes ──────────────────────────────────────────────────────────────
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key"    ON "User"("email");`);
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "User_googleId_key" ON "User"("googleId");`);
    await client.query(`CREATE INDEX        IF NOT EXISTS "User_email_idx"    ON "User"("email");`);
    await client.query(`CREATE INDEX        IF NOT EXISTS "User_role_idx"     ON "User"("role");`);
    await client.query(`CREATE INDEX        IF NOT EXISTS "User_googleId_idx" ON "User"("googleId");`);
    await client.query(`CREATE INDEX        IF NOT EXISTS "AuditLog_userId_idx"   ON "AuditLog"("userId");`);
    await client.query(`CREATE INDEX        IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");`);
    await client.query(`CREATE INDEX        IF NOT EXISTS "Notification_userId_idx" ON "Notification"("userId");`);
    await client.query(`CREATE INDEX        IF NOT EXISTS "Notification_userId_read_idx" ON "Notification"("userId", "read");`);
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "SystemSetting_key_key" ON "SystemSetting"("key");`);

    // ── Foreign keys (safe to re-run — DO block catches duplicate) ───────────
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE "User" ADD CONSTRAINT "User_invitedById_fkey"
          FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey"
          FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey"
          FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    console.log("✅ [MIGRATE] Schema ready");

    // ── Seed system settings ─────────────────────────────────────────────────
    await client.query(`
      INSERT INTO "SystemSetting" ("id", "key", "value", "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, 'registration_mode', 'INVITE_ONLY', NOW(), NOW())
      ON CONFLICT ("key") DO NOTHING;
    `);
    await client.query(`
      INSERT INTO "SystemSetting" ("id", "key", "value", "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, 'app_name', 'My App', NOW(), NOW())
      ON CONFLICT ("key") DO NOTHING;
    `);

    // ── Seed super admin (only if no super admin exists) ─────────────────────
    const existing = await client.query(
      `SELECT id FROM "User" WHERE role = 'SUPER_ADMIN' LIMIT 1`
    );
    if (existing.rowCount === 0) {
      const adminEmail    = process.env.SUPER_ADMIN_EMAIL;
      const adminPassword = process.env.SUPER_ADMIN_PASSWORD ?? randomBytes(16).toString("hex");

      if (!adminEmail) {
        throw new Error("SUPER_ADMIN_EMAIL is required in .env to seed the super admin account.");
      }

      const passwordHash = await bcrypt.hash(adminPassword, 12);
      const id = randomBytes(12).toString("hex");
      await client.query(`
        INSERT INTO "User" (
          "id", "email", "password", "role", "accountStatus",
          "firstName", "lastName", "displayName", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, 'SUPER_ADMIN', 'ACTIVE', 'Super', 'Admin', 'Super Admin', NOW(), NOW())
        ON CONFLICT ("email") DO NOTHING;
      `, [id, adminEmail, passwordHash]);

      console.log(`🌱 [MIGRATE] Super admin created → ${adminEmail}`);
      if (!process.env.SUPER_ADMIN_PASSWORD) {
        console.log(`   Generated password: ${adminPassword}`);
        console.log(`   ⚠️  Save this now — it will NOT be shown again.`);
      }
      console.log(`   👉 Log in and change BOTH the email and password immediately.`);
      console.log(`   ℹ️  Re-seeding will NOT update an existing account — use the app.`);
    } else {
      console.log("🌱 [MIGRATE] Super admin already exists — skipping seed");
    }

  } catch (err: any) {
    console.error("❌ [MIGRATE] Migration failed:", err.message);
    throw err; // re-throw so server startup aborts — don't run a broken app
  } finally {
    client.release();
    await pool.end();
  }
}
