"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  AlertCircle,
  AlertTriangle,
  Bell,
  BookOpen,
  Check,
  CheckCheck,
  ChevronRight,
  ClipboardList,
  FileText,
  Info,
  Loader2,
  Megaphone,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  X,
  XCircle,
} from "lucide-react";

import {
  useSession,
} from "next-auth/react";

import {
  getLecturerNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteLecturerNotification,
  type LecturerNotification,
  type NotificationType,
} from "@/lib/lecturer-notifications";

import {
  toast,
} from "sonner";

/* =========================================================
   TYPES
========================================================= */

/* =========================================================
   ICON CONFIG
========================================================= */

const notificationIconMap: Record<
  NotificationType | string,
  typeof Bell
> = {
  info: Info,
  success: CheckCheck,
  warning: AlertTriangle,
  error: XCircle,
  admission: FileText,
  result: Check,
  course: BookOpen,
  registration: ClipboardList,
  user: UserRound,
  announcement: Megaphone,
  system: Bell,
};

const notificationLabelMap: Record<
  NotificationType | string,
  string
> = {
  info: "Information",
  success: "Success",
  warning: "Warning",
  error: "Important",
  admission: "Admission",
  result: "Result",
  course: "Course",
  registration: "Registration",
  user: "User",
  announcement: "Announcement",
  system: "System",
};

/* =========================================================
   HELPERS
========================================================= */

