import rateLimit from "express-rate-limit";
import { HttpStatus } from "@repo/types";

/**
 * Auth Rate Limiter:
 * Specifically for /login and /register to prevent brute-force attacks.
 * Limits each IP to 10 attempts per 15-minute window.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: {
    message: "Too many login attempts, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Global Rate Limiter:
 * Protects the entire API from general abuse.
 */
export const globalRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000,
  message: {
    message: "Too many requests from this IP, please try again in an hour.",
  },
});
