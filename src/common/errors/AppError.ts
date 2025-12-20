import { ErrorCode } from "./errorCodes";

export class AppError extends Error {
  public statusCode: number;
  public code: ErrorCode;
  public isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    code: ErrorCode,
    isOperational = true
  ) {
    super(message);

    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}
