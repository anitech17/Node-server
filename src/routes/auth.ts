import { Router } from "express";
import { user, login, logout } from "../controllers";
import { verifyToken } from "../middleware/verifyToken";

const router = Router();

router.post("/login", login);
router.post("/logout", logout);
router.get("/user", verifyToken, user);

export default router;

