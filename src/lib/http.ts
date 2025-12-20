import { Request } from "express";

export const getClientIp = (req: Request): string => {
  return (
    (req.headers["x-forwarded-for"] as string) ||
    req.socket.remoteAddress ||
    ""
  );
};
