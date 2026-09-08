"use client";

import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  ArrowDownToLine,
  BarChart3,
  Banknote,
  Bell,
  BookOpen,
  Calculator,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CreditCard,
  FileBarChart,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
  Wallet,
  X,
  Megaphone,
  ShieldCheck,
  AlertTriangle,
  Loader2,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
} from "react";

import { useFinanceDashboard } from "@/components/dashboard/finance/finance-dashboard-context";

interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navigation: NavSection[] = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboards/finance",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Fee Management",
    items: [
      {
        label: "Fee Structures",
        href: "/dashboards/finance/fees",
        icon: Calculator,
      },
      {
        label: "Student Fees",
        href: "/dashboards/finance/students-fee",
        icon: FileText,
      },
      {
        label: "Fee Categories",
        href: "/dashboards/finance/fee-categories",
        icon: BookOpen,
      },
    ],
  },
  {
    label: "Payments",
    items: [
      {
        label: "Record Payment",
        href: "/dashboards/finance/payments/record",
        icon: Banknote,
      },
      {
        label: "Payment History",
        href: "/dashboards/finance/payments",
        icon: History,
      },
      {
        label: "Receipts",
        href: "/dashboards/finance/receipts",
        icon: Receipt,
      },
      {
        label: "Refunds",
        href: "/dashboards/finance/refunds",
        icon: ArrowDownToLine,
      },
    ],
  },
  {
    label: "Student Finance",
    items: [
      {
        label: "Outstanding Fees",
        href: "/dashboards/finance/outstanding-fees",
        icon: Wallet,
      },
    ],
  },
  {
    label: "Reports",
    items: [
      {
        label: "Financial Reports",
        href: "/dashboards/finance/reports",
        icon: FileBarChart,
      },
      {
        label: "Payment Reports",
        href: "/dashboards/finance/reports",
        icon: BarChart3,
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        label: "Notifications",
        href: "/dashboards/finance/notifications",
        icon: Bell,
      },
      {
        label: "Announcements",
        href: "/dashboards/finance/announcements",
        icon: Megaphone,
      },
      // {
      //   label: "Settings",
      //   href: "/dashboards/finance/settings",
      //   icon: Settings,
      // },
    ],
  },
];

