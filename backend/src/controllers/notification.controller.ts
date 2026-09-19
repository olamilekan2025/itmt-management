import type { Response } from "express";
import { z } from "zod";

import type { AuthRequest } from "../middleware/auth.middleware.js";

import Notification from "../models/Notification.js";

/* =========================================================
   VALIDATION
========================================================= */

const objectId = z.string().regex(
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
    const pageValue =
      typeof req.query.page === "string"
        ? Number(req.query.page)
        : 1;

    const limitValue =
      typeof req.query.limit === "string"
        ? Number(req.query.limit)
        : 20;

    const page =
      Number.isInteger(pageValue) && pageValue > 0
        ? pageValue
        : 1;

    const limit =
      Number.isInteger(limitValue) &&
      limitValue > 0 &&
      limitValue <= 100
        ? limitValue
        : 20;

    const skip = (page - 1) * limit;

    const recipient = req.user!.userId;

    const [notifications, total, unreadCount] =
      await Promise.all([
        Notification.find({
          recipient,
        })
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),

        Notification.countDocuments({
          recipient,
        }),

        Notification.countDocuments({
          recipient,
          isRead: false,
        }),
      ]);

    return res.status(200).json({
      success: true,
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      unreadCount,
    });
  } catch (error) {
    console.error(
      "Get notifications error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve notifications",
    });
  }
}

/* =========================================================
   GET UNREAD NOTIFICATION COUNT
========================================================= */

export async function getUnreadNotificationCount(
  req: AuthRequest,
  res: Response,
) {
  try {
    const recipient = req.user!.userId;

    const unreadCount =
      await Notification.countDocuments({
        recipient,
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
    const notificationId = req.params.id;

    const parsed =
      objectId.safeParse(notificationId);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    const notification =
      await Notification.findOneAndUpdate(
        {
          _id: notificationId,
          recipient: req.user!.userId,
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
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
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
   MARK ALL NOTIFICATIONS AS READ
========================================================= */

export async function markAllNotificationsAsRead(
  req: AuthRequest,
  res: Response,
) {
  try {
    const result =
      await Notification.updateMany(
        {
          recipient: req.user!.userId,
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
      modified: result.modifiedCount,
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
    const notificationId = req.params.id;

    const parsed =
      objectId.safeParse(notificationId);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    const notification =
      await Notification.findOneAndDelete({
        _id: notificationId,
        recipient: req.user!.userId,
      });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
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