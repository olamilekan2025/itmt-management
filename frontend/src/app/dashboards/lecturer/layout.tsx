"use client";

import {
  useState,
  type ReactNode,
} from "react";

import {
  Bell,
  Menu,
  Search,
} from "lucide-react";

import LecturerSidebar from "@/components/dashboard/lecturer/lecturer-sidebar";

interface LecturerLayoutProps {
  children: ReactNode;
}

export default function LecturerLayout({
  children,
}: LecturerLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <LecturerSidebar
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* =====================================================
          MAIN APPLICATION AREA
      ====================================================== */}

      <div
        className={[
          "min-h-screen transition-[padding-left] duration-300",
          collapsed
            ? "lg:pl-[82px]"
            : "lg:pl-[280px]",
        ].join(" ")}
      >
        {/* ===================================================
            TOP HEADER
        ==================================================== */}

        <header
          className="
            sticky
            top-0
            z-30
            h-[72px]
            border-b
            border-slate-200
            bg-white/95
            backdrop-blur-xl
          "
        >
          <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* LEFT */}
            <div className="flex min-w-0 items-center gap-3">
              {/* Mobile menu */}
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open lecturer navigation"
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
                  transition
                  hover:border-brand-gold/40
                  hover:bg-slate-50
                  hover:text-brand-navy
                  lg:hidden
                "
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Page identity */}
              <div className="min-w-0">
                <p className="hidden text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold sm:block">
                  Lecturer Workspace
                </p>

                <h1 className="truncate text-sm font-bold text-brand-navy sm:text-base">
                  Academic Portal
                </h1>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search */}
              <button
                type="button"
                aria-label="Search"
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  text-slate-500
                  transition
                  hover:border-brand-gold/40
                  hover:bg-slate-50
                  hover:text-brand-navy
                "
              >
                <Search className="h-[18px] w-[18px]" />
              </button>

              {/* Notifications */}
              <button
                type="button"
                aria-label="Notifications"
                className="
                  relative
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  text-slate-500
                  transition
                  hover:border-brand-gold/40
                  hover:bg-slate-50
                  hover:text-brand-navy
                "
              >
                <Bell className="h-[18px] w-[18px]" />

                {/* Notification indicator */}
                <span
                  className="
                    absolute
                    right-2
                    top-2
                    h-2
                    w-2
                    rounded-full
                    bg-brand-gold
                    ring-2
                    ring-white
                  "
                />
              </button>
            </div>
          </div>
        </header>

        {/* ===================================================
            PAGE CONTENT
        ==================================================== */}

        <main className="min-h-[calc(100vh-72px)]">
          <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}