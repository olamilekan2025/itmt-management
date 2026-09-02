"use client";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Bell,
  Check,
  CheckCheck,
  Clock3,
  Info,
  RefreshCw,
  Trash2,
  XCircle,
  AlertTriangle,
  FileText,
  Users,
  BookOpen,
  ClipboardList,
} from "lucide-react";

import { useSession } from "next-auth/react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  deleteAdminNotification,
  getAdminNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type AdminNotification,
  type NotificationType,
} from "@/lib/admin-notifications";

/* =========================================================
   HELPERS
========================================================= */

function formatNotificationDate(
  date: string,
) {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "Unknown date";
  }

  return value.toLocaleString(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  );
}

function getNotificationIcon(
  type: NotificationType,
) {
  switch (type) {
    case "success":
      return CheckCheck;

    case "warning":
      return AlertTriangle;

    case "error":
      return XCircle;

    case "admission":
      return Users;

    case "result":
      return FileText;

    case "course":
      return BookOpen;

    case "registration":
      return ClipboardList;

    case "user":
      return Users;

    case "system":
      return Bell;

    case "info":
    default:
      return Info;
  }
}

function getNotificationIconClass(
  type: NotificationType,
) {
  switch (type) {
    case "success":
      return "bg-emerald-50 text-emerald-600";

    case "warning":
      return "bg-amber-50 text-amber-600";

    case "error":
      return "bg-red-50 text-red-600";

    case "admission":
      return "bg-purple-50 text-purple-600";

    case "result":
      return "bg-blue-50 text-blue-600";

    case "course":
      return "bg-brand-navy/5 text-brand-navy";

    case "registration":
      return "bg-indigo-50 text-indigo-600";

    case "user":
      return "bg-cyan-50 text-cyan-600";

    case "system":
      return "bg-slate-100 text-slate-600";

    case "info":
    default:
      return "bg-brand-gold/10 text-brand-navy";
  }
}

/* =========================================================
   PAGE
========================================================= */

