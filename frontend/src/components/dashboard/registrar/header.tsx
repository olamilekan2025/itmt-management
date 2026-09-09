"use client";

import { useState } from "react";
import {
  Bell,
  ChevronDown,
  Menu,
  Search,
  User,
} from "lucide-react";
import { signOut } from "next-auth/react";

import { cn } from "@/lib/utils";

interface RegistrarHeaderProps {
  userName: string;
  onMenuClick?: () => void;
}

export default function RegistrarHeader({
  userName,
  onMenuClick,
}: RegistrarHeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);

  const initials = userName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((name) => name.charAt(0).toUpperCase())
    .join("");

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      {/* Left */}
      <div className="flex min-w-0 items-center gap-3">
        {/* Mobile menu */}
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-brand-navy lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="hidden text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 sm:block">
              Registrar Portal
            </p>

            <span className="hidden h-1 w-1 rounded-full bg-brand-gold sm:block" />

            <span className="hidden text-xs font-medium text-slate-400 md:block">
              Academic Administration
            </span>
          </div>

          <h1 className="truncate text-base font-bold text-brand-navy sm:text-lg">
            Welcome, {userName}
          </h1>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search */}
        <button
          type="button"
          className="hidden h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-400 transition hover:border-slate-300 hover:bg-white hover:text-slate-600 md:flex"
        >
          <Search className="h-4 w-4" />

          <span className="text-xs font-medium">
            Search
          </span>

          <kbd className="ml-2 hidden rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 lg:inline">
            /
          </kbd>
        </button>

        {/* Notifications */}
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-brand-navy"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" />

          {/* Notification indicator */}
          <span className="absolute right-2.5 top-2 h-2 w-2 rounded-full bg-brand-gold ring-2 ring-white" />
        </button>

        {/* Divider */}
        <div className="mx-1 hidden h-8 w-px bg-slate-200 sm:block" />

        {/* Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((open) => !open)}
            className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-50"
            aria-expanded={profileOpen}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-navy text-xs font-bold text-white shadow-sm">
              {initials || <User className="h-4 w-4" />}
            </div>

            <div className="hidden text-left lg:block">
              <p className="max-w-32 truncate text-xs font-semibold text-slate-700">
                {userName}
              </p>

              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Registrar
              </p>
            </div>

            <ChevronDown
              className={cn(
                "hidden h-4 w-4 text-slate-400 transition-transform lg:block",
                profileOpen && "rotate-180",
              )}
            />
          </button>

          {/* Profile dropdown */}
          {profileOpen && (
            <>
              <button
                type="button"
                aria-label="Close profile menu"
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setProfileOpen(false)}
              />

              <div className="absolute right-0 top-14 z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
                <div className="border-b border-slate-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy text-sm font-bold text-white">
                      {initials || (
                        <User className="h-5 w-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {userName}
                      </p>

                      <p className="text-xs text-slate-400">
                        Registrar
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-600 transition hover:bg-slate-50 hover:text-brand-navy"
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      signOut({
                        callbackUrl: "/auth/login",
                      })
                    }
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-red-500 transition hover:bg-red-50"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-4 w-4"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <path d="m16 17 5-5-5-5" />
                        <path d="M21 12H9" />
                      </svg>
                    </span>

                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}