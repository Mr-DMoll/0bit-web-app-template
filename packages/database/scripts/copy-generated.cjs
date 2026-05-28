// Cross-platform alternative to `cp -r generated dist/`
// Works on Windows, macOS and Linux — no extra dependencies needed.
const { cpSync, existsSync, mkdirSync } = require("fs");
const { join } = require("path");

const src  = join(__dirname, "..", "generated");
const dest = join(__dirname, "..", "dist", "generated");

if (!existsSync(src)) {
  console.error("❌ [copy-generated] 'generated' folder not found — run prisma generate first");
  process.exit(1);
}

mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });
console.log("✅ [copy-generated] copied generated → dist/generated");
