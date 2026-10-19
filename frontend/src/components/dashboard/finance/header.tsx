"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCheck,
  CircleDollarSign,
  Globe2,
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

import LogoutConfirmModal from "@/components/common/logout-confirm-modal";
import { logoutUser } from "@/lib/auth/sign-out";
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

  if (Number.isNaN(value.getTime())) return "";

  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);

  if (diffHours < 24) return `${diffHours}h ago`;

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

  const { collapsed, setMobileOpen } = useFinanceDashboard();

  const accessToken = session?.accessToken as string | undefined;

  const profileRef = useRef<HTMLDivElement>(null);
  const markingRef = useRef<Set<string>>(new Set());

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

  const email = session?.user?.email?.trim() || "Finance & Accounts";

  const initials = getInitials(displayName);

  // Load notifications and refresh every 60 seconds.
  const loadNotifications = useCallback(
    async (showLoading = false) => {
      if (!accessToken) {
        setNotifications([]);
        setUnreadCount(0);
        setNotifLoading(false);
        return;
      }

      if (showLoading) {
        setNotifLoading(true);
      }

      try {
        const response = await getAdminNotifications(accessToken, {
          page: 1,
          limit: 3,
        });

        setNotifications(response.notifications ?? []);
        setUnreadCount(response.unreadCount ?? 0);
      } catch (error) {
        console.error("Load finance notifications error:", error);
      } finally {
        setNotifLoading(false);
      }
    },
    [accessToken],
  );

  useEffect(() => {
    void loadNotifications(true);

    const interval = window.setInterval(() => {
      void loadNotifications();
    }, 60_000);

    return () => window.clearInterval(interval);
  }, [loadNotifications]);

  // Close the profile dropdown when clicking outside.
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // Close the profile dropdown with Escape.
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleMarkAsRead(
    notification: AdminNotification,
  ) {
    if (
      !accessToken ||
      notification.isRead ||
      markingRef.current.has(notification._id)
    ) {
      return;
    }

    markingRef.current.add(notification._id);
    setMarkingId(notification._id);

    try {
      await markNotificationAsRead(notification._id, accessToken);

      setNotifications((current) =>
        current.map((item) =>
          item._id === notification._id
            ? { ...item, isRead: true }
            : item,
        ),
      );

      setUnreadCount((current) => Math.max(0, current - 1));
    } catch (error) {
      console.error("Mark finance notification as read error:", error);
    } finally {
      markingRef.current.delete(notification._id);
      setMarkingId(null);
    }
  }

  function openLogoutModal() {
    setProfileOpen(false);
    setLogoutModalOpen(true);
  }

  function closeLogoutModal() {
    if (loggingOut) return;

    setLogoutModalOpen(false);
  }

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logoutUser("/");
    } catch (error) {
      console.error("Finance sign out error:", error);
      setLoggingOut(false);
      setLogoutModalOpen(false);
    }
  }

  return (
    <>
      <header
        className={`
          fixed inset-x-0 top-0 z-40 h-[72px]
          border-b border-slate-200/80
          bg-white/95
          shadow-[0_1px_18px_rgba(15,23,42,0.05)]
          backdrop-blur-xl
          transition-[left] duration-300 ease-in-out
          dark:border-slate-800 dark:bg-slate-950/95
          md:left-[88px]
          ${collapsed ? "lg:left-[88px]" : "lg:left-72"}
        `}
      >
        <div className="flex h-full items-center justify-between gap-3 px-3 sm:px-5 lg:px-7">
          {/* LEFT: MOBILE MENU AND PORTAL TITLE */}
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="
                flex h-10 w-10 shrink-0 items-center justify-center
                rounded-xl border border-slate-200 bg-white
                text-slate-600 shadow-sm transition
                hover:border-brand-navy/20 hover:bg-brand-navy/5
                hover:text-brand-navy active:scale-95
                focus:outline-none focus:ring-2 focus:ring-brand-gold/40
                md:hidden
              "
              aria-label="Open navigation"
            >
              <Menu className="h-[18px] w-[18px]" />
            </button>

            <div
              className="
                hidden h-10 w-10 shrink-0 items-center justify-center
                rounded-xl bg-brand-navy shadow-sm sm:flex
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
                Finance &amp; Accounts
              </p>
            </div>
          </div>

          {/* RIGHT: NOTIFICATIONS AND PROFILE */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* NOTIFICATIONS */}
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
                className="
                  relative flex h-10 w-10 shrink-0 items-center justify-center
                  rounded-xl border border-slate-200 bg-white
                  text-slate-500 shadow-sm transition
                  hover:border-brand-gold/30 hover:bg-brand-gold/[0.04]
                  hover:text-brand-navy
                  focus:outline-none focus:ring-2 focus:ring-brand-gold/40
                  data-[state=open]:border-brand-gold/40
                  data-[state=open]:bg-brand-gold/[0.06]
                "
              >
                <Bell className="h-[18px] w-[18px]" />

                {unreadCount > 0 && (
                  <span
                    className="
                      absolute -right-1 -top-1 flex min-h-[18px] min-w-[18px]
                      items-center justify-center rounded-full
                      bg-brand-navy px-1 text-[8px] font-extrabold
                      leading-none text-white ring-2 ring-white
                    "
                  >
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
                {/* HEADER */}
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

                {/* NOTIFICATION LIST */}
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
                        const Icon = getNotificationIcon(
                          notification.type,
                        );

                        const isMarking =
                          markingId === notification._id;

                        return (
                          <div
                            key={notification._id}
                            className={`
                              flex gap-3 px-4 py-3.5 transition-colors
                              ${
                                notification.isRead
                                  ? "bg-white hover:bg-slate-50"
                                  : "bg-brand-navy/[0.025] hover:bg-brand-navy/[0.045]"
                              }
                            `}
                          >
                            <div
                              className={`
                                flex h-9 w-9 shrink-0 items-center
                                justify-center rounded-xl
                                ${getNotificationIconClass(notification.type)}
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

                              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                                <span className="text-[9px] text-slate-400">
                                  {formatRelativeTime(
                                    notification.createdAt,
                                  )}
                                </span>

                                {!notification.isRead && (
                                  <button
                                    type="button"
                                    disabled={isMarking}
                                    onClick={() =>
                                      void handleMarkAsRead(notification)
                                    }
                                    className="
                                      inline-flex items-center gap-1
                                      text-[10px] font-bold text-brand-navy
                                      transition hover:text-brand-gold
                                      disabled:cursor-not-allowed
                                      disabled:opacity-50
                                    "
                                  >
                                    {isMarking ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Check className="h-3 w-3" />
                                    )}

                                    {isMarking ? "Marking..." : "Mark read"}
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

                {/* FOOTER */}
                <div className="border-t border-slate-100 bg-slate-50/70 p-3">
                  <Link
                    href="/dashboards/finance/notifications"
                    className="
                      flex w-full items-center justify-center
                      rounded-xl bg-brand-navy px-4 py-2.5
                      text-xs font-bold text-white transition
                      hover:bg-brand-dark
                      focus:outline-none focus:ring-2
                      focus:ring-brand-gold/50 focus:ring-offset-2
                    "
                  >
                    View all notifications
                  </Link>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden h-8 w-px bg-slate-200 sm:block" />

            {/* PROFILE DROPDOWN */}
            <div ref={profileRef} className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((value) => !value)}
                className="
                  group flex items-center gap-2 rounded-xl p-1.5
                  transition hover:bg-slate-50
                  focus:outline-none focus:ring-2 focus:ring-brand-gold/40
                "
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                aria-label="Open account menu"
              >
                <div className="relative">
                  <div
                    className="
                      relative flex h-9 w-9 items-center justify-center
                      overflow-hidden rounded-xl bg-brand-navy
                      text-[11px] font-extrabold text-white shadow-sm
                      ring-2 ring-brand-gold/20 sm:h-10 sm:w-10
                    "
                  >
                    <span className="absolute inset-x-0 top-0 h-0.5 bg-brand-gold" />
                    {initials}
                  </div>

                  <span
                    className="
                      absolute bottom-0 right-0 h-2.5 w-2.5
                      rounded-full border-2 border-white bg-emerald-500
                    "
                  />
                </div>

                <div className="hidden min-w-0 text-left md:block">
                  <div className="flex items-center gap-1">
                    <p className="max-w-[140px] truncate text-xs font-bold text-slate-800">
                      {displayName}
                    </p>

                    <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-brand-gold" />
                  </div>

                  <p className="max-w-[160px] truncate text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Finance
                  </p>
                </div>
              </button>

              {profileOpen && (
                <div
                  role="menu"
                  className="
                    absolute right-0 top-[calc(100%+10px)] z-50
                    w-[min(300px,calc(100vw-24px))]
                    overflow-hidden rounded-2xl
                    border border-slate-200 bg-white
                    shadow-[0_24px_70px_rgba(15,23,42,0.16)]
                  "
                >
                  {/* ACCOUNT DETAILS */}
                  <div className="relative overflow-hidden bg-brand-navy px-4 py-4">
                    <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-gold/10 blur-2xl" />

                    <div className="relative flex items-center gap-3">
                      <div
                        className="
                          flex h-12 w-12 shrink-0 items-center
                          justify-center rounded-xl bg-white/10
                          text-sm font-bold text-white ring-1 ring-white/10
                        "
                      >
                        {initials}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-white">
                          {displayName}
                        </p>

                        <p className="mt-1 truncate text-[11px] text-slate-300">
                          {email}
                        </p>

                        <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.12em] text-brand-gold">
                          Finance &amp; Accounts
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* MENU LINKS */}
                  <div className="p-2">
                    <Link
                      href="/dashboards/finance/profile"
                      role="menuitem"
                      onClick={() => setProfileOpen(false)}
                      className="
                        group flex items-center gap-3 rounded-xl
                        px-3 py-2.5 transition hover:bg-slate-50
                      "
                    >
                      <span
                        className="
                          flex h-8 w-8 shrink-0 items-center
                          justify-center rounded-lg bg-slate-100
                          text-slate-500 transition
                          group-hover:bg-brand-navy/10
                          group-hover:text-brand-navy
                        "
                      >
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
                      role="menuitem"
                      onClick={() => setProfileOpen(false)}
                      className="
                        group flex items-center gap-3 rounded-xl
                        px-3 py-2.5 transition hover:bg-slate-50
                      "
                    >
                      <span
                        className="
                          flex h-8 w-8 shrink-0 items-center
                          justify-center rounded-lg bg-slate-100
                          text-slate-500 transition
                          group-hover:bg-brand-navy/10
                          group-hover:text-brand-navy
                        "
                      >
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

                    <Link
                      href="/"
                      role="menuitem"
                      onClick={() => setProfileOpen(false)}
                      className="
                        group flex items-center gap-3 rounded-xl
                        px-3 py-2.5 transition hover:bg-slate-50
                      "
                    >
                      <span
                        className="
                          flex h-8 w-8 shrink-0 items-center
                          justify-center rounded-lg bg-slate-100
                          text-slate-500 transition
                          group-hover:bg-brand-navy/10
                          group-hover:text-brand-navy
                        "
                      >
                        <Globe2 className="h-4 w-4" />
                      </span>

                      <span className="flex-1">
                        <span className="block text-xs font-bold text-slate-700">
                          Back to Website
                        </span>

                        <span className="mt-0.5 block text-[10px] text-slate-400">
                          Visit the ITMT homepage
                        </span>
                      </span>
                    </Link>

                    <div className="my-1.5 h-px bg-slate-100" />

                    {/* SIGN OUT */}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={openLogoutModal}
                      className="
                        group flex w-full items-center gap-3
                        rounded-xl px-3 py-2.5 text-left
                        transition hover:bg-red-50
                        focus:outline-none focus:ring-2
                        focus:ring-red-200
                      "
                    >
                      <span
                        className="
                          flex h-8 w-8 shrink-0 items-center
                          justify-center rounded-lg bg-red-50
                          text-red-500 transition group-hover:bg-red-100
                        "
                      >
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

                  {/* BRAND FOOTER */}
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

      {/* SHARED LOGOUT CONFIRMATION MODAL */}
      <LogoutConfirmModal
        isOpen={logoutModalOpen}
        isLoading={loggingOut}
        onClose={closeLogoutModal}
        onConfirm={handleLogout}
      />
    </>
  );
}