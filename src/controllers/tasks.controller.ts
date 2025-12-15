import { Request, Response, NextFunction } from "express";
import { TasksService } from "../services/tasks.service";

const tasksService = new TasksService();

function requireString(value: unknown, name: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw Object.assign(new Error(`${name} is required`), { status: 400 });
  }
  return value.trim();
}

/**
 * Avoids TS error: "Property 'user' does not exist on type Request"
 * Works with your requireAuth if it sets req.user, and also supports x-user-id for testing.
 */
function getCurrentUserId(req: Request): string {
  const anyReq = req as any;
  const fromUser = anyReq?.user?.id;
  if (typeof fromUser === "string" && fromUser.trim()) return fromUser.trim();

  const fromHeader = req.header("x-user-id");
  if (typeof fromHeader === "string" && fromHeader.trim()) return fromHeader.trim();

  throw Object.assign(new Error("Unauthorized"), { status: 401 });
}

export async function createTask(req: Request, res: Response, next: NextFunction) {
  try {
    const currentUserId = getCurrentUserId(req);
    const created = await tasksService.createTask(req.body, currentUserId);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

export async function listTasks(req: Request, res: Response, next: NextFunction) {
  try {
    const tasks = await tasksService.listTasks();
    res.json(tasks);
  } catch (err) {
    next(err);
  }
}

export async function getTask(req: Request, res: Response, next: NextFunction) {
  try {
    const taskId = requireString(req.params.taskId, "taskId");
    const task = await tasksService.getTaskById(taskId);
    res.json(task);
  } catch (err) {
    next(err);
  }
}

export async function updateTask(req: Request, res: Response, next: NextFunction) {
  try {
    const taskId = requireString(req.params.taskId, "taskId");
    const currentUserId = getCurrentUserId(req);

    const updated = await tasksService.updateTask(taskId, req.body, currentUserId);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function assignTask(req: Request, res: Response, next: NextFunction) {
  try {
    const taskId = requireString(req.params.taskId, "taskId");
    const currentUserId = getCurrentUserId(req);

    const assignedToId = requireString(req.body?.assignedToId, "assignedToId");

    const updated = await tasksService.assignTask(taskId, assignedToId, currentUserId);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(req: Request, res: Response, next: NextFunction) {
  try {
    const taskId = requireString(req.params.taskId, "taskId");
    const out = await tasksService.deleteTask(taskId);
    res.json(out);
  } catch (err) {
    next(err);
  }
}
