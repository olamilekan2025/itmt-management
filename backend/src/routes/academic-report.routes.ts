import { Router } from "express";

import {
  getAcademicReport,
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
  authorize("admin"),
  getAcademicReport,
);

export default router;