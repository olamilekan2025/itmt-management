"use client";

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

interface NavItem {
  label: string;
  sectionId: string;
  icon: React.ComponentType<{ className?: string }>;
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
        sectionId: "overview",
        icon: LayoutDashboard,
      },
    ],
  },

  {
    label: "Fee Management",
    items: [
      {
        label: "Fee Structures",
        sectionId: "fee-structures",
        icon: Calculator,
      },
      {
        label: "Student Fees",
        sectionId: "student-fees",
        icon: FileText,
      },
      {
        label: "Fee Categories",
        sectionId: "fee-categories",
        icon: BookOpen,
      },
    ],
  },

  {
    label: "Payments",
    items: [
      {
        label: "Record Payment",
        sectionId: "record-payment",
        icon: Banknote,
      },
      {
        label: "Payment History",
        sectionId: "payment-history",
        icon: History,
      },
      {
        label: "Online Payments",
        sectionId: "online-payments",
        icon: CreditCard,
      },
      {
        label: "Receipts",
        sectionId: "receipts",
        icon: Receipt,
      },
      {
        label: "Refunds",
        sectionId: "refunds",
        icon: ArrowDownToLine,
      },
    ],
  },

  {
    label: "Student Finance",
    items: [
      {
        label: "Check Balance",
        sectionId: "balance",
        icon: Wallet,
      },
      {
        label: "Outstanding Fees",
        sectionId: "outstanding-fees",
        icon: FileText,
      },
      {
        label: "Scholarships & Discounts",
        sectionId: "scholarships",
        icon: Banknote,
      },
    ],
  },

  {
    label: "Reports",
    items: [
      {
        label: "Financial Reports",
        sectionId: "financial-reports",
        icon: FileBarChart,
      },
      {
        label: "Payment Reports",
        sectionId: "payment-reports",
        icon: BarChart3,
      },
    ],
  },

  {
    label: "System",
    items: [
      {
        label: "Notifications",
        sectionId: "notifications",
        icon: Bell,
      },
      {
        label: "Settings",
        sectionId: "settings",
        icon: Settings,
      },
    ],
  },
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export default function FinanceSidebar() {
  const pathname = usePathname();

  function isSectionActive(sectionId: string) {
    // Check if the URL hash matches the section
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      return hash === sectionId;
    }
    return false;
  }
  return (
    <aside
      className="
        hidden  h-screen w-[272px] shrink-0 flex-col
        border-r border-white/[0.07]
        bg-brand-navy text-white
        md:flex
      "
    >
      {/* =========================================================
          BRAND
      ========================================================== */}
      <div className="px-5 pt-5">
        <div
          className="
            relative overflow-hidden rounded-2xl
            border border-white/[0.08]
            bg-gradient-to-br from-white/[0.08] to-white/[0.02]
            p-4
          "
        >
          {/* Decorative glow */}
          <div
            className="
              pointer-events-none absolute
              -right-8 -top-8 h-24 w-24
              rounded-full bg-brand-gold/10 blur-2xl
            "
          />

          <div className="relative flex items-center gap-3">
            <Link href="/dashboards/finance" className="flex items-center gap-3">
              {/* Logo */}
              <div
                className="
                  flex h-11 w-11 shrink-0
                  items-center justify-center
                  rounded-xl
                  bg-white
                  shadow-lg shadow-black/10
                "
              >
                <span className="text-sm font-black tracking-tight text-brand-navy">
                  IT
                </span>
              </div>

              {/* Brand text */}
              <div className="min-w-0">
                <p className="text-sm font-bold tracking-tight text-white">
                  ITMT
                </p>

                <p className="mt-0.5 truncate text-[10px] font-medium uppercase tracking-[0.16em] text-white/40">
                  Finance Portal
                </p>
              </div>
            </Link>
          </div>

          {/* Online indicator */}
          <div className="relative mt-4 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>

            <span className="text-[10px] font-medium text-white/45">
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
          mt-5 flex-1 overflow-y-auto px-4 pb-4
          scrollbar-thin scrollbar-track-transparent
          scrollbar-thumb-white/10
        "
      >
        <div className="space-y-6">
          {navigation.map((section) => (
            <div key={section.label}>
              {/* Section title */}
              <div className="mb-2 flex items-center gap-2 px-3">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">
                  {section.label}
                </span>

                <div className="h-px flex-1 bg-white/[0.05]" />
              </div>

              {/* Items */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = isSectionActive(item.sectionId);

                  return (
                    <button
                      key={item.sectionId}
                      type="button"
                      onClick={() => scrollToSection(item.sectionId)}
                      className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200 ${isActive ? "bg-white/[0.08]" : "hover:bg-white/[0.06]"}`}
                    >
                      {/* Active indicator */}
                      <span className={`absolute left-0 h-6 w-[2px] rounded-r-full bg-brand-gold transition-opacity ${isActive ? "opacity-100" : "opacity-0"}`} />

                      {/* Icon container */}
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${isActive ? "bg-brand-gold/20 text-brand-gold" : "bg-white/[0.035] text-white/40 group-hover:bg-brand-gold/10 group-hover:text-brand-gold"}`}>
                        <Icon className="h-[16px] w-[16px]" />
                      </span>

                      {/* Label */}
                      <span className={`flex-1 truncate text-[13px] font-medium transition-colors ${isActive ? "text-white" : "text-white/65 group-hover:text-white"}`}>
                        {item.label}
                      </span>

                      {/* Arrow */}
                      <ChevronRight className="h-3.5 w-3.5 text-white/0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-white/25" />
                    </button>
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
      <div className="border-t border-white/[0.07] p-4">
        {/* Account card */}
        <div className="mb-3 rounded-xl border border-white/[0.06] bg-white/[0.035] p-3">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-gold/10 text-xs font-bold text-brand-gold">
              FA
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">
                Finance Administrator
              </p>

              <p className="mt-0.5 truncate text-[10px] text-white/35">
                Finance & Accounts
              </p>
            </div>
          </div>
        </div>

        {/* Sign out */}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="group flex w-full items-center gap-3 rounded-xl border border-white/[0.07] px-3 py-2.5 text-left transition-all duration-200 hover:border-red-400/20 hover:bg-red-400/[0.06]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.035] text-white/40 transition-colors group-hover:bg-red-400/10 group-hover:text-red-300">
            <LogOut className="h-4 w-4" />
          </span>

          <span className="text-xs font-medium text-white/55 transition-colors group-hover:text-white">
            Sign out
          </span>
        </button>

        {/* Version */}
        <p className="mt-3 text-center text-[9px] tracking-wide text-white/20">
          ITMT MANAGEMENT SYSTEM • FINANCE
        </p>
      </div>
    </aside>
  );
}