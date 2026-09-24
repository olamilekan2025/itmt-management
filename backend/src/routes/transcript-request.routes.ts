import { Router } from "express";

import {
  createTranscriptRequest,
  getMyTranscriptRequests,
  getTranscriptRequestById,
  getTranscriptRequests,
  updateTranscriptRequestStatus,
} from "../controllers/transcript-request.controller.js";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

/* =========================================================
   STUDENT
   ========================================================= */

/**
 * Create a transcript request
 * POST /api/transcript-requests
 */
router.post(
  "/",
  authenticate,
  authorize("student"),
  createTranscriptRequest,
);

/**
 * Get my transcript requests
 * GET /api/transcript-requests/my
 *
 * IMPORTANT:
 * This route must come before "/:id"
 * so "my" is not treated as an ID.
 */
router.get(
  "/my",
  authenticate,
  authorize("student"),
  getMyTranscriptRequests,
);

/* =========================================================
   ADMIN
   ========================================================= */

/**
 * Get all transcript requests
 * GET /api/transcript-requests
 */
router.get(
  "/",
  authenticate,
  authorize("admin"),
  getTranscriptRequests,
);

/**
 * Get a single transcript request
 * GET /api/transcript-requests/:id
 */
router.get(
  "/:id",
  authenticate,
  authorize("admin"),
  getTranscriptRequestById,
);

/**
 * Update transcript request status
 * PATCH /api/transcript-requests/:id/status
 */
router.patch(
  "/:id/status",
  authenticate,
  authorize("admin"),
  updateTranscriptRequestStatus,
);

export default router;