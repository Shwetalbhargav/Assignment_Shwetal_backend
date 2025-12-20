import type { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { setAuthCookie, clearAuthCookie } from "../../utils/cookies";
import { AppError } from "../../common/errors/AppError";
import { ErrorCodes } from "../../common/errors/errorCodes";

export class AuthController {
  private service = new AuthService();

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user, token } = await this.service.register(req.body);
      setAuthCookie(res, token);
      return res.status(201).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user, token } = await this.service.login(req.body);
      setAuthCookie(res, token);
      return res.status(200).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  };

  logout = async (_req: Request, res: Response) => {
    clearAuthCookie(res);
    return res.status(200).json({ success: true, data: { message: "Logged out" } });
  };

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        throw new AppError("Unauthorized", 401, ErrorCodes.UNAUTHORIZED);
      }
      const user = await this.service.me(req.user.id);
      return res.status(200).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  };

  
}
