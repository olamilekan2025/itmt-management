"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  Bell,
  BellRing,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

import { apiDelete, apiGet, apiPatch } from "@/lib/api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";

/* =========================================================
   TYPES
========================================================= */

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

interface NotificationItem {
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

interface NotificationsResponse {
  success: boolean;
  notifications: NotificationItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  unreadCount: number;
}

interface ActionResponse {
  success: boolean;
  message?: string;
}

/* =========================================================
   HELPERS
========================================================= */

function formatDate(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "success":
      return Check;

    case "warning":
      return AlertCircle;

    case "error":
      return AlertCircle;

    case "admission":
      return BellRing;

    case "result":
      return CheckCheck;

    case "course":
      return Bell;

    case "registration":
      return BellRing;

    case "user":
      return Bell;

    case "announcement":
      return BellRing;

    case "system":
      return AlertCircle;

    case "info":
    default:
      return Bell;
  }
}

function getNotificationStyle(type: NotificationType) {
  switch (type) {
    case "success":
      return {
        icon: "text-emerald-600",
        iconBg: "bg-emerald-50",
        badge:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
      };

    case "warning":
      return {
        icon: "text-amber-600",
        iconBg: "bg-amber-50",
        badge:
          "border-amber-200 bg-amber-50 text-amber-700",
      };

    case "error":
      return {
        icon: "text-red-600",
        iconBg: "bg-red-50",
        badge:
          "border-red-200 bg-red-50 text-red-700",
      };

    case "admission":
      return {
        icon: "text-violet-600",
        iconBg: "bg-violet-50",
        badge:
          "border-violet-200 bg-violet-50 text-violet-700",
      };

    case "result":
      return {
        icon: "text-blue-600",
        iconBg: "bg-blue-50",
        badge:
          "border-blue-200 bg-blue-50 text-blue-700",
      };

    case "course":
      return {
        icon: "text-cyan-600",
        iconBg: "bg-cyan-50",
        badge:
          "border-cyan-200 bg-cyan-50 text-cyan-700",
      };

    case "registration":
      return {
        icon: "text-indigo-600",
        iconBg: "bg-indigo-50",
        badge:
          "border-indigo-200 bg-indigo-50 text-indigo-700",
      };

    case "user":
      return {
        icon: "text-pink-600",
        iconBg: "bg-pink-50",
        badge:
          "border-pink-200 bg-pink-50 text-pink-700",
      };

    case "announcement":
      return {
        icon: "text-brand-gold",
        iconBg: "bg-amber-50",
        badge:
          "border-amber-200 bg-amber-50 text-amber-700",
      };

    case "system":
      return {
        icon: "text-slate-600",
        iconBg: "bg-slate-100",
        badge:
          "border-slate-200 bg-slate-100 text-slate-700",
      };

    case "info":
    default:
      return {
        icon: "text-brand-navy",
        iconBg: "bg-slate-100",
        badge:
          "border-slate-200 bg-slate-100 text-slate-700",
      };
  }
}

function formatType(type: NotificationType) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/* =========================================================
   PAGE
========================================================= */

