import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) throw Object.assign(new Error("Unauthorized"), { status: 401 });

    const token = auth.slice("Bearer ".length);
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as { sub: string };

    (req as any).user = { id: payload.sub };
    next();
  } catch {
    next(Object.assign(new Error("Unauthorized"), { status: 401 }));
  }
}
