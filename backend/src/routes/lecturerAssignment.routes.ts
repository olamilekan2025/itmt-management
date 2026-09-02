import { Router } from "express";

import {
  assignLecturer,
  getAssignments,
  getMyAssignments,
  removeAssignment,
} from "../controllers/lecturerAssignment.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("admin", "registrar"),
  assignLecturer,
);

router.get(
  "/",
  authenticate,
  authorize("admin", "registrar"),
  getAssignments,
);

router.get(
  "/me",
  authenticate,
  authorize("lecturer"),
  getMyAssignments,
);

router.patch(
  "/:id/remove",
  authenticate,
  authorize("admin", "registrar"),
  removeAssignment,
);

export default router;