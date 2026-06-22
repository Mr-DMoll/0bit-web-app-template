import { Router } from "express";
import { protect } from "../../middleware/auth.middleware.js";
import {
  login, logout, getMe,
  setPassword, forgotPassword, resetPassword, register,
} from "./auth.controller.js";
import { googleRedirect, googleCallback } from "./google-oauth.controller.js";

const router = Router();

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 */
router.post("/login", login);

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Self-register (only if enabled by admin)
 */
router.post("/register", register);

/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout
 *     security:
 *       - cookieAuth: []
 */
router.post("/logout", protect, logout);

/**
 * @openapi
 * /api/v1/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user
 *     security:
 *       - cookieAuth: []
 */
router.get("/me", protect, getMe);

/**
 * @openapi
 * /api/v1/auth/set-password:
 *   post:
 *     tags: [Auth]
 *     summary: Set password from invitation link
 */
router.post("/set-password", setPassword);

/**
 * @openapi
 * /api/v1/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request password reset email
 */
router.post("/forgot-password", forgotPassword);

/**
 * @openapi
 * /api/v1/auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password with token
 */
router.post("/reset-password", resetPassword);

// ── Google OAuth ──────────────────────────────────────────────────────────────
router.get("/google",          googleRedirect);
router.get("/google/callback", googleCallback);

export default router;