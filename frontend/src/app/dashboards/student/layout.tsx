
"use client";

import {
  Bell,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  Search,
  Settings,
  UserRound,
  X,
} from "lucide-react";

import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Toaster } from "sonner";

import StudentSidebar from "@/components/dashboard/student/student-sidebar";
import LogoutConfirmModal from "@/components/common/logout-confirm-modal";
import { logoutUser } from "@/lib/auth/sign-out";

/* =========================================================
   TYPES
========================================================= */

interface StudentLayoutProps {
  children: React.ReactNode;
}

/* =========================================================
   LAYOUT
========================================================= */

export default function StudentLayout({
  children,
}: StudentLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const { data: session, status } = useSession();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  /* =======================================================
     USER INFORMATION
  ======================================================= */

  const userName = session?.user?.name?.trim() || "Student";

  const userEmail =
    session?.user?.email?.trim() || "student@itmt.edu.ng";

  const matricNumber =
    (session?.user as { matricNumber?: string } | undefined)
      ?.matricNumber?.trim() || "Not assigned";

  const initials = useMemo(() => {
    const parts = userName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);

    return (
      parts
        .map((part) => part.charAt(0).toUpperCase())
        .join("") || "ST"
    );
  }, [userName]);

  /* =======================================================
     PAGE TITLE
  ======================================================= */

  const pageTitle = useMemo(() => {
    if (pathname === "/dashboards/student") {
      return "Dashboard";
    }

    const pageTitles: Array<[string, string]> = [
      ["/dashboards/student/courses", "My Courses"],
      ["/dashboards/student/registration", "Course Registration"],
      ["/dashboards/student/results", "Results"],
      ["/dashboards/student/academic-progress", "Academic Progress"],
      ["/dashboards/student/progress", "Academic Progress"],
      ["/dashboards/student/transcript", "Transcript"],
      ["/dashboards/student/attendance", "My Attendance"],
      ["/dashboards/student/finance", "School Fees"],
      ["/dashboards/student/payments", "Payment History"],
      ["/dashboards/student/outstanding", "Outstanding Fees"],
      ["/dashboards/student/announcements", "Announcements"],
      ["/dashboards/student/notifications", "Notifications"],
      ["/dashboards/student/documents", "My Documents"],
      ["/dashboards/student/profile", "My Profile"],
      ["/dashboards/student/settings", "Settings"],
    ];

    return (
      pageTitles.find(([route]) => pathname.startsWith(route))?.[1] ||
      "Student Portal"
    );
  }, [pathname]);

  /* =======================================================
     MOBILE SIDEBAR
  ======================================================= */

  const closeMobileSidebar = useCallback(() => {
    setMobileOpen(false);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileMenuOpen(false);
  }, [pathname]);

  /*
   * Close the mobile sidebar with Escape.
   * The shared logout modal manages its own Escape behavior.
   */
  useEffect(() => {
    if (!mobileOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  /*
   * Prevent background scrolling while the mobile sidebar
   * is open and restore the previous value on cleanup.
   */
  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  /* =======================================================
     PROFILE MENU
  ======================================================= */

  useEffect(() => {
    if (!profileMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (
        target instanceof Node &&
        !profileMenuRef.current?.contains(target)
      ) {
        setProfileMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileMenuOpen]);

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const navigateTo = useCallback(
    (route: string) => {
      setProfileMenuOpen(false);
      router.push(route);
    },
    [router],
  );

  /* =======================================================
     LOGOUT
  ======================================================= */

  const openLogoutModal = useCallback(() => {
    setProfileMenuOpen(false);
    setMobileOpen(false);
    setLogoutModalOpen(true);
  }, []);

  const closeLogoutModal = useCallback(() => {
    if (loggingOut) return;

    setLogoutModalOpen(false);
  }, [loggingOut]);

  const handleLogout = useCallback(async () => {
    if (loggingOut) return;

    try {
      setLoggingOut(true);
      await logoutUser("/");
    } catch (error) {
      console.error("Student logout failed:", error);
      setLoggingOut(false);
      setLogoutModalOpen(false);
    }
  }, [loggingOut]);

  /* =======================================================
     AUTH LOADING
  ======================================================= */

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <div className="flex min-h-screen">
          <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white p-6 lg:block">
            <div className="mb-10 flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
                <div className="h-2.5 w-20 animate-pulse rounded bg-slate-100" />
              </div>
            </div>

            <div className="space-y-3">
              {Array.from({ length: 7 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-xl px-3 py-3"
                >
                  <div className="h-5 w-5 animate-pulse rounded-md bg-slate-200" />
                  <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
                </div>
              ))}
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <header className="flex h-[72px] items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
              <div className="space-y-2">
                <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-52 animate-pulse rounded bg-slate-100" />
              </div>
              <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />
            </header>

            <main className="space-y-6 p-4 sm:p-6 lg:p-8">
              <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200" />
              <div className="h-4 w-72 max-w-full animate-pulse rounded bg-slate-100" />

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-36 animate-pulse rounded-2xl border border-slate-100 bg-white"
                  />
                ))}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen overflow-x-clip bg-[#FAFAFA]">
      <Toaster position="top-right" richColors closeButton />

      {/* MOBILE BACKDROP */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close student menu"
          onClick={closeMobileSidebar}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* SIDEBAR */}

      <StudentSidebar
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={closeMobileSidebar}
      />

      {/* MAIN AREA */}

      <div
        className={`min-h-screen transition-[padding] duration-300 ease-in-out ${
          collapsed ? "lg:pl-[88px]" : "lg:pl-72"
        }`}
      >
        {/* HEADER */}

        <header className="sticky top-0 z-30 h-[72px] border-b border-slate-200/80 bg-white/95 shadow-[0_1px_12px_rgba(15,23,42,0.03)] backdrop-blur-md">
          <div className="flex h-full items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8 xl:px-10">
            {/* LEFT SIDE */}

            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen((current) => !current)}
                aria-label={
                  mobileOpen ? "Close student menu" : "Open student menu"
                }
                aria-expanded={mobileOpen}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-brand-gold/40 hover:bg-brand-gold/5 hover:text-brand-navy active:scale-95 lg:hidden"
              >
                {mobileOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>

              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="hidden shrink-0 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-gold sm:block">
                    Student Portal
                  </span>

                  <span className="hidden h-1 w-1 shrink-0 rounded-full bg-slate-300 sm:block" />

                  <h1 className="truncate text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                    {pageTitle}
                  </h1>
                </div>

                <p className="mt-0.5 hidden truncate text-xs text-slate-400 sm:block">
                  Manage your academic journey and student account
                </p>
              </div>
            </div>

            {/* RIGHT SIDE */}

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              {/* SEARCH */}

              <button
                type="button"
                onClick={() => navigateTo("/dashboards/student/courses")}
                aria-label="Search student portal"
                title="Search courses"
                className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition-colors hover:border-brand-gold/40 hover:bg-brand-gold/5 hover:text-brand-navy active:scale-95 sm:flex"
              >
                <Search className="h-4 w-4" />
              </button>

              {/* NOTIFICATIONS */}

              <button
                type="button"
                onClick={() =>
                  navigateTo("/dashboards/student/notifications")
                }
                aria-label="Open notifications"
                title="Notifications"
                className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:border-brand-gold/40 hover:bg-brand-gold/5 hover:text-brand-navy active:scale-95"
              >
                <Bell className="h-4 w-4" />

                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brand-gold ring-2 ring-white" />
              </button>

              <div className="hidden h-8 w-px bg-slate-200 sm:block" />

              {/* STUDENT PROFILE */}

              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() =>
                    setProfileMenuOpen((current) => !current)
                  }
                  aria-label="Open student profile"
                  aria-expanded={profileMenuOpen}
                  aria-haspopup="menu"
                  className="group flex min-w-0 items-center gap-2 rounded-xl px-1.5 py-1 transition-colors hover:bg-slate-50 active:scale-[0.98] sm:gap-2.5"
                >
                  {/* AVATAR */}

                  <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-gold to-brand-gold/70 text-[11px] font-bold text-brand-navy shadow-sm ring-1 ring-brand-gold/20">
                    {initials}

                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
                  </div>

                  {/* USER DETAILS */}

                  <div className="hidden min-w-0 text-left md:block">
                    <p
                      className="max-w-[150px] truncate text-xs font-semibold text-slate-800"
                      title={userName}
                    >
                      {userName}
                    </p>

                    <p
                      className="max-w-[150px] truncate text-[10px] text-slate-400"
                      title={userEmail}
                    >
                      {userEmail}
                    </p>
                  </div>

                  <ChevronDown
                    className={`hidden h-3.5 w-3.5 shrink-0 text-slate-300 transition-transform duration-200 group-hover:text-brand-gold md:block ${
                      profileMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* PROFILE DROPDOWN */}

                {profileMenuOpen && (
                  <div
                    role="menu"
                    aria-label="Student account menu"
                    className="absolute right-0 top-full z-50 mt-2 w-[min(16rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.12)] animate-in fade-in slide-in-from-top-2"
                  >
                    {/* MENU HEADER */}

                    <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-gold to-brand-gold/70 text-[11px] font-bold text-brand-navy shadow-sm">
                          {initials}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {userName}
                          </p>

                          <p className="truncate text-xs text-slate-500">
                            {matricNumber}
                          </p>

                          <p className="truncate text-[11px] text-slate-400">
                            {userEmail}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* MENU ITEMS */}

                    <div className="p-2">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() =>
                          navigateTo("/dashboards/student/profile")
                        }
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-brand-navy"
                      >
                        <UserRound className="h-4 w-4 text-slate-400" />
                        <span>View Profile</span>
                        <ChevronRight className="ml-auto h-3.5 w-3.5 text-slate-300" />
                      </button>

                      <button
                        type="button"
                        role="menuitem"
                        onClick={() =>
                          navigateTo("/dashboards/student/settings")
                        }
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-brand-navy"
                      >
                        <Settings className="h-4 w-4 text-slate-400" />
                        <span>Settings</span>
                        <ChevronRight className="ml-auto h-3.5 w-3.5 text-slate-300" />
                      </button>

                      <div className="my-1 border-t border-slate-100" />

                      <button
                        type="button"
                        role="menuitem"
                        onClick={openLogoutModal}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}

        <main className="min-h-[calc(100vh-72px)] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 xl:px-10 xl:py-10">
          <div className="mx-auto w-full max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>

      {/* SHARED LOGOUT CONFIRMATION MODAL */}

      <LogoutConfirmModal
        isOpen={logoutModalOpen}
        isLoading={loggingOut}
        onClose={closeLogoutModal}
        onConfirm={handleLogout}
      />
    </div>
  );
}
