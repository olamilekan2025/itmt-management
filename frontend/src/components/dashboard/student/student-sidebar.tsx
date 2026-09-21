"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  BookOpen,
  CalendarCheck,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  CreditCard,
  FileBarChart,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  LogOut,
  Megaphone,
  Receipt,
  Settings,
  ShieldCheck,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";
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

interface StudentSidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  onClose?: () => void;
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
        href: "/dashboards/student",
        icon: LayoutDashboard,
      },
    ],
  },

  {
    label: "Academic",
    items: [
      {
        label: "My Courses",
        href: "/dashboards/student/courses",
        icon: BookOpen,
      },
      {
        label: "Course Registration",
        href: "/dashboards/student/registration",
        icon: ClipboardList,
      },
      {
        label: "Results",
        href: "/dashboards/student/results",
        icon: BarChart3,
      },
      {
        label: "Academic Progress",
        href: "/dashboards/student/progress",
        icon: GraduationCap,
      },
      {
        label: "Transcript",
        href: "/dashboards/student/transcript",
        icon: FileText,
      },
    ],
  },

  {
    label: "Attendance",
    items: [
      {
        label: "My Attendance",
        href: "/dashboards/student/attendance",
        icon: CalendarCheck,
      },
    ],
  },

  {
    label: "Finance",
    items: [
      {
        label: "School Fees",
        href: "/dashboards/student/finance",
        icon: WalletCards,
      },
      {
        label: "Payment History",
        href: "/dashboards/student/payments",
        icon: Receipt,
      },
      {
        label: "Outstanding Fees",
        href: "/dashboards/student/outstanding",
        icon: CreditCard,
      },
    ],
  },

  {
    label: "Communication",
    items: [
      {
        label: "Announcements",
        href: "/dashboards/student/announcements",
        icon: Megaphone,
      },
      {
        label: "Notifications",
        href: "/dashboards/student/notifications",
        icon: Bell,
      },
    ],
  },

  {
    label: "Documents",
    items: [
      {
        label: "My Documents",
        href: "/dashboards/student/documents",
        icon: FileBarChart,
      },
    ],
  },

  {
    label: "Account",
    items: [
      {
        label: "My Profile",
        href: "/dashboards/student/profile",
        icon: UserRound,
      },
      {
        label: "Settings",
        href: "/dashboards/student/settings",
        icon: Settings,
      },
    ],
  },
];

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
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  /* =======================================================
     MOBILE CLOSE
  ======================================================= */

  const closeMobileSidebar = () => {
    onMobileClose?.();
    onClose?.();
  };

  /* =======================================================
     USER INFORMATION
  ======================================================= */

  const userName =
    session?.user?.name?.trim() || "Student";

  const userEmail =
    session?.user?.email?.trim() ||
    "student@itmt.edu.ng";

  const userImage = session?.user?.image || null;

  const initials =
    userName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "ST";

  /* =======================================================
     ACTIVE NAVIGATION
  ======================================================= */

  const isActive = (href: string) => {
    if (href === "/dashboards/student") {
      return pathname === href;
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  /* =======================================================
     NAVIGATION CLICK
  ======================================================= */

  const handleNavClick = () => {
    closeMobileSidebar();
    setProfileOpen(false);
  };

  /* =======================================================
     PROFILE
  ======================================================= */

  const toggleProfile = () => {
    setProfileOpen((current) => !current);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

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
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileOpen(false);

        if (!signingOut) {
          setLogoutModalOpen(false);
        }
      }
    };

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
  }, [signingOut]);

  /* =======================================================
     LOGOUT
  ======================================================= */

  const openLogoutModal = () => {
    setProfileOpen(false);
    setLogoutModalOpen(true);
  };

  const closeLogoutModal = () => {
    if (signingOut) return;

    setLogoutModalOpen(false);
  };

  const handleSignOut = async () => {
    if (signingOut) return;

    try {
      setSigningOut(true);

      await signOut({
        callbackUrl: "/auth/login",
      });
    } catch (error) {
      console.error(
        "Student sign out error:",
        error,
      );

      setSigningOut(false);
      setLogoutModalOpen(false);
    }
  };

  /* =======================================================
     PROFILE ACTIVE STATES
  ======================================================= */

  const profileActive =
    pathname === "/dashboards/student/profile" ||
    pathname.startsWith(
      "/dashboards/student/profile/",
    );

  const settingsActive =
    pathname === "/dashboards/student/settings" ||
    pathname.startsWith(
      "/dashboards/student/settings/",
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
        onClick={closeMobileSidebar}
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
        aria-label="Student navigation"
        className={`
          fixed
          inset-y-0
          left-0
          z-50

          flex
          flex-col

          w-72

          border-r
          border-white/[0.07]

          bg-brand-navy
          text-white

          shadow-[8px_0_30px_rgba(0,0,0,0.08)]

          transition-transform
          duration-300
          ease-in-out

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }

          lg:translate-x-0

          lg:transition-[width]
          lg:duration-300
          lg:ease-in-out

          ${
            collapsed
              ? "lg:w-[88px]"
              : "lg:w-72"
          }
        `}
      >
        {/* ===================================================
            MOBILE CLOSE
        ==================================================== */}

        <button
          type="button"
          onClick={closeMobileSidebar}
          aria-label="Close student navigation"
          className="
            absolute
            right-3
            top-3
            z-10

            flex
            h-8
            w-8
            items-center
            justify-center

            rounded-lg

            text-white/50

            transition

            hover:bg-white/[0.08]
            hover:text-white

            lg:hidden
          "
        >
          <X className="h-4 w-4" />
        </button>

        {/* ===================================================
            BRAND
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
                  ? "p-4 lg:p-3"
                  : "p-4"
              }
            `}
          >
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

            <Link
              href="/dashboards/student"
              onClick={handleNavClick}
              title={
                collapsed
                  ? "ITMT Student Portal"
                  : undefined
              }
              className={`
                relative

                flex
                items-center
                gap-3

                transition-all
                duration-300

                ${
                  collapsed
                    ? "lg:justify-center"
                    : ""
                }
              `}
            >
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
                "
              >
                <Image
                  src="/newLogo.png"
                  alt="ITMT logo"
                  fill
                  sizes="44px"
                  priority
                  className="object-contain p-1.5"
                />
              </div>

              <div
                className={`
                  min-w-0
                  overflow-hidden

                  transition-all
                  duration-300

                  w-auto
                  opacity-100

                  ${
                    collapsed
                      ? "lg:w-0 lg:opacity-0"
                      : ""
                  }
                `}
              >
                <p className="text-sm font-bold tracking-tight text-white">
                  ITMT
                </p>

                <p className="mt-0.5 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.16em] text-white/40">
                  Student Portal
                </p>
              </div>
            </Link>

            {/* Online status */}

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
                    ? "lg:mt-3 lg:justify-center"
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
                  block
                  w-auto
                  whitespace-nowrap

                  text-[10px]
                  font-medium
                  text-white/45

                  opacity-100

                  transition-all
                  duration-300

                  ${
                    collapsed
                      ? "lg:hidden lg:w-0 lg:opacity-0"
                      : ""
                  }
                `}
              >
                Student portal online
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
                        ? "lg:justify-center lg:gap-0 lg:px-0"
                        : ""
                    }
                  `}
                >
                  {collapsed ? (
                    <>
                      <span className="hidden h-px w-8 bg-white/[0.08] lg:block" />

                      <span className="whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.2em] text-white/30 lg:hidden">
                        {section.label}
                      </span>

                      <div className="h-px flex-1 bg-white/[0.05] lg:hidden" />
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

                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={`${section.label}-${item.href}`}
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
                              ? "lg:justify-center lg:px-2"
                              : ""
                          }

                          ${
                            active
                              ? "bg-white/[0.08]"
                              : "hover:bg-white/[0.06]"
                          }
                        `}
                      >
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

                        <span
                          className={`
                            min-w-0
                            flex-1

                            truncate

                            text-[13px]
                            font-medium

                            transition-all
                            duration-300

                            w-auto
                            opacity-100

                            ${
                              collapsed
                                ? "lg:w-0 lg:opacity-0"
                                : ""
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

                        <ChevronRight
                          className={`
                            h-3.5
                            w-3.5
                            shrink-0

                            transition-all
                            duration-200

                            ${
                              collapsed
                                ? "lg:hidden"
                                : active
                                  ? "translate-x-0.5 text-brand-gold/50"
                                  : "text-white/0 group-hover:translate-x-0.5 group-hover:text-white/25"
                            }
                          `}
                        />
                      </Link>
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
          <button
            type="button"
            onClick={toggleProfile}
            aria-expanded={profileOpen}
            aria-haspopup="menu"
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
                  ? "lg:justify-center lg:p-2"
                  : ""
              }
            `}
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

            <div
              className={`
                min-w-0
                flex-1
                overflow-hidden

                transition-all
                duration-300

                ${
                  collapsed
                    ? "lg:hidden"
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
                    ? "lg:hidden"
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

                left-3
                right-3

                ${
                  collapsed
                    ? "lg:left-[76px] lg:right-auto lg:w-64"
                    : ""
                }
              `}
            >
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

                <div className="mt-3 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                  <span className="text-[10px] font-medium text-emerald-300/80">
                    Student account active
                  </span>
                </div>
              </div>

              <div className="p-2">
                {/* Profile */}

                <Link
                  href="/dashboards/student/profile"
                  onClick={() => {
                    setProfileOpen(false);
                    closeMobileSidebar();
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

                {/* Settings */}

                <Link
                  href="/dashboards/student/settings"
                  onClick={() => {
                    setProfileOpen(false);
                    closeMobileSidebar();
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

                <div className="my-1 border-t border-white/[0.06]" />

                {/* Sign out */}

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
                      End your student session
                    </p>
                  </div>
                </button>
              </div>

              <div className="border-t border-white/[0.06] px-4 py-2.5">
                <p className="text-center text-[9px] uppercase tracking-[0.16em] text-white/20">
                  ITMT Student Portal
                </p>
              </div>
            </div>
          )}

          {/* Sidebar footer */}

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
                  ? "lg:hidden"
                  : ""
              }
            `}
          >
            ITMT MANAGEMENT SYSTEM • STUDENT PORTAL
          </p>
        </div>

        {/* ===================================================
            DESKTOP COLLAPSE BUTTON
        ==================================================== */}

        {onCollapsedChange && (
          <button
            type="button"
            onClick={() =>
              onCollapsedChange(!collapsed)
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
            className="
              absolute
              -right-3
              top-24
              z-[60]

              hidden

              h-7
              w-7

              items-center
              justify-center

              rounded-full

              border
              border-white/10

              bg-brand-navy

              text-white/50

              shadow-lg
              shadow-black/20

              transition-all
              duration-200

              hover:border-brand-gold/30
              hover:bg-brand-gold
              hover:text-brand-navy

              focus:outline-none
              focus:ring-2
              focus:ring-brand-gold/30

              lg:flex
            "
          >
            {collapsed ? (
              <ChevronsRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronsLeft className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </aside>

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
          aria-labelledby="student-logout-title"
          aria-describedby="student-logout-description"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
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

              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">
                  Student Portal
                </p>

                <h2
                  id="student-logout-title"
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
                  id="student-logout-description"
                  className="
                    mt-3

                    text-sm
                    leading-6
                    text-white/50
                  "
                >
                  You are about to leave your student
                  account. Your current session will be
                  securely ended.
                </p>
              </div>

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

