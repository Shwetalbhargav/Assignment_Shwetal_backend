import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

type Shape = Partial<{
  body: ZodSchema;
  params: ZodSchema;
  query: ZodSchema;
}>;

export const validate =
  (shape: Shape) => (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (shape.body) {
        (req as any).body = shape.body.parse(req.body);
      }

      if (shape.params) {
        // Express types req.params as ParamsDictionary, so assign via any
        (req as any).params = shape.params.parse(req.params);
      }

      if (shape.query) {
        // Express types req.query as ParsedQs, so assign via any
        (req as any).query = shape.query.parse(req.query);
      }

      next();
    } catch (err) {
      next(err);
    }
  };
