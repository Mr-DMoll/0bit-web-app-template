import { Router } from "express";
import {
  adminDashboard, listUsers, inviteUser, updateUserStatus, updateUserRole,
  inviteManager, listManagers, adminActivity,
} from "./admin.controller.js";
import { protect }   from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/role.middleware.js";
import { Role }      from "@repo/types";

const router = Router();
router.use(protect);
router.use(authorize([Role.ADMIN, Role.SUPER_ADMIN]));

router.get("/dashboard",          adminDashboard);
router.get("/activity",           adminActivity);

// Users
router.get("/users",              listUsers);
router.post("/users/invite",      inviteUser);
router.patch("/users/:id/status", updateUserStatus);
router.patch("/users/:id/role",   updateUserRole);

// Managers
router.get("/managers",           listManagers);
router.post("/managers/invite",   inviteManager);

export default router;
