import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError";
import { ErrorCodes } from "../errors/errorCodes";

type ErrorResponse = {
  success: false;
  message: string;
  code: string;
  details?: unknown;
  stack?: string;
};

export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Zod validation errors
  if (err instanceof ZodError) {
    const payload: ErrorResponse = {
      success: false,
      message: "Validation failed",
      code: ErrorCodes.VALIDATION_ERROR,
      details: err.flatten(),
    };
    return res.status(400).json(payload);
  }

  // AppError (our own)
  if (err instanceof AppError) {
    const payload: ErrorResponse = {
      success: false,
      message: err.message,
      code: err.code,
      ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {}),
    };
    return res.status(err.statusCode).json(payload);
  }

  // Prisma-ish errors (keep it lightweight without hard dependency)
  // If you want, we can upgrade this later to Prisma.PrismaClientKnownRequestError.
  const maybeAny = err as any;
  if (maybeAny?.code && typeof maybeAny.code === "string") {
    // e.g. "P2002" unique constraint violation
    if (maybeAny.code === "P2002") {
      const payload: ErrorResponse = {
        success: false,
        message: "Duplicate value. Resource already exists.",
        code: ErrorCodes.CONFLICT,
        ...(process.env.NODE_ENV !== "production"
          ? { details: maybeAny.meta, stack: maybeAny.stack }
          : {}),
      };
      return res.status(409).json(payload);
    }
  }

  // Unknown error
  const payload: ErrorResponse = {
    success: false,
    message: "Something went wrong",
    code: ErrorCodes.INTERNAL_ERROR,
    ...(process.env.NODE_ENV !== "production"
      ? { details: err, stack: (err as any)?.stack }
      : {}),
  };

  return res.status(500).json(payload);
};
