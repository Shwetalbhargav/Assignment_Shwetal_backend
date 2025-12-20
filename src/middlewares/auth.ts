import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { AppError } from "../common/errors/AppError";
import { ErrorCodes } from "../common/errors/errorCodes";

export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Unauthorized", 401, ErrorCodes.UNAUTHORIZED);
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw new AppError("Unauthorized", 401, ErrorCodes.UNAUTHORIZED);
  }

  try {
    const payload = verifyAccessToken(token);

    // attach user to request
    req.user = {
      id: payload.id,
      email: payload.email,
      name: payload.name,
    };

    next();
  } catch {
    throw new AppError("Invalid or expired token", 401, ErrorCodes.UNAUTHORIZED);
  }
};
