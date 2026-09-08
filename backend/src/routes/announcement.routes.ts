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
   ADMIN / REGISTRAR / FINANCE
   GET ALL ANNOUNCEMENTS

   Finance receives a restricted response from the controller:
   published + everyone/staff/finance only.
========================================================= */

router.get(
  "/",
  authenticate,
  authorize(
    "admin",
    "registrar",
    "finance",
  ),
  getAllAnnouncements,
);

/* =========================================================
   ADMIN / REGISTRAR / FINANCE
   GET SINGLE ANNOUNCEMENT

   Finance access is restricted inside the controller.
========================================================= */

router.get(
  "/:id",
  authenticate,
  authorize(
    "admin",
    "registrar",
    "finance",
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