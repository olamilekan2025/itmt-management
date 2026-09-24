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
   GET ALL ANNOUNCEMENTS
========================================================= */

router.get(
  "/",
  authenticate,
  authorize(
    "admin",
    "registrar",
    "finance",
    "lecturer",
    "student",
  ),
  getAllAnnouncements,
);

/* =========================================================
   GET SINGLE ANNOUNCEMENT
========================================================= */

router.get(
  "/:id",
  authenticate,
  authorize(
    "admin",
    "registrar",
    "finance",
    "lecturer",
    "student",
  ),
  getAnnouncementById,
);

/* =========================================================
   CREATE ANNOUNCEMENT
   ADMIN ONLY
========================================================= */

router.post(
  "/",
  authenticate,
  authorize("admin"),
  createAnnouncement,
);

/* =========================================================
   UPDATE ANNOUNCEMENT
   ADMIN ONLY
========================================================= */

router.patch(
  "/:id",
  authenticate,
  authorize("admin"),
  updateAnnouncement,
);

/* =========================================================
   PUBLISH ANNOUNCEMENT
   ADMIN ONLY
========================================================= */

router.patch(
  "/:id/publish",
  authenticate,
  authorize("admin"),
  publishAnnouncement,
);

/* =========================================================
   ARCHIVE ANNOUNCEMENT
   ADMIN ONLY
========================================================= */

router.patch(
  "/:id/archive",
  authenticate,
  authorize("admin"),
  archiveAnnouncement,
);

/* =========================================================
   DELETE ANNOUNCEMENT
   ADMIN ONLY
========================================================= */

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  deleteAnnouncement,
);

export default router;