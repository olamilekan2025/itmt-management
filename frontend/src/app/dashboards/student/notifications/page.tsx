"use client";

import {
  Bell,
  CheckCheck,
  ChevronRight,
  CircleAlert,
  Info,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { apiDelete, apiGet, apiPatch } from "@/lib/api";

type NotificationType =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "admission"
  | "result"
  | "course"
  | "registration"
  | "user"
  | "announcement"
  | "system";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface NotificationResponse {
  success: boolean;
  notifications: Notification[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  unreadCount: number;
}

interface UnreadResponse {
  success: boolean;
  unreadCount: number;
}

function getToken(session: unknown): string {
  return (
    (session as { accessToken?: string } | null)?.accessToken ?? ""
  );
}

function formatRelativeDate(date: string) {
  const value = new Date(date);
  const now = new Date();

  const diff = now.getTime() - value.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
  }).format(value);
}

function getTypeIcon(type: NotificationType) {
  switch (type) {
    case "success":
      return <CheckCheck className="h-5 w-5" />;

    case "warning":
      return <CircleAlert className="h-5 w-5" />;

    case "error":
      return <CircleAlert className="h-5 w-5" />;

    case "announcement":
      return <Bell className="h-5 w-5" />;

    default:
      return <Info className="h-5 w-5" />;
  }
}

function getTypeClasses(type: NotificationType) {
  switch (type) {
    case "success":
      return "bg-emerald-50 text-emerald-600";

    case "warning":
      return "bg-amber-50 text-amber-600";

    case "error":
      return "bg-red-50 text-red-600";

    case "announcement":
      return "bg-brand-navy/5 text-brand-navy";

    default:
      return "bg-blue-50 text-blue-600";
  }
}

