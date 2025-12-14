import type { Request, Response } from "express";
import { UserService } from "../services/user.service";

export class UserController {
  constructor(private users = new UserService()) {}

  me = async (req: Request, res: Response) => {
    const userId = req.auth!.userId;
    const user = await this.users.getMe(userId);
    res.json({ user });
  };

  updateMe = async (req: Request, res: Response) => {
    const userId = req.auth!.userId;
    const user = await this.users.updateMe(userId, req.body);
    res.json({ user });
  };
}
