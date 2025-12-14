import type { RequestHandler } from "express";
import type { ZodTypeAny } from "zod";

export const validate =
  (schema: ZodTypeAny): RequestHandler =>
  (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: result.error.flatten(),
      });
    }
    req.body = result.data;
    next();
  };
