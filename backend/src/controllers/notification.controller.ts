import type {
  Request,
  Response,
} from "express";

import { z } from "zod";

import type { AuthRequest } from "../middleware/auth.middleware.js";

import Notification from "../models/Notification.js";

/* =========================================================
   VALIDATION
========================================================= */

const objectId = z
  .string()
  .regex(
    /^[a-f\d]{24}$/i,
    "Invalid notification ID",
  );

/* =========================================================
   GET MY NOTIFICATIONS
========================================================= */

export async function getMyNotifications(
  req: AuthRequest,
  res: Response,
) {
  try {
    const page =
      typeof req.query.page === "string"
        ? Number(req.query.page)
        : 1;

    const limit =
      typeof req.query.limit === "string"
        ? Number(req.query.limit)
        : 20;

    const safePage =
      Number.isInteger(page) && page > 0
        ? page
        : 1;

    const safeLimit =
      Number.isInteger(limit) &&
      limit > 0 &&
      limit <= 100
        ? limit
        : 20;

    const skip =
      (safePage - 1) * safeLimit;

    /* =====================================================
       GET NOTIFICATIONS
    ====================================================== */

    const [
      notifications,
      total,
      unread,
    ] = await Promise.all([
      Notification.find({
        recipient: req.user!.userId,
      })
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(safeLimit)
        .lean(),

      Notification.countDocuments({
        recipient: req.user!.userId,
      }),

      Notification.countDocuments({
        recipient: req.user!.userId,
        isRead: false,
      }),
    ]);

    return res.status(200).json({
      success: true,

      notifications,

      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        pages:
          Math.ceil(
            total / safeLimit,
          ),
      },

      unreadCount: unread,
    });
  } catch (error) {
    console.error(
      "Get notifications error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to retrieve notifications",
    });
  }
}

/* =========================================================
   GET UNREAD COUNT
========================================================= */

export async function getUnreadNotificationCount(
  req: AuthRequest,
  res: Response,
) {
  try {
    const unreadCount =
      await Notification.countDocuments({
        recipient: req.user!.userId,
        isRead: false,
      });

    return res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error(
      "Get unread notification count error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to retrieve unread notification count",
    });
  }
}

/* =========================================================
   MARK ONE NOTIFICATION AS READ
========================================================= */

export async function markNotificationAsRead(
  req: AuthRequest,
  res: Response,
) {
  try {
    const notificationId =
      req.params.id;

    const parsed =
      objectId.safeParse(
        notificationId,
      );

    if (!parsed.success) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid notification ID",
      });
    }

    const notification =
      await Notification.findOneAndUpdate(
        {
          _id: notificationId,

          recipient:
            req.user!.userId,
        },

        {
          $set: {
            isRead: true,
          },
        },

        {
          new: true,
        },
      );

    if (!notification) {
      return res.status(404).json({
        success: false,

        message:
          "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,

      message:
        "Notification marked as read",

      notification,
    });
  } catch (error) {
    console.error(
      "Mark notification as read error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to mark notification as read",
    });
  }
}

/* =========================================================
   MARK ALL AS READ
========================================================= */

export async function markAllNotificationsAsRead(
  req: AuthRequest,
  res: Response,
) {
  try {
    const result =
      await Notification.updateMany(
        {
          recipient:
            req.user!.userId,

          isRead: false,
        },

        {
          $set: {
            isRead: true,
          },
        },
      );

    return res.status(200).json({
      success: true,

      message:
        "All notifications marked as read",

      modified:
        result.modifiedCount,
    });
  } catch (error) {
    console.error(
      "Mark all notifications as read error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to mark all notifications as read",
    });
  }
}

/* =========================================================
   DELETE NOTIFICATION
========================================================= */

export async function deleteNotification(
  req: AuthRequest,
  res: Response,
) {
  try {
    const notificationId =
      req.params.id;

    const parsed =
      objectId.safeParse(
        notificationId,
      );

    if (!parsed.success) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid notification ID",
      });
    }

    const notification =
      await Notification.findOneAndDelete(
        {
          _id: notificationId,

          recipient:
            req.user!.userId,
        },
      );

    if (!notification) {
      return res.status(404).json({
        success: false,

        message:
          "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,

      message:
        "Notification deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete notification error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to delete notification",
    });
  }
}