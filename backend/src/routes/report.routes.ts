import { Router } from "express";

import {
  getSystemReport,
  getStudentReport,
} from "../controllers/report.controller.js";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

/**
 * =========================================================
 * PROTECTED ROUTES
 * =========================================================
 */

/**
 * GET /api/reports/system
 *
 * Admin and Registrar can view system-wide reports.
 */
router.get(
  "/system",
  authenticate,
  authorize("admin", "registrar"),
  getSystemReport,
);

/**
 * GET /api/reports/students
 *
 * Admin and Registrar can view student reports.
 */
router.get(
  "/students",
  authenticate,
  authorize("admin", "registrar"),
  getStudentReport,
);

export default router;
