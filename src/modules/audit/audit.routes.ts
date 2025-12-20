import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware";
import { getTaskAudit } from "./audit.controller";

const router = Router();
router.use(requireAuth);

router.get("/tasks/:taskId/audit", getTaskAudit);

export default router;
