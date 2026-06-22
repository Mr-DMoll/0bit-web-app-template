import { Router } from "express";
import { protect }   from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/role.middleware.js";
import { Role }      from "@repo/types";
import {
  platformStats, listAdmins, inviteAdmin, removeAdmin,
  suspendAdmin, activateAdmin, resendAdminInvite,
  getSettings, updateSetting, auditLog,
} from "./super-admin.controller.js";

const router = Router();
router.use(protect);
router.use(authorize([Role.SUPER_ADMIN]));

router.get("/stats",                     platformStats);
router.get("/admins",                    listAdmins);
router.post("/admins/invite",            inviteAdmin);
router.patch("/admins/:id/suspend",      suspendAdmin);
router.patch("/admins/:id/activate",     activateAdmin);
router.post("/admins/:id/resend-invite", resendAdminInvite);
router.delete("/admins/:id",             removeAdmin);
router.get("/audit",                     auditLog);
router.get("/settings",                  getSettings);
router.put("/settings",                  updateSetting);

export default router;
