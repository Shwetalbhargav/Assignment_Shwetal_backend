import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware";
import { validate } from "../../common/middleware/validate.middleware";
import { NotificationsController } from "./notifications.controller";
import {
  createNotificationDto,
  listNotificationsQueryDto,
  markReadBodyDto,
  markReadParamsDto,
} from "./notification.dto";

const router = Router();
const controller = new NotificationsController();

router.get(
  "/me",
  requireAuth,
  validate({ query: listNotificationsQueryDto }),
  controller.listMy
);

router.patch(
  "/:id/read",
  requireAuth,
  validate({ params: markReadParamsDto, body: markReadBodyDto }),
  controller.markRead
);

router.delete(
  "/:id",
  requireAuth,
  validate({ params: markReadParamsDto }),
  controller.remove
);

// Optional: create manually (admin/dev)
router.post("/", requireAuth, validate({ body: createNotificationDto }), controller.create);

export const notificationsRoutes = router;
