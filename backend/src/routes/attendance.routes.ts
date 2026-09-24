import { Router } from "express";

import {
  getAttendanceHistory,
  getAttendanceRoster,
  getMyAttendance,
  saveAttendance,
} from "../controllers/attendance.controller.js";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

/**
 * =========================================================
 * STUDENT
 * MY ATTENDANCE
 * =========================================================
 *
 * GET
 * /api/attendance/my
 *
 * Optional:
 *
 * ?course=COURSE_ID
 * ?semester=SEMESTER_ID
 *
 * =========================================================
 */

router.get(
  "/my",
  authenticate,
  authorize("student"),
  getMyAttendance,
);

/**
 * =========================================================
 * LECTURER
 * ATTENDANCE ROSTER
 * =========================================================
 *
 * GET
 * /api/attendance/roster
 *
 * Query:
 *
 * ?course=COURSE_ID
 * &semester=SEMESTER_ID
 * &date=2026-09-15
 *
 * =========================================================
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
 * Query:
 *
 * ?course=COURSE_ID
 * &semester=SEMESTER_ID
 *
 * =========================================================
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
 * =========================================================
 */

router.post(
  "/",
  authenticate,
  authorize("lecturer"),
  saveAttendance,
);

export default router;