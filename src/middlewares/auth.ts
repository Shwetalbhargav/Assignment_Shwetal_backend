import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/jwt";

export type AuthUser = { userId: string };

declare global {
  namespace Express {
    interface Request {
      auth?: AuthUser;
    }
  }
}

export const requireAuth: RequestHandler = (req, res, next) => {
  const token = req.cookies?.accessToken;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const payload = jwt.verify(token, jwtConfig.accessSecret) as { sub: string };
    req.auth = { userId: payload.sub };
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
