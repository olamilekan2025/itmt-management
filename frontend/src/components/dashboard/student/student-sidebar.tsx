
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  CalendarCheck,
  ChevronDown,
  ClipboardList,
  CreditCard,
  FileBarChart,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  PanelLeftClose,
  PanelLeftOpen,
  Receipt,
  Settings,
  ShieldCheck,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";

import LogoutConfirmModal from "@/components/common/logout-confirm-modal";
import { logoutUser } from "@/lib/auth/sign-out";

/* =========================================================
   TYPES
========================================================= */

interface StudentSidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  onClose?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  description?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

/* =========================================================
   NAVIGATION
========================================================= */

const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboards/student",
        icon: LayoutDashboard,
        description: "Student dashboard",
      },
    ],
  },
  {
    title: "Academic",
    items: [
      {
        label: "My Courses",
        href: "/dashboards/student/courses",
        icon: BookOpen,
        description: "View my courses",
      },
      {
        label: "Course Registration",
        href: "/dashboards/student/registration",
        icon: ClipboardList,
        description: "Register for courses",
      },
      {
        label: "Results",
        href: "/dashboards/student/results",
        icon: BarChart3,
        description: "View my results",
      },
      {
        label: "Academic Progress",
        href: "/dashboards/student/academic-progress",
        icon: GraduationCap,
        description: "Track my progress",
      },
      {
        label: "Transcript",
        href: "/dashboards/student/transcript",
        icon: FileText,
        description: "My transcript",
      },
    ],
  },
  {
    title: "Attendance",
    items: [
      {
        label: "My Attendance",
        href: "/dashboards/student/attendance",
        icon: CalendarCheck,
        description: "Attendance records",
      },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        label: "School Fees",
        href: "/dashboards/student/finance",
        icon: WalletCards,
        description: "Fee information",
      },
      {
        label: "Payment History",
        href: "/dashboards/student/payments",
        icon: Receipt,
        description: "Payment records",
      },
      {
        label: "Outstanding Fees",
        href: "/dashboards/student/outstanding",
        icon: CreditCard,
        description: "Outstanding balance",
      },
    ],
  },
  {
    title: "Communication",
    items: [
      {
        label: "Announcements",
        href: "/dashboards/student/announcements",
        icon: MessageSquareText,
        description: "School announcements",
      },
      {
        label: "Notifications",
        href: "/dashboards/student/notifications",
        icon: Bell,
        description: "My notifications",
      },
    ],
  },
  {
    title: "Documents",
    items: [
      {
        label: "My Documents",
        href: "/dashboards/student/documents",
        icon: FileBarChart,
        description: "Student documents",
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        label: "My Profile",
        href: "/dashboards/student/profile",
        icon: UserRound,
        description: "My profile",
      },
      {
        label: "Settings",
        href: "/dashboards/student/settings",
        icon: Settings,
        description: "Account settings",
      },
    ],
  },
];

/* =========================================================
   HELPERS
========================================================= */

function getInitials(
  name?: string | null,
  email?: string | null,
) {
  const value = name?.trim() || email?.trim() || "Student";

  const parts = value.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return value.slice(0, 2).toUpperCase();
}

/* =========================================================
   COMPONENT
========================================================= */

