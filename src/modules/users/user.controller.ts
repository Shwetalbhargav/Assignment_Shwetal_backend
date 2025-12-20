import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../common/errors/AppError";
import { ErrorCodes } from "../../common/errors/errorCodes";
import { UserService } from "./user.service";

export class UserController {
  private service = new UserService();

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) throw new AppError("Unauthorized", 401, ErrorCodes.UNAUTHORIZED);
      const user = await this.service.me(req.user.id);
      return res.status(200).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  };

  updateMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) throw new AppError("Unauthorized", 401, ErrorCodes.UNAUTHORIZED);
      const user = await this.service.updateMe(req.user.id, req.body);
      return res.status(200).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  };
}
