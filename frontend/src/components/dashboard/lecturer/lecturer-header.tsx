

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCheck,
  ChevronDown,
  ExternalLink,
  Loader2,
  LogOut,
  Menu,
  Settings,
  UserRound,
  X,
}
from "lucide-react";
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
    case "success": return CheckCheck;
    case "warning": return AlertTriangle;
    case "error": return X;
    case "result": return Check;
    case "course": return UserRound;
    default: return Bell;
  }
}
function getNotificationIconStyle(type: NotificationType | string) {
  switch (type) {
    case "success": return "bg-emerald-50 text-emerald-600";
    case "warning": return "bg-amber-50 text-amber-600";
    case "error": return "bg-red-50 text-red-600";
    case "announcement": return "bg-brand-gold/10 text-brand-gold";
    case "result": return "bg-blue-50 text-blue-600";
    case "course": return "bg-indigo-50 text-indigo-600";
    case "registration": return "bg-violet-50 text-violet-600";
    default: return "bg-slate-100 text-slate-600";
  }
}

function formatNotificationDate(date: string) {
  const createdAt = new Date(date);
  if (Number.isNaN(createdAt.getTime())) return "";

  const difference = Date.now() - createdAt.getTime();
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (difference < minute) return "Just now";
  if (difference < hour) return `${Math.floor(difference / minute)}m ago`;
  if (difference < day) return `${Math.floor(difference / hour)}h ago`;
  if (difference < 7 * day) return `${Math.floor(difference / day)}d ago`;

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
  const [notifications, setNotifications] = useState<LecturerNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [markingNotificationId, setMarkingNotificationId] = useState<string | null>(null);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const lecturerName = session?.user?.name?.trim() || "Lecturer";
  const lecturerEmail = session?.user?.email?.trim() || "Lecturer account";
  const initials = lecturerName.split(" ").filter(Boolean).slice(0, 2)
    .map((name) => name.charAt(0).toUpperCase()).join("") || "L";

  const loadUnreadCount = useCallback(async () => {
    if (!accessToken) return;
    try {
      const response = await getUnreadNotificationCount(accessToken);
      if (response?.success) setUnreadCount(Math.max(0, Number(response.unreadCount ?? 0)));
    } catch (error) {
      console.error("Failed to load lecturer unread notification count:", error);
    }
  }, [accessToken]);

  const loadNotifications = useCallback(async (showLoader = false) => {
    if (!accessToken) return;
    if (showLoader) setNotificationsLoading(true);
    try {
      // The header is deliberately a preview: never show more than three items here.
      const response = await getLecturerNotifications(accessToken, { page: 1, limit: 3 });
      if (!response?.success) return;
      setNotifications(Array.isArray(response.notifications) ? response.notifications.slice(0, 3) : []);
      setUnreadCount(Math.max(0, Number(response.unreadCount ?? 0)));
    } catch (error) {
      console.error("Failed to load lecturer notifications:", error);
    } finally {
      if (showLoader) setNotificationsLoading(false);
    }
  }, [accessToken]);
useEffect(() => {
    if (status !== "authenticated" || !accessToken) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    void loadUnreadCount();
  }, [accessToken, loadUnreadCount, status]);

  useEffect(() => {
    if (status !== "authenticated" || !accessToken) return;
    const interval = window.setInterval(() => void loadUnreadCount(), 15_000);
    return () => window.clearInterval(interval);
  }, [accessToken, loadUnreadCount, status]);

  useEffect(() => {
    if (!accessToken) return;
    const refresh = () => {
      void loadUnreadCount();
      if (notificationOpen) void loadNotifications();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("notifications-updated", refresh);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("notifications-updated", refresh);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [accessToken, loadNotifications, loadUnreadCount, notificationOpen]);

  useEffect(() => {
    const closeMenus = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!notificationMenuRef.current?.contains(target)) setNotificationOpen(false);
      if (!profileMenuRef.current?.contains(target)) setProfileOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNotificationOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", closeMenus);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeMenus);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const handleMarkAsRead = async (notification: LecturerNotification) => {
    if (!accessToken || notification.isRead || markingNotificationId) return;
    setMarkingNotificationId(notification._id);
    try {
      await markNotificationAsRead(notification._id, accessToken);
      setNotifications((current) => current.map((item) =>
        item._id === notification._id ? { ...item, isRead: true } : item,
      ));
      await loadUnreadCount();
      window.dispatchEvent(new Event("notifications-updated"));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    } finally {
      setMarkingNotificationId(null);
    }
  };
 const handleMarkAllAsRead = async () => {
    if (!accessToken || unreadCount === 0 || markingAllRead) return;
    setMarkingAllRead(true);
    try {
      await markAllNotificationsAsRead(accessToken);
      setNotifications((current) => current.map((notification) => ({ ...notification, isRead: true })));
      setUnreadCount(0);
      window.dispatchEvent(new Event("notifications-updated"));
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
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

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ callbackUrl: "/auth/login" });
    } finally {
      setIsLoggingOut(false);
    }
  };
   return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="flex min-h-[76px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={onMenuClick} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-brand-navy/20 hover:bg-slate-50 hover:text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-gold/40 lg:hidden" aria-label="Open navigation menu">
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-lg font-bold tracking-tight text-brand-navy sm:text-xl">{title}</h1>
                <span className="hidden rounded-full bg-brand-gold/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-gold sm:inline-flex">Lecturer</span>
              </div>
              <p className="mt-0.5 hidden truncate text-xs text-slate-500 sm:block">{description}</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div ref={notificationMenuRef} className="relative">
              <button type="button" onClick={toggleNotifications} aria-expanded={notificationOpen} aria-controls="lecturer-notification-menu" className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition focus:outline-none focus:ring-2 focus:ring-brand-gold/40 ${notificationOpen ? "border-brand-navy/20 bg-brand-navy text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-brand-navy"}`} aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications"}>
                <Bell className="h-[18px] w-[18px]" />
                {unreadCount > 0 && <span className="absolute -right-1 -top-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-extrabold leading-none text-white shadow-sm ring-2 ring-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}
              </button>

              {notificationOpen && <div id="lecturer-notification-menu" className="absolute right-0 top-12 z-[60] w-[calc(100vw-2rem)] max-w-[380px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
                <div className="border-b border-slate-100 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div><div className="flex items-center gap-2"><h2 className="text-sm font-bold text-slate-900">Notifications</h2>{unreadCount > 0 && <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">{unreadCount} unread</span>}</div><p className="mt-0.5 text-xs text-slate-500">Your three latest academic updates</p></div>
                    <Link href={NOTIFICATIONS_PAGE} onClick={() => setNotificationOpen(false)} className="shrink-0 text-xs font-semibold text-brand-navy transition hover:text-brand-gold hover:underline">View all</Link>
                  </div>
                  {unreadCount > 0 && <button type="button" disabled={markingAllRead} onClick={() => void handleMarkAllAsRead()} className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 transition hover:text-brand-navy disabled:cursor-not-allowed disabled:opacity-50">{markingAllRead ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCheck className="h-3.5 w-3.5" />}Mark all as read</button>}
                </div>

                <div className="max-h-[390px] overflow-y-auto">
                  {notificationsLoading ? <div className="space-y-3 p-4">{[1, 2, 3].map((item) => <div key={item} className="flex animate-pulse gap-3"><div className="h-10 w-10 rounded-xl bg-slate-100" /><div className="min-w-0 flex-1 space-y-2"><div className="h-3 w-2/3 rounded bg-slate-100" /><div className="h-3 w-full rounded bg-slate-100" /><div className="h-2.5 w-1/3 rounded bg-slate-100" /></div></div>)}</div>
                    : notifications.length === 0 ? <div className="px-4 py-10 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50"><Bell className="h-6 w-6 text-slate-300" /></div><p className="mt-3 text-sm font-semibold text-slate-700">No notifications yet</p><p className="mx-auto mt-1 max-w-[260px] text-xs leading-5 text-slate-400">New announcements and academic updates will appear here.</p></div>
                    : <div className="divide-y divide-slate-100">{notifications.map((notification) => {
                      const Icon = getNotificationIcon(notification.type as NotificationType);
                      const isMarking = markingNotificationId === notification._id;
                      return <div key={notification._id} className={`group relative px-4 py-3.5 transition ${notification.isRead ? "bg-white hover:bg-slate-50" : "bg-brand-navy/[0.025] hover:bg-brand-navy/[0.045]"}`}>
                        <div className="flex gap-3"><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${getNotificationIconStyle(notification.type as NotificationType)}`}><Icon className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className={`line-clamp-1 text-xs ${notification.isRead ? "font-semibold text-slate-700" : "font-bold text-slate-900"}`}>{notification.title}</p>{!notification.isRead && <span className="mt-1 inline-flex rounded-full bg-red-50 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-red-600">New</span>}</div><span className="shrink-0 text-[9px] font-medium text-slate-400">{formatNotificationDate(notification.createdAt)}</span></div><p className="mt-1 line-clamp-2 text-[11px] leading-5 text-slate-500">{notification.message}</p><div className="mt-2 flex items-center gap-3">{notification.link && <Link href={notification.link} onClick={() => { setNotificationOpen(false); if (!notification.isRead) void handleMarkAsRead(notification); }} className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-navy transition hover:text-brand-gold">Open <ExternalLink className="h-3 w-3" /></Link>}{!notification.isRead && <button type="button" disabled={isMarking} onClick={() => void handleMarkAsRead(notification)} className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 transition hover:text-brand-navy disabled:cursor-not-allowed disabled:opacity-50">{isMarking ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}Mark read</button>}</div></div>{!notification.isRead && <span className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-brand-gold" />}</div>
                      </div>;
                    })}</div>}
                </div>
                 <div className="border-t border-slate-100 bg-slate-50/70 p-3"><Link href={NOTIFICATIONS_PAGE} onClick={() => setNotificationOpen(false)} className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-navy px-4 py-2.5 text-xs font-bold text-white transition hover:bg-brand-navy/90 focus:outline-none focus:ring-2 focus:ring-brand-gold/50">View all notifications <ExternalLink className="h-3.5 w-3.5" /></Link></div>
              </div>}
            </div>

            <div className="hidden h-8 w-px bg-slate-200 sm:block" />
            <div ref={profileMenuRef} className="relative"><button type="button" onClick={() => { setProfileOpen((value) => !value); setNotificationOpen(false); }} aria-expanded={profileOpen} className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-gold/40"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-white shadow-sm ring-2 ring-brand-gold/20">{initials}</div><div className="hidden max-w-[150px] text-left md:block"><p className="truncate text-sm font-semibold text-slate-900">{lecturerName}</p><p className="truncate text-xs text-slate-500">Lecturer</p></div><ChevronDown className={`hidden h-4 w-4 text-slate-400 transition-transform md:block ${profileOpen ? "rotate-180" : ""}`} /></button>
              {profileOpen && <div className="absolute right-0 top-12 z-[60] w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10"><div className="border-b border-slate-100 bg-slate-50/70 px-4 py-4"><div className="flex items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-white">{initials}</div><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-900">{lecturerName}</p><p className="truncate text-xs text-slate-500">{lecturerEmail}</p></div></div></div><div className="p-2"><Link href="/dashboards/lecturer/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-brand-navy"><Settings className="h-4 w-4 text-slate-400" />Account Settings</Link><button type="button" onClick={() => { setProfileOpen(false); setLogoutModalOpen(true); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"><LogOut className="h-4 w-4" />Sign out</button></div></div>}
            </div>
          </div>
        </div>
      </header>

      {logoutModalOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"><div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"><div className="px-6 pb-5 pt-6"><div className="flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50"><AlertTriangle className="h-5 w-5 text-red-600" /></div><div><h2 className="text-lg font-bold text-slate-900">Sign out of Lecturer Portal?</h2><p className="mt-1 text-sm leading-6 text-slate-500">Are you sure you want to sign out? You will need to authenticate again to access your dashboard.</p></div></div></div><div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4"><button type="button" disabled={isLoggingOut} onClick={() => setLogoutModalOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50">Cancel</button><button type="button" disabled={isLoggingOut} onClick={() => void handleLogout()} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">{isLoggingOut ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Signing out...</> : <><LogOut className="h-4 w-4" />Sign out</>}</button></div></div></div>}
    </>
  );
}