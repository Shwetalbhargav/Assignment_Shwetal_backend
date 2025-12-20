import dotenv from "dotenv";

dotenv.config();

const getEnv = (key: string, required = true): string => {
  const value = process.env[key];
  if (!value && required) {
    throw new Error(`❌ Missing environment variable: ${key}`);
  }
  return value as string;
};

export const env = {
  NODE_ENV: getEnv("NODE_ENV", false) || "development",
  PORT: Number(getEnv("PORT", false)) || 4000,

  DATABASE_URL: getEnv("DATABASE_URL"),

  // ✅ match your .env keys
  JWT_ACCESS_SECRET: getEnv("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),

  // optional, add if you use them
  JWT_ACCESS_EXPIRES_IN: getEnv("JWT_ACCESS_EXPIRES_IN", false) || "15m",
  JWT_REFRESH_EXPIRES_IN: getEnv("JWT_REFRESH_EXPIRES_IN", false) || "7d",

  COOKIE_SECURE: getEnv("COOKIE_SECURE", false) === "true",
  CLIENT_URL: getEnv("CLIENT_URL", false) || "http://localhost:5173",

  // optional, only if you actually use it anywhere
  PRISMA_CLIENT_ENGINE_TYPE: getEnv("PRISMA_CLIENT_ENGINE_TYPE", false) || "binary",
};
