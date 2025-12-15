import { Request, Response, NextFunction } from "express";
import { TasksService } from "../services/tasks.service";
import {
  createTaskSchema,
  updateTaskSchema,
  assignTaskSchema,
  objectId,
  TaskStatusSchema,
  TaskPrioritySchema,
} from "../middlewares/tasks.validators";

const service = new TasksService();

function getUserId(req: Request) {
  const id = (req as any).user?.id as string | undefined;
  if (!id) throw Object.assign(new Error("Unauthorized"), { status: 401 });
  return id;
}

export async function createTask(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const body = createTaskSchema.parse(req.body);

    // ✅ Normalize: never pass undefined explicitly for optional props
    const input = {
      title: body.title,
      dueDate: body.dueDate,
      description: body.description ?? null,         // undefined -> null
      assignedToId: body.assignedToId ?? null,       // undefined -> null
      ...(body.priority !== undefined ? { priority: body.priority } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
    };

    const task = await service.createTask(userId, input);

    req.app.get("io")?.emit("task:created", task);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

export async function listTasks(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);

    const status =
      typeof req.query.status === "string" ? TaskStatusSchema.parse(req.query.status) : undefined;

    const priority =
      typeof req.query.priority === "string" ? TaskPrioritySchema.parse(req.query.priority) : undefined;

    const assignedToId =
      typeof req.query.assignedToId === "string" ? objectId.parse(req.query.assignedToId) : undefined;

    const creatorId =
      typeof req.query.creatorId === "string" ? objectId.parse(req.query.creatorId) : undefined;

    const q = typeof req.query.q === "string" ? req.query.q : undefined;

    const page =
      typeof req.query.page === "string" && req.query.page.trim() !== ""
        ? Number(req.query.page)
        : undefined;

    const limit =
      typeof req.query.limit === "string" && req.query.limit.trim() !== ""
        ? Number(req.query.limit)
        : undefined;

    // ✅ Only include keys when they exist (prevents passing undefined explicitly)
    const result = await service.listTasks(userId, {
      ...(status !== undefined ? { status } : {}),
      ...(priority !== undefined ? { priority } : {}),
      ...(assignedToId !== undefined ? { assignedToId } : {}),
      ...(creatorId !== undefined ? { creatorId } : {}),
      ...(q !== undefined ? { q } : {}),
      ...(page !== undefined ? { page } : {}),
      ...(limit !== undefined ? { limit } : {}),
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getTaskById(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const id = objectId.parse(req.params.id);
    const task = await service.getById(userId, id);
    res.json(task);
  } catch (err) {
    next(err);
  }
}

export async function updateTask(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const id = objectId.parse(req.params.id);
    const body = updateTaskSchema.parse(req.body);

    // ✅ Build patch without passing undefined values
    const patch = {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.dueDate !== undefined ? { dueDate: body.dueDate } : {}),
      ...(body.priority !== undefined ? { priority: body.priority } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.assignedToId !== undefined ? { assignedToId: body.assignedToId } : {}),
    };

    const task = await service.updateTask(userId, id, patch);

    req.app.get("io")?.emit("task:updated", task);
    res.json(task);
  } catch (err) {
    next(err);
  }
}

export async function assignTask(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const id = objectId.parse(req.params.id);
    const { assignedToId } = assignTaskSchema.parse(req.body);

    // assignedToId is string | null (never undefined)
    const task = await service.assignTask(userId, id, assignedToId);

    req.app.get("io")?.emit("task:assigned", task);
    res.json(task);
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const id = objectId.parse(req.params.id);

    const result = await service.deleteTask(userId, id);

    req.app.get("io")?.emit("task:deleted", { id });
    res.json(result);
  } catch (err) {
    next(err);
  }
}
