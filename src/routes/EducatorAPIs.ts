import { Router } from "express";
import { getEducator, scheduleClass } from "../controllers";

const router = Router();

router.get("/user/:id", getEducator);
router.post("/schedule/class", scheduleClass);

export default router;

