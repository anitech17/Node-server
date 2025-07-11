import { Router } from "express";
import auth from "./auth";
import StudentAPIs from "./StudentAPIs";
import EducatorAPIs from "./EducatorAPIs";
import AdminAPIs from "./AdminAPIs";
import { authorizeRoles } from "../middleware/authorizeRoles";
import { verifyToken } from "../middleware/verifyToken";

const router = Router();

router.use("/auth", auth);
router.use("/student", verifyToken, authorizeRoles('student'), StudentAPIs);
router.use("/educator", verifyToken, authorizeRoles('educator'), EducatorAPIs);
router.use("/admin", verifyToken, authorizeRoles('admin'), AdminAPIs);

export default router;