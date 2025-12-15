import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import {
  register,
  login,
  refresh,
  logout,
  listSessions,
  revokeSession,
} from "../controllers/auth.controller"; // adjust path

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

router.get("/sessions", requireAuth, listSessions);
router.post("/sessions/:id/revoke", requireAuth, revokeSession);

export default router;
