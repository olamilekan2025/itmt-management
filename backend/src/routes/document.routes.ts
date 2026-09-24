import { Router } from "express";

import {
  getAllDocuments,
  getMyDocuments,
  getMyDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
} from "../controllers/document.controller.js";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

import {
  documentUpload,
} from "../middleware/document-upload.middleware.js";

const router = Router();

/* =========================================================
   ADMIN / REGISTRAR DOCUMENT MANAGEMENT
========================================================= */

/**
 * GET /api/documents
 *
 * Admin / Registrar gets all uploaded student documents.
 *
 * Query parameters:
 *   search
 *   type
 *   page
 *   limit
 */
router.get(
  "/",
  authenticate,
  authorize("admin", "registrar"),
  getAllDocuments,
);

/* =========================================================
   STUDENT DOCUMENTS
========================================================= */

/**
 * GET /api/documents/my
 *
 * Student gets only their own documents.
 *
 * IMPORTANT:
 * This route must come before "/:id".
 */
router.get(
  "/my",
  authenticate,
  authorize("student"),
  getMyDocuments,
);

/**
 * GET /api/documents/:id
 *
 * Student gets one of their own documents.
 */
router.get(
  "/:id",
  authenticate,
  authorize("student"),
  getMyDocumentById,
);

/* =========================================================
   ADMIN / REGISTRAR DOCUMENT UPLOAD
========================================================= */

/**
 * POST /api/documents
 *
 * Multipart/form-data
 *
 * File field:
 *   file
 */
router.post(
  "/",
  authenticate,
  authorize("admin", "registrar"),
  documentUpload.single("file"),
  createDocument,
);

/* =========================================================
   ADMIN / REGISTRAR DOCUMENT UPDATE
========================================================= */

/**
 * PATCH /api/documents/:id
 *
 * Update document metadata.
 */
router.patch(
  "/:id",
  authenticate,
  authorize("admin", "registrar"),
  updateDocument,
);

/* =========================================================
   ADMIN / REGISTRAR DOCUMENT DELETE
========================================================= */

/**
 * DELETE /api/documents/:id
 */
router.delete(
  "/:id",
  authenticate,
  authorize("admin", "registrar"),
  deleteDocument,
);

export default router;