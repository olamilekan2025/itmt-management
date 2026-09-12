import { Router } from "express";

import {
  getMyNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../controllers/notification.controller.js";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

/* =========================================================
   GET MY NOTIFICATIONS
========================================================= */

router.get(
  "/",
  authenticate,
  authorize("admin", "finance", "registrar"),
  getMyNotifications,
);

/* =========================================================
   GET UNREAD COUNT
========================================================= */

router.get(
  "/unread-count",
  authenticate,
  authorize("admin", "finance", "registrar"),
  getUnreadNotificationCount,
);

/* =========================================================
   MARK ALL AS READ
========================================================= */

router.patch(
  "/read-all",
  authenticate,
  authorize("admin", "finance", "registrar"),
  markAllNotificationsAsRead,
);

/* =========================================================
   MARK ONE AS READ
========================================================= */

router.patch(
  "/:id/read",
  authenticate,
  authorize("admin", "finance", "registrar"),
  markNotificationAsRead,
);

/* =========================================================
   DELETE
========================================================= */

router.delete(
  "/:id",
  authenticate,
  authorize("admin", "finance", "registrar"),
  deleteNotification,
);

export default router;