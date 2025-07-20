import { Router } from "express";
import { createCourse, createUser, deleteCourse, deleteUser, editCourse, editUser, getCourses, getUsers } from "../controllers";

const router = Router();

router.get("/users", getUsers);
router.post("/user", createUser);
router.put("/user/:id", editUser);
router.delete("/user/:id", deleteUser);
router.get("/course", getCourses);
router.post("/course", createCourse);
router.put("/course/:id", editCourse);
router.delete("/course/:id", deleteCourse);

export default router;

