import { Router } from "express";

import {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  publishAnnouncement,
  archiveAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcement.controller.js";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

/* =========================================================
   ADMIN / REGISTRAR
   GET ALL ANNOUNCEMENTS
========================================================= */

router.get(
  "/",
  authenticate,
  authorize(
    "admin",
    "registrar",
  ),
  getAllAnnouncements,
);

/* =========================================================
   ADMIN / REGISTRAR
   GET SINGLE ANNOUNCEMENT
========================================================= */

router.get(
  "/:id",
  authenticate,
  authorize(
    "admin",
    "registrar",
  ),
  getAnnouncementById,
);

/* =========================================================
   ADMIN
   CREATE ANNOUNCEMENT
========================================================= */

router.post(
  "/",
  authenticate,
  authorize("admin"),
  createAnnouncement,
);

/* =========================================================
   ADMIN
   UPDATE ANNOUNCEMENT
========================================================= */

router.patch(
  "/:id",
  authenticate,
  authorize("admin"),
  updateAnnouncement,
);

/* =========================================================
   ADMIN
   PUBLISH ANNOUNCEMENT
========================================================= */

router.patch(
  "/:id/publish",
  authenticate,
  authorize("admin"),
  publishAnnouncement,
);

/* =========================================================
   ADMIN
   ARCHIVE ANNOUNCEMENT
========================================================= */

router.patch(
  "/:id/archive",
  authenticate,
  authorize("admin"),
  archiveAnnouncement,
);

/* =========================================================
   ADMIN
   DELETE ANNOUNCEMENT
========================================================= */

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  deleteAnnouncement,
);

export default router;