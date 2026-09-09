import { Router } from "express";

import { getRegistrarDashboard } from "../controllers/dashboard.controller.js";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

/**
 * =========================================================
 * REGISTRAR DASHBOARD
 * =========================================================
 *
 * GET /api/dashboard/registrar
 *
 * Accessible by:
 * - admin
 * - registrar
 */

router.get(
  "/registrar",
  authenticate,
  authorize("admin", "registrar"),
  getRegistrarDashboard,
);

export default router;

