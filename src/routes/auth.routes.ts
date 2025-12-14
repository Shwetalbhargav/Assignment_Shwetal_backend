import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate";
import { LoginDto, RegisterDto } from "../dtos/auth.dto";

const r = Router();
const c = new AuthController();

r.post("/register", validate(RegisterDto), c.register);
r.post("/login", validate(LoginDto), c.login);
r.post("/logout", c.logout);

export default r;
