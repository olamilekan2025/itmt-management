"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

import {
  AlertTriangle,
  Bell,
  BookOpen,
  BookOpenCheck,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import { AiOutlineBarChart } from "react-icons/ai";

import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
} from "react";

/* =========================================================
   TYPES
========================================================= */

interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

interface LecturerSidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

/* =========================================================
   NAVIGATION
========================================================= */

const navigation: NavSection[] = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboards/lecturer",
        icon: LayoutDashboard,
      },
    ],
  },

  {
    label: "Academic",
    items: [
      {
        label: "My Courses",
        href: "/dashboards/lecturer/courses",
        icon: BookOpen,
      },
      {
        label: "My Students",
        href: "/dashboards/lecturer/students",
        icon: GraduationCap,
      },
      {
        label: "Course Registrations",
        href: "/dashboards/lecturer/registrations",
        icon: ClipboardCheck,
      },
    ],
  },

  {
    label: "Results",
    items: [
      {
        label: "Enter Results",
        href: "/dashboards/lecturer/results",
        icon: BookOpenCheck,
      },
      {
        label: "Submitted Results",
        href: "/dashboards/lecturer/results/submitted",
        icon: GraduationCap,
      },
    ],
  },

  {
    label: "Class Management",
    items: [
      {
        label: "Attendance",
        href: "/dashboards/lecturer/attendance",
        icon: CalendarDays,
      },
    ],
  },

  {
    label: "Reports",
    items: [
      {
        label: "Academic Reports",
        href: "/dashboards/lecturer/reports",
        icon: AiOutlineBarChart,
      },
    ],
  },

  {
    label: "Communication",
    items: [
      {
        label: "Notifications",
        href: "/dashboards/lecturer/notifications",
        icon: Bell,
      },
      {
        label: "Announcements",
        href: "/dashboards/lecturer/announcements",
        icon: Bell,
      },
    ],
  },
];

/* =========================================================
   HELPERS
========================================================= */

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "LE"
  );
}

/* =========================================================
   COMPONENT
========================================================= */

