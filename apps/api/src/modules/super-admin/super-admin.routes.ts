import { Router } from "express";
import { protect }   from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/role.middleware.js";
import { Role }      from "@repo/types";
import {
  platformStats, listAdmins, inviteAdmin,
  removeAdmin, getSettings, updateSetting, auditLog,
} from "./super-admin.controller.js";

const router = Router();
router.use(protect);
router.use(authorize([Role.SUPER_ADMIN]));

/**
 * @openapi
 * /api/v1/super-admin/stats:
 *   get:
 *     tags: [SuperAdmin]
 *     summary: Platform-wide stats
 *     security:
 *       - cookieAuth: []
 */
router.get("/stats", platformStats);

/**
 * @openapi
 * /api/v1/super-admin/admins:
 *   get:
 *     tags: [SuperAdmin]
 *     summary: List all admins
 *     security:
 *       - cookieAuth: []
 */
router.get("/admins", listAdmins);

/**
 * @openapi
 * /api/v1/super-admin/admins/invite:
 *   post:
 *     tags: [SuperAdmin]
 *     summary: Invite a new admin (sends email with set-password link)
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 */
router.post("/admins/invite", inviteAdmin);

/**
 * @openapi
 * /api/v1/super-admin/admins/{id}:
 *   delete:
 *     tags: [SuperAdmin]
 *     summary: Remove an admin
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 */
router.delete("/admins/:id", removeAdmin);

/**
 * @openapi
 * /api/v1/super-admin/settings:
 *   get:
 *     tags: [SuperAdmin]
 *     summary: Get all system settings
 *     security:
 *       - cookieAuth: []
 */
router.get("/audit",    auditLog);
router.get("/settings", getSettings);

/**
 * @openapi
 * /api/v1/super-admin/settings:
 *   put:
 *     tags: [SuperAdmin]
 *     summary: Update a system setting
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - value
 *             properties:
 *               key:
 *                 type: string
 *               value:
 *                 type: string
 */
router.put("/settings", updateSetting);

export default router;