function formatNotificationDate(
  value: string,
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat(
    "en-NG",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
}

function getRelativeTime(
  value: string,
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const diff =
    Date.now() - date.getTime();

  const minutes = Math.floor(
    diff / 60000,
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(
    minutes / 60,
  );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(
    hours / 24,
  );

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function LecturerNotificationsPage() {
  const {
    data: session,
    status: sessionStatus,
  } = useSession();

  const accessToken =
    session?.accessToken;

  const [
    notifications,
    setNotifications,
  ] = useState<
    LecturerNotification[]
  >([]);

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    actionId,
    setActionId,
  ] = useState<string | null>(
    null,
  );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    filter,
    setFilter,
  ] = useState<
    "all" | "unread" | "read"
  >("all");

  const [
    deleteId,
    setDeleteId,
  ] = useState<string | null>(
    null,
  );

  /* =======================================================
     LOAD NOTIFICATIONS
  ======================================================== */

  const loadNotifications =
    useCallback(
      async (
        showRefresh = false,
      ) => {
        if (!accessToken) {
          return;
        }

        try {
          if (showRefresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          const response =
            await getLecturerNotifications(
              accessToken,
              {
                page: 1,
                limit: 100,
              }
            );

          setNotifications(
            response.notifications ?? [],
          );

          setUnreadCount(
            response.unreadCount ?? 0,
          );
        } catch (error) {
          console.error(
            "Load lecturer notifications error:",
            error,
          );

          toast.error(
            "Unable to load notifications",
            {
              description:
                "Please try again.",
            },
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [accessToken],
    );

  useEffect(() => {
    if (
      sessionStatus ===
      "authenticated"
    ) {
      void loadNotifications();
    }
  }, [
    sessionStatus,
    loadNotifications,
  ]);

  /* =======================================================
     FILTERED NOTIFICATIONS
  ======================================================== */

  const filteredNotifications =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return notifications.filter(
        (notification) => {
          const matchesFilter =
            filter === "all" ||
            (filter === "unread" &&
              !notification.isRead) ||
            (filter === "read" &&
              notification.isRead);

          if (!matchesFilter) {
            return false;
          }

          if (!query) {
            return true;
          }

          return (
            notification.title
              .toLowerCase()
              .includes(query) ||
            notification.message
              .toLowerCase()
              .includes(query) ||
            notificationLabelMap[
              notification.type as NotificationType
            ]
              .toLowerCase()
              .includes(query)
          );
        },
      );
    }, [
      notifications,
      search,
      filter,
    ]);

  const readCount =
    notifications.length -
    unreadCount;

  /* =======================================================
     MARK ONE AS READ
  ======================================================== */

  const markAsRead = async (
    notification: LecturerNotification,
  ) => {
    if (
      notification.isRead ||
      actionId ||
      !accessToken
    ) {
      return;
    }

    try {
      setActionId(
        notification._id,
      );

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
      console.error(
        "Mark notification read error:",
        error,
      );

      toast.error(
        "Unable to update notification",
      );
    } finally {
      setActionId(null);
    }
  };

  /* =======================================================
     MARK ALL AS READ
  ======================================================== */

  const markAllAsRead =
    async () => {
      if (
        unreadCount === 0 ||
        actionId ||
        !accessToken
      ) {
        return;
      }

      try {
        setActionId("all");

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
          "All notifications marked as read",
        );
      } catch (error) {
        console.error(
          "Mark all notifications read error:",
          error,
        );

        toast.error(
          "Unable to mark notifications as read",
        );
      } finally {
        setActionId(null);
      }
    };

  /* =======================================================
     DELETE
  ======================================================== */

  const deleteNotification =
    async () => {
      if (
        !deleteId ||
        actionId ||
        !accessToken
      ) {
        return;
      }

      const target =
        notifications.find(
          (item) =>
            item._id === deleteId,
        );

      try {
        setActionId(deleteId);

        await deleteLecturerNotification(
          deleteId,
          accessToken,
        );

        setNotifications(
          (current) =>
            current.filter(
              (item) =>
                item._id !== deleteId,
            ),
        );

        if (
          target &&
          !target.isRead
        ) {
          setUnreadCount(
            (current) =>
              Math.max(
                0,
                current - 1,
              ),
          );
        }

        toast.success(
          "Notification deleted",
        );
      } catch (error) {
        console.error(
          "Delete notification error:",
          error,
        );

        toast.error(
          "Unable to delete notification",
        );
      } finally {
        setActionId(null);
        setDeleteId(null);
      }
    };

  /* =======================================================
     LOADING
  ======================================================== */

  if (
    sessionStatus ===
      "loading" ||
    loading
  ) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-32 rounded-3xl bg-white" />

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                1, 2, 3,
              ].map((item) => (
                <div
                  key={item}
                  className="h-28 rounded-2xl bg-white"
                />
              ))}
            </div>

            <div className="h-[520px] rounded-3xl bg-white" />
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     PAGE
  ======================================================== */

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[1600px] px-0 py-5 sm:px-0 lg:px-0 lg:py-7">
        {/* =================================================
            HEADER
        ================================================= */}

        <section className="relative overflow-hidden rounded-[28px] bg-brand-navy p-5 shadow-xl sm:p-7 lg:p-8">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-brand-gold/10 blur-3xl" />

          <div className="absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-brand-gold">
                <Bell className="h-3.5 w-3.5" />
                Lecturer Portal
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Notifications
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Stay informed about academic
                activities, results, courses,
                registrations, announcements and
                other important updates.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadNotifications(true)
              }
              disabled={refreshing}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh
            </button>
          </div>
        </section>

        {/* =================================================
            STATS
        ================================================= */}

        <section className="mt-5 grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={Bell}
            label="Total notifications"
            value={notifications.length}
          />

          <StatCard
            icon={AlertCircle}
            label="Unread"
            value={unreadCount}
            accent
          />

          <StatCard
            icon={CheckCheck}
            label="Read"
            value={Math.max(
              0,
              readCount,
            )}
          />
        </section>

        {/* =================================================
            TOOLBAR
        ================================================= */}

        <section className="mt-5 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search notifications..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-gold focus:bg-white focus:ring-4 focus:ring-brand-gold/10"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  [
                    "all",
                    "All",
                  ],
                  [
                    "unread",
                    "Unread",
                  ],
                  [
                    "read",
                    "Read",
                  ],
                ] as const
              ).map(
                ([
                  value,
                  label,
                ]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setFilter(
                        value,
                      )
                    }
                    className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                      filter ===
                      value
                        ? "bg-brand-navy text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {label}

                    {value ===
                      "unread" &&
                      unreadCount >
                        0 && (
                        <span className="ml-1.5 rounded-full bg-brand-gold px-1.5 py-0.5 text-[10px] text-brand-navy">
                          {unreadCount}
                        </span>
                      )}
                  </button>
                ),
              )}

              <div className="hidden h-7 w-px bg-slate-200 sm:block" />

              <button
                type="button"
                onClick={() =>
                  void markAllAsRead()
                }
                disabled={
                  unreadCount ===
                    0 ||
                  actionId ===
                    "all"
                }
                className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold text-brand-navy transition hover:bg-brand-navy/5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {actionId ===
                "all" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCheck className="h-4 w-4" />
                )}

                Mark all read
              </button>
            </div>
          </div>
        </section>

        {/* =================================================
            NOTIFICATION LIST
        ================================================= */}

        <section className="mt-5">
          {filteredNotifications.length ===
          0 ? (
            <EmptyNotifications
              search={search}
              filter={filter}
            />
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map(
                (
                  notification,
                ) => (
                  <NotificationCard
                    key={
                      notification._id
                    }
                    notification={
                      notification
                    }
                    actionId={
                      actionId
                    }
                    onRead={() =>
                      void markAsRead(
                        notification,
                      )
                    }
                    onDelete={() =>
                      setDeleteId(
                        notification._id,
                      )
                    }
                  />
                ),
              )}
            </div>
          )}
        </section>
      </div>

      {/* ===================================================
          DELETE MODAL
      ==================================================== */}

      {deleteId && (
        <DeleteModal
          loading={
            actionId ===
            deleteId
          }
          onCancel={() =>
            setDeleteId(null)
          }
          onConfirm={() =>
            void deleteNotification()
          }
        />
      )}
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: typeof Bell;
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            accent
              ? "bg-brand-gold/15 text-brand-gold"
              : "bg-brand-navy/5 text-brand-navy"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <span className="text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </span>
      </div>

      <p className="mt-4 text-sm font-medium text-slate-500">
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   NOTIFICATION CARD
========================================================= */

