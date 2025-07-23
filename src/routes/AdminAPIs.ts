import { Router } from "express";
import { createCourse, createUser, deleteCourse, deleteUser, editCourse, editUser, getCourses, getCourseSyllabu, getUsers } from "../controllers";

const router = Router();

router.get("/users", getUsers);
router.post("/user", createUser);
router.put("/user/:id", editUser);
router.delete("/user/:id", deleteUser);
router.get("/course", getCourses);
router.post("/course", createCourse);
router.put("/course/:courseId", editCourse);
router.delete("/course/:courseId", deleteCourse);
router.get("/course/syllabus/:courseid", getCourseSyllabu);

export default router;

