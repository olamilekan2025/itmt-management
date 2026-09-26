"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

import {
  AlertTriangle,
  Bell,
  Check,
  CheckCheck,
  ChevronDown,
  ExternalLink,
  Globe2,
  Loader2,
  LogOut,
  Menu,
  Settings,
  UserRound,
  X,
} from "lucide-react";

import {
  getLecturerNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type LecturerNotification,
  type NotificationType,
} from "@/lib/lecturer-notifications";

interface LecturerHeaderProps {
  onMenuClick?: () => void;
  title?: string;
  description?: string;
}

const NOTIFICATIONS_PAGE = "/dashboards/lecturer/notifications";

function getNotificationIcon(type: NotificationType | string) {
  switch (type) {
    case "success":
      return CheckCheck;
    case "warning":
      return AlertTriangle;
    case "error":
      return X;
    case "result":
      return Check;
    case "course":
      return UserRound;
    default:
      return Bell;
  }
}

function getNotificationIconStyle(type: NotificationType | string) {
  switch (type) {
    case "success":
      return "bg-emerald-50 text-emerald-600";
    case "warning":
      return "bg-amber-50 text-amber-600";
    case "error":
      return "bg-red-50 text-red-600";
    case "announcement":
      return "bg-brand-gold/10 text-brand-gold";
    case "result":
      return "bg-blue-50 text-blue-600";
    case "course":
      return "bg-indigo-50 text-indigo-600";
    case "registration":
      return "bg-violet-50 text-violet-600";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function formatNotificationDate(date: string) {
  const createdAt = new Date(date);

  if (Number.isNaN(createdAt.getTime())) {
    return "";
  }

  const difference = Date.now() - createdAt.getTime();

  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (difference < minute) return "Just now";
  if (difference < hour) {
    return `${Math.floor(difference / minute)}m ago`;
  }

  if (difference < day) {
    return `${Math.floor(difference / hour)}h ago`;
  }

  if (difference < 7 * day) {
    return `${Math.floor(difference / day)}d ago`;
  }

  return createdAt.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function LecturerHeader({
  onMenuClick,
  title = "Lecturer Dashboard",
  description = "Manage your courses, students and academic activities.",
}: LecturerHeaderProps) {
  const { data: session, status } = useSession();

  const accessToken = session?.accessToken;

  const notificationMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const [notifications, setNotifications] = useState<
    LecturerNotification[]
  >([]);

  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [markingNotificationId, setMarkingNotificationId] = useState<
    string | null
  >(null);

  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const lecturerName =
    session?.user?.name?.trim() || "Lecturer";

  const lecturerEmail =
    session?.user?.email?.trim() || "Lecturer account";

  const initials =
    lecturerName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((name) => name.charAt(0).toUpperCase())
      .join("") || "L";

  const loadUnreadCount = useCallback(async () => {
    if (!accessToken) return;

    try {
      const response =
        await getUnreadNotificationCount(accessToken);

      if (response?.success) {
        setUnreadCount(
          Math.max(
            0,
            Number(response.unreadCount ?? 0),
          ),
        );
      }
    } catch (error) {
      console.error(
        "Failed to load lecturer unread notification count:",
        error,
      );
    }
  }, [accessToken]);

  const loadNotifications = useCallback(
    async (showLoader = false) => {
      if (!accessToken) return;

      if (showLoader) {
        setNotificationsLoading(true);
      }

      try {
        const response =
          await getLecturerNotifications(
            accessToken,
            {
              page: 1,
              limit: 3,
            },
          );

        if (!response?.success) return;

        setNotifications(
          Array.isArray(response.notifications)
            ? response.notifications.slice(0, 3)
            : [],
        );

        setUnreadCount(
          Math.max(
            0,
            Number(response.unreadCount ?? 0),
          ),
        );
      } catch (error) {
        console.error(
          "Failed to load lecturer notifications:",
          error,
        );
      } finally {
        if (showLoader) {
          setNotificationsLoading(false);
        }
      }
    },
    [accessToken],
  );

  useEffect(() => {
    if (
      status !== "authenticated" ||
      !accessToken
    ) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    void loadUnreadCount();
  }, [
    accessToken,
    loadUnreadCount,
    status,
  ]);

  useEffect(() => {
    if (
      status !== "authenticated" ||
      !accessToken
    ) {
      return;
    }

    const interval = window.setInterval(
      () => void loadUnreadCount(),
      15_000,
    );

    return () =>
      window.clearInterval(interval);
  }, [
    accessToken,
    loadUnreadCount,
    status,
  ]);

  useEffect(() => {
    if (!accessToken) return;

    const refresh = () => {
      void loadUnreadCount();

      if (notificationOpen) {
        void loadNotifications();
      }
    };

    const onVisibilityChange = () => {
      if (
        document.visibilityState === "visible"
      ) {
        refresh();
      }
    };

    window.addEventListener(
      "notifications-updated",
      refresh,
    );

    document.addEventListener(
      "visibilitychange",
      onVisibilityChange,
    );

    return () => {
      window.removeEventListener(
        "notifications-updated",
        refresh,
      );

      document.removeEventListener(
        "visibilitychange",
        onVisibilityChange,
      );
    };
  }, [
    accessToken,
    loadNotifications,
    loadUnreadCount,
    notificationOpen,
  ]);

  useEffect(() => {
    const closeMenus = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        !notificationMenuRef.current?.contains(
          target,
        )
      ) {
        setNotificationOpen(false);
      }

      if (
        !profileMenuRef.current?.contains(
          target,
        )
      ) {
        setProfileOpen(false);
      }
    };

    const closeOnEscape = (
      event: KeyboardEvent,
    ) => {
      if (event.key !== "Escape") return;

      setNotificationOpen(false);
      setProfileOpen(false);
      setLogoutModalOpen(false);
    };

    document.addEventListener(
      "mousedown",
      closeMenus,
    );

    document.addEventListener(
      "keydown",
      closeOnEscape,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        closeMenus,
      );

      document.removeEventListener(
        "keydown",
        closeOnEscape,
      );
    };
  }, []);

  const handleMarkAsRead = async (
    notification: LecturerNotification,
  ) => {
    if (
      !accessToken ||
      notification.isRead ||
      markingNotificationId
    ) {
      return;
    }

    setMarkingNotificationId(
      notification._id,
    );

    try {
      await markNotificationAsRead(
        notification._id,
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

      await loadUnreadCount();

      window.dispatchEvent(
        new Event("notifications-updated"),
      );
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error,
      );
    } finally {
      setMarkingNotificationId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (
      !accessToken ||
      unreadCount === 0 ||
      markingAllRead
    ) {
      return;
    }

    setMarkingAllRead(true);

    try {
      await markAllNotificationsAsRead(
        accessToken,
      );

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );

      setUnreadCount(0);

      window.dispatchEvent(
        new Event("notifications-updated"),
      );
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error,
      );

      await loadUnreadCount();
    } finally {
      setMarkingAllRead(false);
    }
  };

  const toggleNotifications = () => {
    const willOpen = !notificationOpen;

    setNotificationOpen(willOpen);
    setProfileOpen(false);

    if (willOpen) {
      void loadUnreadCount();
      void loadNotifications(true);
    }
  };

  const toggleProfile = () => {
    setProfileOpen((value) => !value);
    setNotificationOpen(false);
  };

  const openLogoutModal = () => {
    setProfileOpen(false);
    setLogoutModalOpen(true);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await signOut({
        callbackUrl: "/auth/login",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[72px] w-full items-center justify-between gap-3 px-3 sm:min-h-[76px] sm:px-5 lg:px-8">
          {/* =====================================================
              LEFT SIDE
          ====================================================== */}
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            {/* Mobile Menu */}
            <button
              type="button"
              onClick={onMenuClick}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-brand-navy/20 hover:bg-slate-50 hover:text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-gold/40 lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Page Heading */}
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <h1 className="truncate text-base font-bold tracking-tight text-brand-navy sm:text-xl">
                  {title}
                </h1>

                <span className="hidden rounded-full bg-brand-gold/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-gold sm:inline-flex">
                  Lecturer
                </span>
              </div>

              <p className="mt-0.5 hidden max-w-[620px] truncate text-xs text-slate-500 sm:block">
                {description}
              </p>
            </div>
          </div>

          {/* =====================================================
              RIGHT SIDE
          ====================================================== */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* ===================================================
                NOTIFICATIONS
            ==================================================== */}
            <div
              ref={notificationMenuRef}
              className="relative"
            >
              <button
                type="button"
                onClick={toggleNotifications}
                aria-expanded={notificationOpen}
                aria-controls="lecturer-notification-menu"
                aria-label={
                  unreadCount > 0
                    ? `Notifications (${unreadCount} unread)`
                    : "Notifications"
                }
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition focus:outline-none focus:ring-2 focus:ring-brand-gold/40 ${
                  notificationOpen
                    ? "border-brand-navy bg-brand-navy text-white shadow-lg shadow-brand-navy/15"
                    : "border-slate-200 bg-white text-slate-600 hover:border-brand-navy/20 hover:bg-slate-50 hover:text-brand-navy"
                }`}
              >
                <Bell className="h-[18px] w-[18px]" />

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-extrabold leading-none text-white shadow-sm ring-2 ring-white">
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div
                  id="lecturer-notification-menu"
                  className="absolute right-0 top-[calc(100%+10px)] z-[70] w-[calc(100vw-1.5rem)] max-w-[390px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15"
                >
                  {/* Notification Header */}
                  <div className="border-b border-slate-100 px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-bold text-slate-900">
                            Notifications
                          </h2>

                          {unreadCount > 0 && (
                            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">
                              {unreadCount} unread
                            </span>
                          )}
                        </div>

                        <p className="mt-0.5 text-xs text-slate-500">
                          Your latest academic updates
                        </p>
                      </div>

                      <Link
                        href={NOTIFICATIONS_PAGE}
                        onClick={() =>
                          setNotificationOpen(false)
                        }
                        className="shrink-0 text-xs font-semibold text-brand-navy transition hover:text-brand-gold hover:underline"
                      >
                        View all
                      </Link>
                    </div>

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        disabled={markingAllRead}
                        onClick={() =>
                          void handleMarkAllAsRead()
                        }
                        className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 transition hover:text-brand-navy disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {markingAllRead ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCheck className="h-3.5 w-3.5" />
                        )}

                        Mark all as read
                      </button>
                    )}
                  </div>

                  {/* Notification List */}
                  <div className="max-h-[390px] overflow-y-auto">
                    {notificationsLoading ? (
                      <div className="space-y-3 p-4">
                        {[1, 2, 3].map(
                          (item) => (
                            <div
                              key={item}
                              className="flex animate-pulse gap-3"
                            >
                              <div className="h-10 w-10 rounded-xl bg-slate-100" />

                              <div className="min-w-0 flex-1 space-y-2">
                                <div className="h-3 w-2/3 rounded bg-slate-100" />
                                <div className="h-3 w-full rounded bg-slate-100" />
                                <div className="h-2.5 w-1/3 rounded bg-slate-100" />
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    ) : notifications.length ===
                      0 ? (
                      <div className="px-4 py-10 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50">
                          <Bell className="h-6 w-6 text-slate-300" />
                        </div>

                        <p className="mt-3 text-sm font-semibold text-slate-700">
                          No notifications yet
                        </p>

                        <p className="mx-auto mt-1 max-w-[260px] text-xs leading-5 text-slate-400">
                          New announcements and academic updates will appear here.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {notifications.map(
                          (notification) => {
                            const Icon =
                              getNotificationIcon(
                                notification.type as NotificationType,
                              );

                            const isMarking =
                              markingNotificationId ===
                              notification._id;

                            return (
                              <div
                                key={notification._id}
                                className={`group relative px-4 py-3.5 transition ${
                                  notification.isRead
                                    ? "bg-white hover:bg-slate-50"
                                    : "bg-brand-navy/[0.025] hover:bg-brand-navy/[0.045]"
                                }`}
                              >
                                <div className="flex gap-3">
                                  <div
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${getNotificationIconStyle(
                                      notification.type as NotificationType,
                                    )}`}
                                  >
                                    <Icon className="h-4 w-4" />
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0">
                                        <p
                                          className={`line-clamp-1 text-xs ${
                                            notification.isRead
                                              ? "font-semibold text-slate-700"
                                              : "font-bold text-slate-900"
                                          }`}
                                        >
                                          {
                                            notification.title
                                          }
                                        </p>

                                        {!notification.isRead && (
                                          <span className="mt-1 inline-flex rounded-full bg-red-50 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-red-600">
                                            New
                                          </span>
                                        )}
                                      </div>

                                      <span className="shrink-0 text-[9px] font-medium text-slate-400">
                                        {formatNotificationDate(
                                          notification.createdAt,
                                        )}
                                      </span>
                                    </div>

                                    <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-slate-500">
                                      {
                                        notification.message
                                      }
                                    </p>

                                    <div className="mt-2 flex items-center gap-3">
                                      {notification.link && (
                                        <Link
                                          href={
                                            notification.link
                                          }
                                          onClick={() => {
                                            setNotificationOpen(
                                              false,
                                            );

                                            if (
                                              !notification.isRead
                                            ) {
                                              void handleMarkAsRead(
                                                notification,
                                              );
                                            }
                                          }}
                                          className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-navy transition hover:text-brand-gold"
                                        >
                                          Open
                                          <ExternalLink className="h-3 w-3" />
                                        </Link>
                                      )}

                                      {!notification.isRead && (
                                        <button
                                          type="button"
                                          disabled={
                                            isMarking
                                          }
                                          onClick={() =>
                                            void handleMarkAsRead(
                                              notification,
                                            )
                                          }
                                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 transition hover:text-brand-navy disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                          {isMarking ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                          ) : (
                                            <Check className="h-3 w-3" />
                                          )}

                                          Mark read
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {!notification.isRead && (
                                    <span className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-brand-gold" />
                                  )}
                                </div>
                              </div>
                            );
                          },
                        )}
                      </div>
                    )}
                  </div>

                  {/* Notification Footer */}
                  <div className="border-t border-slate-100 bg-slate-50/70 p-3">
                    <Link
                      href={NOTIFICATIONS_PAGE}
                      onClick={() =>
                        setNotificationOpen(false)
                      }
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-navy px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-navy/90 focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                    >
                      View all notifications
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="hidden h-8 w-px bg-slate-200 sm:block" />

            {/* ===================================================
                PROFILE / AVATAR
            ==================================================== */}
            <div
              ref={profileMenuRef}
              className="relative"
            >
              <button
                type="button"
                onClick={toggleProfile}
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                className={`group flex items-center gap-2 rounded-xl p-1.5 transition focus:outline-none focus:ring-2 focus:ring-brand-gold/40 ${
                  profileOpen
                    ? "bg-slate-100"
                    : "hover:bg-slate-50"
                }`}
              >
                {/* Avatar */}
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-brand-navy text-sm font-bold text-white shadow-sm ring-2 ring-brand-gold/20 transition group-hover:ring-brand-gold/40 sm:h-10 sm:w-10">
                    {session?.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt={lecturerName}
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>

                  {/* Online Indicator */}
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                </div>

                {/* Desktop User Info */}
                <div className="hidden max-w-[150px] text-left md:block">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {lecturerName}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    Lecturer
                  </p>
                </div>

                <ChevronDown
                  className={`hidden h-4 w-4 text-slate-400 transition-transform duration-200 md:block ${
                    profileOpen
                      ? "rotate-180 text-brand-navy"
                      : ""
                  }`}
                />
              </button>

              {/* =================================================
                  PROFILE DROPDOWN
              ================================================== */}
              {profileOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+10px)] z-[70] w-[calc(100vw-1.5rem)] max-w-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15"
                >
                  {/* Profile Identity */}
                  <div className="relative overflow-hidden bg-brand-navy px-4 py-5 text-white">
                    <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand-gold/10" />
                    <div className="absolute -bottom-12 -left-8 h-24 w-24 rounded-full bg-white/5" />

                    <div className="relative flex items-center gap-3">
                      <div className="relative">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-brand-gold/40 bg-white/10 text-sm font-bold text-white shadow-lg">
                          {session?.user?.image ? (
                            <Image
                              src={session.user.image}
                              alt={lecturerName}
                              width={48}
                              height={48}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            initials
                          )}
                        </div>

                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-brand-navy bg-emerald-400" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">
                          {lecturerName}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-white/60">
                          {lecturerEmail}
                        </p>

                        <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-brand-gold">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          Lecturer
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="p-2">
                    {/* Back to Website */}
                    <Link
                      href="/"
                      onClick={() =>
                        setProfileOpen(false)
                      }
                      role="menuitem"
                      className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-brand-navy/[0.05] hover:text-brand-navy"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-navy/[0.06] text-brand-navy transition group-hover:bg-brand-navy group-hover:text-white">
                        <Globe2 className="h-4 w-4" />
                      </span>

                      <span className="flex-1">
                        <span className="block">
                          Back to Website
                        </span>

                        <span className="mt-0.5 block text-[10px] font-normal text-slate-400">
                          Visit the public website
                        </span>
                      </span>

                      <ExternalLink className="h-3.5 w-3.5 text-slate-300 transition group-hover:text-brand-navy" />
                    </Link>

                    {/* Profile */}
                    <Link
                      href="/dashboards/lecturer/profile"
                      onClick={() =>
                        setProfileOpen(false)
                      }
                      role="menuitem"
                      className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-brand-navy"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition group-hover:bg-brand-navy/10 group-hover:text-brand-navy">
                        <UserRound className="h-4 w-4" />
                      </span>

                      <span className="flex-1">
                        <span className="block">
                          My Profile
                        </span>

                        <span className="mt-0.5 block text-[10px] font-normal text-slate-400">
                          View your lecturer profile
                        </span>
                      </span>
                    </Link>

                    {/* Settings */}
                    <Link
                      href="/dashboards/lecturer/settings"
                      onClick={() =>
                        setProfileOpen(false)
                      }
                      role="menuitem"
                      className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-brand-navy"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition group-hover:bg-brand-navy/10 group-hover:text-brand-navy">
                        <Settings className="h-4 w-4" />
                      </span>

                      <span className="flex-1">
                        <span className="block">
                          Settings
                        </span>

                        <span className="mt-0.5 block text-[10px] font-normal text-slate-400">
                          Manage your account
                        </span>
                      </span>
                    </Link>

                    {/* Divider */}
                    <div className="my-2 border-t border-slate-100" />

                    {/* Logout */}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={openLogoutModal}
                      className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500 transition group-hover:bg-red-100">
                        <LogOut className="h-4 w-4" />
                      </span>

                      <span className="flex-1">
                        <span className="block">
                          Sign out
                        </span>

                        <span className="mt-0.5 block text-[10px] font-normal text-red-400">
                          End your lecturer session
                        </span>
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================
          LOGOUT MODAL
      ========================================================== */}
      {logoutModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !isLoggingOut
            ) {
              setLogoutModalOpen(false);
            }
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl shadow-slate-950/30">
            {/* Modal Navy Header */}
            <div className="relative overflow-hidden bg-brand-navy px-6 pb-7 pt-6 text-white">
              <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-brand-gold/10" />
              <div className="absolute -bottom-16 -left-12 h-32 w-32 rounded-full bg-white/5" />

              <div className="relative flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-gold/20 bg-brand-gold/10 text-brand-gold">
                    <LogOut className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-gold">
                      Lecturer Portal
                    </p>

                    <h2
                      id="logout-title"
                      className="mt-1 text-lg font-bold"
                    >
                      Sign out?
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isLoggingOut}
                  onClick={() =>
                    setLogoutModalOpen(false)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-white/60 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Close logout dialog"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="relative mt-5 text-sm leading-6 text-white/65">
                Are you sure you want to sign out of
                your lecturer portal? You will need to
                authenticate again to access your
                dashboard.
              </p>
            </div>

            {/* Modal Body */}
            <div className="bg-white px-6 py-5">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-white">
                  {initials}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-800">
                    {lecturerName}
                  </p>

                  <p className="truncate text-xs text-slate-400">
                    {lecturerEmail}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/80 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={() =>
                  setLogoutModalOpen(false)
                }
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Stay signed in
              </button>

              <button
                type="button"
                disabled={isLoggingOut}
                onClick={() =>
                  void handleLogout()
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 text-sm font-bold text-white shadow-lg shadow-brand-navy/20 transition hover:bg-brand-navy/90 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing out...
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

