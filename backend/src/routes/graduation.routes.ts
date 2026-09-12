import { Router } from "express";

import {
  getGraduations,
  getGraduationById,
  evaluateGraduation,
  approveGraduation,
  graduateStudent,
  rejectGraduation,
} from "../controllers/graduation.controller.js";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

/* =========================================================
   GRADUATION
========================================================= */

/*
 * Get graduation candidates.
 *
 * Optional query parameters:
 * ?session=SESSION_ID
 * ?programme=PROGRAMME_ID
 * ?status=eligible
 * ?search=john
 */
router.get(
  "/",
  authenticate,
  authorize("admin", "registrar"),
  getGraduations,
);

/*
 * Get one graduation record.
 */
router.get(
  "/:id",
  authenticate,
  authorize("admin", "registrar"),
  getGraduationById,
);

/*
 * Recalculate one student's eligibility.
 */
router.post(
  "/evaluate",
  authenticate,
  authorize("admin", "registrar"),
  evaluateGraduation,
);

/*
 * Registrar/Admin approval.
 */
router.patch(
  "/:id/approve",
  authenticate,
  authorize("admin", "registrar"),
  approveGraduation,
);

/*
 * Mark approved student as graduated.
 */
router.patch(
  "/:id/graduate",
  authenticate,
  authorize("admin", "registrar"),
  graduateStudent,
);

/*
 * Return graduation decision to not eligible.
 */
router.patch(
  "/:id/reject",
  authenticate,
  authorize("admin", "registrar"),
  rejectGraduation,
);

export default router;