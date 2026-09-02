import { Router } from "express";

import {
  activateAcademicSession,
  createAcademicSession,
  getAcademicSessions,
} from "../controllers/academic-session.controller.js";
import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authenticate, getAcademicSessions);

router.post(
  "/",
  authenticate,
  authorize("admin", "registrar"),
  createAcademicSession,
);

router.patch(
  "/:id/activate",
  authenticate,
  authorize("admin", "registrar"),
  activateAcademicSession,
);

export default router;