export default function AdminNotificationsPage() {
  const { data: session } =
    useSession();

  const accessToken =
    session?.accessToken as
      | string
      | undefined;

  const [
    notifications,
    setNotifications,
  ] = useState<
    AdminNotification[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    processingId,
    setProcessingId,
  ] = useState<
    string | null
  >(null);

  const [
    markingAll,
    setMarkingAll,
  ] = useState(false);

  const [
    deletingId,
    setDeletingId,
  ] = useState<
    string | null
  >(null);

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);

  /* =======================================================
     LOAD
  ======================================================== */

  const loadNotifications =
    useCallback(
      async (
        showRefresh = false,
      ) => {
        if (!accessToken) {
          return;
        }

        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        try {
          const response =
            await getAdminNotifications(
              accessToken,
              {
                page: 1,
                limit: 50,
              },
            );

          setNotifications(
            response.notifications ?? [],
          );

          setUnreadCount(
            response.unreadCount ?? 0,
          );
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Unable to load notifications.",
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [accessToken],
    );

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  /* =======================================================
     UNREAD
  ======================================================== */

  const unreadNotifications =
    useMemo(
      () =>
        notifications.filter(
          (notification) =>
            !notification.isRead,
        ),
      [notifications],
    );

  /* =======================================================
     MARK ONE AS READ
  ======================================================== */

  async function handleMarkAsRead(
    notification: AdminNotification,
  ) {
    if (
      !accessToken ||
      notification.isRead
    ) {
      return;
    }

    setProcessingId(
      notification._id,
    );

    try {
      await markNotificationAsRead(
        notification._id,
        accessToken,
      );

      setNotifications(
        (current) =>
          current.map(
            (item) =>
              item._id ===
              notification._id
                ? {
                    ...item,
                    isRead: true,
                  }
                : item,
          ),
      );

      setUnreadCount(
        (current) =>
          Math.max(0, current - 1),
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to mark notification as read.",
      );
    } finally {
      setProcessingId(null);
    }
  }

  /* =======================================================
     MARK ALL AS READ
  ======================================================== */

  async function handleMarkAllAsRead() {
    if (
      !accessToken ||
      unreadCount === 0
    ) {
      return;
    }

    setMarkingAll(true);

    try {
      await markAllNotificationsAsRead(
        accessToken,
      );

      setNotifications(
        (current) =>
          current.map(
            (notification) => ({
              ...notification,
              isRead: true,
            }),
          ),
      );

      setUnreadCount(0);

      toast.success(
        "All notifications marked as read.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to mark notifications as read.",
      );
    } finally {
      setMarkingAll(false);
    }
  }

  /* =======================================================
     DELETE
  ======================================================== */

  async function handleDelete(
    notification: AdminNotification,
  ) {
    if (!accessToken) {
      return;
    }

    const confirmed =
      window.confirm(
        "Delete this notification?",
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(
      notification._id,
    );

    try {
      await deleteAdminNotification(
        notification._id,
        accessToken,
      );

      setNotifications(
        (current) =>
          current.filter(
            (item) =>
              item._id !==
              notification._id,
          ),
      );

      if (!notification.isRead) {
        setUnreadCount(
          (current) =>
            Math.max(0, current - 1),
        );
      }

      toast.success(
        "Notification deleted.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete notification.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  /* =======================================================
     LOADING
  ======================================================== */

  if (loading) {
    return (
      <div className="min-h-full space-y-8 pb-8">
        <section className="relative overflow-hidden rounded-2xl border border-brand-navy/20 bg-brand-navy shadow-lg">
          <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-brand-gold/15 blur-3xl" />

          <div className="relative z-10 p-6 lg:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                <Bell className="h-5 w-5 text-brand-gold" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
                  Administration
                </p>

                <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
                  Notifications
                </h1>
              </div>
            </div>
          </div>
        </section>

        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <CardContent className="space-y-3 p-5">
            {[
              1,
              2,
              3,
              4,
              5,
            ].map((item) => (
              <div
                key={item}
                className="flex animate-pulse gap-4 rounded-xl border border-slate-100 p-4"
              >
                <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-100" />

                <div className="flex-1 space-y-2">
                  <div className="h-4 w-56 max-w-full rounded bg-slate-100" />

                  <div className="h-3 w-full max-w-2xl rounded bg-slate-100" />

                  <div className="h-3 w-32 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  /* =======================================================
     PAGE
  ======================================================== */

  return (
    <div className="min-h-full space-y-8 pb-8">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <section className="relative overflow-hidden rounded-2xl border border-brand-navy/20 bg-brand-navy shadow-lg">
        <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-brand-gold/15 blur-3xl" />

        <div className="absolute -bottom-20 -left-12 h-48 w-48 rounded-full bg-white/5 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/10 shadow-inner">
                <Bell className="h-5 w-5 text-brand-gold" />
              </div>

              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
                Administration
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Notifications
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
              Stay updated with important
              activities and events across
              the institution.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() =>
              loadNotifications(true)
            }
            disabled={refreshing}
            className="h-11 w-full rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white lg:w-auto"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </Button>
        </div>
      </section>

      {/* =====================================================
          STATISTICS
      ====================================================== */}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-brand-navy/10 bg-brand-navy/[0.03] shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                  Total
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-brand-dark">
                  {notifications.length}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Recent notifications
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy/10">
                <Bell className="h-5 w-5 text-brand-navy" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-100 bg-amber-50/50 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                  Unread
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-amber-600">
                  {unreadCount}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Require your attention
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100">
                <Clock3 className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 bg-emerald-50/50 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                  Read
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-600">
                  {notifications.length -
                    unreadNotifications.length}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Already reviewed
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
                <CheckCheck className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* =====================================================
          NOTIFICATIONS
      ====================================================== */}

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-navy/10">
                  <Bell className="h-4 w-4 text-brand-navy" />
                </div>

                <CardTitle className="text-base font-semibold text-brand-dark">
                  Notification Centre
                </CardTitle>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                {notifications.length}{" "}
                notification
                {notifications.length ===
                1
                  ? ""
                  : "s"}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={
                handleMarkAllAsRead
              }
              disabled={
                markingAll ||
                unreadCount === 0
              }
              className="rounded-lg"
            >
              {markingAll ? (
                <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCheck className="mr-2 h-3.5 w-3.5" />
              )}

              Mark all as read
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {notifications.length ===
          0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-navy/5 ring-8 ring-brand-navy/[0.02]">
                <Bell className="h-7 w-7 text-brand-navy/50" />
              </div>

              <h3 className="mt-5 text-base font-semibold text-slate-800">
                No notifications
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                You are all caught up.
                New administrative
                notifications will appear
                here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map(
                (notification) => {
                  const Icon =
                    getNotificationIcon(
                      notification.type,
                    );

                  return (
                    <div
                      key={
                        notification._id
                      }
                      className={`group flex gap-4 p-5 transition-colors sm:p-6 ${
                        notification.isRead
                          ? "bg-white hover:bg-slate-50/70"
                          : "bg-brand-navy/[0.025] hover:bg-brand-navy/[0.045]"
                      }`}
                    >
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${getNotificationIconClass(
                          notification.type,
                        )}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              {!notification.isRead && (
                                <span className="h-2 w-2 shrink-0 rounded-full bg-brand-gold" />
                              )}

                              <h3
                                className={`text-sm ${
                                  notification.isRead
                                    ? "font-medium text-slate-700"
                                    : "font-semibold text-brand-dark"
                                }`}
                              >
                                {
                                  notification.title
                                }
                              </h3>
                            </div>

                            <p className="mt-1.5 text-sm leading-6 text-slate-500">
                              {
                                notification.message
                              }
                            </p>
                          </div>

                          <span className="shrink-0 text-[11px] text-slate-400">
                            {formatNotificationDate(
                              notification.createdAt,
                            )}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          {!notification.isRead && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleMarkAsRead(
                                  notification,
                                )
                              }
                              disabled={
                                processingId ===
                                notification._id
                              }
                              className="h-8 rounded-lg bg-white text-xs"
                            >
                              {processingId ===
                              notification._id ? (
                                <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Check className="mr-1.5 h-3.5 w-3.5" />
                              )}

                              Mark as read
                            </Button>
                          )}

                          {notification.link && (
                          <Link
  href="/dashboards/admin/notifications"
  className="inline-flex h-7 items-center justify-center gap-1 rounded-lg border border-border bg-background px-2.5 text-[0.8rem] font-medium whitespace-nowrap transition-all hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
>
  View all
</Link>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDelete(
                                notification,
                              )
                            }
                            disabled={
                              deletingId ===
                              notification._id
                            }
                            className="h-8 rounded-lg text-xs text-slate-500 hover:bg-red-50 hover:text-red-600"
                          >
                            {deletingId ===
                            notification._id ? (
                              <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                            )}

                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}