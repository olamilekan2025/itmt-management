"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Bell,
  Check,
  CheckCheck,
  LogOut,
  Menu,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";

import {
  signOut,
  useSession,
} from "next-auth/react";

import { toast } from "sonner";

import {
  getAdminNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type AdminNotification,
} from "@/lib/admin-notifications";

type AdminHeaderProps = {
  onMenuClick: () => void;
};

function formatTime(date: string) {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "";
  }

  return value.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function AdminHeader({
  onMenuClick,
}: AdminHeaderProps) {
  const { data: session } = useSession();

  const accessToken =
    session?.accessToken as string | undefined;

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [logoutModalOpen, setLogoutModalOpen] =
    useState(false);

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const [notifications, setNotifications] =
    useState<AdminNotification[]>([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [loadingNotifications, setLoadingNotifications] =
    useState(false);

  const [markingAll, setMarkingAll] =
    useState(false);

  const adminName =
    session?.user?.name?.trim() ||
    "Administrator";

  const adminEmail =
    session?.user?.email ||
    "";

  const initials =
    adminName
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AD";

  /* =======================================================
     LOAD NOTIFICATIONS
  ======================================================== */

  const loadNotifications = useCallback(
    async () => {
      if (!accessToken) {
        return;
      }

      setLoadingNotifications(true);

      try {
        const response =
          await getAdminNotifications(
            accessToken,
            {
              page: 1,
              limit: 5,
            },
          );

        setNotifications(
          response.notifications ?? [],
        );

        setUnreadCount(
          response.unreadCount ?? 0,
        );
      } catch (error) {
        console.error(
          "Unable to load notifications:",
          error,
        );
      } finally {
        setLoadingNotifications(false);
      }
    },
    [accessToken],
  );

  /* =======================================================
     INITIAL LOAD
  ======================================================== */

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  /* =======================================================
     REFRESH PERIODICALLY
  ======================================================== */

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const interval =
      window.setInterval(
        loadNotifications,
        60_000,
      );

    return () =>
      window.clearInterval(interval);
  }, [
    accessToken,
    loadNotifications,
  ]);

  /* =======================================================
     CLOSE LOGOUT MODAL WITH ESCAPE
  ======================================================== */

  useEffect(() => {
    if (!logoutModalOpen) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key === "Escape" &&
        !loggingOut
      ) {
        setLogoutModalOpen(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    logoutModalOpen,
    loggingOut,
  ]);

  /* =======================================================
     MARK ONE READ
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

    try {
      await markNotificationAsRead(
        notification._id,
        accessToken,
      );

      setNotifications((current) =>
        current.map((item) =>
          item._id ===
          notification._id
            ? {
                ...item,
                isRead: true,
              }
            : item,
        ),
      );

      setUnreadCount((current) =>
        Math.max(0, current - 1),
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to mark notification as read.",
      );
    }
  }

  /* =======================================================
     MARK ALL READ
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

      setNotifications((current) =>
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
     OPEN LOGOUT CONFIRMATION
  ======================================================== */

  function openLogoutModal() {
    if (loggingOut) {
      return;
    }

    setNotificationOpen(false);
    setLogoutModalOpen(true);
  }

  /* =======================================================
     CANCEL LOGOUT
  ======================================================== */

  function cancelLogout() {
    if (loggingOut) {
      return;
    }

    setLogoutModalOpen(false);
  }

  /* =======================================================
     CONFIRM LOGOUT
  ======================================================== */

  const handleLogout = async () => {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      await signOut({
        callbackUrl: "/auth/login",
      });
    } catch (error) {
      console.error(
        "Logout failed:",
        error,
      );

      setLoggingOut(false);

      toast.error(
        "Unable to log out. Please try again.",
      );
    }
  };

  return (
    <>
      {/* =====================================================
          ADMIN HEADER
      ====================================================== */}

      <header className="sticky top-0 z-30 flex h-[72px] items-center border-b border-slate-200/80 bg-white/90 px-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] backdrop-blur-xl md:px-6 dark:border-white/[0.07] dark:bg-brand-dark/90">
        <div className="flex w-full items-center justify-between">
          {/* =================================================
              LEFT SIDE
          ================================================== */}

          <div className="flex items-center gap-3">
            {/* MOBILE MENU */}

            <button
              type="button"
              onClick={onMenuClick}
              className="group flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-brand-navy/20 hover:bg-brand-light hover:text-brand-navy lg:hidden dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Open administration menu"
            >
              <Menu className="h-5 w-5 transition-transform group-hover:scale-105" />
            </button>

            {/* DESKTOP PAGE TITLE */}

            <div className="hidden lg:block">
              <div className="flex items-center gap-0">
                <div className="h-2 w-2 rounded-full bg-brand-gold shadow-[0_0_0_4px_rgba(0,0,0,0.02)] dark:shadow-[0_0_0_4px_rgba(255,255,255,0.04)]" />

                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                  Administration
                </p>
              </div>

              <h1 className="mt-0.5 text-lg font-bold tracking-tight text-brand-navy dark:text-white">
                Management Portal
              </h1>
            </div>
          </div>

          {/* =================================================
              RIGHT SIDE
          ================================================== */}

          <div className="ml-auto flex items-center gap-1 sm:gap-3">
            {/* =================================================
                NOTIFICATIONS
            ================================================== */}

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setNotificationOpen(
                    (current) =>
                      !current,
                  )
                }
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
                  notificationOpen
                    ? "border-brand-navy/15 bg-brand-light text-brand-navy shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-brand-gold"
                    : "border-slate-200 bg-white text-slate-500 hover:border-brand-navy/15 hover:bg-brand-light hover:text-brand-navy dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                }`}
                aria-label="Notifications"
                aria-expanded={
                  notificationOpen
                }
              >
                <Bell className="h-[18px] w-[18px]" />

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-gold px-1 text-[9px] font-black text-brand-navy shadow-sm ring-2 ring-white dark:ring-brand-dark">
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}
              </button>

              {/* NOTIFICATION DROPDOWN */}

              {notificationOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Close notifications"
                    onClick={() =>
                      setNotificationOpen(
                        false,
                      )
                    }
                    className="fixed inset-0 z-40 cursor-default"
                  />

                  <div className="absolute right-0 top-[52px] z-50 w-[min(390px,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.16)] dark:border-white/10 dark:bg-brand-dark">
                    {/* HEADER */}

                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 dark:border-white/[0.07]">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-bold text-brand-navy dark:text-white">
                            Notifications
                          </h2>

                          {unreadCount >
                            0 && (
                            <span className="rounded-full bg-brand-gold/15 px-2 py-0.5 text-[9px] font-bold text-brand-navy dark:text-brand-gold">
                              {unreadCount} new
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-[11px] text-slate-400">
                          {unreadCount >
                          0
                            ? "You have unread updates."
                            : "You're all caught up."}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={
                            loadNotifications
                          }
                          disabled={
                            loadingNotifications
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-brand-navy disabled:opacity-50 dark:hover:bg-white/10 dark:hover:text-white"
                          aria-label="Refresh notifications"
                        >
                          <RefreshCw
                            className={`h-4 w-4 ${
                              loadingNotifications
                                ? "animate-spin"
                                : ""
                            }`}
                          />
                        </button>

                        {unreadCount >
                          0 && (
                          <button
                            type="button"
                            onClick={
                              handleMarkAllAsRead
                            }
                            disabled={
                              markingAll
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-brand-navy disabled:opacity-50 dark:hover:bg-white/10 dark:hover:text-white"
                            aria-label="Mark all notifications as read"
                          >
                            <CheckCheck className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* BODY */}

                    {loadingNotifications ? (
                      <div className="space-y-4 p-4">
                        {[1, 2, 3].map(
                          (item) => (
                            <div
                              key={item}
                              className="flex animate-pulse gap-3"
                            >
                              <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-100 dark:bg-white/10" />

                              <div className="flex-1 space-y-2">
                                <div className="h-3 w-32 rounded bg-slate-100 dark:bg-white/10" />

                                <div className="h-3 w-full rounded bg-slate-100 dark:bg-white/10" />

                                <div className="h-2 w-20 rounded bg-slate-100 dark:bg-white/10" />
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    ) : notifications.length ===
                      0 ? (
                      <div className="px-5 py-12 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy/[0.06] dark:bg-white/10">
                          <Bell className="h-5 w-5 text-brand-navy/50 dark:text-brand-gold/70" />
                        </div>

                        <p className="mt-4 text-sm font-bold text-slate-700 dark:text-white">
                          No notifications
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          New notifications will
                          appear here.
                        </p>
                      </div>
                    ) : (
                      <div className="max-h-[370px] overflow-y-auto">
                        {notifications.map(
                          (
                            notification,
                          ) => (
                            <div
                              key={
                                notification._id
                              }
                              className={`border-b border-slate-100 px-4 py-3.5 transition-colors last:border-0 dark:border-white/[0.05] ${
                                notification.isRead
                                  ? "bg-white dark:bg-brand-dark"
                                  : "bg-brand-navy/[0.025] dark:bg-white/[0.035]"
                              }`}
                            >
                              <div className="flex gap-3">
                                <div className="relative mt-0.5">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy/[0.06] dark:bg-white/10">
                                    <Bell className="h-4 w-4 text-brand-navy dark:text-brand-gold" />
                                  </div>

                                  {!notification.isRead && (
                                    <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-brand-gold ring-2 ring-white dark:ring-brand-dark" />
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <p
                                      className={`text-xs leading-5 ${
                                        notification.isRead
                                          ? "font-medium text-slate-700 dark:text-slate-300"
                                          : "font-bold text-brand-navy dark:text-white"
                                      }`}
                                    >
                                      {
                                        notification.title
                                      }
                                    </p>

                                    <span className="shrink-0 text-[10px] text-slate-400">
                                      {formatTime(
                                        notification.createdAt,
                                      )}
                                    </span>
                                  </div>

                                  <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                                    {
                                      notification.message
                                    }
                                  </p>

                                  <div className="mt-2.5 flex items-center gap-3">
                                    {!notification.isRead && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleMarkAsRead(
                                            notification,
                                          )
                                        }
                                        className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-navy hover:underline dark:text-brand-gold"
                                      >
                                        <Check className="h-3 w-3" />
                                        Mark read
                                      </button>
                                    )}

                                    {notification.link && (
                                      <a
                                        href={
                                          notification.link
                                        }
                                        onClick={() =>
                                          setNotificationOpen(
                                            false,
                                          )
                                        }
                                        className="text-[10px] font-bold text-slate-500 hover:text-brand-navy hover:underline dark:text-slate-400 dark:hover:text-white"
                                      >
                                        View
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    )}

                    {/* FOOTER */}

                    <div className="border-t border-slate-100 bg-slate-50/70 p-2 dark:border-white/[0.07] dark:bg-white/[0.025]">
                      <a
                        href="/dashboards/admin/notifications"
                        onClick={() =>
                          setNotificationOpen(
                            false,
                          )
                        }
                        className="flex h-9 items-center justify-center rounded-lg text-[11px] font-bold text-brand-navy transition-colors hover:bg-brand-navy/[0.05] dark:text-brand-gold dark:hover:bg-white/10"
                      >
                        View all notifications
                      </a>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* DIVIDER */}

            <div className="hidden h-9 w-px bg-slate-200 sm:block dark:bg-white/10" />

            {/* =================================================
                ADMIN PROFILE
            ================================================== */}

            <div className="flex items-center gap-2.5">
              {/* PROFILE INFO */}

              <div className="hidden text-right md:block">
                <p className="max-w-[180px] truncate text-sm font-bold text-brand-navy dark:text-white">
                  {adminName}
                </p>

                <div className="mt-0.5 flex items-center justify-end gap-1.5">
                  <ShieldCheck className="h-3 w-3 text-brand-gold" />

                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Administrator
                  </p>
                </div>
              </div>

              {/* AVATAR */}

              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy text-xs font-black text-white shadow-sm ring-2 ring-brand-gold/20 dark:bg-white/10 dark:text-brand-gold">
                  {initials}
                </div>

                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-brand-dark" />
              </div>

              {/* LOGOUT */}

              <button
                type="button"
                onClick={openLogoutModal}
                disabled={loggingOut}
                className="hidden h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-600 shadow-sm transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 md:flex dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-red-500/20 dark:hover:bg-red-500/10 dark:hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />

                <span>Logout</span>
              </button>

              {/* MOBILE LOGOUT */}

              <button
                type="button"
                onClick={openLogoutModal}
                disabled={loggingOut}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 md:hidden dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-red-500/20 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* =======================================================
          LOGOUT CONFIRMATION MODAL
      ======================================================== */}

      {logoutModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
          aria-describedby="logout-description"
        >
          {/* BACKDROP */}

          <button
            type="button"
            aria-label="Close logout confirmation"
            onClick={cancelLogout}
            disabled={loggingOut}
            className="absolute inset-0 cursor-default bg-slate-950/50 backdrop-blur-sm"
          />

          {/* MODAL */}

          <div className="relative w-full max-w-[420px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.25)] dark:border-white/10 dark:bg-brand-dark">
            {/* TOP ACCENT */}

            <div className="h-1 w-full bg-brand-gold" />

            <div className="p-6 sm:p-7">
              {/* CLOSE */}

              <button
                type="button"
                onClick={cancelLogout}
                disabled={loggingOut}
                className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              {/* ICON */}

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                <LogOut className="h-6 w-6" />
              </div>

              {/* CONTENT */}

              <div className="mt-5 pr-6">
                <h2
                  id="logout-title"
                  className="text-xl font-bold tracking-tight text-brand-navy dark:text-white"
                >
                  Confirm logout
                </h2>

                <p
                  id="logout-description"
                  className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400"
                >
                  Are you sure you want to log out of
                  your administrator account?
                </p>

                {adminEmail && (
                  <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-3 dark:border-white/[0.06] dark:bg-white/[0.04]">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-navy text-[10px] font-bold text-white dark:bg-white/10 dark:text-brand-gold">
                      {initials}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-brand-navy dark:text-white">
                        {adminName}
                      </p>

                      <p className="truncate text-[10px] text-slate-400">
                        {adminEmail}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* ACTIONS */}

              <div className="mt-7 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={cancelLogout}
                  disabled={loggingOut}
                  className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
                >
                  No, stay logged in
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-bold text-white shadow-sm transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loggingOut ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Logging out...
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4" />
                      Yes, logout
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}