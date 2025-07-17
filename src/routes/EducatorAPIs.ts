import { Router } from "express";
import { getEducator } from "../controllers";

const router = Router();

router.get("/user/:id", getEducator);

export default router;

