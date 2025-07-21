import { Router } from "express";
import { getEducator, getEducatorClasses, getStudents, scheduleClass } from "../controllers";

const router = Router();

router.get("/user/:id", getEducator);
router.get("/students/:educator_id", getStudents);
router.get("/classes/:educator_id", getEducatorClasses);
router.post("/schedule/class", scheduleClass);

export default router;

