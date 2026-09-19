import { Router } from "express";

import {
  getAcademicReport,
  getLecturerAcademicReport,
} from "../controllers/academic-report.controller.js";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

/* =========================================================
   ADMIN ACADEMIC REPORT
========================================================= */

router.get(
  "/",
  authenticate,
  authorize("admin", "registrar"),
  getAcademicReport,
);

/* =========================================================
   LECTURER ACADEMIC REPORT
========================================================= */

router.get(
  "/lecturer",
  authenticate,
  authorize("lecturer"),
  getLecturerAcademicReport,
);

export default router;