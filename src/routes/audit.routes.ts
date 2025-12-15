import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { getTaskAudit } from "./audit.controller";

const router = Router();
router.use(requireAuth);

router.get("/tasks/:taskId/audit", getTaskAudit);

export default router;
