import { Router } from "express";
import { getUsers } from "../controllers";

const router = Router();

router.get("/get/admin/users", getUsers);

export default router;

