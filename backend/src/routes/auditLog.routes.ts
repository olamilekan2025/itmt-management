
import { Router } from "express";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

import {
  getAuditLogs,
  getAuditLogById,
} from "../controllers/auditLog.controller.js";

/**
 * =========================================================
 * ROUTER
 * =========================================================
 */

const router = Router();

/**
 * =========================================================
 * AUDIT LOG ACCESS
 * =========================================================
 *
 * Audit logs contain sensitive administrative information.
 *
 * Only authenticated administrators and registrars can
 * access the audit-log viewer.
 */

router.use(
  authenticate,
  authorize("admin", "registrar"),
);

/**
 * =========================================================
 * GET ALL AUDIT LOGS
 * GET /api/audit-logs
 * =========================================================
 */

router.get(
  "/",
  getAuditLogs,
);

/**
 * =========================================================
 * GET SINGLE AUDIT LOG
 * GET /api/audit-logs/:id
 * =========================================================
 */

router.get(
  "/:id",
  getAuditLogById,
);

export default router;

