import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validate } from "../../common/middleware/validate.middleware";
import { registerDto, loginDto } from "./auth.dto";
import { requireAuth } from "../../common/middleware/auth.middleware";
import { authRateLimit } from "../../common/middleware/rateLimit.middleware";

const router = Router();
const controller = new AuthController();

router.post("/register", authRateLimit, validate({ body: registerDto }), controller.register);
router.post("/login", authRateLimit, validate({ body: loginDto }), controller.login);
router.post("/logout", controller.logout);

router.get("/me", requireAuth, controller.me);

export const authRoutes = router;
