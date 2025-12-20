import rateLimit from "express-rate-limit";

export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 300, // per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: "RATE_LIMITED",
    message: "Too many requests. Please try again later.",
  },
});

export const authRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 min
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: "RATE_LIMITED",
    message: "Too many auth attempts. Please try again later.",
  },
});
