import { Router } from "express";

import { submitContactMessage, listContactMessages } from "../controllers/contact.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", submitContactMessage);
router.get("/", authenticate, authorize("admin", "registrar"), listContactMessages);

export default router;