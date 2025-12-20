import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import routes from "./routes";
import { errorMiddleware } from "./common/middleware/error.middleware";

export const createApp = () => {
  const app = express();

  // ---------- Core middleware ----------
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
  }

  // ---------- Health check ----------
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  // ---------- API ----------
  app.use("/api/v1", routes);

  // ---------- Errors ----------
  app.use(errorMiddleware);

  return app;
};
