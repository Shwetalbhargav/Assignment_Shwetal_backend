import { Router } from "express";

import { authRoutes } from "../modules/auth/auth.routes";
import { userRoutes } from "../modules/users/user.routes";
import { tasksRoutes } from "../modules/tasks/tasks.routes";
import { notificationsRoutes } from "../modules/notifications/notifications.routes";
import  auditRoutes  from "../modules/audit/audit.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/tasks", tasksRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/audit", auditRoutes);


export default router;
