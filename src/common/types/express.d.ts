import type { JwtPayloadUser } from "@/common/utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayloadUser;
    }
  }
}

export {};
