import { Router } from "express";
import { getStudent } from "../controllers";

const router = Router();

router.get("/user/:id", getStudent);

export default router;

