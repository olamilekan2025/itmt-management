import { Router } from "express";

import {
  registerCourses,
  getMyRegistrations,
  getRegistrations,
  dropRegistration,
  getCourseRoster,
} from "../controllers/registration.controller.js";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

// =========================================================
// STUDENT
// Register courses
// =========================================================
router.post(
  "/",
  authenticate,
  authorize("student"),
  registerCourses,
);

// =========================================================
// STUDENT
// View own registrations
// =========================================================
router.get(
  "/me",
  authenticate,
  authorize("student"),
  getMyRegistrations,
);

// =========================================================
// ADMIN / REGISTRAR
// View all registrations
// =========================================================
router.get(
  "/",
  authenticate,
  authorize("admin", "registrar"),
  getRegistrations,
);

// =========================================================
// LECTURER
// View students registered for an assigned course
// =========================================================
router.get(
  "/roster",
  authenticate,
  authorize("lecturer"),
  getCourseRoster,
);

// =========================================================
// STUDENT
// Drop registration
// =========================================================
router.patch(
  "/:id/drop",
  authenticate,
  authorize("student"),
  dropRegistration,
);

export default router;