"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

import {
  Activity,
  Archive,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  FileBarChart,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Megaphone,
  ScrollText,
  Settings,
  ShieldCheck,
  User,
  UserCheck,
  Users,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface RegistrarSidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
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

const navigation: NavSection[] = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboards/registrar",
        icon: LayoutDashboard,
        description: "Registrar overview",
      },
    ],
  },

  {
    title: "Admissions & Students",
    items: [
      {
        label: "Admissions",
        href: "/dashboards/registrar/admissions",
        icon: ClipboardCheck,
        description: "Manage admission applications",
      },
      {
        label: "Students",
        href: "/dashboards/registrar/students",
        icon: Users,
        description: "Manage student records",
      },
    ],
  },

  {
    title: "Academic Structure",
    items: [
      {
        label: "Departments",
        href: "/dashboards/registrar/departments",
        icon: Archive,
        description: "Manage departments",
      },
      {
        label: "Programmes",
        href: "/dashboards/registrar/programmes",
        icon: GraduationCap,
        description: "Manage academic programmes",
      },
      {
        label: "Academic Sessions",
        href: "/dashboards/registrar/academic-sessions",
        icon: CalendarDays,
        description: "Manage academic sessions",
      },
      {
        label: "Semesters",
        href: "/dashboards/registrar/semesters",
        icon: Activity,
        description: "Manage semesters",
      },
      {
        label: "Courses",
        href: "/dashboards/registrar/courses",
        icon: BookOpen,
        description: "Manage academic courses",
      },
    ],
  },

  {
    title: "Academic Operations",
    items: [
      {
        label: "Course Registrations",
        href: "/dashboards/registrar/registrations",
        icon: ClipboardList,
        description: "Manage course registrations",
      },
      {
        label: "Lecturer Assignments",
        href: "/dashboards/registrar/lecturer-assignments",
        icon: UserCheck,
        description: "Manage lecturer assignments",
      },
      {
        label: "Results",
        href: "/dashboards/registrar/results",
        icon: FileBarChart,
        description: "Review and process results",
      },
      {
        label: "Transcripts",
        href: "/dashboards/registrar/transcripts",
        icon: ScrollText,
        description: "Student academic transcripts",
      },
    ],
  },

  {
    title: "Reports",
    items: [
      {
        label: "Academic Reports",
        href: "/dashboards/registrar/academic-reports",
        icon: FileText,
        description: "Academic reports and statistics",
      },
      {
        label: "Graduation",
        href: "/dashboards/registrar/graduation",
        icon: GraduationCap,
        description: "Graduation and final-year records",
      },
    ],
  },

  {
    title: "Communication",
    items: [
      {
        label: "Announcements",
        href: "/dashboards/registrar/announcements",
        icon: Megaphone,
        description: "Academic announcements",
      },
      {
        label: "Notifications",
        href: "/dashboards/registrar/notifications",
        icon: Megaphone,
        description: "Academic notifications",
      },
    ],
  },

  {
    title: "System",
    items: [
      {
        label: "Audit Logs",
        href: "/dashboards/registrar/audit-logs",
        icon: ShieldCheck,
        description: "Registrar activity history",
      },
      {
        label: "Settings",
        href: "/dashboards/registrar/settings",
        icon: Settings,
        description: "Registrar account settings",
      },
    ],
  },
];

