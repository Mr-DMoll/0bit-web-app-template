import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { randomBytes } from "crypto";
import pkg from "bcryptjs";
const { hash } = pkg;
import { PrismaClient } from "../generated/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../../.env"), override: true });

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("❌ DATABASE_URL missing from .env");

  const pool    = new pg.Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma  = new PrismaClient({ adapter } as any);

  try {
    console.log("🌱 Seeding database...");

    await prisma.systemSetting.upsert({
      where:  { key: "registration_mode" },
      update: {},
      create: { key: "registration_mode", value: "INVITE_ONLY" },
    });

    await prisma.systemSetting.upsert({
      where:  { key: "app_name" },
      update: {},
      create: { key: "app_name", value: "My App" },
    });

    const adminEmail    = process.env.SUPER_ADMIN_EMAIL;
    const adminPassword = process.env.SUPER_ADMIN_PASSWORD ?? randomBytes(16).toString("hex");

    if (!adminEmail) {
      throw new Error("❌ SUPER_ADMIN_EMAIL is required in .env to seed the super admin account.");
    }

    const passwordHash = await hash(adminPassword, 12);

    const superAdmin = await prisma.user.upsert({
      where:  { email: adminEmail },
      update: {},
      create: {
        email:         adminEmail,
        password:      passwordHash,
        role:          "SUPER_ADMIN",
        accountStatus: "ACTIVE",
        firstName:     "Super",
        lastName:      "Admin",
        displayName:   "Super Admin",
      },
    });

    console.log(`✅ Super admin: ${superAdmin.email}`);
    if (!process.env.SUPER_ADMIN_PASSWORD) {
      console.log(`   Generated password: ${adminPassword}`);
      console.log(`   ⚠️  Save this now — it will NOT be shown again.`);
    }
    console.log(`   👉 Log in and change BOTH the email and password immediately.`);
    console.log(`   ℹ️  Re-seeding will NOT update an existing account — use the app.`);
  } catch (error: any) {
    console.error("❌ Seed error:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
