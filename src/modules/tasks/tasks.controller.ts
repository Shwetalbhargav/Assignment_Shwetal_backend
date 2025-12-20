import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../common/errors/AppError";
import { ErrorCodes } from "../../common/errors/errorCodes";
import { TasksService } from "./tasks.service";
import type { TaskPriority, TaskStatus } from "@prisma/client";

export class TasksController {
  private service = new TasksService();

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = req.query.status as TaskStatus | undefined;
      const priority = req.query.priority as TaskPriority | undefined;
      const sort = req.query.sort as "dueDateAsc" | "dueDateDesc" | undefined;

      const tasks = await this.service.list({ status, priority, sort });
      return res.status(200).json({ success: true, data: tasks });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params?.id;
    if (!id) throw new AppError("Task id is required", 400, ErrorCodes.VALIDATION_ERROR);

    const task = await this.service.getById(id);
    return res.status(200).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) throw new AppError("Unauthorized", 401, ErrorCodes.UNAUTHORIZED);

    const id = req.params?.id;
    if (!id) throw new AppError("Task id is required", 400, ErrorCodes.VALIDATION_ERROR);

    const task = await this.service.update(id, req.user.id, req.body);
    return res.status(200).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params?.id;
    if (!id) throw new AppError("Task id is required", 400, ErrorCodes.VALIDATION_ERROR);

    const result = await this.service.remove(id);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};


  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) throw new AppError("Unauthorized", 401, ErrorCodes.UNAUTHORIZED);
      const task = await this.service.create(req.user.id, req.body);
      return res.status(201).json({ success: true, data: task });
    } catch (err) {
      next(err);
    }
  };

}