"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
} from "react";

import {
  ArrowDownToLine,
  BarChart3,
  Banknote,
  BookOpen,
  Calculator,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileBarChart,
  FileText,
  Globe2,
  History,
  LayoutDashboard,
  LogOut,
  Megaphone,
  PanelLeftClose,
  PanelLeftOpen,
  Receipt,
  Settings,
  Wallet,
  X,
} from "lucide-react";

import { useFinanceDashboard } from "@/components/dashboard/finance/finance-dashboard-context";
import { logoutUser } from "@/lib/auth/sign-out";
import LogoutConfirmModal from "@/components/common/logout-confirm-modal";

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

/* =========================================================
   NAVIGATION
========================================================= */

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
        icon: Wallet,
      },
      {
        label: "Announcements",
        href: "/dashboards/finance/announcements",
        icon: Megaphone,
      },
    ],
  },
];

/* =========================================================
   COMPONENT
========================================================= */

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

  /* =======================================================
     USER INFORMATION
  ======================================================= */

  const userName =
    session?.user?.name?.trim() || "Finance Administrator";

  const userEmail =
    session?.user?.email?.trim() || "finance@itmt.edu.ng";

  const userImage = session?.user?.image || null;

  const initials =
    userName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "FA";

  /* =======================================================
     ACTIVE NAVIGATION
  ======================================================= */

  const isActive = useCallback(
    (href: string) => {
      if (href === "/dashboards/finance") {
        return pathname === href;
      }

      return pathname === href || pathname.startsWith(`${href}/`);
    },
    [pathname],
  );

  /* =======================================================
     PROFILE AND LOGOUT
  ======================================================= */

  const toggleProfile = () => {
    setProfileOpen((current) => !current);
  };

  const openLogoutModal = () => {
    setProfileOpen(false);
    setMobileOpen(false);
    setLogoutModalOpen(true);
  };

  const closeLogoutModal = () => {
    if (signingOut) return;
    setLogoutModalOpen(false);
  };

  const handleSignOut = async () => {
    if (signingOut) return;

    setSigningOut(true);

    try {
      await logoutUser("/");
    } catch (error) {
      console.error("Finance sign-out error:", error);
      setSigningOut(false);
    }
  };

  /* =======================================================
     NAVIGATION HANDLERS
  ======================================================= */

  const handleNavClick = () => {
    setProfileOpen(false);
    setMobileOpen(false);
  };

  const handleMobileClose = () => {
    setMobileOpen(false);
  };

  /* =======================================================
     CLOSE PROFILE MENU ON OUTSIDE CLICK
  ======================================================= */

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  /* =======================================================
     ESCAPE KEY
  ======================================================= */

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      setProfileOpen(false);

      if (mobileOpen) {
        setMobileOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [mobileOpen, setMobileOpen]);

  /* =======================================================
     MOBILE BODY SCROLL LOCK
  ======================================================= */

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  /* =======================================================
     CLOSE MOBILE SIDEBAR AFTER ROUTE CHANGE
  ======================================================= */

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname, setMobileOpen]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={handleMobileClose}
          className="fixed inset-0 z-[80] bg-brand-dark/60 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-[90]
          flex h-dvh flex-col
          border-r border-white/[0.06]
          bg-brand-dark text-white
          shadow-[12px_0_50px_rgba(0,0,0,0.12)]
          transition-[width,transform] duration-300 ease-in-out
          ${collapsed ? "w-[88px]" : "w-72"}
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* =====================================================
            BRAND / LOGO
        ====================================================== */}

        <div className="shrink-0 border-b border-white/[0.06] px-3 pb-4 pt-5">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={
              collapsed ? "Expand finance sidebar" : "Collapse finance sidebar"
            }
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`
              group/logo flex w-full items-center gap-3 rounded-2xl
              p-2 text-left transition-colors
              hover:bg-white/[0.045]
              ${collapsed ? "justify-center" : ""}
            `}
          >
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] ring-1 ring-white/20 transition-all duration-300 group-hover/logo:scale-[1.04]">
              <Image
                src="/newLogo.png"
                alt="ITMT logo"
                fill
                sizes="48px"
                priority
                className="object-contain p-1.5 transition-all duration-300 group-hover/logo:scale-75 group-hover/logo:opacity-0"
              />

              <span className="absolute inset-0 flex scale-75 items-center justify-center bg-brand-gold text-brand-navy opacity-0 transition-all duration-300 group-hover/logo:scale-100 group-hover/logo:opacity-100">
                {collapsed ? (
                  <PanelLeftOpen className="h-5 w-5" strokeWidth={2.2} />
                ) : (
                  <PanelLeftClose className="h-5 w-5" strokeWidth={2.2} />
                )}
              </span>
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="whitespace-nowrap text-sm font-bold tracking-tight text-white">
                  ITMT
                </p>
                <p className="mt-0.5 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.16em] text-white/40">
                  Finance Portal
                </p>
              </div>
            )}
          </button>

          {/* Online status */}
          <div
            className={`mt-4 flex items-center gap-2 pb-1 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>

            {!collapsed && (
              <span className="whitespace-nowrap text-[10px] font-medium text-white/45">
                Finance system online
              </span>
            )}
          </div>
        </div>

        {/* =====================================================
            NAVIGATION
        ====================================================== */}

        <nav className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 mt-5 flex-1 overflow-y-auto px-3 pb-4">
          <div className="space-y-6">
            {navigation.map((section) => (
              <div key={section.label}>
                {/* Section heading */}
                <div
                  className={`mb-2 flex items-center gap-2 px-3 ${
                    collapsed ? "justify-center px-0" : ""
                  }`}
                >
                  {collapsed ? (
                    <span className="mx-auto block h-px w-8 bg-white/[0.08]" />
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
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={`${section.label}-${item.label}`}
                        href={item.href}
                        onClick={handleNavClick}
                        aria-current={active ? "page" : undefined}
                        title={collapsed ? item.label : undefined}
                        className={`
                          group relative flex w-full items-center gap-3
                          rounded-xl px-3 py-2.5 text-left
                          transition-all duration-200
                          ${collapsed ? "justify-center px-2" : ""}
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
                            absolute left-0 h-6 w-[2px] rounded-r-full
                            bg-brand-gold transition-opacity
                            ${active ? "opacity-100" : "opacity-0"}
                          `}
                        />

                        {/* Icon */}
                        <span
                          className={`
                            flex h-8 w-8 shrink-0 items-center justify-center
                            rounded-lg transition-all duration-200
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
                        {!collapsed && (
                          <span
                            className={`
                              min-w-0 flex-1 truncate text-[13px] font-medium
                              ${
                                active
                                  ? "text-white"
                                  : "text-white/65 group-hover:text-white"
                              }
                            `}
                          >
                            {item.label}
                          </span>
                        )}

                        {/* Chevron */}
                        {!collapsed && (
                          <ChevronRight
                            className={`
                              h-3.5 w-3.5 shrink-0 transition-all duration-200
                              ${
                                active
                                  ? "translate-x-0.5 text-brand-gold/50"
                                  : "text-white/0 group-hover:translate-x-0.5 group-hover:text-white/25"
                              }
                            `}
                          />
                        )}
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
            relative shrink-0 border-t border-white/[0.07]
            transition-all duration-300
            ${collapsed ? "p-3" : "p-4"}
          `}
        >
          {/* Profile button */}
          <button
            type="button"
            onClick={toggleProfile}
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            className={`
              group flex w-full items-center gap-3 rounded-2xl
              border border-white/[0.07] bg-white/[0.035]
              p-2.5 text-left transition-all duration-200
              hover:border-brand-gold/20 hover:bg-white/[0.07]
              ${collapsed ? "justify-center p-2" : ""}
            `}
          >
            {/* Avatar */}
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-gold text-xs font-bold text-brand-navy shadow-lg shadow-brand-gold/10 ring-1 ring-brand-gold/20">
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

              <span className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full border-2 border-brand-dark bg-emerald-400" />
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="truncate text-xs font-semibold text-white">
                  {userName}
                </p>
                <p className="mt-0.5 truncate text-[10px] text-white/35">
                  {userEmail}
                </p>
              </div>
            )}

            {!collapsed && (
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-white/30 transition-transform duration-200 ${
                  profileOpen ? "rotate-180 text-brand-gold" : ""
                }`}
              />
            )}
          </button>

          {/* Profile dropdown */}
          {profileOpen && (
            <div
              role="menu"
              className={`
                absolute bottom-full z-[100] mb-3 overflow-hidden
                rounded-2xl border border-white/[0.09]
                bg-[#081a35] shadow-2xl shadow-black/30
                ${collapsed ? "left-[76px] w-64" : "left-3 right-3"}
              `}
            >
              {/* Profile identity */}
              <div className="border-b border-white/[0.07] bg-white/[0.025] p-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-gold text-sm font-bold text-brand-navy">
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

              <div className="p-2">
                {/* Back to website */}
                <Link
                  href="/"
                  onClick={handleNavClick}
                  role="menuitem"
                  className="group flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-white/[0.06]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-white/50 transition group-hover:bg-brand-gold/10 group-hover:text-brand-gold">
                    <Globe2 className="h-4 w-4" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white/80 group-hover:text-white">
                      Back to Website
                    </p>
                    <p className="mt-0.5 text-[10px] text-white/30">
                      Visit the public website
                    </p>
                  </div>

                  <ExternalLink className="h-3.5 w-3.5 text-white/20 transition group-hover:text-brand-gold" />
                </Link>

                {/* Settings */}
                <Link
                  href="/dashboards/finance/settings"
                  onClick={handleNavClick}
                  role="menuitem"
                  className="group flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-white/[0.06]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-white/50 transition group-hover:bg-brand-gold/10 group-hover:text-brand-gold">
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

                <div className="my-2 border-t border-white/[0.06]" />

                {/* Sign out */}
                <button
                  type="button"
                  onClick={openLogoutModal}
                  role="menuitem"
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-red-500/[0.08]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-white/50 transition group-hover:bg-red-500/10 group-hover:text-red-300">
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

              {/* Dropdown footer */}
              <div className="border-t border-white/[0.06] px-4 py-2.5">
                <p className="text-center text-[9px] uppercase tracking-[0.16em] text-white/20">
                  ITMT Finance Portal
                </p>
              </div>
            </div>
          )}

          {!collapsed && (
            <p className="mt-3 text-center text-[9px] tracking-wide text-white/20">
              ITMT MANAGEMENT SYSTEM • FINANCE
            </p>
          )}
        </div>
      </aside>

      {/* =====================================================
          FLOATING MOBILE CLOSE BUTTON
      ====================================================== */}

      <div
        className={`
          fixed left-[calc(min(18rem,100vw-3rem))] top-1/2 z-[95]
          -translate-x-1/2 -translate-y-1/2
          transition-all duration-300 lg:hidden
          ${
            mobileOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }
        `}
      >
        <button
          type="button"
          onClick={handleMobileClose}
          aria-label="Close finance sidebar"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-brand-navy text-white/70 shadow-[0_12px_35px_rgba(0,0,0,0.30)] transition hover:border-brand-gold/30 hover:bg-brand-gold hover:text-brand-navy"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* =====================================================
          SHARED LOGOUT CONFIRMATION MODAL
      ====================================================== */}

      <LogoutConfirmModal
        isOpen={logoutModalOpen}
        isLoading={signingOut}
        onClose={closeLogoutModal}
        onConfirm={handleSignOut}
      />
    </>
  );
}