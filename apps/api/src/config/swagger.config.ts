import { Options } from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "url";

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🚀 SOP: Always pull production URL from Env to keep the file generic
const liveUrl = process.env.LIVE_URL || "https://rfpxfgdpbq.us-east-1.awsapprunner.com";
//we have added this
export const swaggerConfig: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "O-Bit Agency API",
      version: "1.0.0",
      description: "Community Transformation Platform Core API",
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Development (Local)",
      },
      {
        url: liveUrl,
        description: "Production (AWS App Runner)",
      },
    ],
  },
  // 🚀 AUTOMATION: Scans both TS (local) and JS (production) across all modules
  apis: [
    path.resolve(__dirname, "../modules/**/*.routes.{ts,js}"),
    path.resolve(__dirname, "../modules/**/*.controller.{ts,js}"),
    path.resolve(__dirname, "../modules/**/*.schema.{ts,js}"),
  ],
};