import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import {
  getMyNotifications,
  markAsRead,
} from "./notifications.controller";

const router = Router();

router.use(requireAuth); 

router.get("/", getMyNotifications);
router.patch("/:id/read", markAsRead);

export default router;