export default function LecturerSidebar({
  collapsed = false,
  onCollapsedChange,
  mobileOpen = false,
  onMobileClose,
}: LecturerSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  /* =======================================================
     USER INFORMATION
  ======================================================= */

  const userName =
    session?.user?.name?.trim() || "Lecturer";

  const userEmail =
    session?.user?.email?.trim() || "lecturer@itmt.edu.ng";

  const userImage =
    session?.user?.image || null;

  const initials = getInitials(userName);

  /* =======================================================
     ACTIVE NAVIGATION
  ======================================================= */

  function isActive(href: string) {
    if (href === "/dashboards/lecturer") {
      return pathname === href;
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  /* =======================================================
     MOBILE NAVIGATION
  ======================================================= */

  function handleNavClick() {
    onMobileClose?.();
    setProfileOpen(false);
  }

  /* =======================================================
     SIDEBAR TOGGLE
  ======================================================= */

  function toggleSidebar() {
    if (!onCollapsedChange) return;

    setProfileOpen(false);

    onCollapsedChange(!collapsed);
  }

  /* =======================================================
     PROFILE DROPDOWN
  ======================================================= */

  function toggleProfile() {
    setProfileOpen((current) => !current);
  }

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target as Node,
        )
      ) {
        setProfileOpen(false);
      }
    }

    if (profileOpen) {
      document.addEventListener(
        "mousedown",
        handleOutsideClick,
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, [profileOpen]);

  /* =======================================================
     ESCAPE KEY
  ======================================================= */

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;

      setProfileOpen(false);
      setLogoutModalOpen(false);

      if (mobileOpen) {
        onMobileClose?.();
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [
    mobileOpen,
    onMobileClose,
  ]);

  /* =======================================================
     LOCK BODY SCROLL ON MOBILE
  ======================================================= */

  useEffect(() => {
    if (!mobileOpen) return;

    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        originalOverflow;
    };
  }, [mobileOpen]);

  /* =======================================================
     CLOSE PROFILE WHEN ROUTE CHANGES
  ======================================================= */

  useEffect(() => {
    setProfileOpen(false);
  }, [pathname]);

  /* =======================================================
     LOGOUT
  ======================================================= */

  function openLogoutModal() {
    setProfileOpen(false);
    setLogoutModalOpen(true);
  }

  function closeLogoutModal() {
    if (signingOut) return;

    setLogoutModalOpen(false);
  }

  async function handleSignOut() {
    if (signingOut) return;

    try {
      setSigningOut(true);

      await signOut({
        callbackUrl: "/auth/login",
      });
    } catch (error) {
      console.error(
        "Lecturer sign out error:",
        error,
      );

      setSigningOut(false);
      setLogoutModalOpen(false);
    }
  }

  /* =======================================================
     PROFILE ACTIVE STATES
  ======================================================= */

  const profileActive =
    pathname === "/dashboards/lecturer/profile" ||
    pathname.startsWith(
      "/dashboards/lecturer/profile/",
    );

  const settingsActive =
    pathname === "/dashboards/lecturer/settings" ||
    pathname.startsWith(
      "/dashboards/lecturer/settings/",
    );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      {/* =====================================================
          MOBILE BACKDROP
      ====================================================== */}

      <div
        onClick={onMobileClose}
        aria-hidden="true"
        className={`
          fixed
          inset-0
          z-40

          bg-slate-950/60
          backdrop-blur-sm

          transition-opacity
          duration-300

          lg:hidden

          ${
            mobileOpen
              ? "opacity-100"
              : "pointer-events-none opacity-0"
          }
        `}
      />

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50

          flex
          flex-col

          ${
            collapsed
              ? "w-[88px]"
              : "w-72"
          }

          border-r
          border-white/[0.07]

          bg-brand-navy
          text-white

          shadow-[8px_0_30px_rgba(0,0,0,0.08)]

          transition-[width,transform]
          duration-300
          ease-in-out

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* ===================================================
            BRAND / COLLAPSE CONTROL
        ==================================================== */}

        <div
          className={`
            pt-5

            transition-all
            duration-300

            ${
              collapsed
                ? "px-3"
                : "px-5"
            }
          `}
        >
          <div
            className={`
              relative
              overflow-hidden

              rounded-2xl

              border
              border-white/[0.08]

              bg-gradient-to-br
              from-white/[0.08]
              to-white/[0.02]

              transition-all
              duration-300

              ${
                collapsed
                  ? "p-3"
                  : "p-4"
              }
            `}
          >
            {/* Decorative glow */}

            <div
              className="
                pointer-events-none
                absolute
                -right-8
                -top-8

                h-24
                w-24

                rounded-full

                bg-brand-gold/10

                blur-2xl
              "
            />

            {/* =================================================
                LOGO TOGGLE

                Expanded:
                normal = logo
                hover = collapse icon

                Collapsed:
                normal = logo
                hover = expand icon
            ================================================== */}

            <button
              type="button"
              onClick={toggleSidebar}
              onMouseEnter={() =>
                setLogoHovered(true)
              }
              onMouseLeave={() =>
                setLogoHovered(false)
              }
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
              className={`
                group
                relative

                flex
                w-full
                items-center
                gap-3

                rounded-xl

                text-left

                transition-all
                duration-300

                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-brand-gold/50

                ${
                  collapsed
                    ? "justify-center"
                    : ""
                }
              `}
            >
              {/* Logo / Hover Icon */}

              <div
                className="
                  relative

                  flex
                  h-11
                  w-11
                  shrink-0

                  items-center
                  justify-center

                  overflow-hidden

                  rounded-xl

                  bg-white

                  shadow-lg

                  transition-all
                  duration-300

                  group-hover:bg-brand-gold
                "
              >
                {/* Actual logo */}

                <Image
                  src="/newLogo.png"
                  alt="ITMT logo"
                  fill
                  sizes="44px"
                  priority
                  className={`
                    object-contain
                    p-1.5

                    transition-all
                    duration-200

                    ${
                      logoHovered
                        ? "scale-75 opacity-0"
                        : "scale-100 opacity-100"
                    }
                  `}
                />

                {/* Collapse / Expand icon */}

                <span
                  className={`
                    absolute
                    inset-0

                    flex
                    items-center
                    justify-center

                    text-brand-navy

                    transition-all
                    duration-200

                    ${
                      logoHovered
                        ? "scale-100 opacity-100"
                        : "scale-75 opacity-0"
                    }
                  `}
                >
                  {collapsed ? (
                    <PanelLeftOpen className="h-5 w-5" />
                  ) : (
                    <PanelLeftClose className="h-5 w-5" />
                  )}
                </span>
              </div>

              {/* Brand text */}

              <div
                className={`
                  min-w-0
                  overflow-hidden

                  transition-all
                  duration-300

                  ${
                    collapsed
                      ? "w-0 opacity-0"
                      : "w-auto opacity-100"
                  }
                `}
              >
                <p className="text-sm font-bold tracking-tight text-white">
                  ITMT
                </p>

                <p className="mt-0.5 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.16em] text-white/40">
                  Lecturer Portal
                </p>
              </div>
            </button>

            {/* =================================================
                ONLINE STATUS
            ================================================== */}

            <div
              className={`
                relative

                mt-4

                flex
                items-center
                gap-2

                transition-all
                duration-300

                ${
                  collapsed
                    ? "mt-3 justify-center"
                    : ""
                }
              `}
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />

                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>

              <span
                className={`
                  whitespace-nowrap

                  text-[10px]
                  font-medium
                  text-white/45

                  transition-all
                  duration-300

                  ${
                    collapsed
                      ? "hidden w-0 opacity-0"
                      : "w-auto opacity-100"
                  }
                `}
              >
                Lecturer system online
              </span>
            </div>
          </div>
        </div>

        {/* ===================================================
            NAVIGATION
        ==================================================== */}

        <nav
          className="
            mt-5
            flex-1
            overflow-y-auto

            px-3
            pb-4

            scrollbar-thin
            scrollbar-track-transparent
            scrollbar-thumb-white/10
          "
        >
          <div className="space-y-6">
            {navigation.map((section) => (
              <div key={section.label}>
                {/* Section heading */}

                <div
                  className={`
                    mb-2

                    flex
                    items-center
                    gap-2

                    px-3

                    transition-all
                    duration-300

                    ${
                      collapsed
                        ? "justify-center gap-0 px-0"
                        : ""
                    }
                  `}
                >
                  {collapsed ? (
                    <>
                      <span className="h-px w-8 bg-white/[0.08]" />

                      {/* Tooltip-style section label */}

                      <span className="sr-only">
                        {section.label}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">
                        {section.label}
                      </span>

                      <div className="h-px flex-1 bg-white/[0.05]" />
                    </>
                  )}
                </div>

                {/* Section items */}

                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active =
                      isActive(item.href);

                    return (
                      <div
                        key={`${section.label}-${item.href}`}
                        className="group/nav relative"
                      >
                        <Link
                          href={item.href}
                          onClick={handleNavClick}
                          aria-current={
                            active
                              ? "page"
                              : undefined
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
                            w-full
                            items-center
                            gap-3

                            rounded-xl

                            px-3
                            py-2.5

                            text-left

                            transition-all
                            duration-200

                            ${
                              collapsed
                                ? "justify-center px-2"
                                : ""
                            }

                            ${
                              active
                                ? "bg-white/[0.08]"
                                : "hover:bg-white/[0.06]"
                            }
                          `}
                        >
                          {/* Active indicator */}

                          <span
                            className={`
                              absolute
                              left-0

                              h-6
                              w-[2px]

                              rounded-r-full

                              bg-brand-gold

                              transition-opacity

                              ${
                                active
                                  ? "opacity-100"
                                  : "opacity-0"
                              }
                            `}
                          />

                          {/* Icon */}

                          <span
                            className={`
                              flex
                              h-8
                              w-8
                              shrink-0

                              items-center
                              justify-center

                              rounded-lg

                              transition-all
                              duration-200

                              ${
                                active
                                  ? "bg-brand-gold/20 text-brand-gold"
                                  : "bg-white/[0.035] text-white/40 group-hover:bg-brand-gold/10 group-hover:text-brand-gold"
                              }
                            `}
                          >
                            <Icon className="h-4 w-4" />
                          </span>

                          {/* Label */}

                          <span
                            className={`
                              min-w-0
                              flex-1

                              truncate

                              text-[13px]
                              font-medium

                              transition-all
                              duration-300

                              ${
                                collapsed
                                  ? "hidden w-0 opacity-0"
                                  : "w-auto opacity-100"
                              }

                              ${
                                active
                                  ? "text-white"
                                  : "text-white/65 group-hover:text-white"
                              }
                            `}
                          >
                            {item.label}
                          </span>

                          {/* Arrow */}

                          <ChevronRight
                            className={`
                              h-3.5
                              w-3.5
                              shrink-0

                              transition-all
                              duration-200

                              ${
                                collapsed
                                  ? "hidden"
                                  : active
                                    ? "translate-x-0.5 text-brand-gold/50"
                                    : "text-white/0 group-hover:translate-x-0.5 group-hover:text-white/25"
                              }
                            `}
                          />
                        </Link>

                        {/* =================================================
                            COLLAPSED TOOLTIP
                        ================================================== */}

                        {collapsed && (
                          <div
                            className="
                              pointer-events-none

                              absolute
                              left-[calc(100%+12px)]
                              top-1/2
                              z-[100]

                              hidden
                              -translate-y-1/2

                              whitespace-nowrap

                              rounded-lg

                              border
                              border-white/[0.08]

                              bg-[#081a35]

                              px-3
                              py-2

                              text-[11px]
                              font-semibold
                              text-white

                              opacity-0

                              shadow-xl
                              shadow-black/30

                              transition-all
                              duration-200

                              group-hover/nav:block
                              group-hover/nav:opacity-100
                            "
                          >
                            {item.label}

                            <span
                              className="
                                absolute
                                -left-1
                                top-1/2

                                h-2
                                w-2

                                -translate-y-1/2
                                rotate-45

                                border-l
                                border-b
                                border-white/[0.08]

                                bg-[#081a35]
                              "
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* ===================================================
            PROFILE
        ==================================================== */}

        <div
          ref={profileRef}
          className={`
            relative

            border-t
            border-white/[0.07]

            transition-all
            duration-300

            ${
              collapsed
                ? "p-3"
                : "p-4"
            }
          `}
        >
          {/* Profile button */}

          <button
            type="button"
            onClick={toggleProfile}
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            title={
              collapsed
                ? `${userName} profile`
                : undefined
            }
            className={`
              group

              flex
              w-full
              items-center
              gap-3

              rounded-2xl

              border
              border-white/[0.07]

              bg-white/[0.035]

              p-2.5

              text-left

              transition-all
              duration-200

              hover:border-brand-gold/20
              hover:bg-white/[0.07]

              ${
                collapsed
                  ? "justify-center p-2"
                  : ""
              }
            `}
          >
            {/* Avatar */}

            <div
              className="
                relative

                flex
                h-10
                w-10
                shrink-0

                items-center
                justify-center

                overflow-hidden

                rounded-xl

                bg-gradient-to-br
                from-brand-gold
                to-brand-gold/70

                text-xs
                font-bold
                text-brand-navy

                shadow-lg
                shadow-brand-gold/10

                ring-1
                ring-brand-gold/20
              "
            >
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

              {/* Online indicator */}

              <span
                className="
                  absolute
                  bottom-0.5
                  right-0.5

                  h-2.5
                  w-2.5

                  rounded-full

                  border-2
                  border-brand-navy

                  bg-emerald-400
                "
              />
            </div>

            {/* User information */}

            <div
              className={`
                min-w-0
                flex-1
                overflow-hidden

                transition-all
                duration-300

                ${
                  collapsed
                    ? "hidden"
                    : ""
                }
              `}
            >
              <p className="truncate text-xs font-semibold text-white">
                {userName}
              </p>

              <p className="mt-0.5 truncate text-[10px] text-white/35">
                {userEmail}
              </p>
            </div>

            {/* Chevron */}

            <ChevronDown
              className={`
                h-4
                w-4
                shrink-0

                text-white/30

                transition-transform
                duration-200

                ${
                  profileOpen
                    ? "rotate-180 text-brand-gold"
                    : ""
                }

                ${
                  collapsed
                    ? "hidden"
                    : ""
                }
              `}
            />
          </button>

          {/* =================================================
              PROFILE DROPDOWN
          ================================================= */}

          {profileOpen && (
            <div
              role="menu"
              className={`
                absolute

                bottom-full
                mb-3

                overflow-hidden

                rounded-2xl

                border
                border-white/[0.09]

                bg-[#081a35]

                shadow-2xl
                shadow-black/30

                backdrop-blur-xl

                ${
                  collapsed
                    ? "left-[76px] w-64"
                    : "left-3 right-3"
                }
              `}
            >
              {/* Profile header */}

              <div className="border-b border-white/[0.07] bg-white/[0.025] p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="
                      relative

                      flex
                      h-11
                      w-11
                      shrink-0

                      items-center
                      justify-center

                      overflow-hidden

                      rounded-xl

                      bg-gradient-to-br
                      from-brand-gold
                      to-brand-gold/70

                      text-sm
                      font-bold
                      text-brand-navy
                    "
                  >
                    {userImage ? (
                      <Image
                        src={userImage}
                        alt={userName}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {userName}
                    </p>

                    <p className="mt-0.5 truncate text-[10px] text-white/40">
                      {userEmail}
                    </p>
                  </div>
                </div>

                {/* Status */}

                <div className="mt-3 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                  <span className="text-[10px] font-medium text-emerald-300/80">
                    Lecturer account active
                  </span>
                </div>
              </div>

              {/* =================================================
                  MENU
              ================================================= */}

              <div className="p-2">
                {/* PROFILE */}

                <Link
                  href="/dashboards/lecturer/profile"
                  onClick={() => {
                    setProfileOpen(false);
                    onMobileClose?.();
                  }}
                  role="menuitem"
                  aria-current={
                    profileActive
                      ? "page"
                      : undefined
                  }
                  className={`
                    group

                    flex
                    items-center
                    gap-3

                    rounded-xl

                    px-3
                    py-3

                    transition

                    ${
                      profileActive
                        ? "bg-brand-gold/10"
                        : "hover:bg-white/[0.06]"
                    }
                  `}
                >
                  <span
                    className={`
                      flex
                      h-9
                      w-9
                      shrink-0

                      items-center
                      justify-center

                      rounded-lg

                      transition

                      ${
                        profileActive
                          ? "bg-brand-gold/15 text-brand-gold"
                          : "bg-white/[0.05] text-white/50 group-hover:bg-brand-gold/10 group-hover:text-brand-gold"
                      }
                    `}
                  >
                    <UserRound className="h-4 w-4" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`
                        text-xs
                        font-semibold

                        ${
                          profileActive
                            ? "text-brand-gold"
                            : "text-white/80 group-hover:text-white"
                        }
                      `}
                    >
                      My Profile
                    </p>

                    <p className="mt-0.5 text-[10px] text-white/30">
                      View and update your profile
                    </p>
                  </div>

                  <ChevronRight
                    className={`
                      h-3.5
                      w-3.5

                      transition

                      ${
                        profileActive
                          ? "text-brand-gold"
                          : "text-white/20 group-hover:translate-x-0.5 group-hover:text-brand-gold"
                      }
                    `}
                  />
                </Link>

                {/* SETTINGS */}

                <Link
                  href="/dashboards/lecturer/settings"
                  onClick={() => {
                    setProfileOpen(false);
                    onMobileClose?.();
                  }}
                  role="menuitem"
                  aria-current={
                    settingsActive
                      ? "page"
                      : undefined
                  }
                  className={`
                    group

                    flex
                    items-center
                    gap-3

                    rounded-xl

                    px-3
                    py-3

                    transition

                    ${
                      settingsActive
                        ? "bg-brand-gold/10"
                        : "hover:bg-white/[0.06]"
                    }
                  `}
                >
                  <span
                    className={`
                      flex
                      h-9
                      w-9
                      shrink-0

                      items-center
                      justify-center

                      rounded-lg

                      transition

                      ${
                        settingsActive
                          ? "bg-brand-gold/15 text-brand-gold"
                          : "bg-white/[0.05] text-white/50 group-hover:bg-brand-gold/10 group-hover:text-brand-gold"
                      }
                    `}
                  >
                    <Settings className="h-4 w-4" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`
                        text-xs
                        font-semibold

                        ${
                          settingsActive
                            ? "text-brand-gold"
                            : "text-white/80 group-hover:text-white"
                        }
                      `}
                    >
                      Settings
                    </p>

                    <p className="mt-0.5 text-[10px] text-white/30">
                      Manage your account
                    </p>
                  </div>

                  <ChevronRight
                    className={`
                      h-3.5
                      w-3.5

                      transition

                      ${
                        settingsActive
                          ? "text-brand-gold"
                          : "text-white/20 group-hover:translate-x-0.5 group-hover:text-brand-gold"
                      }
                    `}
                  />
                </Link>

                {/* SIGN OUT */}

                <button
                  type="button"
                  onClick={openLogoutModal}
                  role="menuitem"
                  className="
                    group

                    flex
                    w-full
                    items-center
                    gap-3

                    rounded-xl

                    px-3
                    py-3

                    text-left

                    transition

                    hover:bg-red-500/[0.08]
                  "
                >
                  <span
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0

                      items-center
                      justify-center

                      rounded-lg

                      bg-white/[0.05]

                      text-white/50

                      transition

                      group-hover:bg-red-500/10
                      group-hover:text-red-300
                    "
                  >
                    <LogOut className="h-4 w-4" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white/80 group-hover:text-white">
                      Sign out
                    </p>

                    <p className="mt-0.5 text-[10px] text-white/30">
                      End your lecturer session
                    </p>
                  </div>
                </button>
              </div>

              {/* Footer */}

              <div className="border-t border-white/[0.06] px-4 py-2.5">
                <p className="text-center text-[9px] uppercase tracking-[0.16em] text-white/20">
                  ITMT Lecturer Portal
                </p>
              </div>
            </div>
          )}

          {/* =================================================
              SIDEBAR FOOTER
          ================================================= */}

          <p
            className={`
              mt-3

              text-center

              text-[9px]
              tracking-wide
              text-white/20

              transition-all
              duration-300

              ${
                collapsed
                  ? "hidden"
                  : ""
              }
            `}
          >
            ITMT MANAGEMENT SYSTEM • LECTURER
          </p>
        </div>
      </aside>

      {/* =====================================================
          FLOATING MOBILE CLOSE BUTTON

          IMPORTANT:
          This stays OUTSIDE the sidebar.
      ====================================================== */}

      <div
       className={`
          pointer-events-none
          fixed
          left-85
          top-150
          z-[100]
          -translate-x-1/2
          lg:hidden
          transition-all
          duration-300
          ease-out

          ${
            mobileOpen
              ? "translate-y-0 opacity-100"
              : "-translate-y-5 opacity-0"
          }
        `}
      >
        <button
          type="button"
          onClick={onMobileClose}
          aria-label="Close lecturer menu"
          title="Close menu"
          className="
            pointer-events-auto

            flex
            h-10
            w-10

            -translate-x-1/2

            items-center
            justify-center

            rounded-full

            border
            border-white/10

            bg-brand-navy

            text-white/60

            shadow-xl
            shadow-black/30

            transition-all
            duration-200

            hover:border-brand-gold/30
            hover:bg-brand-gold
            hover:text-brand-navy

            focus:outline-none
            focus:ring-2
            focus:ring-brand-gold/40
          "
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* =====================================================
          LOGOUT MODAL
      ====================================================== */}

      {logoutModalOpen && (
        <div
          className="
            fixed
            inset-0
            z-[200]

            flex
            items-center
            justify-center

            bg-slate-950/70

            p-4

            backdrop-blur-md
          "
          role="dialog"
          aria-modal="true"
          aria-labelledby="lecturer-logout-title"
          aria-describedby="lecturer-logout-description"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeLogoutModal();
            }
          }}
        >
          <div
            className="
              relative

              w-full
              max-w-md

              overflow-hidden

              rounded-3xl

              border
              border-white/10

              bg-brand-navy

              shadow-[0_30px_100px_rgba(0,0,0,0.45)]
            "
          >
            {/* Decorative glow */}

            <div
              className="
                pointer-events-none

                absolute
                -right-20
                -top-20

                h-48
                w-48

                rounded-full

                bg-red-500/10

                blur-3xl
              "
            />

            <div
              className="
                pointer-events-none

                absolute
                -bottom-20
                -left-20

                h-40
                w-40

                rounded-full

                bg-brand-gold/5

                blur-3xl
              "
            />

            {/* Close */}

            <button
              type="button"
              onClick={closeLogoutModal}
              disabled={signingOut}
              aria-label="Close logout dialog"
              className="
                absolute
                right-4
                top-4
                z-10

                flex
                h-9
                w-9

                items-center
                justify-center

                rounded-xl

                text-white/35

                transition

                hover:bg-white/[0.06]
                hover:text-white

                disabled:cursor-not-allowed
              "
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative p-6 sm:p-7">
              {/* Warning icon */}

              <div
                className="
                  mb-5

                  flex
                  h-14
                  w-14

                  items-center
                  justify-center

                  rounded-2xl

                  border
                  border-red-400/20

                  bg-red-400/10

                  text-red-300

                  shadow-lg
                  shadow-red-950/20
                "
              >
                <AlertTriangle className="h-6 w-6" />
              </div>

              {/* Heading */}

              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">
                  Lecturer Portal
                </p>

                <h2
                  id="lecturer-logout-title"
                  className="
                    text-xl
                    font-bold
                    tracking-tight
                    text-white

                    sm:text-2xl
                  "
                >
                  Are you sure you want to sign out?
                </h2>

                <p
                  id="lecturer-logout-description"
                  className="
                    mt-3

                    text-sm
                    leading-6
                    text-white/50
                  "
                >
                  You are about to leave your lecturer
                  account. Your current session will be
                  securely ended.
                </p>
              </div>

              {/* User preview */}

              <div
                className="
                  mt-6

                  flex
                  items-center
                  gap-3

                  rounded-2xl

                  border
                  border-white/[0.07]

                  bg-white/[0.035]

                  p-3
                "
              >
                <div
                  className="
                    relative

                    flex
                    h-10
                    w-10
                    shrink-0

                    items-center
                    justify-center

                    overflow-hidden

                    rounded-xl

                    bg-gradient-to-br
                    from-brand-gold
                    to-brand-gold/70

                    text-xs
                    font-bold
                    text-brand-navy
                  "
                >
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
                  <p className="truncate text-xs font-semibold text-white">
                    {userName}
                  </p>

                  <p className="truncate text-[10px] text-white/35">
                    {userEmail}
                  </p>
                </div>

                <ShieldCheck className="ml-auto h-4 w-4 shrink-0 text-emerald-400/70" />
              </div>

              {/* Buttons */}

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeLogoutModal}
                  disabled={signingOut}
                  className="
                    h-11
                    rounded-xl

                    border
                    border-white/[0.08]

                    bg-white/[0.04]

                    px-5

                    text-sm
                    font-semibold
                    text-white/70

                    transition

                    hover:bg-white/[0.08]
                    hover:text-white

                    disabled:cursor-not-allowed
                    disabled:opacity-50

                    sm:min-w-[110px]
                  "
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="
                    flex
                    h-11

                    items-center
                    justify-center
                    gap-2

                    rounded-xl

                    bg-red-500

                    px-5

                    text-sm
                    font-semibold
                    text-white

                    shadow-lg
                    shadow-red-950/20

                    transition

                    hover:bg-red-400

                    disabled:cursor-not-allowed
                    disabled:opacity-60

                    sm:min-w-[145px]
                  "
                >
                  {signingOut ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing out...
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4" />
                      Yes, sign out
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