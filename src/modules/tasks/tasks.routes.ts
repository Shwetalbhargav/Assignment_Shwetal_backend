import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware";
import { validate } from "../../common/middleware/validate.middleware";
import { TasksController } from "./tasks.controller";
import {
  createTaskDto,
  updateTaskDto,
  listTasksQueryDto,
  taskIdParamsDto,
} from "./task.dto";

const router = Router();
const controller = new TasksController();

router.get("/", requireAuth, validate({ query: listTasksQueryDto }), controller.list);
router.get("/:id", requireAuth, validate({ params: taskIdParamsDto }), controller.getById);

router.post("/", requireAuth, validate({ body: createTaskDto }), controller.create);
router.patch(
  "/:id",
  requireAuth,
  validate({ params: taskIdParamsDto, body: updateTaskDto }),
  controller.update
);
router.delete("/:id", requireAuth, validate({ params: taskIdParamsDto }), controller.remove);

export const tasksRoutes = router;
