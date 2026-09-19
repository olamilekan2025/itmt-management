import { Router } from "express";

import {
  getAttendanceHistory,
  getAttendanceRoster,
  saveAttendance,
} from "../controllers/attendance.controller";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware";

const router = Router();

/**
 * =========================================================
 * LECTURER
 * ATTENDANCE ROSTER
 * =========================================================
 *
 * GET
 * /api/attendance/roster
 *
 */

router.get(
  "/roster",
  authenticate,
  authorize("lecturer"),
  getAttendanceRoster,
);

/**
 * =========================================================
 * LECTURER
 * ATTENDANCE HISTORY
 * =========================================================
 *
 * GET
 * /api/attendance/history
 *
 */

router.get(
  "/history",
  authenticate,
  authorize("lecturer"),
  getAttendanceHistory,
);

/**
 * =========================================================
 * LECTURER
 * SAVE ATTENDANCE
 * =========================================================
 *
 * POST
 * /api/attendance
 *
 */

router.post(
  "/",
  authenticate,
  authorize("lecturer"),
  saveAttendance,
);

export default router;