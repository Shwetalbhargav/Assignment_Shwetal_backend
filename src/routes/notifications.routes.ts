import { Router } from "express";
import {
  listNotifications,
  unreadCount,
  markNotificationRead,
  markAllRead,
} from "../controllers/notifications.controller";

// import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

// router.use(requireAuth);

router.get("/", listNotifications);
router.get("/unread-count", unreadCount);
router.patch("/:notificationId/read", markNotificationRead);
router.patch("/read-all", markAllRead);

export default router;