export default function StudentNotificationsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const token = getToken(session);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState("");
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState("");

  const loadNotifications = async (showRefresh = false) => {
    if (!token) return;

    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [notificationResponse, unreadResponse] =
        await Promise.all([
          apiGet<NotificationResponse>("/notifications", token),
          apiGet<UnreadResponse>(
            "/notifications/unread-count",
            token,
          ),
        ]);

      setNotifications(
        notificationResponse?.notifications ?? [],
      );

      setUnreadCount(
        unreadResponse?.unreadCount ??
          notificationResponse?.unreadCount ??
          0,
      );
    } catch (err) {
      console.error("Load notifications error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load notifications.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (sessionStatus === "authenticated" && token) {
      loadNotifications();
    }
  }, [sessionStatus, token]);

  const markAsRead = async (notification: Notification) => {
    if (notification.isRead || processingId) return;

    try {
      setProcessingId(notification._id);

      await apiPatch(
        `/notifications/${notification._id}/read`,
        {},
        token,
      );

      setNotifications((current) =>
        current.map((item) =>
          item._id === notification._id
            ? { ...item, isRead: true }
            : item,
        ),
      );

      setUnreadCount((current) => Math.max(0, current - 1));
    } catch (err) {
      console.error("Mark notification as read error:", err);
    } finally {
      setProcessingId("");
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0 || markingAll) return;

    try {
      setMarkingAll(true);

      await apiPatch("/notifications/read-all", {}, token);

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );

      setUnreadCount(0);
    } catch (err) {
      console.error("Mark all notifications error:", err);
    } finally {
      setMarkingAll(false);
    }
  };

  const deleteNotification = async (
    notificationId: string,
  ) => {
    if (processingId) return;

    try {
      setProcessingId(notificationId);

      await apiDelete(
        `/notifications/${notificationId}`,
        token,
      );

      setNotifications((current) =>
        current.filter(
          (notification) =>
            notification._id !== notificationId,
        ),
      );
    } catch (err) {
      console.error("Delete notification error:", err);
    } finally {
      setProcessingId("");
    }
  };

  const openNotification = async (
    notification: Notification,
  ) => {
    await markAsRead(notification);

    if (notification.link) {
      router.push(notification.link);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[1200px] px-0 py-5 sm:px-0 lg:px-0 lg:py-8">
        {/* Header */}
        <section className="mb-6 overflow-hidden rounded-3xl bg-brand-navy shadow-xl">
          <div className="relative px-5 py-7 sm:px-8 sm:py-9">
            <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-brand-gold/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80">
                  <Bell className="h-3.5 w-3.5 text-brand-gold" />
                  Student Portal
                </div>

                <h1 className="text-2xl font-bold text-white sm:text-3xl">
                  Notifications
                </h1>

                <p className="mt-2 text-sm text-white/60 sm:text-base">
                  Keep track of updates and important messages from
                  your school portal.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-center">
                  <p className="text-2xl font-bold text-brand-gold">
                    {unreadCount}
                  </p>
                  <p className="text-[11px] uppercase tracking-wider text-white/50">
                    Unread
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Controls */}
        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Your notifications
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                {notifications.length} notification
                {notifications.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => loadNotifications(true)}
                disabled={refreshing}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:border-brand-gold hover:text-brand-navy disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={markAllAsRead}
                disabled={unreadCount === 0 || markingAll}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-navy px-4 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <CheckCheck className="h-4 w-4" />
                {markingAll ? "Marking..." : "Mark all as read"}
              </button>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <section className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>
          </section>
        )}

        {/* Loading */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="flex gap-4">
                  <div className="h-11 w-11 rounded-xl bg-slate-200" />

                  <div className="flex-1">
                    <div className="h-4 w-1/3 rounded bg-slate-200" />
                    <div className="mt-3 h-3 w-5/6 rounded bg-slate-100" />
                    <div className="mt-2 h-3 w-2/3 rounded bg-slate-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          /* Empty */
          <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-navy/5">
              <Bell className="h-8 w-8 text-brand-navy/60" />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-900">
              You&apos;re all caught up
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              New notifications will appear here when there are
              important updates for you.
            </p>
          </section>
        ) : (
          /* Notifications */
          <div className="space-y-3">
            {notifications.map((notification) => {
              const isProcessing =
                processingId === notification._id;

              return (
                <article
                  key={notification._id}
                  className={`group rounded-2xl border bg-white p-4 shadow-sm transition sm:p-5 ${
                    notification.isRead
                      ? "border-slate-200"
                      : "border-brand-gold/30 bg-brand-gold/[0.025] shadow-md"
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${getTypeClasses(
                        notification.type,
                      )}`}
                    >
                      {getTypeIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3
                              className={`text-sm sm:text-base ${
                                notification.isRead
                                  ? "font-semibold text-slate-800"
                                  : "font-bold text-slate-950"
                              }`}
                            >
                              {notification.title}
                            </h3>

                            {!notification.isRead && (
                              <span className="h-2 w-2 rounded-full bg-brand-gold" />
                            )}
                          </div>

                          <p className="mt-1 text-xs text-slate-400">
                            {formatRelativeDate(
                              notification.createdAt,
                            )}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            deleteNotification(
                              notification._id,
                            )
                          }
                          disabled={isProcessing}
                          className="self-start rounded-lg p-2 text-slate-300 opacity-100 transition hover:bg-red-50 hover:text-red-600 sm:opacity-0 sm:group-hover:opacity-100"
                          title="Delete notification"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {notification.message}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {!notification.isRead && (
                          <button
                            type="button"
                            onClick={() =>
                              markAsRead(notification)
                            }
                            disabled={isProcessing}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-brand-gold hover:text-brand-navy disabled:opacity-50"
                          >
                            <CheckCheck className="h-3.5 w-3.5" />
                            Mark as read
                          </button>
                        )}

                        {notification.link && (
                          <button
                            type="button"
                            onClick={() =>
                              openNotification(notification)
                            }
                            disabled={isProcessing}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-navy px-3 py-2 text-xs font-semibold text-white transition hover:opacity-95 disabled:opacity-50"
                          >
                            Open
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}