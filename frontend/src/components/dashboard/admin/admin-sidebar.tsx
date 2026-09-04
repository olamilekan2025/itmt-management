"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ClipboardCheck,
  ClipboardList,
  FileBarChart,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  ScrollText,
  Settings,
  UserCog,
  Users,
  UserRound,
  X,
  Building2,
  ImageIcon,
} from "lucide-react";

type AdminSidebarProps = {
  mobileOpen?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
};

type NavigationItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
};

type NavigationSection = {
  label: string;
  items: NavigationItem[];
};

/**
 * ADMIN-ONLY NAVIGATION
 *
 * Everything here belongs to the administration portal.
 */
const navigationSections: NavigationSection[] = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboards/admin",
        icon: LayoutDashboard,
      },
    ],
  },

 {
  label: "People",
  items: [
    {
      label: "Students",
      href: "/dashboards/admin/students",
      icon: GraduationCap,
    },
    {
      label: "Add Existing Student",
      href: "/dashboards/admin/existing",
      icon: UserRound,
    },
    {
      label: "Lecturers",
      href: "/dashboards/admin/lecturers",
      icon: UserCog,
    },
    {
      label: "Staff",
      href: "/dashboards/admin/staff",
      icon: UserRound,
    },
    {
      label: "Users",
      href: "/dashboards/admin/users",
      icon: Users,
    },

    
  ],
},

  {
    label: "Academic Management",
    items: [
      {
        label: "Departments",
        href: "/dashboards/admin/departments",
        icon: Building2,
      },
      {
        label: "Programmes",
        href: "/dashboards/admin/programmes",
        icon: BookOpen,
      },
      {
        label: "Academic Sessions",
        href: "/dashboards/admin/sessions",
        icon: CalendarDays,
      },
      {
        label: "Semesters",
        href: "/dashboards/admin/semesters",
        icon: CalendarDays,
      },
      {
        label: "Courses",
        href: "/dashboards/admin/courses",
        icon: BookOpen,
      },
      {
        label: "Registrations",
        href: "/dashboards/admin/registrations",
        icon: ClipboardList,
      },
      {
        label: "Lecturer Assignments",
        href: "/dashboards/admin/lecturer-assignments",
        icon: UserCog,
      },
    
    ],
  },

  {
    label: "Results & Assessment",
    items: [
      {
        label: "Results",
        href: "/dashboards/admin/results",
        icon: BarChart3,
      },
      {
        label: "Result Approval",
        href: "/dashboards/admin/results/approval",
        icon: ClipboardCheck,
      },
      {
        label: "Result Reports",
        href: "/dashboards/admin/results/reports",
        icon: FileBarChart,
      },
      {
        label: "Transcript Requests",
        href: "/dashboards/admin/transcript-requests",
        icon: FileText,
      },
    ],
  },

  {
    label: "Admissions",
    items: [
      {
        label: "Applications",
        href: "/dashboards/admin/applications",
        icon: ClipboardList,
      },
    ],
  },

  {
    label: "Communication",
    items: [
      {
        label: "Notifications",
        href: "/dashboards/admin/notifications",
        icon: Bell,
      },
      {
        label: "Announcements",
        href: "/dashboards/admin/announcements",
        icon: Megaphone,
      },
    ],
  },

  {
    label: "Reports",
    items: [
      {
        label: "Academic Reports",
        href: "/dashboards/admin/academic-reports",
        icon: FileBarChart,
      },
      {
        label: "Student Reports",
        href: "/dashboards/admin/reports/students",
        icon: Users,
      },
      {
        label: "System Reports",
        href: "/dashboards/admin/reports/system",
        icon: Activity,
      },
    ],
  },

  {
    label: "System",
    items: [
      {
        label: "Audit Logs",
        href: "/dashboards/admin/audit-logs",
        icon: ScrollText,
      },
      {
        label: "Settings",
        href: "/dashboards/admin/settings",
        icon: Settings,
      },
        {
        label: "Hero Section",
        href: "/dashboards/admin/hero-slides",
        icon: ImageIcon,
      },
    ],
  },
];

