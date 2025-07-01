import { Router } from "express";
import { getDetails } from "../controllers";

const router = Router();

router.get("/get/educator/details", getDetails);

export default router;

