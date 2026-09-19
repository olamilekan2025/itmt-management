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
   READ ANNOUNCEMENTS

   Admin:
   - Full access

   Registrar:
   - Full read access

   Finance:
   - Published:
     everyone
     staff
     finance

   Lecturer:
   - Published:
     everyone
     lecturers
========================================================= */

router.get(
  "/",
  authenticate,
  authorize(
    "admin",
    "registrar",
    "finance",
    "lecturer",
  ),
  getAllAnnouncements,
);

router.get(
  "/:id",
  authenticate,
  authorize(
    "admin",
    "registrar",
    "finance",
    "lecturer",
  ),
  getAnnouncementById,
);

/* =========================================================
   CREATE
   ADMIN ONLY
========================================================= */

router.post(
  "/",
  authenticate,
  authorize("admin"),
  createAnnouncement,
);

/* =========================================================
   UPDATE
   ADMIN ONLY
========================================================= */

router.patch(
  "/:id",
  authenticate,
  authorize("admin"),
  updateAnnouncement,
);

/* =========================================================
   PUBLISH
   ADMIN ONLY
========================================================= */

router.patch(
  "/:id/publish",
  authenticate,
  authorize("admin"),
  publishAnnouncement,
);

/* =========================================================
   ARCHIVE
   ADMIN ONLY
========================================================= */

router.patch(
  "/:id/archive",
  authenticate,
  authorize("admin"),
  archiveAnnouncement,
);

/* =========================================================
   DELETE
   ADMIN ONLY
========================================================= */

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  deleteAnnouncement,
);

export default router;