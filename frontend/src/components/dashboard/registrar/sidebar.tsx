
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

import { logoutUser } from "@/lib/auth/sign-out";
import LogoutConfirmModal from "@/components/common/logout-confirm-modal";

import {
  Activity,
  Archive,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  FileBarChart,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  PanelLeftClose,
  PanelLeftOpen,
  ScrollText,
  Settings,
  ShieldCheck,
  User,
  UserCheck,
  Users,
  X,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

interface RegistrarSidebarProps {
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
        icon: MessageSquareText,
        description: "Academic announcements",
      },
      {
        label: "Notifications",
        href: "/dashboards/registrar/notifications",
        icon: MessageSquareText,
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

/* =========================================================
   HELPERS
========================================================= */

function getInitials(
  name?: string | null,
  email?: string | null,
) {
  const value = name?.trim() || email?.trim() || "Registrar";
  const parts = value.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return value.slice(0, 2).toUpperCase();
}

/* =========================================================
   COMPONENT
========================================================= */

export default function RegistrarSidebar({
  collapsed = false,
  onCollapsedChange,
  mobileOpen = false,
  onMobileClose,
  onClose,
}: RegistrarSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  /* =======================================================
     USER
  ======================================================= */

  const user = session?.user;

  const userName = user?.name?.trim() || "Registrar";
  const userEmail = user?.email?.trim() || "registrar@itmt.edu.ng";
  const userImage = user?.image || null;

  const initials = getInitials(user?.name, user?.email);

  /* =======================================================
     ACTIVE NAVIGATION
  ======================================================= */

  const activeHref = useMemo(() => {
    let bestMatch = "";

    for (const section of navSections) {
      for (const item of section.items) {
        if (
          pathname === item.href ||
          pathname.startsWith(`${item.href}/`)
        ) {
          if (item.href.length > bestMatch.length) {
            bestMatch = item.href;
          }
        }
      }
    }

    return bestMatch;
  }, [pathname]);

  /* =======================================================
     MOBILE NAVIGATION
  ======================================================= */

  const handleMobileClose = useCallback(() => {
    onMobileClose?.();
    onClose?.();
    setProfileOpen(false);
  }, [onMobileClose, onClose]);

  const handleNavClick = useCallback(() => {
    handleMobileClose();
  }, [handleMobileClose]);

  /* =======================================================
     ESCAPE KEY — MOBILE SIDEBAR ONLY
     The shared logout modal handles its own Escape key.
  ======================================================= */

  useEffect(() => {
    if (!mobileOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !logoutOpen) {
        handleMobileClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [mobileOpen, logoutOpen, handleMobileClose]);

  /* =======================================================
     CLOSE PROFILE WHEN ROUTE CHANGES
  ======================================================= */

  useEffect(() => {
    setProfileOpen(false);
  }, [pathname]);

  /* =======================================================
     LOGOUT
  ======================================================= */

  const openLogoutModal = () => {
    setProfileOpen(false);
    setLogoutOpen(true);
  };

  const closeLogoutModal = () => {
    if (loggingOut) return;
    setLogoutOpen(false);
  };

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logoutUser("/");
    } catch (error) {
      console.error("Registrar logout failed:", error);
      setLoggingOut(false);
    }
  };

  /* =======================================================
     COLLAPSE
  ======================================================= */

  const handleToggleSidebar = () => {
    onCollapsedChange?.(!collapsed);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      {/* MOBILE OVERLAY */}

      <button
        type="button"
        aria-label="Close navigation"
        tabIndex={mobileOpen ? 0 : -1}
        onClick={handleMobileClose}
        className={`
          fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]
          transition-opacity duration-300 lg:hidden
          ${
            mobileOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }
        `}
      />

      {/* SIDEBAR */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex h-dvh flex-col
          overflow-hidden border-r border-white/[0.07]
          bg-brand-navy text-white
          shadow-[12px_0_45px_rgba(0,0,0,0.14)]
          transition-[width,transform] duration-300 ease-out
          ${
            collapsed ? "w-[88px]" : "w-72"
          }
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* BACKGROUND DECORATION */}

        <div className="pointer-events-none absolute -left-24 top-20 h-56 w-56 rounded-full bg-brand-gold/[0.05] blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-24 h-64 w-64 rounded-full bg-blue-500/[0.035] blur-3xl" />

        {/* LOGO */}

        <div
          className={`
            relative shrink-0 pt-5 transition-all duration-300
            ${collapsed ? "px-3" : "px-5"}
          `}
        >
          <div className="group/logo-control relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.09] via-white/[0.045] to-white/[0.015] shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-300 hover:border-brand-gold/25 hover:shadow-[0_16px_50px_rgba(0,0,0,0.20)]">
            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand-gold/10 blur-3xl transition-all duration-500 group-hover/logo-control:bg-brand-gold/20" />

            <button
              type="button"
              onClick={handleToggleSidebar}
              disabled={!onCollapsedChange}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={`
                group/logo relative z-10 flex w-full items-center
                rounded-xl outline-none transition-all duration-300
                focus-visible:ring-2 focus-visible:ring-brand-gold/50
                ${
                  collapsed
                    ? "justify-center p-3"
                    : "justify-start gap-3 p-1"
                }
              `}
            >
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] ring-1 ring-white/20 transition-all duration-300 group-hover/logo:scale-[1.04]">
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

              <div
                className={`
                  min-w-0 overflow-hidden text-left transition-all duration-300
                  ${
                    collapsed
                      ? "w-0 -translate-x-2 opacity-0"
                      : "w-auto translate-x-0 opacity-100"
                  }
                `}
              >
                <p className="whitespace-nowrap text-sm font-bold tracking-tight text-white">
                  ITMT
                </p>
                <p className="mt-0.5 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.16em] text-white/40">
                  Registrar Portal
                </p>
              </div>
            </button>

            {/* SYSTEM STATUS */}

            <div
              className={`
                relative flex items-center gap-2 transition-all duration-300
                ${
                  collapsed
                    ? "mt-3 justify-center pb-3"
                    : "mt-4 pb-1"
                }
              `}
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>

              {!collapsed && (
                <span className="whitespace-nowrap text-[10px] font-medium text-white/45">
                  Registrar system online
                </span>
              )}
            </div>
          </div>
        </div>

        {/* NAVIGATION */}

        <nav className="relative flex-1 space-y-6 overflow-y-auto overflow-x-hidden px-3 pb-6 pt-5">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-2">
              <div
                className={`
                  flex items-center px-3 transition-all duration-300
                  ${collapsed ? "justify-center px-0" : "justify-between"}
                `}
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

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeHref === item.href;

                  return (
                    <Link
                      key={`${section.title}-${item.href}`}
                      href={item.href}
                      onClick={handleNavClick}
                      title={collapsed ? item.label : undefined}
                      aria-current={isActive ? "page" : undefined}
                      className={`
                        group/nav relative flex min-h-[46px] w-full
                        items-center gap-3 overflow-visible rounded-xl px-3
                        text-sm transition-all duration-200
                        ${collapsed ? "justify-center px-0" : ""}
                        ${
                          isActive
                            ? "bg-white/[0.10] text-white shadow-[0_6px_22px_rgba(0,0,0,0.10)]"
                            : "text-white/55 hover:bg-white/[0.055] hover:text-white"
                        }
                      `}
                    >
                      <span
                        className={`
                          absolute left-0 top-1/2 h-7 w-[3px]
                          -translate-y-1/2 rounded-r-full bg-brand-gold
                          transition-all duration-200
                          ${isActive ? "opacity-100" : "opacity-0"}
                        `}
                      />

                      <span
                        className={`
                          relative flex h-9 w-9 shrink-0 items-center
                          justify-center rounded-lg transition-all duration-200
                          ${
                            isActive
                              ? "bg-brand-gold/15 text-brand-gold"
                              : "bg-white/[0.035] text-white/45 group-hover/nav:bg-white/[0.07] group-hover/nav:text-white"
                          }
                        `}
                      >
                        <Icon
                          className="h-[18px] w-[18px] transition-transform duration-200 group-hover/nav:scale-105"
                          strokeWidth={isActive ? 2.2 : 1.8}
                        />
                      </span>

                      {!collapsed && (
                        <span className="min-w-0 flex-1 truncate font-medium">
                          {item.label}
                        </span>
                      )}

                      {isActive && !collapsed && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-gold shadow-[0_0_10px_rgba(200,169,81,0.65)]" />
                      )}

                      {collapsed && (
                        <span className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 z-[100] -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-brand-dark px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-2xl transition-all duration-150 group-hover/nav:opacity-100">
                          {item.label}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* PROFILE AREA */}

        <div
          className={`
            relative shrink-0 border-t border-white/[0.07]
            transition-all duration-300
            ${collapsed ? "p-2" : "p-3"}
          `}
        >
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((value) => !value)}
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              title={collapsed ? `${userName} account` : undefined}
              className={`
                group/profile flex w-full items-center gap-3 rounded-2xl
                border border-white/[0.07] bg-white/[0.045] p-2
                text-left transition-all duration-200
                hover:border-white/10 hover:bg-white/[0.075]
                ${collapsed ? "justify-center" : ""}
              `}
            >
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
                  className={`
                    h-4 w-4 shrink-0 text-white/35 transition-transform duration-200
                    ${profileOpen ? "rotate-180 text-brand-gold" : ""}
                  `}
                />
              )}
            </button>

            {/* PROFILE MENU */}

            {profileOpen && (
              <div
                role="menu"
                className={`
                  absolute z-[100] w-64 overflow-hidden rounded-2xl
                  border border-white/10 bg-brand-dark p-1.5
                  shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl
                  ${
                    collapsed
                      ? "bottom-0 left-[calc(100%+10px)]"
                      : "bottom-[calc(100%+10px)] left-0 w-full"
                  }
                `}
              >
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
                      Registrar account active
                    </span>
                  </div>
                </div>

                <Link
                  href="/dashboards/registrar/profile"
                  onClick={handleNavClick}
                  role="menuitem"
                  className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/65 transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] transition group-hover:bg-brand-gold/10 group-hover:text-brand-gold">
                    <User className="h-4 w-4" />
                  </span>
                  <span className="flex-1">My Profile</span>
                  <span className="text-white/20">→</span>
                </Link>

                <Link
                  href="/dashboards/registrar/settings"
                  onClick={handleNavClick}
                  role="menuitem"
                  className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/65 transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] transition group-hover:bg-brand-gold/10 group-hover:text-brand-gold">
                    <Settings className="h-4 w-4" />
                  </span>
                  <span className="flex-1">Settings</span>
                  <span className="text-white/20">→</span>
                </Link>

                <div className="my-1.5 h-px bg-white/[0.07]" />

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

                <div className="mt-1 border-t border-white/[0.06] px-3 py-2">
                  <p className="text-center text-[8px] font-medium uppercase tracking-[0.16em] text-white/20">
                    ITMT Registrar Portal
                  </p>
                </div>
              </div>
            )}
          </div>

          {!collapsed && (
            <p className="mt-3 text-center text-[8px] font-medium uppercase tracking-[0.12em] text-white/20">
              ITMT MANAGEMENT SYSTEM • REGISTRAR PORTAL
            </p>
          )}
        </div>
      </aside>

      {/* MOBILE CLOSE BUTTON */}

      {mobileOpen && (
        <button
          type="button"
          onClick={handleMobileClose}
          aria-label="Close navigation menu"
          title="Close navigation menu"
          className="fixed right-4 top-4 z-[60] flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-brand-navy/95 text-white/80 shadow-xl backdrop-blur-xl transition hover:border-brand-gold/40 hover:text-brand-gold active:scale-95 lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      {/* SHARED LOGOUT CONFIRMATION MODAL */}

      <LogoutConfirmModal
        isOpen={logoutOpen}
        isLoading={loggingOut}
        onClose={closeLogoutModal}
        onConfirm={handleLogout}
      />
    </>
  );
}
