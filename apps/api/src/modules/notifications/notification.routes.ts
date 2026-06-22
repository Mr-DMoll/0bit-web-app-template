import { Router } from "express";
import { protect } from "../../middleware/auth.middleware.js";
import {
  listNotifications, markRead, markAllRead, deleteNotification,
} from "./notification.controller.js";

const router = Router();
router.use(protect);

router.get("/",               listNotifications);
router.patch("/read-all",     markAllRead);
router.patch("/:id/read",     markRead);
router.delete("/:id",         deleteNotification);

export default router;
