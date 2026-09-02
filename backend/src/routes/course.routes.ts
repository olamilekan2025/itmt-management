import { Router } from "express";

import {
  archiveCourse,
  createCourse,
  getCourses,
  getPublicCourses,
  updateCourse,
} from "../controllers/course.controller.js";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

/**
 * =========================================================
 * PUBLIC COURSES
 * =========================================================
 */

router.get(
  "/public",
  getPublicCourses,
);

/**
 * =========================================================
 * ADMIN / STAFF COURSES
 * =========================================================
 */

router.get(
  "/",
  authenticate,
  getCourses,
);

/**
 * =========================================================
 * CREATE COURSE
 * =========================================================
 */

router.post(
  "/",
  authenticate,
  authorize("admin", "registrar"),
  createCourse,
);

/**
 * =========================================================
 * UPDATE COURSE
 * =========================================================
 */

router.patch(
  "/:id",
  authenticate,
  authorize("admin", "registrar"),
  updateCourse,
);

/**
 * =========================================================
 * ARCHIVE COURSE
 * =========================================================
 */

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  archiveCourse,
);

export default router;