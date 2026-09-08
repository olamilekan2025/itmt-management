// import { Router } from "express";

// import {
//   getMyNotifications,
//   getUnreadNotificationCount,
//   markNotificationAsRead,
//   markAllNotificationsAsRead,
//   deleteNotification,
// } from "../controllers/notification.controller.js";

// import {
//   authenticate,
//   authorize,
// } from "../middleware/auth.middleware.js";

// const router = Router();

// /* =========================================================
//    GET MY NOTIFICATIONS
//    ADMIN
// ========================================================= */

// router.get(
//   "/",
//   authenticate,
//   authorize("admin"),
//   getMyNotifications,
// );

// /* =========================================================
//    GET UNREAD COUNT
//    ADMIN
// ========================================================= */

// router.get(
//   "/unread-count",
//   authenticate,
//   authorize("admin"),
//   getUnreadNotificationCount,
// );

// /* =========================================================
//    MARK ALL AS READ
//    ADMIN
// ========================================================= */

// router.patch(
//   "/read-all",
//   authenticate,
//   authorize("admin"),
//   markAllNotificationsAsRead,
// );

// /* =========================================================
//    MARK ONE AS READ
//    ADMIN
// ========================================================= */

// router.patch(
//   "/:id/read",
//   authenticate,
//   authorize("admin"),
//   markNotificationAsRead,
// );

// /* =========================================================
//    DELETE
//    ADMIN
// ========================================================= */

// router.delete(
//   "/:id",
//   authenticate,
//   authorize("admin"),
//   deleteNotification,
// );

// export default router;



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
  authorize("admin", "finance"),
  getMyNotifications,
);

/* =========================================================
   GET UNREAD COUNT
========================================================= */

router.get(
  "/unread-count",
  authenticate,
  authorize("admin", "finance"),
  getUnreadNotificationCount,
);

/* =========================================================
   MARK ALL AS READ
========================================================= */

router.patch(
  "/read-all",
  authenticate,
  authorize("admin", "finance"),
  markAllNotificationsAsRead,
);

/* =========================================================
   MARK ONE AS READ
========================================================= */

router.patch(
  "/:id/read",
  authenticate,
  authorize("admin", "finance"),
  markNotificationAsRead,
);

/* =========================================================
   DELETE
========================================================= */

router.delete(
  "/:id",
  authenticate,
  authorize("admin", "finance"),
  deleteNotification,
);

export default router;