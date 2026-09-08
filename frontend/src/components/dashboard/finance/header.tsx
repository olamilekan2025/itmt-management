"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  CircleDollarSign,
  Loader2,
  ShieldCheck,
  Menu,
  Bell,
  Check,
  Info,
  CheckCheck,
  AlertTriangle,
  XCircle,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useFinanceDashboard } from "@/components/dashboard/finance/finance-dashboard-context";

import {
  getAdminNotifications,
  markNotificationAsRead,
  type AdminNotification,
  type NotificationType,
} from "@/lib/admin-notifications";

interface Props {
  userName: string;
}

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "FA"
  );
}

function formatRelativeTime(date: string) {
  const value = new Date(date);
  const diffMs = Date.now() - value.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (Number.isNaN(diffMins)) return "";

  if (diffMins < 1) return "Just now";

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }

  const diffHours = Math.floor(diffMins / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  return `${diffDays}d ago`;
}

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "success":
      return CheckCheck;

    case "warning":
      return AlertTriangle;

    case "error":
      return XCircle;

    default:
      return Info;
  }
}

function getNotificationIconClass(type: NotificationType) {
  switch (type) {
    case "success":
      return "bg-emerald-50 text-emerald-600";

    case "warning":
      return "bg-amber-50 text-amber-600";

    case "error":
      return "bg-red-50 text-red-600";

    default:
      return "bg-brand-gold/10 text-brand-navy";
  }
}

