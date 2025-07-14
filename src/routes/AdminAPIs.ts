import { Router } from "express";
import { createUser, deleteUser, editUser, getUsers } from "../controllers";

const router = Router();

router.get("/users", getUsers);
router.post("/user", createUser);
router.put("/user/:id", editUser);
router.delete("/user/:id", deleteUser);

export default router;

