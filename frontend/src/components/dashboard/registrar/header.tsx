"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  User,
  X,
} from "lucide-react";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { apiGet } from "@/lib/api";

interface RegistrarHeaderProps {
  userName: string;
  onMenuClick?: () => void;
}

interface UnreadNotificationResponse {
  success: boolean;
  unreadCount: number;
}

export default function RegistrarHeader({
  userName,
  onMenuClick,
}: RegistrarHeaderProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] =
    useState(false);

  const displayName =
    userName?.trim() || "Registrar";

  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name.charAt(0).toUpperCase())
    .join("");

  /* =========================================================
     FETCH UNREAD NOTIFICATION COUNT
  ========================================================= */

  const loadUnreadNotifications = useCallback(async () => {
    if (!session?.accessToken) return;

    try {
      setIsLoadingNotifications(true);

      const response =
        await apiGet<UnreadNotificationResponse>(
          "/notifications/unread-count",
          session.accessToken,
        );

      setUnreadCount(
        Math.max(0, Number(response?.unreadCount ?? 0)),
      );
    } catch (error) {
      console.error(
        "Failed to load unread notifications:",
        error,
      );

      setUnreadCount(0);
    } finally {
      setIsLoadingNotifications(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    loadUnreadNotifications();

    const interval = window.setInterval(
      loadUnreadNotifications,
      30000,
    );

    return () => {
      window.clearInterval(interval);
    };
  }, [loadUnreadNotifications]);

  /* =========================================================
     HELPERS
  ========================================================= */

  const handleNotifications = () => {
    setProfileOpen(false);
    router.push("/dashboards/registrar/notifications");
  };

  const handleSignOut = async () => {
    setProfileOpen(false);

    await signOut({
      callbackUrl: "/auth/login",
    });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 shadow-[0_1px_12px_rgba(15,23,42,0.04)] backdrop-blur-xl">
      <div className="flex h-[72px] items-center justify-between px-3 sm:h-20 sm:px-5 lg:px-8">
        {/* =====================================================
            LEFT SECTION
        ===================================================== */}

        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          {/* Mobile menu */}
          <button
            type="button"
            onClick={onMenuClick}
            className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-200 hover:border-brand-navy/20 hover:bg-slate-50 hover:text-brand-navy active:scale-95 lg:hidden"
            aria-label="Open navigation"
            title="Open navigation"
          >
            <Menu className="h-[19px] w-[19px] transition-transform duration-200 group-hover:scale-105" />
          </button>

          {/* Brand mark */}
          <div className="hidden h-10 w-1 rounded-full bg-brand-gold sm:block" />

          {/* Page identity */}
          <div className="min-w-0">
            <div className="mb-0.5 hidden items-center gap-2 sm:flex">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">
                Registrar Portal
              </span>

              <span className="h-1 w-1 rounded-full bg-slate-300" />

              <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
                Academic Administration
              </span>
            </div>

            <div className="flex items-center gap-2">
              <h1 className="max-w-[190px] truncate text-[15px] font-bold text-brand-navy sm:max-w-[280px] sm:text-lg">
                Welcome, {displayName}
              </h1>

              {/* Desktop online indicator */}
              <span className="hidden items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-[9px] font-bold uppercase tracking-wide text-emerald-600">
                  Online
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* =====================================================
            RIGHT SECTION
        ===================================================== */}

        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Search */}
          <button
            type="button"
            className="group hidden h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 text-slate-400 transition-all duration-200 hover:border-slate-300 hover:bg-white hover:text-brand-navy md:flex lg:min-w-[150px]"
            aria-label="Search"
            title="Search"
          >
            <Search className="h-[16px] w-[16px] transition-transform duration-200 group-hover:scale-105" />

            <span className="text-xs font-semibold">
              Search
            </span>

            <kbd className="ml-auto hidden rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-bold text-slate-400 shadow-sm lg:inline">
              /
            </kbd>
          </button>

          {/* Mobile search */}
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-brand-navy active:scale-95 md:hidden"
            aria-label="Search"
            title="Search"
          >
            <Search className="h-[17px] w-[17px]" />
          </button>

          {/* Notifications */}
          <button
            type="button"
            onClick={handleNotifications}
            className={cn(
              "group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-white shadow-sm transition-all duration-200 active:scale-95",
              unreadCount > 0
                ? "border-brand-gold/30 text-brand-navy hover:border-brand-gold/50 hover:bg-brand-gold/[0.04]"
                : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-brand-navy",
            )}
            aria-label={
              unreadCount > 0
                ? `${unreadCount} unread notifications`
                : "Open notifications"
            }
            title="Notifications"
          >
            <Bell
              className={cn(
                "h-[18px] w-[18px] transition-transform duration-200",
                unreadCount > 0 &&
                  "group-hover:rotate-[-8deg]",
              )}
            />

            {/* Unread indicator */}
            {unreadCount > 0 && (
              <>
                <span className="absolute right-2 top-1.5 h-2 w-2 animate-pulse rounded-full bg-brand-gold ring-2 ring-white" />

                <span className="absolute -right-1.5 -top-1.5 flex min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-brand-navy px-1 py-0.5 text-[8px] font-bold leading-none text-white shadow-sm">
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              </>
            )}

            {/* Loading indicator */}
            {isLoadingNotifications &&
              unreadCount === 0 && (
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-slate-300" />
              )}
          </button>

          {/* Divider */}
          <div className="mx-1 hidden h-8 w-px bg-slate-200 sm:block" />

          {/* ===================================================
              PROFILE
          =================================================== */}

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setProfileOpen((open) => !open)
              }
              className={cn(
                "group flex items-center gap-2 rounded-xl p-1 transition-all duration-200",
                profileOpen
                  ? "bg-slate-100"
                  : "hover:bg-slate-50",
              )}
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              title="Account menu"
            >
              {/* Avatar */}
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-navy text-[11px] font-extrabold text-white shadow-sm ring-1 ring-brand-navy/10 transition-all duration-200 group-hover:shadow-md sm:h-10 sm:w-10">
                {/* Gold accent */}
                <span className="absolute inset-x-0 top-0 h-0.5 bg-brand-gold" />

                {initials || (
                  <User className="h-4 w-4" />
                )}

                {/* Online dot */}
                <span className="absolute bottom-0.5 right-0.5 h-2 w-2 rounded-full border-2 border-brand-navy bg-emerald-400" />
              </div>

              {/* User details */}
              <div className="hidden min-w-0 text-left lg:block">
                <p className="max-w-[135px] truncate text-xs font-bold text-slate-700">
                  {displayName}
                </p>

                <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Registrar
                </p>
              </div>

              <ChevronDown
                className={cn(
                  "hidden h-4 w-4 text-slate-400 transition-transform duration-200 lg:block",
                  profileOpen && "rotate-180 text-brand-navy",
                )}
              />
            </button>

            {/* =================================================
                PROFILE DROPDOWN
            ================================================= */}

            {profileOpen && (
              <>
                {/* Backdrop */}
                <button
                  type="button"
                  aria-label="Close account menu"
                  className="fixed inset-0 z-40 cursor-default bg-transparent"
                  onClick={() =>
                    setProfileOpen(false)
                  }
                />

                <div
                  className="absolute right-0 top-[calc(100%+10px)] z-50 w-[min(300px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.16)]"
                  role="menu"
                >
                  {/* Header */}
                  <div className="relative overflow-hidden bg-brand-navy px-4 py-4">
                    {/* Decorative glow */}
                    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-gold/10 blur-2xl" />

                    <div className="relative flex items-center gap-3">
                      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-sm font-extrabold text-white shadow-inner">
                        <span className="absolute inset-x-0 top-0 h-0.5 rounded-full bg-brand-gold" />

                        {initials || (
                          <User className="h-5 w-5" />
                        )}

                        <span className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full border-2 border-brand-navy bg-emerald-400" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white">
                          {displayName}
                        </p>

                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />

                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300">
                            Registrar
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="p-2">
                    <Link
  href="/dashboards/registrar/profile"
  role="menuitem"
  onClick={() => setProfileOpen(false)}
  className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200 hover:bg-slate-50"
>
  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-brand-navy/10 group-hover:text-brand-navy">
    <User className="h-4 w-4" />
  </span>

  <span className="flex-1">
    <span className="block text-xs font-bold text-slate-700">
      My Profile
    </span>

    <span className="mt-0.5 block text-[10px] text-slate-400">
      Manage your account
    </span>
  </span>

  <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
</Link>

                    <div className="my-1.5 h-px bg-slate-100" />

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleSignOut}
                      className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200 hover:bg-red-50"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 transition-colors group-hover:bg-red-100">
                        <LogOut className="h-4 w-4" />
                      </span>

                      <span className="flex-1">
                        <span className="block text-xs font-bold text-red-600">
                          Sign out
                        </span>

                        <span className="mt-0.5 block text-[10px] text-red-400">
                          End your current session
                        </span>
                      </span>
                    </button>
                  </div>

                  {/* Footer */}
                  <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-2.5">
                    <p className="text-center text-[9px] font-medium uppercase tracking-[0.14em] text-slate-400">
                      ITMT Management System
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