export default function AdminSidebar({
  mobileOpen = false,
  onClose,
  collapsed = false,
  onCollapsedChange,
}: AdminSidebarProps) {
  const pathname = usePathname();

  /**
   * Check whether a navigation item is active.
   *
   * Dashboard must match exactly so that:
   *
   * /dashboards/admin
   *
   * does not remain active on every admin page.
   */
  function isItemActive(href: string) {
    if (href === "/dashboards/admin") {
      return pathname === "/dashboards/admin";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  /**
   * Close mobile sidebar after navigation.
   */
  function handleNavigationClick() {
    onClose?.();
  }

  /**
   * Toggle desktop sidebar.
   */
  function toggleCollapsed() {
    onCollapsedChange?.(!collapsed);
  }

  return (
    <>
      {/* =====================================================
          MOBILE OVERLAY
      ====================================================== */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="
            fixed inset-0 z-40
            bg-brand-dark/60
            backdrop-blur-sm
            lg:hidden
          "
        />
      )}

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex flex-col

          border-r border-white/10
          bg-brand-dark

          shadow-xl
          shadow-brand-dark/10

          transition-[width,transform]
          duration-300
          ease-in-out

          w-72

          ${collapsed ? "lg:w-20" : "lg:w-72"}

          lg:translate-x-0

          ${mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
          }
        `}
      >
        {/* =================================================
            BRAND HEADER
        ================================================== */}

        <div
          className={`
            relative
            flex h-16 shrink-0
            items-center
            border-b border-white/10

            transition-all
            duration-300

            ${
              collapsed
                ? "justify-center px-3"
                : "justify-between px-5"
            }
          `}
        >
          {/* Brand */}

          <Link
            href="/dashboards/admin"
            onClick={handleNavigationClick}
            className={`
              flex items-center

              ${
                collapsed
                  ? "justify-center"
                  : "gap-3"
              }
            `}
            title={
              collapsed
                ? "ITMT Admin Dashboard"
                : undefined
            }
          >
           <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-white">
  <Image
    src="/newLogo.png"
    alt="ITMT"
    fill
    priority
    sizes="36px"
    className="object-contain p-1"
  />
</div>

            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate font-bold text-white">
                  ITMT
                </p>

                <p className="truncate text-xs text-slate-400">
                  Management System
                </p>
              </div>
            )}
          </Link>

          {/* =================================================
              MOBILE CLOSE
          ================================================== */}

          <button
            type="button"
            onClick={onClose}
            className="
              rounded-lg
              p-2
              text-slate-400
              transition-colors
              hover:bg-white/10
              hover:text-white
              lg:hidden
            "
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>

          {/* =================================================
              DESKTOP COLLAPSE BUTTON
          ================================================== */}

          <button
            type="button"
            onClick={toggleCollapsed}
            className="
              absolute
              right-0
              top-1/2

              hidden
              h-8
              w-8

              -translate-y-1/2
              translate-x-1/2

              items-center
              justify-center

              rounded-full

              border
              border-white/10

              bg-brand-dark

              text-slate-400

              shadow-lg

              transition-all

              hover:bg-white/10
              hover:text-white

              lg:flex
            "
            aria-label={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
            title={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
          >
            <ChevronLeft
              className={`
                h-4 w-4
                transition-transform
                duration-300

                ${
                  collapsed
                    ? "rotate-180"
                    : ""
                }
              `}
            />
          </button>
        </div>

        {/* =================================================
            NAVIGATION
        ================================================== */}

        <nav
          className="
            min-h-0
            flex-1
            overflow-y-auto
            overflow-x-hidden
            px-3
            py-5
          "
        >
          <div className="space-y-6">
            {navigationSections.map(
              (section) => (
                <div key={section.label}>
                  {/* Section heading */}

                  {!collapsed && (
                    <p
                      className="
                        mb-2
                        px-3

                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.16em]

                        text-slate-500
                      "
                    >
                      {section.label}
                    </p>
                  )}

                  {/* Collapsed separator */}

                  {collapsed && (
                    <div
                      className="
                        mx-2
                        mb-2
                        h-px
                        bg-white/10
                      "
                    />
                  )}

                  {/* Navigation items */}

                  <div className="space-y-1">
                    {section.items.map(
                      (item) => {
                        const Icon = item.icon;

                        const isActive =
                          isItemActive(
                            item.href,
                          );

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={
                              handleNavigationClick
                            }
                            title={
                              collapsed
                                ? item.label
                                : undefined
                            }
                            className={`
                              group
                              relative
                              flex
                              items-center
                              rounded-lg

                              py-2.5

                              text-sm
                              font-medium

                              transition-all
                              duration-200

                              ${
                                collapsed
                                  ? "justify-center px-2"
                                  : "gap-3 px-3"
                              }

                              ${
                                isActive
                                  ? "bg-white text-brand-navy shadow-sm"
                                  : "text-slate-300 hover:bg-white/10 hover:text-white"
                              }
                            `}
                          >
                            <Icon
                              className={`
                                h-[18px]
                                w-[18px]
                                shrink-0

                                transition-colors

                                ${
                                  isActive
                                    ? "text-brand-navy"
                                    : "text-slate-400 group-hover:text-white"
                                }
                              `}
                            />

                            {!collapsed && (
                              <span className="truncate">
                                {item.label}
                              </span>
                            )}

                            {/* Active indicator */}

                            {isActive && (
                              <span
                                className={`
                                  h-1.5
                                  w-1.5
                                  shrink-0
                                  rounded-full
                                  bg-brand-gold

                                  ${
                                    collapsed
                                      ? "absolute right-1"
                                      : "ml-auto"
                                  }
                                `}
                              />
                            )}
                          </Link>
                        );
                      },
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        </nav>

        {/* =================================================
            FOOTER
        ================================================== */}

        {!collapsed && (
          <div
            className="
              shrink-0
              border-t
              border-white/10
              p-4
            "
          >
            <div
              className="
                rounded-lg
                bg-white/5
                p-3
              "
            >
              <p className="text-xs font-medium text-white">
                ITMT Management System
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Administration Portal
              </p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}