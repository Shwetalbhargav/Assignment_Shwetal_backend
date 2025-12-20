import type { NextFunction, Request, Response } from "express";
import { NotificationsService } from "./notifications.service";
import { AppError } from "../../common/errors/AppError";
import { ErrorCodes } from "../../common/errors/errorCodes";
import type { ListNotificationsQuery } from "./notification.types";

export class NotificationsController {
  private service = new NotificationsService();

  listMy = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError("Unauthorized", 401, ErrorCodes.UNAUTHORIZED);

      const query: ListNotificationsQuery = {};

      if (typeof req.query.page === "string") query.page = Number(req.query.page);
      if (typeof req.query.limit === "string") query.limit = Number(req.query.limit);

      if (typeof req.query.isRead === "string") {
        query.isRead = req.query.isRead === "true";
      }

      const result = await this.service.listMy(userId, query);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  markRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError("Unauthorized", 401, ErrorCodes.UNAUTHORIZED);

      const id = req.params?.id;
      if (!id) throw new AppError("Notification id is required", 400, ErrorCodes.VALIDATION_ERROR);

      const updated = await this.service.markMyRead(userId, id, req.body.isRead);
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const created = await this.service.create(req.body);
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError("Unauthorized", 401, ErrorCodes.UNAUTHORIZED);

      const id = req.params?.id;
      if (!id) throw new AppError("Notification id is required", 400, ErrorCodes.VALIDATION_ERROR);

      const result = await this.service.deleteMy(userId, id);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };
}
