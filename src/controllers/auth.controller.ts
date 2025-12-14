import type { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { clearAuthCookies, setAuthCookies } from "../utils/cookies";

export class AuthController {
  constructor(private auth = new AuthService()) {}

  register = async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } = await this.auth.register(req.body);
    setAuthCookies(res, accessToken, refreshToken);
    res.status(201).json({ user });
  };

  login = async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } = await this.auth.login(req.body);
    setAuthCookies(res, accessToken, refreshToken);
    res.status(200).json({ user });
  };

  logout = async (_req: Request, res: Response) => {
    clearAuthCookies(res);
    res.status(204).send();
  };
}
