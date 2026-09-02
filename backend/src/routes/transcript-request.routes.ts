import { Router } from "express";

import {
  createTranscriptRequest,
  getMyTranscriptRequests,
  getTranscriptRequestById,
  getTranscriptRequests,
  updateTranscriptRequestStatus,
} from "../controllers/transcript-request.controller";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware";

const router =
  Router();

/* =========================================================
   STUDENT
========================================================= */

router.post(
  "/",
  authenticate,
  authorize("student"),
  createTranscriptRequest,
);

router.get(
  "/my",
  authenticate,
  authorize("student"),
  getMyTranscriptRequests,
);

/* =========================================================
   ADMIN
========================================================= */

router.get(
  "/",
  authenticate,
  authorize("admin"),
  getTranscriptRequests,
);

router.get(
  "/:id",
  authenticate,
  authorize("admin"),
  getTranscriptRequestById,
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("admin"),
  updateTranscriptRequestStatus,
);

export default router;