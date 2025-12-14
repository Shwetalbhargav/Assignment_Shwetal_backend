import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { requireAuth } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { UpdateProfileDto } from "../dtos/user.dto";

const r = Router();
const c = new UserController();

r.get("/me", requireAuth, c.me);
r.patch("/me", requireAuth, validate(UpdateProfileDto), c.updateMe);

export default r;
