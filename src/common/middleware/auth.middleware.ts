import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { AppError } from "../errors/AppError";
import { ErrorCodes } from "../errors/errorCodes";
import { COOKIE_NAMES } from "../../config/constants";

export type JwtUserPayload = {
  id: string;
  email: string;
  name?: string | null;
};

const getTokenFromReq = (req: Request): string | null => {
  // 1) HttpOnly cookie
  const cookieToken = (req as any).cookies?.[COOKIE_NAMES.ACCESS_TOKEN];
  if (cookieToken) return cookieToken;

  // 2) Authorization header
  const auth = req.headers.authorization;
  if (!auth) return null;

  const [type, token] = auth.split(" ");
  if (type !== "Bearer" || !token) return null;

  return token;
};

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const token = getTokenFromReq(req);

  if (!token) {
    return next(
      new AppError("Unauthorized", 401, ErrorCodes.UNAUTHORIZED)
    );
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtUserPayload;

    // attach to request (works even without TS declaration)
    (req as any).user = payload;

    return next();
  } catch {
    return next(new AppError("Invalid or expired token", 401, ErrorCodes.UNAUTHORIZED));
  }
};

/**
 * Optional auth:
 * - If token exists: attaches req.user
 * - If no token: continue without error
 */
export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  const token = getTokenFromReq(req);
  if (!token) return next();

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtUserPayload;
    (req as any).user = payload;
  } catch {
    // ignore invalid token for optional auth
  }
  next();
};
