import { Router } from "express";

import {
  activateSemester,
  createSemester,
  getSemesters,
} from "../controllers/semester.controller.js";
import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authenticate, getSemesters);

router.post(
  "/",
  authenticate,
  authorize("admin", "registrar"),
  createSemester,
);

router.patch(
  "/:id/activate",
  authenticate,
  authorize("admin", "registrar"),
  activateSemester,
);

export default router;