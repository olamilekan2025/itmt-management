import { Router } from "express";

import {
  getAllResults,
  getCourseResults,
  getMyResults,
  publishResults,
  submitResults,
  unpublishResults,
} from "../controllers/result.controller.js";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

/* =========================================================
   LECTURER
   SUBMIT RESULTS
========================================================= */

router.post(
  "/",
  authenticate,
  authorize("lecturer"),
  submitResults,
);

/* =========================================================
   LECTURER
   GET COURSE RESULTS
========================================================= */

router.get(
  "/course",
  authenticate,
  authorize("lecturer"),
  getCourseResults,
);

/* =========================================================
   ADMIN / REGISTRAR
   GET ALL RESULTS
========================================================= */

router.get(
  "/",
  authenticate,
  authorize(
    "admin",
    "registrar",
  ),
  getAllResults,
);

/* =========================================================
   ADMIN / REGISTRAR
   PUBLISH RESULTS
========================================================= */

router.patch(
  "/publish",
  authenticate,
  authorize(
    "admin",
    "registrar",
  ),
  publishResults,
);

/* =========================================================
   ADMIN / REGISTRAR
   UNPUBLISH RESULTS
========================================================= */

router.patch(
  "/unpublish",
  authenticate,
  authorize(
    "admin",
    "registrar",
  ),
  unpublishResults,
);

/* =========================================================
   STUDENT
   GET MY RESULTS
========================================================= */

router.get(
  "/me",
  authenticate,
  authorize("student"),
  getMyResults,
);

export default router;

