import { Router } from "express";
import { getCourseSyllabus, getStudent } from "../controllers";

const router = Router();

router.get("/user/:id", getStudent);
router.get("/course/syllabus/:courseid", getCourseSyllabus);


export default router;