export default function RegistrarNotificationsPage() {
  const { data: session, status } = useSession();

  const accessToken = session?.accessToken;

  const [notifications, setNotifications] = useState<
    NotificationItem[]
  >([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [totalNotifications, setTotalNotifications] =
    useState(0);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [actionId, setActionId] = useState<string | null>(
    null,
  );

  const [markingAll, setMarkingAll] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /* =======================================================
     FETCH NOTIFICATIONS
  ======================================================= */

  const fetchNotifications = useCallback(
    async (showRefresh = false) => {
      if (!accessToken) {
        return;
      }

      try {
        setError(null);

        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response =
          await apiGet<NotificationsResponse>(
            `/notifications?page=${page}&limit=20`,
            accessToken,
          );

        if (!response.success) {
          throw new Error(
            "Unable to load notifications.",
          );
        }

        setNotifications(
          Array.isArray(response.notifications)
            ? response.notifications
            : [],
        );

        setUnreadCount(
          Number(response.unreadCount) || 0,
        );

        setTotalPages(
          Math.max(
            Number(response.pagination?.pages) || 1,
            1,
          ),
        );

        setTotalNotifications(
          Number(response.pagination?.total) || 0,
        );
      } catch (err) {
        console.error(
          "Fetch registrar notifications error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load notifications.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken, page],
  );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    if (status === "authenticated" && accessToken) {
      void fetchNotifications();
    }
  }, [
    status,
    accessToken,
    fetchNotifications,
  ]);

  /* =======================================================
     MARK ONE AS READ
  ======================================================= */

  const markAsRead = async (
    notification: NotificationItem,
  ) => {
    if (
      !accessToken ||
      notification.isRead ||
      actionId
    ) {
      return;
    }

    try {
      setActionId(notification._id);

      await apiPatch<ActionResponse>(
        `/notifications/${notification._id}/read`,
        {},
        accessToken,
      );

      setNotifications((current) =>
        current.map((item) =>
          item._id === notification._id
            ? {
                ...item,
                isRead: true,
              }
            : item,
        ),
      );

      setUnreadCount((current) =>
        Math.max(current - 1, 0),
      );
    } catch (err) {
      console.error(
        "Mark notification as read error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to mark notification as read.",
      );
    } finally {
      setActionId(null);
    }
  };

  /* =======================================================
     MARK ALL AS READ
  ======================================================= */

  const markAllAsRead = async () => {
    if (
      !accessToken ||
      unreadCount === 0 ||
      markingAll
    ) {
      return;
    }

    try {
      setMarkingAll(true);

      await apiPatch<ActionResponse>(
        "/notifications/read-all",
        {},
        accessToken,
      );

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );

      setUnreadCount(0);
    } catch (err) {
      console.error(
        "Mark all notifications as read error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to mark all notifications as read.",
      );
    } finally {
      setMarkingAll(false);
    }
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const deleteNotification = async (
    notificationId: string,
  ) => {
    if (!accessToken || actionId) {
      return;
    }

    try {
      setActionId(notificationId);

      await apiDelete<ActionResponse>(
        `/notifications/${notificationId}`,
        accessToken,
      );

      const deletedNotification =
        notifications.find(
          (notification) =>
            notification._id === notificationId,
        );

      setNotifications((current) =>
        current.filter(
          (notification) =>
            notification._id !== notificationId,
        ),
      );

      setTotalNotifications((current) =>
        Math.max(current - 1, 0),
      );

      if (
        deletedNotification &&
        !deletedNotification.isRead
      ) {
        setUnreadCount((current) =>
          Math.max(current - 1, 0),
        );
      }
    } catch (err) {
      console.error(
        "Delete notification error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete notification.",
      );
    } finally {
      setActionId(null);
    }
  };

  /* =======================================================
     PAGINATION
  ======================================================= */

  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  const pageLabel = useMemo(() => {
    if (totalNotifications === 0) {
      return "No notifications";
    }

    return `Page ${page} of ${totalPages}`;
  }, [
    page,
    totalPages,
    totalNotifications,
  ]);

  /* =======================================================
     LOADING STATE
  ======================================================= */

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy">
            <Loader2 className="h-6 w-6 animate-spin text-brand-gold" />
          </div>

          <p className="text-sm font-medium text-slate-500">
            Loading notifications...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="space-y-6">
      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden rounded-3xl bg-brand-navy p-6 shadow-xl sm:p-8">
        {/* Background grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-gold/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-lg">
              <BellRing className="h-7 w-7 text-brand-gold" />
            </div>

            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge className="border-brand-gold/30 bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/10">
                  Registrar
                </Badge>

                {unreadCount > 0 && (
                  <Badge className="border-white/10 bg-white/10 text-white hover:bg-white/10">
                    {unreadCount} unread
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Notifications
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Stay informed about admissions, academic
                activities, announcements, registrations,
                and system updates.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => void fetchNotifications(true)}
              disabled={refreshing}
              className="border-white/15 bg-white/10 text-white hover:bg-white/15 hover:text-white"
            >
              <RefreshCw
                className={cn(
                  "mr-2 h-4 w-4",
                  refreshing && "animate-spin",
                )}
              />
              Refresh
            </Button>

            <Button
              type="button"
              onClick={() => void markAllAsRead()}
              disabled={
                unreadCount === 0 || markingAll
              }
              className="bg-brand-gold text-brand-navy shadow-lg hover:bg-brand-gold/90"
            >
              {markingAll ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="mr-2 h-4 w-4" />
              )}

              Mark all read
            </Button>
          </div>
        </div>
      </section>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <motion.div
          initial={{
            opacity: 0,
            y: -8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <div>
            <p className="font-semibold">
              Unable to complete request
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>
        </motion.div>
      )}

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total
                </p>

                <p className="mt-2 text-2xl font-bold text-brand-navy">
                  {totalNotifications}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Notifications received
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                <Bell className="h-5 w-5 text-brand-navy" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Unread
                </p>

                <p className="mt-2 text-2xl font-bold text-brand-navy">
                  {unreadCount}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Require your attention
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
                <BellRing className="h-5 w-5 text-brand-gold" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Current page
                </p>

                <p className="mt-2 text-2xl font-bold text-brand-navy">
                  {page}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {pageLabel}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                <Clock3 className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* =====================================================
          NOTIFICATIONS
      ===================================================== */}

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-white">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-brand-navy">
                Recent notifications
              </CardTitle>

              <CardDescription className="mt-1">
                Your latest system and academic updates.
              </CardDescription>
            </div>

            {unreadCount > 0 && (
              <Badge className="w-fit border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50">
                {unreadCount} unread
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <Bell className="h-7 w-7 text-slate-400" />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-brand-navy">
                You're all caught up
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                There are no notifications to display
                right now. New updates will appear here
                automatically.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map(
                (notification, index) => {
                  const Icon =
                    getNotificationIcon(
                      notification.type,
                    );

                  const style =
                    getNotificationStyle(
                      notification.type,
                    );

                  const isProcessing =
                    actionId ===
                    notification._id;

                  return (
                    <motion.div
                      key={notification._id}
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: Math.min(
                          index * 0.03,
                          0.2,
                        ),
                      }}
                      className={cn(
                        "group relative p-5 transition-colors sm:p-6",
                        !notification.isRead &&
                          "bg-amber-50/40",
                        notification.isRead &&
                          "hover:bg-slate-50",
                      )}
                    >
                      {!notification.isRead && (
                        <span className="absolute left-0 top-0 h-full w-1 bg-brand-gold" />
                      )}

                      <div className="flex gap-4">
                        <div
                          className={cn(
                            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                            style.iconBg,
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-5 w-5",
                              style.icon,
                            )}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3
                                  className={cn(
                                    "text-sm font-semibold",
                                    notification.isRead
                                      ? "text-slate-700"
                                      : "text-brand-navy",
                                  )}
                                >
                                  {notification.title}
                                </h3>

                                {!notification.isRead && (
                                  <span className="h-2 w-2 rounded-full bg-brand-gold" />
                                )}
                              </div>

                              <p className="mt-2 text-sm leading-6 text-slate-600">
                                {notification.message}
                              </p>
                            </div>

                            <Badge
                              variant="outline"
                              className={cn(
                                "w-fit shrink-0 text-xs",
                                style.badge,
                              )}
                            >
                              {formatType(
                                notification.type,
                              )}
                            </Badge>
                          </div>

                          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <Clock3 className="h-3.5 w-3.5" />

                              <span>
                                {formatDate(
                                  notification.createdAt,
                                )}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {!notification.isRead && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    void markAsRead(
                                      notification,
                                    )
                                  }
                                  disabled={
                                    isProcessing
                                  }
                                  className="h-8 text-xs font-medium text-brand-navy hover:bg-slate-100"
                                >
                                  {isProcessing ? (
                                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Check className="mr-1.5 h-3.5 w-3.5" />
                                  )}

                                  Mark as read
                                </Button>
                              )}

                              {notification.link && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    window.location.href =
                                      notification.link!;
                                  }}
                                  className="h-8 text-xs font-medium text-brand-navy hover:bg-slate-100"
                                >
                                  Open
                                </Button>
                              )}

                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  void deleteNotification(
                                    notification._id,
                                  )
                                }
                                disabled={
                                  isProcessing
                                }
                                className="h-8 text-xs font-medium text-slate-500 hover:bg-red-50 hover:text-red-600"
                              >
                                {isProcessing ? (
                                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                )}

                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                },
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* =====================================================
          PAGINATION
      ===================================================== */}

      {totalPages > 1 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Showing page{" "}
            <span className="font-semibold text-brand-navy">
              {page}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-brand-navy">
              {totalPages}
            </span>
          </p>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canGoPrevious}
              onClick={() =>
                setPage((current) =>
                  Math.max(current - 1, 1),
                )
              }
              className="border-slate-200"
            >
              <ChevronLeft className="mr-1.5 h-4 w-4" />
              Previous
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canGoNext}
              onClick={() =>
                setPage((current) =>
                  Math.min(
                    current + 1,
                    totalPages,
                  ),
                )
              }
              className="border-slate-200"
            >
              Next
              <ChevronRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

