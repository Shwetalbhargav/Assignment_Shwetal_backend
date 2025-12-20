import { Router } from "express";
import { requireAuth } from "../../common/middleware/auth.middleware";
import { validate } from "../../common/middleware/validate.middleware";
import { updateMeDto } from "./user.dto";
import { UserController } from "./user.controller";

const router = Router();
const controller = new UserController();

router.get("/me", requireAuth, controller.me);
router.patch("/me", requireAuth, validate({ body: updateMeDto }), controller.updateMe);

export const userRoutes = router;