function NotificationCard({
  notification,
  actionId,
  onRead,
  onDelete,
}: {
  notification: LecturerNotification;
  actionId: string | null;
  onRead: () => void;
  onDelete: () => void;
}) {
  const Icon =
    notificationIconMap[
      notification.type as NotificationType
    ] ?? Bell;

  const label =
    notificationLabelMap[
      notification.type as NotificationType
    ] ?? "Notification";

  const isActionLoading =
    actionId ===
    notification._id;

  const content = (
    <article
      className={`group relative overflow-hidden rounded-2xl border bg-white transition duration-200 ${
        notification.isRead
          ? "border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md"
          : "border-brand-gold/30 bg-gradient-to-r from-brand-gold/[0.04] to-white shadow-md hover:shadow-lg"
      }`}
    >
      {!notification.isRead && (
        <div className="absolute left-0 top-0 h-full w-1 bg-brand-gold" />
      )}

      <div className="flex gap-3 p-4 sm:gap-4 sm:p-5">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            notification.isRead
              ? "bg-slate-100 text-slate-500"
              : "bg-brand-navy text-brand-gold"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {label}
                </span>

                {!notification.isRead && (
                  <span className="h-2 w-2 rounded-full bg-brand-gold" />
                )}
              </div>

              <h2
                className={`mt-2 text-sm sm:text-base ${
                  notification.isRead
                    ? "font-semibold text-slate-800"
                    : "font-bold text-slate-950"
                }`}
              >
                {notification.title}
              </h2>
            </div>

            <div className="shrink-0 text-xs text-slate-400">
              <span className="hidden sm:inline">
                {formatNotificationDate(
                  notification.createdAt,
                )}
              </span>

              <span className="sm:hidden">
                {getRelativeTime(
                  notification.createdAt,
                )}
              </span>
            </div>
          </div>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {notification.message}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {notification.link ? (
              <Link
                href={
                  notification.link
                }
                onClick={() => {
                  if (
                    !notification.isRead
                  ) {
                    onRead();
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-navy px-3 py-2 text-xs font-bold text-white transition hover:bg-brand-navy/90"
              >
                Open
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            ) : !notification.isRead ? (
              <button
                type="button"
                onClick={onRead}
                disabled={
                  isActionLoading
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-navy px-3 py-2 text-xs font-bold text-white transition hover:bg-brand-navy/90 disabled:opacity-50"
              >
                {isActionLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}

                Mark as read
              </button>
            ) : null}

            {!notification.isRead &&
              notification.link && (
                <button
                  type="button"
                  onClick={onRead}
                  disabled={
                    isActionLoading
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  {isActionLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}

                  Mark read
                </button>
              )}

            <button
              type="button"
              onClick={onDelete}
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" />

              <span className="hidden sm:inline">
                Delete
              </span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );

  return content;
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyNotifications({
  search,
  filter,
}: {
  search: string;
  filter: string;
}) {
  const filtered =
    Boolean(search) ||
    filter !== "all";

  return (
    <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-navy/5 text-brand-navy">
        {filtered ? (
          <Search className="h-7 w-7" />
        ) : (
          <Bell className="h-7 w-7" />
        )}
      </div>

      <h3 className="mt-5 text-lg font-bold text-slate-900">
        {filtered
          ? "No matching notifications"
          : "You're all caught up"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {filtered
          ? "Try changing your search or notification filter."
          : "New academic and portal updates will appear here when they are available."}
      </p>
    </div>
  );
}

/* =========================================================
   DELETE MODAL
========================================================= */

function DeleteModal({
  loading,
  onCancel,
  onConfirm,
}: {
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="p-6 sm:p-7">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <Trash2 className="h-5 w-5" />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-950">
            Delete notification?
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            This notification will be permanently
            removed from your notification centre.
          </p>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              {loading && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}