export default function FinanceHeader({ userName }: Props) {
  const { data: session } = useSession();

  const {
    collapsed,
    mobileOpen,
    setMobileOpen,
  } = useFinanceDashboard();

  const accessToken = session?.accessToken as string | undefined;

  const [notifications, setNotifications] = useState<
    AdminNotification[]
  >([]);

  const [unreadCount, setUnreadCount] = useState<number>(0);

  const [notifLoading, setNotifLoading] =
    useState<boolean>(true);

  const [markingId, setMarkingId] =
    useState<string | null>(null);

  const displayName =
    userName?.trim() ||
    session?.user?.name?.trim() ||
    "Finance User";

  const email =
    session?.user?.email ||
    "Finance & Accounts";

  const initials = getInitials(displayName);

  async function loadNotifications() {
    if (!accessToken) {
      setNotifLoading(false);
      return;
    }

    setNotifLoading(true);

    try {
      const response = await getAdminNotifications(
        accessToken,
        {
          page: 1,
          limit: 3,
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
        "Load header notifications error:",
        error,
      );
    } finally {
      setNotifLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();

    // Keep notification count fresh.
    const interval = setInterval(
      loadNotifications,
      60000,
    );

    return () => clearInterval(interval);

    // The access token is intentionally the only
    // dependency for the notification polling.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  async function handleMarkAsRead(
    notification: AdminNotification,
  ) {
    if (
      !accessToken ||
      notification.isRead
    ) {
      return;
    }

    setMarkingId(notification._id);

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

      setUnreadCount((current) =>
        Math.max(0, current - 1),
      );
    } catch (error) {
      console.error(
        "Mark as read error:",
        error,
      );
    } finally {
      setMarkingId(null);
    }
  }

  return (
    <header
      className={`
        fixed
        inset-x-0
        top-0
        z-40
        h-16
        border-b
        border-slate-200/80
        bg-white/90
        backdrop-blur-xl
        shadow-[0_1px_15px_rgba(15,23,42,0.05)]
        transition-[left]
        duration-300
        ease-in-out
        dark:border-slate-800
        dark:bg-slate-950/90
        md:left-[88px]
        ${collapsed ? "lg:left-[88px]" : "lg:left-72"}
      `}
    >
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-7">
        {/* =====================================================
            LEFT SIDE
        ====================================================== */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Mobile menu */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            title="Open menu"
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-white
              text-slate-600
              shadow-sm
              transition-all
              duration-200
              hover:border-brand-navy/20
              hover:bg-brand-navy/5
              hover:text-brand-navy
              focus:outline-none
              focus:ring-2
              focus:ring-brand-navy/20
              md:hidden
              dark:border-slate-800
              dark:bg-slate-900
              dark:text-slate-300
            "
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Finance icon */}
          <div
            className="
              hidden
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-brand-navy
              shadow-sm
              sm:flex
            "
          >
            <CircleDollarSign className="h-5 w-5 text-white" />
          </div>

          {/* Portal title */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p
                className="
                  truncate
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-slate-400
                  sm:text-[11px]
                "
              >
                Finance & Accounts
              </p>

              <span className="hidden items-center gap-1.5 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                <span className="text-[10px] font-medium text-emerald-600">
                  Online
                </span>
              </span>
            </div>

            <p
              className="
                truncate
                text-sm
                font-bold
                tracking-tight
                text-brand-navy
                sm:text-base
                dark:text-white
              "
            >
              Finance Portal
            </p>
          </div>
        </div>

        {/* =====================================================
            RIGHT SIDE
        ====================================================== */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* =================================================
              NOTIFICATIONS
          ================================================== */}
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Notifications"
              title="Notifications"
              className="
                relative
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                bg-white
                text-slate-500
                shadow-sm
                transition-all
                duration-200
                hover:border-brand-navy/20
                hover:bg-brand-navy/5
                hover:text-brand-navy
                focus:outline-none
                focus:ring-2
                focus:ring-brand-navy/20
                dark:border-slate-800
                dark:bg-slate-900
                dark:text-slate-400
              "
            >
              <Bell className="h-4 w-4" />

              {/* Notification badge */}
              {unreadCount > 0 && (
                <span
                  className="
                    absolute
                    -right-1
                    -top-1
                    flex
                    h-4
                    min-w-4
                    items-center
                    justify-center
                    rounded-full
                    bg-red-500
                    px-1
                    text-[10px]
                    font-bold
                    leading-none
                    text-white
                    ring-2
                    ring-white
                    dark:ring-slate-950
                  "
                >
                  {unreadCount > 9
                    ? "9+"
                    : unreadCount}
                </span>
              )}
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="
                w-80
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-0
                shadow-[0_20px_50px_rgba(15,23,42,0.15)]
                dark:border-slate-800
                dark:bg-slate-950
              "
            >
              {/* Notification header */}
              <div
                className="
                  flex
                  items-center
                  justify-between
                  border-b
                  border-slate-100
                  px-4
                  py-3
                  dark:border-slate-800
                "
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Notifications
                  </p>

                  <p className="mt-0.5 text-[10px] text-slate-400">
                    Finance account activity
                  </p>
                </div>

                {unreadCount > 0 && (
                  <span
                    className="
                      rounded-full
                      bg-brand-navy/5
                      px-2.5
                      py-1
                      text-[11px]
                      font-semibold
                      text-brand-navy
                    "
                  >
                    {unreadCount} unread
                  </span>
                )}
              </div>

              {/* Notification list */}
              <div className="max-h-80 overflow-y-auto">
                {notifLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-brand-navy" />

                      <span className="text-[11px] text-slate-400">
                        Loading notifications...
                      </span>
                    </div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
                    <div
                      className="
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-2xl
                        bg-slate-100
                        dark:bg-slate-900
                      "
                    >
                      <Bell className="h-5 w-5 text-slate-400" />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        No notifications yet
                      </p>

                      <p className="mt-1 text-[10px] text-slate-400">
                        You&apos;re all caught up.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
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
                            className={`
                              flex
                              gap-3
                              px-4
                              py-3
                              transition-colors
                              ${
                                notification.isRead
                                  ? "bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900"
                                  : "bg-brand-navy/[0.025] hover:bg-brand-navy/[0.045] dark:bg-brand-navy/[0.08] dark:hover:bg-brand-navy/[0.12]"
                              }
                            `}
                          >
                            {/* Icon */}
                            <div
                              className={`
                                flex
                                h-8
                                w-8
                                shrink-0
                                items-center
                                justify-center
                                rounded-lg
                                ${getNotificationIconClass(
                                  notification.type,
                                )}
                              `}
                            >
                              <Icon className="h-4 w-4" />
                            </div>

                            {/* Content */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p
                                  className={`
                                    text-xs
                                    leading-5
                                    ${
                                      notification.isRead
                                        ? "font-medium text-slate-700 dark:text-slate-300"
                                        : "font-semibold text-slate-900 dark:text-white"
                                    }
                                  `}
                                >
                                  {
                                    notification.title
                                  }
                                </p>

                                {!notification.isRead && (
                                  <span
                                    className="
                                      mt-1
                                      h-1.5
                                      w-1.5
                                      shrink-0
                                      rounded-full
                                      bg-brand-gold
                                    "
                                  />
                                )}
                              </div>

                              <p
                                className="
                                  mt-0.5
                                  line-clamp-2
                                  text-[11px]
                                  leading-5
                                  text-slate-500
                                  dark:text-slate-400
                                "
                              >
                                {
                                  notification.message
                                }
                              </p>

                              <div className="mt-1.5 flex items-center gap-2">
                                <span className="text-[10px] text-slate-400">
                                  {formatRelativeTime(
                                    notification.createdAt,
                                  )}
                                </span>

                                {!notification.isRead && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleMarkAsRead(
                                        notification,
                                      )
                                    }
                                    disabled={
                                      markingId ===
                                      notification._id
                                    }
                                    className="
                                      flex
                                      items-center
                                      gap-1
                                      text-[10px]
                                      font-semibold
                                      text-brand-navy
                                      transition-colors
                                      hover:text-brand-blue
                                      hover:underline
                                      disabled:cursor-not-allowed
                                      disabled:opacity-50
                                      dark:text-brand-gold
                                    "
                                  >
                                    {markingId ===
                                    notification._id ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Check className="h-3 w-3" />
                                    )}

                                    Mark read
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                )}
              </div>

              {/* View all */}
              <div
                className="
                  border-t
                  border-slate-100
                  p-2
                  dark:border-slate-800
                "
              >
                <Link
                  href="/dashboards/finance/notifications"
                  className="
                    flex
                    w-full
                    items-center
                    justify-center
                    rounded-xl
                    py-2.5
                    text-xs
                    font-semibold
                    text-brand-navy
                    transition-colors
                    hover:bg-brand-navy/5
                    dark:text-brand-gold
                    dark:hover:bg-brand-gold/5
                  "
                >
                  View all notifications
                </Link>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* =================================================
              FINANCE USER
          ================================================== */}
          <div
            className="
              flex
              items-center
              gap-2.5
              rounded-2xl
              border
              border-slate-200
              bg-slate-50/80
              px-2
              py-1.5
              sm:gap-3
              sm:px-3
              dark:border-slate-800
              dark:bg-slate-900/80
            "
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-gradient-to-br
                  from-brand-navy
                  to-brand-blue
                  text-xs
                  font-bold
                  text-white
                  shadow-sm
                  ring-2
                  ring-white
                  dark:ring-slate-950
                "
              >
                {initials}
              </div>

              {/* Online indicator */}
              <span
                className="
                  absolute
                  -bottom-0.5
                  -right-0.5
                  h-2.5
                  w-2.5
                  rounded-full
                  border-2
                  border-white
                  bg-emerald-500
                  dark:border-slate-950
                "
              />
            </div>

            {/* User information */}
            <div className="hidden min-w-0 md:block">
              <div className="flex items-center gap-1.5">
                <p
                  className="
                    max-w-[150px]
                    truncate
                    text-sm
                    font-semibold
                    text-slate-900
                    dark:text-white
                  "
                >
                  {displayName}
                </p>

                <ShieldCheck
                  className="h-3.5 w-3.5 shrink-0 text-brand-gold"
                  aria-label="Verified account"
                />
              </div>

              <p
                className="
                  max-w-[180px]
                  truncate
                  text-[11px]
                  text-slate-500
                  dark:text-slate-400
                "
              >
                {email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}