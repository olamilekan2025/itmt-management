"use client";

import Image from "next/image";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowDownToLine,
  BarChart3,
  Banknote,
  Bell,
  BookOpen,
  Calculator,
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
} from "lucide-react";
import { useState, type ComponentType } from "react";

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
        label: "Online Payments",
        href: "/dashboards/finance/payments/online",
        icon: CreditCard,
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
        href: "/dashboards/finance/outstanding",
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
        href: "/dashboards/finance/reports/payments",
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
        label: "Settings",
        href: "/dashboards/finance/settings",
        icon: Settings,
      },
    ],
  },
];

export default function FinanceSidebar() {
  const pathname = usePathname();
  const { collapsed, toggleSidebar } = useFinanceDashboard();

  const [signingOut, setSigningOut] = useState(false);

  function isActive(href: string) {
    if (href === "/dashboards/finance") {
      return pathname === href;
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
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
    }
  }

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50
        hidden flex-col
        border-r border-white/[0.07]
        bg-brand-navy
        text-white
        shadow-[8px_0_30px_rgba(0,0,0,0.08)]
        transition-[width]
        duration-300
        ease-in-out
        md:flex
        ${collapsed ? "w-[88px]" : "w-72"}
      `}
    >
      {/* =========================================================
          BRAND
      ========================================================== */}
      <div
        className={`
          pt-5
          transition-all
          duration-300
          ${collapsed ? "px-3" : "px-5"}
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
            ${collapsed ? "p-3" : "p-4"}
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

          <Link
            href="/dashboards/finance"
            title={
              collapsed
                ? "ITMT Finance Portal"
                : undefined
            }
            className={`
              relative
              flex
              items-center
              transition-all
              duration-300
              ${collapsed ? "justify-center" : "gap-3"}
            `}
          >
            {/* Logo */}
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

            {/* Brand */}
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
                Finance Portal
              </p>
            </div>
          </Link>

          {/* Online status */}
          <div
            className={`
              relative
              flex
              items-center
              transition-all
              duration-300
              ${
                collapsed
                  ? "mt-3 justify-center"
                  : "mt-4 gap-2"
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
                    : "block w-auto opacity-100"
                }
              `}
            >
              Finance system online
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================
          NAVIGATION
      ========================================================== */}
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
                  transition-all
                  duration-300
                  ${
                    collapsed
                      ? "justify-center"
                      : "gap-2 px-3"
                  }
                `}
              >
                {collapsed ? (
                  <div className="h-px w-8 bg-white/[0.08]" />
                ) : (
                  <>
                    <span className="whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">
                      {section.label}
                    </span>

                    <div className="h-px flex-1 bg-white/[0.05]" />
                  </>
                )}
              </div>

              {/* Items */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={
                        active ? "page" : undefined
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
                        rounded-xl
                        text-left
                        transition-all
                        duration-200
                        ${
                          collapsed
                            ? "justify-center px-2 py-2.5"
                            : "gap-3 px-3 py-2.5"
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
                              ? "w-0 opacity-0"
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
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* =========================================================
          FOOTER
      ========================================================== */}
      <div
        className={`
          border-t
          border-white/[0.07]
          transition-all
          duration-300
          ${collapsed ? "p-3" : "p-4"}
        `}
      >
        {/* Account */}
        <div
          className={`
            mb-3
            rounded-xl
            border
            border-white/[0.06]
            bg-white/[0.035]
            transition-all
            duration-300
            ${collapsed ? "p-2" : "p-3"}
          `}
        >
          <div
            className={`
              flex
              items-center
              transition-all
              duration-300
              ${
                collapsed
                  ? "justify-center"
                  : "gap-3"
              }
            `}
          >
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-brand-gold/10
                text-xs
                font-bold
                text-brand-gold
              "
              title={
                collapsed
                  ? "Finance Administrator"
                  : undefined
              }
            >
              FA
            </div>

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
              <p className="truncate whitespace-nowrap text-xs font-semibold text-white">
                Finance Administrator
              </p>

              <p className="mt-0.5 truncate whitespace-nowrap text-[10px] text-white/35">
                Finance & Accounts
              </p>
            </div>
          </div>
        </div>

        {/* Sign out */}
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          title={collapsed ? "Sign out" : undefined}
          className={`
            group
            flex
            w-full
            items-center
            rounded-xl
            border
            border-white/[0.07]
            transition-all
            duration-200
            hover:border-red-400/20
            hover:bg-red-400/[0.06]
            disabled:cursor-not-allowed
            disabled:opacity-60
            ${
              collapsed
                ? "justify-center px-2 py-2.5"
                : "gap-3 px-3 py-2.5"
            }
          `}
        >
          <span
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-white/[0.035]
              text-white/40
              transition-colors
              group-hover:bg-red-400/10
              group-hover:text-red-300
            "
          >
            <LogOut className="h-4 w-4" />
          </span>

          <span
            className={`
              whitespace-nowrap
              text-xs
              font-medium
              text-white/55
              transition-all
              duration-300
              group-hover:text-white
              ${
                collapsed
                  ? "hidden w-0 opacity-0"
                  : "block w-auto opacity-100"
              }
            `}
          >
            {signingOut ? "Signing out..." : "Sign out"}
          </span>
        </button>

        {/* Version */}
        <p
          className={`
            mt-3
            text-center
            text-[9px]
            tracking-wide
            text-white/20
            transition-all
            duration-300
            ${collapsed ? "hidden" : "block"}
          `}
        >
          ITMT MANAGEMENT SYSTEM • FINANCE
        </p>
      </div>

      {/* =========================================================
          COLLAPSE BUTTON
      ========================================================== */}
      <button
        type="button"
        onClick={toggleSidebar}
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
          flex
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
        "
      >
        {collapsed ? (
          <ChevronsRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronsLeft className="h-3.5 w-3.5" />
        )}
      </button>
    </aside>
  );
}