export default function FinanceSidebar() {
  const pathname = usePathname();

  const { data: session } = useSession();

  const {
    collapsed,
    toggleSidebar,
    mobileOpen,
    setMobileOpen,
  } = useFinanceDashboard();

  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  /*
   * ---------------------------------------------------------
   * USER INFORMATION
   * ---------------------------------------------------------
   */

  const userName =
    session?.user?.name?.trim() || "Finance Administrator";

  const userEmail =
    session?.user?.email?.trim() || "finance@itmt.edu.ng";

  const userImage = session?.user?.image || null;

  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "FA";

  /*
   * ---------------------------------------------------------
   * ACTIVE NAVIGATION
   * ---------------------------------------------------------
   */

  function isActive(href: string) {
    if (href === "/dashboards/finance") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  /*
   * ---------------------------------------------------------
   * MOBILE NAVIGATION
   * ---------------------------------------------------------
   */

  function handleNavClick() {
    setMobileOpen(false);
    setProfileOpen(false);
  }

  /*
   * ---------------------------------------------------------
   * PROFILE DROPDOWN
   * ---------------------------------------------------------
   */

  function toggleProfile() {
    setProfileOpen((current) => !current);
  }

  /*
   * Close profile dropdown when clicking outside
   */
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    if (profileOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [profileOpen]);

  /*
   * Close dropdown with Escape
   */
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setLogoutModalOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * LOGOUT
   * ---------------------------------------------------------
   */

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
      console.error("Sign out error:", error);

      setSigningOut(false);
      setLogoutModalOpen(false);
    }
  }

  return (
    <>
      {/* =====================================================
          MOBILE BACKDROP
      ====================================================== */}
      <div
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
        className={`
          fixed inset-0 z-40
          bg-slate-950/60
          backdrop-blur-sm
          transition-opacity duration-300
          md:hidden
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
          fixed inset-y-0 left-0 z-50
          flex w-72 flex-col
          border-r border-white/[0.07]
          bg-brand-navy
          text-white
          shadow-[8px_0_30px_rgba(0,0,0,0.08)]
          transition-transform duration-300 ease-in-out

          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}

          md:translate-x-0
          md:transition-[width]
          md:duration-300
          md:ease-in-out

          ${collapsed ? "md:w-[88px]" : "md:w-72"}
        `}
      >
        {/* =====================================================
            MOBILE CLOSE
        ====================================================== */}
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
          className="
            absolute right-3 top-3 z-10
            flex h-8 w-8 items-center justify-center
            rounded-lg
            text-white/50
            transition
            hover:bg-white/[0.08]
            hover:text-white
            md:hidden
          "
        >
          <X className="h-4 w-4" />
        </button>

        {/* =====================================================
            BRAND
        ====================================================== */}
        <div
          className={`
            pt-5
            transition-all
            duration-300
            ${collapsed ? "px-3 md:px-3" : "px-5"}
          `}
        >
          <div
            className={`
              relative overflow-hidden
              rounded-2xl
              border border-white/[0.08]
              bg-gradient-to-br
              from-white/[0.08]
              to-white/[0.02]
              transition-all
              duration-300
              ${collapsed ? "p-4 md:p-3" : "p-4"}
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
              href="/dashboards/finance"
              onClick={handleNavClick}
              title={collapsed ? "ITMT Finance Portal" : undefined}
              className={`
                relative
                flex
                items-center
                gap-3
                transition-all
                duration-300
                ${collapsed ? "md:justify-center" : ""}
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
                  w-auto opacity-100
                  ${collapsed ? "md:w-0 md:opacity-0" : ""}
                `}
              >
                <p className="text-sm font-bold tracking-tight text-white">
                  ITMT
                </p>

                <p className="mt-0.5 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.16em] text-white/40">
                  Finance Portal
                </p>
              </div>
            </Link>

            <div
              className={`
                relative
                mt-4
                flex
                items-center
                gap-2
                transition-all
                duration-300
                ${collapsed ? "md:mt-3 md:justify-center" : ""}
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
                  ${collapsed ? "md:hidden md:w-0 md:opacity-0" : ""}
                `}
              >
                Finance system online
              </span>
            </div>
          </div>
        </div>

        {/* =====================================================
            NAVIGATION
        ====================================================== */}
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
                    ${collapsed ? "md:justify-center md:gap-0 md:px-0" : ""}
                  `}
                >
                  {collapsed ? (
                    <>
                      <span className="hidden h-px w-8 bg-white/[0.08] md:block" />

                      <span className="whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.2em] text-white/30 md:hidden">
                        {section.label}
                      </span>

                      <div className="h-px flex-1 bg-white/[0.05] md:hidden" />
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
                        key={`${section.label}-${item.href}-${item.label}`}
                        href={item.href}
                        onClick={handleNavClick}
                        aria-current={
                          active ? "page" : undefined
                        }
                        title={collapsed ? item.label : undefined}
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

                          ${collapsed
                            ? "md:justify-center md:px-2"
                            : ""}

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

                            ${collapsed
                              ? "md:w-0 md:opacity-0"
                              : ""}

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
                                ? "md:hidden"
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

        {/* =====================================================
            FINANCE PROFILE + DROPDOWN
        ====================================================== */}
        <div
          ref={profileRef}
          className={`
            relative
            border-t
            border-white/[0.07]
            transition-all
            duration-300
            ${collapsed ? "p-3" : "p-4"}
          `}
        >
          {/* ===================================================
              PROFILE BUTTON
          ==================================================== */}
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

              ${collapsed ? "md:justify-center md:p-2" : ""}
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
                ${collapsed ? "md:hidden" : ""}
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

                ${profileOpen ? "rotate-180 text-brand-gold" : ""}

                ${collapsed ? "md:hidden" : ""}
              `}
            />
          </button>

          {/* ===================================================
              PROFILE DROPDOWN
          ==================================================== */}
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
                animate-in
                fade-in
                slide-in-from-bottom-2
                duration-200

                left-3
                right-3

                ${collapsed
                  ? "md:left-[76px] md:right-auto md:w-64"
                  : ""}
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

                <div className="mt-3 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                  <span className="text-[10px] font-medium text-emerald-300/80">
                    Finance account active
                  </span>
                </div>
              </div>

              {/* Menu items */}
              <div className="p-2">
                <Link
                  href="/dashboards/finance/settings"
                  onClick={() => {
                    setProfileOpen(false);
                    setMobileOpen(false);
                  }}
                  role="menuitem"
                  className="
                    group
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-3
                    transition
                    hover:bg-white/[0.06]
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
                      group-hover:bg-brand-gold/10
                      group-hover:text-brand-gold
                    "
                  >
                    <Settings className="h-4 w-4" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white/80 group-hover:text-white">
                      Settings
                    </p>

                    <p className="mt-0.5 text-[10px] text-white/30">
                      Manage your account
                    </p>
                  </div>

                  <ChevronRight className="h-3.5 w-3.5 text-white/20 transition group-hover:translate-x-0.5 group-hover:text-brand-gold" />
                </Link>

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
                      End your finance session
                    </p>
                  </div>
                </button>
              </div>

              {/* Footer */}
              <div className="border-t border-white/[0.06] px-4 py-2.5">
                <p className="text-center text-[9px] uppercase tracking-[0.16em] text-white/20">
                  ITMT Finance Portal
                </p>
              </div>
            </div>
          )}

          {/* Footer label */}
          <p
            className={`
              mt-3
              text-center
              text-[9px]
              tracking-wide
              text-white/20
              transition-all
              duration-300
              ${collapsed ? "md:hidden" : ""}
            `}
          >
            ITMT MANAGEMENT SYSTEM • FINANCE
          </p>
        </div>

        {/* =====================================================
            DESKTOP COLLAPSE BUTTON
        ====================================================== */}
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={
            collapsed ? "Expand sidebar" : "Collapse sidebar"
          }
          title={
            collapsed ? "Expand sidebar" : "Collapse sidebar"
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
            md:flex
          "
        >
          {collapsed ? (
            <ChevronsRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronsLeft className="h-3.5 w-3.5" />
          )}
        </button>
      </aside>

      {/* =======================================================
          PREMIUM LOGOUT CONFIRMATION MODAL
      ======================================================== */}
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
            animate-in
            fade-in
            duration-200
          "
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
          aria-describedby="logout-description"
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
              animate-in
              zoom-in-95
              slide-in-from-bottom-3
              duration-300
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
              {/* Icon */}
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
                  Finance Portal
                </p>

                <h2
                  id="logout-title"
                  className="text-xl font-bold tracking-tight text-white sm:text-2xl"
                >
                  Are you sure you want to sign out?
                </h2>

                <p
                  id="logout-description"
                  className="mt-3 text-sm leading-6 text-white/50"
                >
                  You are about to leave your finance account.
                  Your current session will be securely ended.
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