export default function StudentSidebar({
  collapsed = false,
  onCollapsedChange,
  mobileOpen = false,
  onMobileClose,
  onClose,
}: StudentSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  /* =======================================================
     USER
  ======================================================= */

  const user = session?.user;

  const userName = user?.name?.trim() || "Student";
  const userEmail = user?.email?.trim() || "student@itmt.edu.ng";
  const userImage = user?.image || null;

  const initials = getInitials(user?.name, user?.email);

  /* =======================================================
     ACTIVE NAVIGATION
  ======================================================= */

  const activeHref = useMemo(() => {
    let bestMatch = "";

    for (const section of navSections) {
      for (const item of section.items) {
        const matches =
          pathname === item.href ||
          pathname.startsWith(`${item.href}/`);

        if (matches && item.href.length > bestMatch.length) {
          bestMatch = item.href;
        }
      }
    }

    return bestMatch;
  }, [pathname]);

  /* =======================================================
     CLOSE NAVIGATION / PROFILE
  ======================================================= */

  const handleMobileClose = useCallback(() => {
    onMobileClose?.();
    onClose?.();
    setProfileOpen(false);
  }, [onMobileClose, onClose]);

  const handleNavClick = useCallback(() => {
    handleMobileClose();
  }, [handleMobileClose]);

  useEffect(() => {
    setProfileOpen(false);
  }, [pathname]);

  /* =======================================================
     ESCAPE KEY
  ======================================================= */

  useEffect(() => {
    if (!mobileOpen || logoutOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleMobileClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [mobileOpen, logoutOpen, handleMobileClose]);

  /* =======================================================
     SIDEBAR COLLAPSE
  ======================================================= */

  const handleToggleSidebar = () => {
    onCollapsedChange?.(!collapsed);
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const openLogoutModal = () => {
    if (loggingOut) return;

    setProfileOpen(false);
    handleMobileClose();
    setLogoutOpen(true);
  };

  const closeLogoutModal = () => {
    if (loggingOut) return;

    setLogoutOpen(false);
  };

  const handleLogout = async () => {
    if (loggingOut) return;

    try {
      setLoggingOut(true);
      await logoutUser("/");
    } catch (error) {
      console.error("Student sidebar logout failed:", error);

      setLoggingOut(false);
      setLogoutOpen(false);
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      {/* MOBILE OVERLAY */}

      <button
        type="button"
        aria-label="Close student navigation"
        tabIndex={mobileOpen ? 0 : -1}
        onClick={handleMobileClose}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* SIDEBAR */}

      <aside
        id="student-sidebar"
        aria-label="Student navigation"
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh flex-col overflow-hidden border-r border-white/[0.07] bg-brand-navy text-white shadow-[12px_0_45px_rgba(0,0,0,0.14)] transition-[width,transform] duration-300 ease-out ${
          collapsed ? "w-[88px]" : "w-72"
        } ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* BACKGROUND DECORATION */}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-20 h-56 w-56 rounded-full bg-brand-gold/[0.05] blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 bottom-24 h-64 w-64 rounded-full bg-blue-500/[0.035] blur-3xl"
        />

        {/* LOGO */}

        <div
          className={`relative shrink-0 pt-5 transition-all duration-300 ${
            collapsed ? "px-3" : "px-5"
          }`}
        >
          <div className="group/logo-control relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.09] via-white/[0.045] to-white/[0.015] shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-300 hover:border-brand-gold/25 hover:shadow-[0_16px_50px_rgba(0,0,0,0.20)]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand-gold/10 blur-3xl transition-colors duration-500 group-hover/logo-control:bg-brand-gold/20"
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-10 -left-10 h-20 w-20 rounded-full bg-blue-400/5 blur-2xl"
            />

            <button
              type="button"
              onClick={handleToggleSidebar}
              disabled={!onCollapsedChange}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={`group/logo relative z-10 flex w-full items-center rounded-xl outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-brand-gold/50 ${
                collapsed
                  ? "justify-center p-3"
                  : "justify-start gap-3 p-1"
              }`}
            >
              {/* LOGO IMAGE */}

              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] ring-1 ring-white/20 transition-all duration-300 group-hover/logo:scale-[1.04] group-hover/logo:shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
                <Image
                  src="/newLogo.png"
                  alt="ITMT logo"
                  fill
                  sizes="48px"
                  priority
                  className="object-contain p-1.5 transition-all duration-300 ease-out group-hover/logo:scale-75 group-hover/logo:opacity-0"
                />

                <span className="absolute inset-0 flex scale-75 items-center justify-center bg-brand-gold text-brand-navy opacity-0 transition-all duration-300 ease-out group-hover/logo:scale-100 group-hover/logo:opacity-100">
                  {collapsed ? (
                    <PanelLeftOpen className="h-5 w-5" strokeWidth={2.2} />
                  ) : (
                    <PanelLeftClose className="h-5 w-5" strokeWidth={2.2} />
                  )}
                </span>
              </div>

              {/* BRAND TEXT */}

              <div
                className={`min-w-0 overflow-hidden text-left transition-all duration-300 ${
                  collapsed
                    ? "w-0 -translate-x-2 opacity-0"
                    : "w-auto translate-x-0 opacity-100"
                }`}
              >
                <p className="whitespace-nowrap text-sm font-bold tracking-tight text-white">
                  ITMT
                </p>

                <p className="mt-0.5 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.16em] text-white/40">
                  Student Portal
                </p>
              </div>
            </button>

            {/* ONLINE STATUS */}

            <div
              className={`relative flex items-center gap-2 transition-all duration-300 ${
                collapsed
                  ? "mt-3 justify-center pb-3"
                  : "mt-4 pb-1"
              }`}
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>

              {!collapsed && (
                <span className="whitespace-nowrap text-[10px] font-medium text-white/45">
                  Student portal online
                </span>
              )}
            </div>
          </div>
        </div>

        {/* NAVIGATION */}

        <nav
          aria-label="Student portal sections"
          className="relative flex-1 overflow-y-auto overflow-x-hidden px-3 pb-6 pt-5"
        >
          <div className="space-y-6">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-2">
                {/* SECTION LABEL */}

                <div
                  className={`flex items-center px-3 transition-all duration-300 ${
                    collapsed ? "justify-center px-0" : "justify-between"
                  }`}
                >
                  {collapsed ? (
                    <span className="h-px w-6 bg-white/10" />
                  ) : (
                    <>
                      <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">
                        {section.title}
                      </span>

                      <div className="ml-3 h-px flex-1 bg-white/[0.05]" />
                    </>
                  )}
                </div>

                {/* SECTION LINKS */}

                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeHref === item.href;

                    return (
                      <Link
                        key={`${section.title}-${item.href}`}
                        href={item.href}
                        onClick={handleNavClick}
                        title={collapsed ? item.label : item.description}
                        aria-current={isActive ? "page" : undefined}
                        className={`group/nav relative flex min-h-[46px] w-full items-center gap-3 overflow-visible rounded-xl px-3 text-sm transition-all duration-200 ${
                          collapsed ? "justify-center px-0" : ""
                        } ${
                          isActive
                            ? "bg-white/[0.10] text-white shadow-[0_6px_22px_rgba(0,0,0,0.10)]"
                            : "text-white/55 hover:bg-white/[0.055] hover:text-white"
                        }`}
                      >
                        {/* ACTIVE INDICATOR */}

                        <span
                          aria-hidden="true"
                          className={`absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-full bg-brand-gold transition-opacity duration-200 ${
                            isActive ? "opacity-100" : "opacity-0"
                          }`}
                        />

                        {/* ICON */}

                        <span
                          className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
                            isActive
                              ? "bg-brand-gold/15 text-brand-gold"
                              : "bg-white/[0.035] text-white/45 group-hover/nav:bg-white/[0.07] group-hover/nav:text-white"
                          }`}
                        >
                          <Icon
                            className="h-[18px] w-[18px] transition-transform duration-200 group-hover/nav:scale-105"
                            strokeWidth={isActive ? 2.2 : 1.8}
                          />
                        </span>

                        {/* LABEL */}

                        {!collapsed && (
                          <span className="min-w-0 flex-1 truncate font-medium">
                            {item.label}
                          </span>
                        )}

                        {/* ACTIVE DOT */}

                        {isActive && !collapsed && (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-gold shadow-[0_0_10px_rgba(200,169,81,0.65)]" />
                        )}

                        {/* COLLAPSED TOOLTIP */}

                        {collapsed && (
                          <span className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 z-[100] -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-brand-dark px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-2xl transition-opacity duration-150 group-hover/nav:opacity-100">
                            {item.label}

                            <span className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-b border-l border-white/10 bg-brand-dark" />
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* PROFILE */}

        <div
          className={`relative shrink-0 border-t border-white/[0.07] transition-all duration-300 ${
            collapsed ? "p-2" : "p-3"
          }`}
        >
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((value) => !value)}
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              title={collapsed ? `${userName} account` : undefined}
              className={`group/profile flex w-full items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.045] p-2 text-left transition-all duration-200 hover:border-white/10 hover:bg-white/[0.075] ${
                collapsed ? "justify-center" : ""
              }`}
            >
              {/* AVATAR */}

              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-gold to-yellow-600 text-xs font-black text-brand-navy shadow-[0_6px_20px_rgba(200,169,81,0.20)]">
                {userImage ? (
                  <Image
                    src={userImage}
                    alt={userName}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  initials
                )}

                <span className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full border-2 border-brand-navy bg-emerald-400" />
              </div>

              {/* USER DETAILS */}

              {!collapsed && (
                <div className="min-w-0 flex-1 overflow-hidden">
                  <p className="truncate text-xs font-bold text-white">
                    {userName}
                  </p>

                  <p className="mt-0.5 truncate text-[10px] text-white/40">
                    {userEmail}
                  </p>
                </div>
              )}

              {!collapsed && (
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-white/35 transition-transform duration-200 ${
                    profileOpen ? "rotate-180 text-brand-gold" : ""
                  }`}
                />
              )}
            </button>

            {/* PROFILE MENU */}

            {profileOpen && (
              <div
                role="menu"
                aria-label="Student account menu"
                className={`absolute z-[100] overflow-hidden rounded-2xl border border-white/10 bg-brand-dark p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl ${
                  collapsed
                    ? "bottom-0 left-[calc(100%+10px)] w-64"
                    : "bottom-[calc(100%+10px)] left-0 w-full"
                }`}
              >
                {/* PROFILE SUMMARY */}

                <div className="border-b border-white/[0.07] px-3 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-gold to-yellow-600 text-xs font-black text-brand-navy">
                      {userImage ? (
                        <Image
                          src={userImage}
                          alt={userName}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-white">
                        {userName}
                      </p>

                      <p className="mt-0.5 truncate text-[10px] text-white/40">
                        {userEmail}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                    <span className="text-[10px] font-medium text-emerald-300/80">
                      Student account active
                    </span>
                  </div>
                </div>

                {/* MY PROFILE */}

                <Link
                  href="/dashboards/student/profile"
                  onClick={handleNavClick}
                  role="menuitem"
                  className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/65 transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] transition-colors group-hover:bg-brand-gold/10 group-hover:text-brand-gold">
                    <UserRound className="h-4 w-4" />
                  </span>

                  <span className="flex-1">My Profile</span>

                  <span className="text-white/20">→</span>
                </Link>

                {/* SETTINGS */}

                <Link
                  href="/dashboards/student/settings"
                  onClick={handleNavClick}
                  role="menuitem"
                  className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/65 transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] transition-colors group-hover:bg-brand-gold/10 group-hover:text-brand-gold">
                    <Settings className="h-4 w-4" />
                  </span>

                  <span className="flex-1">Settings</span>

                  <span className="text-white/20">→</span>
                </Link>

                <div className="my-1.5 h-px bg-white/[0.07]" />

                {/* SIGN OUT */}

                <button
                  type="button"
                  role="menuitem"
                  onClick={openLogoutModal}
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                    <LogOut className="h-4 w-4" />
                  </span>

                  <span className="flex-1">Sign out</span>
                </button>

                {/* FOOTER */}

                <div className="mt-1 border-t border-white/[0.06] px-3 py-2">
                  <p className="text-center text-[8px] font-medium uppercase tracking-[0.16em] text-white/20">
                    ITMT Student Portal
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR FOOTER */}

          {!collapsed && (
            <p className="mt-3 text-center text-[8px] font-medium uppercase tracking-[0.12em] text-white/20">
              ITMT MANAGEMENT SYSTEM • STUDENT PORTAL
            </p>
          )}
        </div>
      </aside>

      {/* SHARED LOGOUT MODAL */}

      <LogoutConfirmModal
        isOpen={logoutOpen}
        isLoading={loggingOut}
        onClose={closeLogoutModal}
        onConfirm={handleLogout}
      />
    </>
  );
}
