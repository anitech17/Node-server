import { Router } from "express";
import { getStudentDetails } from "../controllers";

const router = Router();

router.get("/get/student/details", getStudentDetails);

export default router;

