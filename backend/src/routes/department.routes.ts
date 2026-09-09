import { Router } from "express";

import {
  createDepartment,
  getDepartments,
  getPublicDepartments,
  updateDepartment,
  archiveDepartment,
} from "../controllers/department.controller.js";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

/**
 * =========================================================
 * PUBLIC ROUTES
 * =========================================================
 */

/**
 * GET /api/departments/public
 *
 * Public endpoint used by admission forms.
 */
router.get(
  "/public",
  getPublicDepartments,
);

/**
 * =========================================================
 * PROTECTED ROUTES
 * =========================================================
 */

/**
 * GET /api/departments
 *
 * Admin and Registrar can view departments.
 */
router.get(
  "/",
  authenticate,
  authorize("admin", "registrar"),
  getDepartments,
);

/**
 * POST /api/departments
 *
 * Admin and Registrar can create departments.
 */
router.post(
  "/",
  authenticate,
  authorize("admin", "registrar"),
  createDepartment,
);

/**
 * PATCH /api/departments/:id
 *
 * Admin and Registrar can update departments.
 */
router.patch(
  "/:id",
  authenticate,
  authorize("admin", "registrar"),
  updateDepartment,
);

/**
 * PATCH /api/departments/:id/archive
 *
 * Admin and Registrar can archive departments.
 */
router.patch(
  "/:id/archive",
  authenticate,
  authorize("admin", "registrar"),
  archiveDepartment,
);

export default router;

