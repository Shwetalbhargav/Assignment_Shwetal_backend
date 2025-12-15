import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import tasksRouter from "./routes/tasks.routes";
import notificationsRouter from "./routes/notifications.routes";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(cookieParser());
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.post("/echo", (req, res) => res.json({ body: req.body }));
app.use("/api/tasks", tasksRouter);
app.use("/api/notifications", notificationsRouter);

export default app;
