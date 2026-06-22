import rateLimit from "express-rate-limit";
import { HttpStatus } from "@repo/types";

// Brute-force protection for /login and /register — 20 attempts per 15 minutes per IP
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { status: "fail", message: "Too many attempts from this IP, please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Global API protection — 1000 requests per hour per IP
export const globalRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "fail", message: "Too many requests from this IP, please try again in an hour." },
});
