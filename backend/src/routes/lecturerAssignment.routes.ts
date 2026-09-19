import { Router } from "express";

import {
  assignLecturer,
  getAssignments,
  getMyAssignments,
  removeAssignment,
} from "../controllers/lecturerAssignment.controller.js";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

// =========================================================
// ADMIN / REGISTRAR
// Assign lecturer
// =========================================================
router.post(
  "/",
  authenticate,
  authorize("admin", "registrar"),
  assignLecturer,
);

// =========================================================
// ADMIN / REGISTRAR
// View all assignments
// =========================================================
router.get(
  "/",
  authenticate,
  authorize("admin", "registrar"),
  getAssignments,
);

// =========================================================
// LECTURER
// View own assignments
// =========================================================
router.get(
  "/me",
  authenticate,
  authorize("lecturer"),
  getMyAssignments,
);

// =========================================================
// ADMIN / REGISTRAR
// Remove assignment
// =========================================================
router.patch(
  "/:id/remove",
  authenticate,
  authorize("admin", "registrar"),
  removeAssignment,
);

export default router;