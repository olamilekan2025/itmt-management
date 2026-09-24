import { Router } from "express";

import {
  getMyAcademicProgress,
} from "../controllers/academic-progress.controller.js";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

/* =========================================================
   STUDENT
   GET MY ACADEMIC PROGRESS
========================================================= */

router.get(
  "/me",
  authenticate,
  authorize("student"),
  getMyAcademicProgress,
);

export default router;