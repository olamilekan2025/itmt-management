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
   ROLES ALLOWED TO USE NOTIFICATIONS
========================================================= */

const notificationRoles = [
  "admin",
  "finance",
  "registrar",
  "lecturer",
  "student",
] as const;

/* =========================================================
   GET MY NOTIFICATIONS
========================================================= */

router.get(
  "/",
  authenticate,
  authorize(...notificationRoles),
  getMyNotifications,
);

/* =========================================================
   GET UNREAD COUNT
========================================================= */

router.get(
  "/unread-count",
  authenticate,
  authorize(...notificationRoles),
  getUnreadNotificationCount,
);

/* =========================================================
   MARK ALL AS READ
========================================================= */

router.patch(
  "/read-all",
  authenticate,
  authorize(...notificationRoles),
  markAllNotificationsAsRead,
);

/* =========================================================
   MARK ONE AS READ
========================================================= */

router.patch(
  "/:id/read",
  authenticate,
  authorize(...notificationRoles),
  markNotificationAsRead,
);

/* =========================================================
   DELETE ONE NOTIFICATION
========================================================= */

router.delete(
  "/:id",
  authenticate,
  authorize(...notificationRoles),
  deleteNotification,
);

export default router;