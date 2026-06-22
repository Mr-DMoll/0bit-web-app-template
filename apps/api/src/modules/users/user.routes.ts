import { Router } from "express";
import { protect } from "../../middleware/auth.middleware.js";
import { getProfile, updateProfile, changePassword } from "./user.controller.js";

const router = Router();
router.use(protect);

/**
 * @openapi
 * /api/v1/users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get current user profile
 *     security:
 *       - cookieAuth: []
 */
router.get("/me", getProfile);

/**
 * @openapi
 * /api/v1/users/me:
 *   patch:
 *     tags: [Users]
 *     summary: Update current user profile
 *     security:
 *       - cookieAuth: []
 */
router.patch("/me", updateProfile);

/**
 * @openapi
 * /api/v1/users/me/password:
 *   patch:
 *     tags: [Users]
 *     summary: Change password
 *     security:
 *       - cookieAuth: []
 */
router.patch("/me/password", changePassword);

export default router;