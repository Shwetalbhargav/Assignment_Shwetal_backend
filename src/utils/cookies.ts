import type { Response } from "express";
import { COOKIE_NAMES } from "../config/constants";
import { env } from "../config/env";

const isProd = env.NODE_ENV === "production";

export const setAuthCookie = (res: Response, token: string) => {
  res.cookie(COOKIE_NAMES.ACCESS_TOKEN, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    // If you deploy FE+BE on different domains, "none" is required in prod
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const clearAuthCookie = (res: Response) => {
  res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });
};
