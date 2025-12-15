import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import * as Tasks from "../controllers/tasks.controller";

const router = Router();

// 🔐 Protect all task routes
router.use(requireAuth);

// CRUD
router.post("/", Tasks.createTask);
router.get("/", Tasks.listTasks);
router.get("/:id", Tasks.getTask);
router.patch("/:id", Tasks.updateTask);
router.delete("/:id", Tasks.deleteTask);

// Assign / Unassign
router.patch("/:id/assign", Tasks.assignTask);

export default router;
