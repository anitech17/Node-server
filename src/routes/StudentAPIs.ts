import { Router } from "express";
import { getCourseSyllabus, getStudent, getStudentClasses } from "../controllers";

const router = Router();

router.get("/user/:student_id", getStudent);
router.get("/classes/:student_id", getStudentClasses);
router.get("/course/syllabus/:courseid", getCourseSyllabus);


export default router;

