import { Router } from "express";
import { adminDashboard, listUsers, inviteUser, updateUserStatus } from "./admin.controller.js";
import { protect }   from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/role.middleware.js";
import { Role }      from "@repo/types";

const router = Router();
router.use(protect);
router.use(authorize([Role.ADMIN, Role.SUPER_ADMIN]));

/**
 * @openapi
 * /api/v1/admin/dashboard:
 *   get:
 *     tags: [Admin]
 *     summary: Admin dashboard stats
 *     security:
 *       - cookieAuth: []
 */
router.get("/dashboard", adminDashboard);

/**
 * @openapi
 * /api/v1/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: List all users
 *     security:
 *       - cookieAuth: []
 */
router.get("/users", listUsers);

/**
 * @openapi
 * /api/v1/admin/users/invite:
 *   post:
 *     tags: [Admin]
 *     summary: Invite a new user
 *     security:
 *       - cookieAuth: []
 */
router.post("/users/invite", inviteUser);

/**
 * @openapi
 * /api/v1/admin/users/{id}/status:
 *   patch:
 *     tags: [Admin]
 *     summary: Update user account status
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 */
router.patch("/users/:id/status", updateUserStatus);

export default router;
