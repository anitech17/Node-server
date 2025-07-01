import { Router } from "express";
import { user, login, logout } from "../controllers";

const router = Router();

router.post("/login", login);
router.post("/logout", logout);
router.get("/user", user);

export default router;

