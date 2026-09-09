import { Router } from "express";

import {
  applyForAdmission,
  listAdmissions,
  getAdmission,
  reviewAdmission,
  approveAdmission,
  rejectAdmission,
} from "../controllers/admission.controller.js";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

import {
  uploadAdmissionDocuments,
} from "../middleware/upload.middleware.js";

const router = Router();

/* =========================================================
   PUBLIC ADMISSION APPLICATION
========================================================= */

router.post(
  "/apply",
  uploadAdmissionDocuments,
  applyForAdmission,
);

/* =========================================================
   ADMIN / REGISTRAR ADMISSION MANAGEMENT
========================================================= */

router.get(
  "/",
  authenticate,
  authorize("admin", "registrar"),
  listAdmissions,
);

router.get(
  "/:id",
  authenticate,
  authorize("admin", "registrar"),
  getAdmission,
);

router.patch(
  "/:id/review",
  authenticate,
  authorize("admin", "registrar"),
  reviewAdmission,
);

router.patch(
  "/:id/approve",
  authenticate,
  authorize("admin", "registrar"),
  approveAdmission,
);

router.patch(
  "/:id/reject",
  authenticate,
  authorize("admin", "registrar"),
  rejectAdmission,
);

export default router;

