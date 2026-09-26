
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCheck,
  CircleDollarSign,
  Info,
  Loader2,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  UserRound,
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
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return `${Math.floor(diffHours / 24)}d ago`;
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
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

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

      setNotifications(response.notifications ?? []);
      setUnreadCount(response.unreadCount ?? 0);
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

    const interval = setInterval(
      loadNotifications,
      60000,
    );

    return () => clearInterval(interval);

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

  async function handleLogout() {
    setLoggingOut(true);

    try {
      const { signOut } = await import(
        "next-auth/react"
      );

      await signOut({
        callbackUrl: "/auth/login",
      });
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <>
      <header
        className={`
          fixed
          inset-x-0
          top-0
          z-40
          h-[72px]
          border-b
          border-slate-200/80
          bg-white/90
          shadow-[0_1px_18px_rgba(15,23,42,0.05)]
          backdrop-blur-xl
          transition-[left]
          duration-300
          ease-in-out
          dark:border-slate-800
          dark:bg-slate-950/90
          md:left-[88px]
          ${collapsed ? "lg:left-[88px]" : "lg:left-72"}
        `}
      >
        <div className="flex h-full items-center justify-between gap-4 px-3 sm:px-5 lg:px-7">
          {/* LEFT */}
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="
                flex h-10 w-10 shrink-0 items-center justify-center
                rounded-xl border border-slate-200 bg-white
                text-slate-600 shadow-sm transition-all
                hover:border-brand-navy/20 hover:bg-brand-navy/5
                hover:text-brand-navy active:scale-95
                focus:outline-none focus:ring-2
                focus:ring-brand-gold/40
                md:hidden
              "
              aria-label="Open navigation"
            >
              <Menu className="h-[18px] w-[18px]" />
            </button>

            <div
              className="
                hidden h-10 w-10 shrink-0 items-center
                justify-center rounded-xl bg-brand-navy
                shadow-sm sm:flex
              "
            >
              <CircleDollarSign className="h-5 w-5 text-white" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-brand-gold sm:text-[11px]">
                  Finance Portal
                </span>

                <span className="hidden items-center gap-1.5 sm:flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[9px] font-bold uppercase tracking-wide text-emerald-600">
                    Online
                  </span>
                </span>
              </div>

              <p className="truncate text-[15px] font-bold tracking-tight text-brand-navy sm:text-lg dark:text-white">
                Finance & Accounts
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Notifications"
                className="
                  relative flex h-10 w-10 shrink-0
                  items-center justify-center rounded-xl
                  border border-slate-200 bg-white
                  text-slate-500 shadow-sm transition-all
                  hover:border-brand-gold/30 hover:bg-brand-gold/[0.04]
                  hover:text-brand-navy
                  focus:outline-none focus:ring-2
                  focus:ring-brand-gold/40
                "
              >
                <Bell className="h-[18px] w-[18px]" />

                {unreadCount > 0 && (
                  <span className="
                    absolute -right-1 -top-1 flex min-h-[18px]
                    min-w-[18px] items-center justify-center
                    rounded-full bg-brand-navy px-1
                    text-[8px] font-extrabold leading-none
                    text-white ring-2 ring-white
                  ">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={10}
                className="
                  w-[calc(100vw-24px)] max-w-[380px]
                  overflow-hidden rounded-2xl
                  border border-slate-200 bg-white p-0
                  shadow-[0_24px_70px_rgba(15,23,42,0.16)]
                "
              >
                <div className="border-b border-slate-100 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">
                        Notifications
                      </h2>

                      <p className="mt-0.5 text-[10px] text-slate-400">
                        Finance account activity
                      </p>
                    </div>

                    {unreadCount > 0 && (
                      <span className="rounded-full bg-brand-navy/5 px-2.5 py-1 text-[10px] font-bold text-brand-navy">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifLoading ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-10">
                      <Loader2 className="h-5 w-5 animate-spin text-brand-navy" />
                      <span className="text-[11px] text-slate-400">
                        Loading notifications...
                      </span>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50">
                        <Bell className="h-5 w-5 text-slate-300" />
                      </div>

                      <p className="mt-3 text-xs font-bold text-slate-700">
                        No notifications yet
                      </p>

                      <p className="mt-1 text-[10px] text-slate-400">
                        You&apos;re all caught up.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {notifications.map((notification) => {
                        const Icon =
                          getNotificationIcon(
                            notification.type,
                          );

                        return (
                          <div
                            key={notification._id}
                            className={`
                              flex gap-3 px-4 py-3.5
                              transition-colors
                              ${
                                notification.isRead
                                  ? "bg-white hover:bg-slate-50"
                                  : "bg-brand-navy/[0.025] hover:bg-brand-navy/[0.045]"
                              }
                            `}
                          >
                            <div
                              className={`
                                flex h-9 w-9 shrink-0
                                items-center justify-center
                                rounded-xl
                                ${getNotificationIconClass(
                                  notification.type,
                                )}
                              `}
                            >
                              <Icon className="h-4 w-4" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p
                                  className={`
                                    line-clamp-1 text-xs
                                    ${
                                      notification.isRead
                                        ? "font-semibold text-slate-700"
                                        : "font-bold text-slate-900"
                                    }
                                  `}
                                >
                                  {notification.title}
                                </p>

                                {!notification.isRead && (
                                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-gold" />
                                )}
                              </div>

                              <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-slate-500">
                                {notification.message}
                              </p>

                              <div className="mt-2 flex items-center gap-3">
                                <span className="text-[9px] text-slate-400">
                                  {formatRelativeTime(
                                    notification.createdAt,
                                  )}
                                </span>

                                {!notification.isRead && (
                                  <button
                                    type="button"
                                    disabled={
                                      markingId ===
                                      notification._id
                                    }
                                    onClick={() =>
                                      handleMarkAsRead(
                                        notification,
                                      )
                                    }
                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-navy hover:text-brand-gold disabled:opacity-50"
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
                      })}
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 bg-slate-50/70 p-3">
                  <Link
                    href="/dashboards/finance/notifications"
                    className="flex w-full items-center justify-center rounded-xl bg-brand-navy px-4 py-2.5 text-xs font-bold text-white transition hover:bg-brand-dark"
                  >
                    View all notifications
                  </Link>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden h-8 w-px bg-slate-200 sm:block" />

            {/* PROFILE */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setProfileOpen((value) => !value)
                }
                className="
                  group flex items-center gap-2
                  rounded-xl p-1.5 transition-all
                  hover:bg-slate-50
                  focus:outline-none
                  focus:ring-2 focus:ring-brand-gold/40
                "
                aria-expanded={profileOpen}
                aria-haspopup="menu"
              >
                <div className="relative">
                  <div className="
                    flex h-9 w-9 items-center justify-center
                    rounded-xl bg-brand-navy text-[11px]
                    font-extrabold text-white shadow-sm
                    ring-2 ring-brand-gold/20
                    sm:h-10 sm:w-10
                  ">
                    <span className="absolute inset-x-0 top-0 h-0.5 rounded-t-xl bg-brand-gold" />
                    {initials}
                  </div>

                  <span className="
                    absolute bottom-0 right-0 h-2.5 w-2.5
                    rounded-full border-2 border-white
                    bg-emerald-500
                  " />
                </div>

                <div className="hidden min-w-0 text-left md:block">
                  <div className="flex items-center gap-1">
                    <p className="max-w-[140px] truncate text-xs font-bold text-slate-800">
                      {displayName}
                    </p>

                    <ShieldCheck className="h-3.5 w-3.5 text-brand-gold" />
                  </div>

                  <p className="max-w-[160px] truncate text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Finance
                  </p>
                </div>
              </button>

              {profileOpen && (
                <div className="
                  absolute right-0 top-[calc(100%+10px)] z-50
                  w-[min(290px,calc(100vw-24px))]
                  overflow-hidden rounded-2xl
                  border border-slate-200 bg-white
                  shadow-[0_24px_70px_rgba(15,23,42,0.16)]
                ">
                  <div className="relative overflow-hidden bg-brand-navy px-4 py-4">
                    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-gold/10 blur-2xl" />

                    <div className="relative flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-sm font-bold text-white ring-1 ring-white/10">
                        {initials}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white">
                          {displayName}
                        </p>

                        <p className="mt-1 truncate text-[10px] uppercase tracking-[0.12em] text-slate-300">
                          Finance & Accounts
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <Link
                      href="/dashboards/finance/profile"
                      onClick={() => setProfileOpen(false)}
                      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-50"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-brand-navy/10 group-hover:text-brand-navy">
                        <UserRound className="h-4 w-4" />
                      </span>

                      <span className="flex-1">
                        <span className="block text-xs font-bold text-slate-700">
                          My Profile
                        </span>

                        <span className="mt-0.5 block text-[10px] text-slate-400">
                          Manage your account
                        </span>
                      </span>
                    </Link>

                    <Link
                      href="/dashboards/finance/settings"
                      onClick={() => setProfileOpen(false)}
                      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-slate-50"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-brand-navy/10 group-hover:text-brand-navy">
                        <Settings className="h-4 w-4" />
                      </span>

                      <span className="flex-1">
                        <span className="block text-xs font-bold text-slate-700">
                          Settings
                        </span>

                        <span className="mt-0.5 block text-[10px] text-slate-400">
                          Portal preferences
                        </span>
                      </span>
                    </Link>

                    <div className="my-1.5 h-px bg-slate-100" />

                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        setLogoutModalOpen(true);
                      }}
                      className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-red-50"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 group-hover:bg-red-100">
                        <LogOut className="h-4 w-4" />
                      </span>

                      <span>
                        <span className="block text-xs font-bold text-red-600">
                          Sign out
                        </span>

                        <span className="mt-0.5 block text-[10px] text-red-400">
                          End your current session
                        </span>
                      </span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-2.5">
                    <p className="text-center text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      ITMT Management System
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* LOGOUT MODAL */}
      {logoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="
            w-full max-w-[400px] overflow-hidden rounded-3xl
            border border-brand-gold/20 bg-brand-navy
            shadow-[0_30px_100px_rgba(15,23,42,0.45)]
          ">
            <div className="h-1 bg-gradient-to-r from-brand-gold/30 via-brand-gold to-brand-gold/30" />

            <div className="px-6 pb-6 pt-7">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-gold/15 text-brand-gold">
                  <AlertTriangle className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-white">
                    Sign out of Finance Portal?
                  </h2>

                  <p className="mt-1.5 text-sm leading-6 text-slate-300">
                    Are you sure you want to sign out?
                    You will need to authenticate again
                    to access your dashboard.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-white/10 bg-brand-dark/30 px-6 py-4">
              <button
                type="button"
                disabled={loggingOut}
                onClick={() => setLogoutModalOpen(false)}
                className="
                  rounded-xl border border-white/10
                  bg-white/5 px-4 py-2.5
                  text-sm font-semibold text-white
                  transition hover:bg-white/10
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={loggingOut}
                onClick={() => void handleLogout()}
                className="
                  inline-flex items-center gap-2 rounded-xl
                  bg-red-600 px-4 py-2.5 text-sm font-semibold
                  text-white shadow-sm transition
                  hover:bg-red-700 disabled:opacity-60
                "
              >
                {loggingOut ? (
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

