import Notification, { type NotificationType } from "../models/Notification.js";
import User from "../models/User.js";

interface CreateNotificationInput {
  recipient: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  metadata?: Record<string, unknown>;
}

// Creates a notification for a single specific user.
export async function createNotification(input: CreateNotificationInput) {
  try {
    return await Notification.create(input);
  } catch (error) {
    console.error("Create notification error:", error);
    return null;
  }
}

interface NotifyAdminsInput {
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  metadata?: Record<string, unknown>;
}

// Creates the same notification for every active admin account.
export async function notifyAdmins(input: NotifyAdminsInput) {
  try {
    const admins = await User.find({ role: "admin", isActive: true }).select("_id");

    if (admins.length === 0) {
      return [];
    }

    const documents = admins.map((admin) => ({
      recipient: admin._id,
      title: input.title,
      message: input.message,
      type: input.type,
      link: input.link,
      metadata: input.metadata,
    }));

    return await Notification.insertMany(documents);
  } catch (error) {
    console.error("Notify admins error:", error);
    return [];
  }
}

interface NotifyByRoleInput {
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  metadata?: Record<string, unknown>;
}

// Creates the same notification for every active user with the given role(s).
export async function notifyByRole(roles: string | string[], input: NotifyByRoleInput) {
  try {
    const roleList = Array.isArray(roles) ? roles : [roles];

    const users = await User.find({
      role: { $in: roleList },
      isActive: true,
    }).select("_id");

    if (users.length === 0) {
      return [];
    }

    const documents = users.map((user) => ({
      recipient: user._id,
      title: input.title,
      message: input.message,
      type: input.type,
      link: input.link,
      metadata: input.metadata,
    }));

    return await Notification.insertMany(documents);
  } catch (error) {
    console.error("Notify by role error:", error);
    return [];
  }
}