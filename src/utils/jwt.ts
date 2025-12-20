import * as jwt from "jsonwebtoken";
import { env } from "../config/env";

export type JwtPayloadUser = {
  id: string;
  email: string;
  name?: string | null;
};

export type JwtPayload = JwtPayloadUser & {
  iat?: number;
  exp?: number;
};

type ExpiresIn = Exclude<jwt.SignOptions["expiresIn"], undefined>;

export const signAccessToken = (payload: JwtPayloadUser): string => {
  const secret: jwt.Secret = env.JWT_SECRET;

  const raw = env.JWT_EXPIRES_IN;

  // Only pass expiresIn when it's a real value (never undefined)
  if (typeof raw === "string" && raw.trim().length > 0) {
    const options: jwt.SignOptions = {
      expiresIn: raw as ExpiresIn,
    };
    return jwt.sign(payload, secret, options);
  }

  return jwt.sign(payload, secret);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  const secret: jwt.Secret = env.JWT_SECRET;
  return jwt.verify(token, secret) as JwtPayload;
};
