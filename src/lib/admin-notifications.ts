import {
  apiGet,
  apiPatch,
  apiDelete,
} from "./api";

/* =========================================================
   TYPES
========================================================= */

export type NotificationType =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "admission"
  | "result"
  | "course"
  | "registration"
  | "user"
  | "system";

/* =========================================================
   NOTIFICATION
========================================================= */

export interface AdminNotification {
  _id: string;

  recipient: string;

  title: string;

  message: string;

  type: NotificationType;

  isRead: boolean;

  link?: string;

  metadata?: Record<
    string,
    unknown
  >;

  createdAt: string;

  updatedAt: string;
}

/* =========================================================
   RESPONSE TYPES
========================================================= */

export interface NotificationsResponse {
  success: boolean;

  notifications: AdminNotification[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };

  unreadCount: number;
}

export interface UnreadNotificationCountResponse {
  success: boolean;
  unreadCount: number;
}

export interface NotificationResponse {
  success: boolean;

  message: string;

  notification?: AdminNotification;
}

/* =========================================================
   GET NOTIFICATIONS
========================================================= */

export async function getAdminNotifications(
  accessToken: string,
  params?: {
    page?: number;
    limit?: number;
  },
): Promise<NotificationsResponse> {
  const queryParams =
    new URLSearchParams();

  if (params?.page) {
    queryParams.append(
      "page",
      params.page.toString(),
    );
  }

  if (params?.limit) {
    queryParams.append(
      "limit",
      params.limit.toString(),
    );
  }

  const queryString =
    queryParams.toString();

  const path = `/notifications${
    queryString
      ? `?${queryString}`
      : ""
  }`;

  return apiGet<NotificationsResponse>(
    path,
    accessToken,
  );
}

/* =========================================================
   GET UNREAD COUNT
========================================================= */

export async function getUnreadNotificationCount(
  accessToken: string,
): Promise<UnreadNotificationCountResponse> {
  return apiGet<UnreadNotificationCountResponse>(
    "/notifications/unread-count",
    accessToken,
  );
}

/* =========================================================
   MARK ONE AS READ
========================================================= */

export async function markNotificationAsRead(
  id: string,
  accessToken: string,
): Promise<NotificationResponse> {
  return apiPatch<NotificationResponse>(
    `/notifications/${id}/read`,
    {},
    accessToken,
  );
}

/* =========================================================
   MARK ALL AS READ
========================================================= */

export async function markAllNotificationsAsRead(
  accessToken: string,
): Promise<{
  success: boolean;
  message: string;
  modified?: number;
}> {
  return apiPatch<{
    success: boolean;
    message: string;
    modified?: number;
  }>(
    "/notifications/read-all",
    {},
    accessToken,
  );
}

/* =========================================================
   DELETE NOTIFICATION
========================================================= */

export async function deleteAdminNotification(
  id: string,
  accessToken: string,
): Promise<{
  success: boolean;
  message: string;
}> {
  return apiDelete<{
    success: boolean;
    message: string;
  }>(
    `/notifications/${id}`,
    accessToken,
  );
}