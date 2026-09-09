
import { Router } from "express";

import {
  createAcademicSession,
  getAcademicSessions,
  getPublicAcademicSessions,
  activateAcademicSession,
} from "../controllers/academic-session.controller.js";

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
 * GET /api/academic-sessions/public
 *
 * Public endpoint used by the admission application form.
 */
router.get(
  "/public",
  getPublicAcademicSessions,
);

/**
 * =========================================================
 * PROTECTED ROUTES
 * =========================================================
 */

/**
 * GET /api/academic-sessions
 *
 * Admin and Registrar can view academic sessions.
 */
router.get(
  "/",
  authenticate,
  authorize("admin", "registrar"),
  getAcademicSessions,
);

/**
 * POST /api/academic-sessions
 *
 * Admin and Registrar can create academic sessions.
 */
router.post(
  "/",
  authenticate,
  authorize("admin", "registrar"),
  createAcademicSession,
);

/**
 * PATCH /api/academic-sessions/:id/activate
 *
 * Admin and Registrar can activate an academic session.
 */
router.patch(
  "/:id/activate",
  authenticate,
  authorize("admin", "registrar"),
  activateAcademicSession,
);

export default router;