function isActiveRoute(pathname: string, href: string) {
  if (href === "/dashboards/registrar") {
    return pathname === href;
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

export default function RegistrarSidebar({
  collapsed: controlledCollapsed,
  onCollapsedChange,
  mobileOpen = false,
  onMobileClose,
}: RegistrarSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const [internalCollapsed, setInternalCollapsed] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [logoutModalOpen, setLogoutModalOpen] =
    useState(false);

  const [isLoggingOut, setIsLoggingOut] =
    useState(false);

  const collapsed =
    controlledCollapsed ?? internalCollapsed;

  const handleCollapse = () => {
    const nextValue = !collapsed;

    if (onCollapsedChange) {
      onCollapsedChange(nextValue);
    } else {
      setInternalCollapsed(nextValue);
    }

    setProfileOpen(false);
  };

  const closeProfileMenu = () => {
    setProfileOpen(false);
    onMobileClose?.();
  };

  const registrarName =
    session?.user?.name?.trim() || "Registrar";

  const registrarEmail =
    session?.user?.email?.trim() ||
    "Registrar account";

  const registrarImage =
    session?.user?.image || null;

  const initials =
    registrarName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((name) =>
        name.charAt(0).toUpperCase(),
      )
      .join("") || "R";

  const openLogoutModal = () => {
    setProfileOpen(false);
    setLogoutModalOpen(true);
  };

  const handleSignOut = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);

      await signOut({
        callbackUrl: "/auth/login",
      });
    } catch (error) {
      console.error(
        "Sign out failed:",
        error,
      );

      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* =========================================================
          MOBILE BACKDROP
      ========================================================= */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* =========================================================
          SIDEBAR
      ========================================================= */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col",
          "border-r border-white/10 bg-brand-navy text-white",
          "shadow-2xl shadow-black/20",
          "transition-[width,transform] duration-300 ease-in-out",
          "lg:translate-x-0",
          collapsed ? "lg:w-20" : "lg:w-72",
          mobileOpen
            ? "w-72 translate-x-0"
            : "w-72 -translate-x-full",
        )}
      >
        {/* =======================================================
            BRAND
        ======================================================= */}
        <div
          className={cn(
            "flex h-20 shrink-0 items-center border-b border-white/10",
            collapsed
              ? "justify-center px-3"
              : "justify-between px-5",
          )}
        >
          <Link
            href="/dashboards/registrar"
            onClick={onMobileClose}
            className={cn(
              "flex items-center gap-3",
              collapsed && "justify-center",
            )}
          >
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-white shadow-lg shadow-black/10 ring-1 ring-white/10">
              <Image
                src="/newLogo.png"
                alt="ITMT logo"
                fill
                priority
                sizes="44px"
                className="object-contain p-1.5"
              />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-bold tracking-wide text-white">
                  ITMT
                </p>

                <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
                  Registrar Portal
                </p>
              </div>
            )}
          </Link>

          {/* MOBILE CLOSE */}
          <button
            type="button"
            onClick={onMobileClose}
            className="rounded-lg p-2 text-white/50 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* =======================================================
            NAVIGATION
        ======================================================= */}
        <div className="flex-1 overflow-y-auto px-3 py-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
          <nav className="space-y-6">
            {navigation.map((section) => (
              <div key={section.title}>
                {!collapsed && (
                  <div className="mb-2 px-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                      {section.title}
                    </p>
                  </div>
                )}

                <div className="space-y-1">
                  {section.items.map((item) => {
                    const active = isActiveRoute(
                      pathname,
                      item.href,
                    );

                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onMobileClose}
                        title={
                          collapsed
                            ? item.label
                            : undefined
                        }
                        className={cn(
                          "group relative flex items-center rounded-xl",
                          "transition-all duration-200",
                          collapsed
                            ? "justify-center px-2 py-3"
                            : "gap-3 px-3 py-2.5",
                          active
                            ? "bg-white/10 text-white shadow-sm"
                            : "text-white/60 hover:bg-white/[0.06] hover:text-white",
                        )}
                      >
                        {active && (
                          <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand-gold" />
                        )}

                        <span
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
                            active
                              ? "bg-brand-gold text-brand-navy shadow-md shadow-brand-gold/10"
                              : "bg-white/[0.04] text-white/55 group-hover:bg-white/[0.08] group-hover:text-white",
                          )}
                        >
                          <Icon className="h-[17px] w-[17px]" />
                        </span>

                        {!collapsed && (
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">
                              {item.label}
                            </span>

                            {active &&
                              item.description && (
                                <span className="mt-0.5 block truncate text-[10px] text-white/35">
                                  {item.description}
                                </span>
                              )}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* =======================================================
            BOTTOM SECTION
        ======================================================= */}
        <div className="relative shrink-0 border-t border-white/10 p-3">

          {/* COLLAPSE BUTTON */}
          <button
            type="button"
            onClick={handleCollapse}
            className={cn(
              "group mb-2 flex w-full items-center rounded-xl",
              "border border-white/[0.05]",
              "bg-white/[0.025]",
              "text-white/50",
              "transition-all duration-200",
              "hover:border-white/10",
              "hover:bg-white/[0.07]",
              "hover:text-white",
              "focus:outline-none",
              "focus:ring-2",
              "focus:ring-brand-gold/30",
              collapsed
                ? "justify-center px-2 py-3"
                : "gap-3 px-3 py-2.5",
            )}
            title={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
            aria-label={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] transition group-hover:bg-white/[0.08]">
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </span>

            {!collapsed && (
              <span className="text-xs font-semibold">
                Collapse sidebar
              </span>
            )}
          </button>

          {/* =====================================================
              REGISTRAR PROFILE
          ===================================================== */}
          <div className="relative">

            {/* PROFILE DROPDOWN */}
            {profileOpen && (
              <div
                className={cn(
                  "absolute bottom-full z-[70] mb-3 overflow-hidden",
                  "rounded-2xl border border-white/10",
                  "bg-[#101c32]/95 backdrop-blur-xl",
                  "shadow-2xl shadow-black/40",
                  "animate-in fade-in slide-in-from-bottom-2 duration-200",
                  collapsed
                    ? "left-14 w-64"
                    : "left-0 right-0",
                )}
              >
                {/* PROFILE HEADER */}
                <div className="border-b border-white/10 p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-brand-gold text-brand-navy shadow-lg shadow-brand-gold/10">
                      {registrarImage ? (
                        <Image
                          src={registrarImage}
                          alt={registrarName}
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-black">
                          {initials}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {registrarName}
                      </p>

                      <p className="truncate text-[11px] text-white/40">
                        {registrarEmail}
                      </p>
                    </div>
                  </div>
                </div>

                {/* MENU */}
                <div className="p-2">

                  {/* =================================================
                      MY PROFILE
                  ================================================= */}
                  <Link
                    href="/dashboards/registrar/profile"
                    onClick={closeProfileMenu}
                    className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-white/70 transition hover:bg-white/[0.07] hover:text-white"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.05] transition group-hover:bg-brand-gold group-hover:text-brand-navy">
                      <User className="h-4 w-4" />
                    </span>

                    <span className="flex-1">
                      <span className="block text-sm font-medium">
                        My Profile
                      </span>

                      <span className="mt-0.5 block text-[10px] text-white/35">
                        Manage your profile
                      </span>
                    </span>

                    <ChevronRight className="h-4 w-4 text-white/25 transition-transform group-hover:translate-x-0.5 group-hover:text-white/60" />
                  </Link>

                  {/* =================================================
                      SETTINGS
                  ================================================= */}
                  <Link
                    href="/dashboards/registrar/settings"
                    onClick={closeProfileMenu}
                    className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-white/70 transition hover:bg-white/[0.07] hover:text-white"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.05] transition group-hover:bg-brand-gold group-hover:text-brand-navy">
                      <Settings className="h-4 w-4" />
                    </span>

                    <span className="flex-1">
                      <span className="block text-sm font-medium">
                        Settings
                      </span>

                      <span className="mt-0.5 block text-[10px] text-white/35">
                        Preferences and security
                      </span>
                    </span>

                    <ChevronRight className="h-4 w-4 text-white/25 transition-transform group-hover:translate-x-0.5 group-hover:text-white/60" />
                  </Link>

                  {/* =================================================
                      DIVIDER
                  ================================================= */}
                  <div className="my-2 border-t border-white/[0.07]" />

                  {/* =================================================
                      SIGN OUT
                  ================================================= */}
                  <button
                    type="button"
                    onClick={openLogoutModal}
                    className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-white/70 transition hover:bg-red-500/10 hover:text-red-300"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.05] transition group-hover:bg-red-500/10">
                      <LogOut className="h-4 w-4" />
                    </span>

                    <span className="flex-1 text-left">
                      <span className="block text-sm font-medium">
                        Sign out
                      </span>

                      <span className="mt-0.5 block text-[10px] text-white/35 group-hover:text-red-300/50">
                        End current session
                      </span>
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* PROFILE BUTTON */}
            <button
              type="button"
              onClick={() =>
                setProfileOpen(
                  (open) => !open,
                )
              }
              className={cn(
                "group flex w-full items-center rounded-2xl",
                "border border-transparent",
                "bg-white/[0.035]",
                "transition-all duration-200",
                "hover:border-white/10",
                "hover:bg-white/[0.07]",
                "focus:outline-none",
                "focus:ring-2",
                "focus:ring-brand-gold/30",
                collapsed
                  ? "justify-center p-2"
                  : "gap-3 px-2.5 py-2.5",
              )}
              title={
                collapsed
                  ? `${registrarName} — Registrar`
                  : undefined
              }
              aria-expanded={profileOpen}
              aria-haspopup="menu"
            >
              {/* AVATAR */}
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-brand-gold text-brand-navy shadow-lg shadow-brand-gold/10 ring-1 ring-white/10">
                {registrarImage ? (
                  <Image
                    src={registrarImage}
                    alt={registrarName}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-black">
                    {initials}
                  </div>
                )}
              </div>

              {!collapsed && (
                <>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-sm font-semibold text-white">
                      {registrarName}
                    </p>

                    <p className="mt-0.5 truncate text-[10px] font-medium uppercase tracking-[0.12em] text-white/35">
                      Registrar
                    </p>
                  </div>

                  <ChevronRight
                    className={cn(
                      "h-4 w-4 shrink-0 text-white/30 transition-transform duration-200",
                      profileOpen &&
                        "rotate-90 text-white/60",
                    )}
                  />
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* =========================================================
          LOGOUT MODAL
      ========================================================= */}
      {logoutModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
        >
          {/* BACKDROP */}
          <button
            type="button"
            aria-label="Close logout dialog"
            onClick={() => {
              if (!isLoggingOut) {
                setLogoutModalOpen(false);
              }
            }}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* MODAL */}
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl shadow-black/40">

            {/* GOLD ACCENT */}
            <div className="h-1.5 bg-brand-gold" />

            <div className="p-7 sm:p-8">

              {/* ICON */}
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-8 ring-red-50/50">
                <LogOut className="h-6 w-6" />
              </div>

              {/* CONTENT */}
              <h2
                id="logout-title"
                className="text-xl font-bold tracking-tight text-slate-900"
              >
                Sign out of Registrar Portal?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                You are about to end your current registrar
                session. You will need to sign in again to
                access the portal.
              </p>

              {/* ACCOUNT PREVIEW */}
              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-brand-gold text-brand-navy">
                  {registrarImage ? (
                    <Image
                      src={registrarImage}
                      alt={registrarName}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-black">
                      {initials}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {registrarName}
                  </p>

                  <p className="text-xs text-slate-500">
                    Registrar account
                  </p>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={isLoggingOut}
                  onClick={() =>
                    setLogoutModalOpen(false)
                  }
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Stay signed in
                </button>

                <button
                  type="button"
                  disabled={isLoggingOut}
                  onClick={handleSignOut}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoggingOut ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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
        </div>
      )}
    </>
  );
}