import Notification, {
  type NotificationType,
} from "../models/Notification.js";

import User, {
  type UserRole,
} from "../models/User.js";

/* =========================================================
   TYPES
========================================================= */

interface CreateNotificationInput {
  recipient: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  metadata?: Record<string, unknown>;
}

interface NotifyUsersInput {
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  metadata?: Record<string, unknown>;
}

/* =========================================================
   CREATE NOTIFICATION
========================================================= */

/**
 * Creates a notification for one specific user.
 */
export async function createNotification(
  input: CreateNotificationInput,
) {
  try {
    return await Notification.create({
      recipient: input.recipient,
      title: input.title,
      message: input.message,
      type: input.type,
      link: input.link,
      metadata: input.metadata,
    });
  } catch (error) {
    console.error("Create notification error:", error);
    return null;
  }
}

/* =========================================================
   NOTIFY ADMINS
========================================================= */

/**
 * Creates the same notification for every active admin.
 */
export async function notifyAdmins(
  input: NotifyUsersInput,
) {
  try {
    const admins = await User.find({
      role: "admin",
      isActive: true,
    })
      .select("_id")
      .lean();

    if (admins.length === 0) {
      return [];
    }

    const documents = admins.map((admin) => ({
      recipient: admin._id,
      title: input.title,
      message: input.message,
      type: input.type,
      ...(input.link !== undefined && {
        link: input.link,
      }),
      ...(input.metadata !== undefined && {
        metadata: input.metadata,
      }),
    }));

    return await Notification.insertMany(documents);
  } catch (error) {
    console.error("Notify admins error:", error);
    return [];
  }
}

/* =========================================================
   NOTIFY BY ROLE
========================================================= */

/**
 * Creates the same notification for every active user
 * with one or more specified roles.
 *
 * Examples:
 *
 * notifyByRole("student", {...})
 *
 * notifyByRole("lecturer", {...})
 *
 * notifyByRole(["student", "lecturer"], {...})
 */
export async function notifyByRole(
  roles: UserRole | UserRole[],
  input: NotifyUsersInput,
) {
  try {
    const roleList = Array.isArray(roles)
      ? roles
      : [roles];

    const users = await User.find({
      role: {
        $in: roleList,
      },
      isActive: true,
    })
      .select("_id")
      .lean();

    if (users.length === 0) {
      return [];
    }

    const documents = users.map((user) => ({
      recipient: user._id,
      title: input.title,
      message: input.message,
      type: input.type,
      ...(input.link !== undefined && {
        link: input.link,
      }),
      ...(input.metadata !== undefined && {
        metadata: input.metadata,
      }),
    }));

    return await Notification.insertMany(documents);
  } catch (error) {
    console.error("Notify by role error:", error);
    return [];
  }
}