
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowRight,
  ChevronDown,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import LogoutConfirmModal from "@/components/common/logout-confirm-modal";
import { logoutUser } from "@/lib/auth/sign-out";

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/courses", label: "Courses" },
  { href: "/admissions", label: "Admissions" },
  { href: "/results", label: "Results" },
  { href: "/contact", label: "Contact" },
];

const NAVBAR_HEIGHT = 76;

const dashboardRoutes: Record<string, string> = {
  admin: "/dashboards/admin",
  finance: "/dashboards/finance",
  registrar: "/dashboards/registrar",
  lecturer: "/dashboards/lecturer",
  student: "/dashboards/student",
};

const roleLabels: Record<string, string> = {
  admin: "Administrator",
  finance: "Finance",
  registrar: "Registrar",
  lecturer: "Lecturer",
  student: "Student",
};

function getInitials(name?: string | null, email?: string | null) {
  const value = name?.trim();

  if (value) {
    return value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }

  return email?.trim().charAt(0).toUpperCase() || "U";
}

export default function PublicNavbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const accountRef = useRef<HTMLDivElement>(null);

  const user = session?.user;
  const role = user?.role?.toLowerCase() ?? "";
  const dashboardHref = dashboardRoutes[role];

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  const displayName =
    user?.name?.trim() ||
    user?.email?.split("@")[0] ||
    "ITMT User";

  const initials = getInitials(user?.name, user?.email);
  const roleLabel = roleLabels[role] ?? "Account";

  const closeMenus = useCallback(() => {
    setMobileOpen(false);
    setAccountOpen(false);
    setMobileAccountOpen(false);
  }, []);

  const closeLogoutModal = useCallback(() => {
    if (loggingOut) return;
    setShowLogoutModal(false);
  }, [loggingOut]);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  // Logout buttons open the shared confirmation modal.
  function handleLogout() {
    if (loggingOut) return;

    closeMenus();
    setShowLogoutModal(true);
  }

  // Actual logout only occurs after the user confirms.
  async function confirmLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logoutUser("/");
    } catch (error) {
      console.error("Unable to sign out:", error);
      setLoggingOut(false);
    }
  }

  // Close the desktop account dropdown when clicking outside it.
  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target as Node)
      ) {
        setAccountOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  // Close menus with Escape, without interfering with the modal's
  // own Escape handling while logout confirmation is open.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape" || showLogoutModal) return;

      setAccountOpen(false);
      setMobileAccountOpen(false);
      setMobileOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showLogoutModal]);

  // Prevent background scrolling while the mobile menu is open.
  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  // Close mobile navigation when switching to desktop.
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
        setMobileAccountOpen(false);
      }
    }

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close navigation menus when navigating between pages.
  useEffect(() => {
    closeMenus();
  }, [pathname, closeMenus]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 shadow-[0_1px_0_rgba(15,23,42,0.02)] backdrop-blur-xl">
        {/* Main navbar */}
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <Link
            href="/"
            onClick={closeMenus}
            className="group flex shrink-0 items-center gap-3"
            aria-label="ITMT Management System home"
          >
            <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm transition-shadow duration-200 group-hover:shadow-md">
              <Image
                src="/newLogo.png"
                alt="ITMT logo"
                fill
                sizes="44px"
                className="object-contain p-1"
                priority
              />
            </div>

            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-brand-navy">
                  ITMT
                </span>

                <span className="rounded-full bg-brand-light px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-navy">
                  Portal
                </span>
              </div>

              <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Management System
              </p>
            </div>
          </Link>

          {/* Desktop navigation */}
          <nav
            className="hidden items-center rounded-full border border-slate-200/70 bg-slate-50/70 p-1 lg:flex"
            aria-label="Main navigation"
          >
            {navLinks.map((link) => {
              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                    active
                      ? "bg-white text-brand-navy shadow-sm"
                      : "text-slate-600 hover:bg-white hover:text-brand-navy"
                  }`}
                >
                  {link.label}

                  {active && (
                    <span className="absolute bottom-0.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-brand-gold" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop account actions */}
          <div className="hidden items-center gap-2 lg:flex">
            {isLoading ? (
              <div className="h-10 w-28 animate-pulse rounded-xl bg-slate-100" />
            ) : isAuthenticated ? (
              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  onClick={() => setAccountOpen((open) => !open)}
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  aria-label="Open account menu"
                  className={`group flex items-center gap-2.5 rounded-xl border px-2 py-1.5 text-left transition-colors ${
                    accountOpen
                      ? "border-brand-gold/40 bg-brand-light/60"
                      : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-sm font-bold text-white ring-2 ring-brand-gold/20">
                    {initials}
                  </span>

                  <span className="max-w-[135px]">
                    <span className="block truncate text-sm font-bold text-brand-navy">
                      {displayName}
                    </span>
                    <span className="mt-0.5 block text-[10px] font-medium text-slate-500">
                      {roleLabel}
                    </span>
                  </span>

                  <ChevronDown
                    className={`ml-1 h-4 w-4 text-slate-400 transition-transform duration-200 ${
                      accountOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Desktop account dropdown */}
                {accountOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-[calc(100%+12px)] z-[80] w-72 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.14)]"
                  >
                    <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-sm font-bold text-white">
                          {initials}
                        </span>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-brand-navy">
                            {displayName}
                          </p>
                          <p className="mt-1 truncate text-xs text-slate-500">
                            {user?.email || "Signed in"}
                          </p>
                          <span className="mt-2 inline-flex rounded-full bg-brand-light px-2 py-1 text-[10px] font-bold text-brand-navy">
                            {roleLabel}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 p-2">
                      {dashboardHref ? (
                        <Link
                          href={dashboardHref}
                          role="menuitem"
                          onClick={closeMenus}
                          className="group flex items-center gap-3 rounded-xl bg-brand-navy px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                        >
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                            <LayoutDashboard className="h-4 w-4" />
                          </span>

                          <span className="flex-1">Go to dashboard</span>

                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      ) : (
                        <div className="rounded-xl bg-slate-50 px-3 py-3 text-xs leading-5 text-slate-500">
                          Your account does not have a recognized dashboard
                          role. Please contact the administrator.
                        </div>
                      )}

                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 transition-colors group-hover:bg-red-100">
                          <LogOut className="h-4 w-4" />
                        </span>

                        <span>Sign out</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 px-4 py-3">
                      <p className="text-center text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                        ITMT Management System
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="group inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-light"
                >
                  <LogIn className="h-4 w-4" />
                  Sign in
                </Link>

                <Link
                  href="/admission-form/apply"
                  className="group inline-flex items-center gap-2 rounded-xl bg-brand-navy px-[18px] py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(15,23,42,0.12)] transition-colors hover:bg-brand-dark"
                >
                  Apply Now
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            type="button"
            aria-label={
              mobileOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileOpen((open) => !open)}
            className="relative z-[70] inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-brand-navy shadow-sm transition-colors hover:bg-brand-light lg:hidden"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile backdrop */}
        <button
          type="button"
          tabIndex={mobileOpen ? 0 : -1}
          aria-label="Close navigation menu"
          onClick={closeMenus}
          className={`fixed inset-x-0 bottom-0 z-[55] bg-brand-navy/20 backdrop-blur-[2px] transition-opacity duration-200 lg:hidden ${
            mobileOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
          style={{ top: `${NAVBAR_HEIGHT}px` }}
        />

        {/* Mobile navigation panel */}
        <div
          id="mobile-navigation"
          aria-hidden={!mobileOpen}
          className={`fixed left-0 right-0 z-[60] flex flex-col overflow-hidden bg-white transition-all duration-200 ease-out lg:hidden ${
            mobileOpen
              ? "visible translate-y-0 opacity-100"
              : "invisible -translate-y-2 opacity-0"
          }`}
          style={{
            top: `${NAVBAR_HEIGHT}px`,
            height: `calc(100dvh - ${NAVBAR_HEIGHT}px)`,
          }}
          inert={!mobileOpen}
        >
          <nav
            className="flex h-full flex-col overflow-y-auto"
            aria-label="Mobile navigation"
          >
            <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 sm:px-6">
              {/* Mobile navigation heading */}
              <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">
                    Navigation
                  </p>
                  <p className="mt-1 text-sm font-semibold text-brand-navy">
                    ITMT Management System
                  </p>
                </div>

                <span className="rounded-full bg-brand-light px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-brand-navy">
                  Portal
                </span>
              </div>

              {/* Mobile public links */}
              <div className="space-y-2">
                {navLinks.map((link) => {
                  const active = isActive(link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMenus}
                      aria-current={active ? "page" : undefined}
                      className={`group flex min-h-[54px] items-center justify-between rounded-2xl border px-5 py-4 text-sm font-semibold transition-colors ${
                        active
                          ? "border-brand-gold/20 bg-brand-light text-brand-navy"
                          : "border-transparent text-slate-600 hover:border-slate-100 hover:bg-slate-50 hover:text-brand-navy"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        {active && (
                          <span className="h-2 w-2 rounded-full bg-brand-gold" />
                        )}
                        {link.label}
                      </span>

                      <ArrowRight
                        className={`h-4 w-4 transition-transform ${
                          active
                            ? "text-brand-navy"
                            : "text-slate-300 group-hover:translate-x-0.5 group-hover:text-brand-navy"
                        }`}
                      />
                    </Link>
                  );
                })}
              </div>

              {/* Mobile account panel */}
              <div className="mt-7">
                {isLoading ? (
                  <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
                ) : isAuthenticated ? (
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <button
                      type="button"
                      onClick={() =>
                        setMobileAccountOpen((open) => !open)
                      }
                      aria-expanded={mobileAccountOpen}
                      className="flex w-full items-center gap-3 p-4 text-left"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-sm font-bold text-white ring-2 ring-brand-gold/20">
                        {initials}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-brand-navy">
                          {displayName}
                        </span>
                        <span className="mt-1 block text-xs text-slate-500">
                          {roleLabel}
                        </span>
                      </span>

                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                          mobileAccountOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {mobileAccountOpen && (
                      <div className="space-y-2 border-t border-slate-100 p-3">
                        {dashboardHref ? (
                          <Link
                            href={dashboardHref}
                            onClick={closeMenus}
                            className="flex min-h-[50px] items-center justify-center gap-2 rounded-xl bg-brand-navy px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            Go to dashboard
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        ) : (
                          <p className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                            No dashboard is configured for this account role.
                          </p>
                        )}

                        <button
                          type="button"
                          onClick={handleLogout}
                          disabled={loggingOut}
                          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:border-red-100 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Link
                      href="/auth/login"
                      onClick={closeMenus}
                      className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-light"
                    >
                      <LogIn className="h-4 w-4" />
                      Sign in
                    </Link>

                    <Link
                      href="/admission-form/apply"
                      onClick={closeMenus}
                      className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-brand-navy px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                    >
                      Apply Now
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile information card */}
              <div className="mt-auto pt-8">
                <div className="rounded-2xl border border-slate-100 bg-[#FAFAFA] p-5">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
                      <Image
                        src="/newLogo.png"
                        alt="ITMT"
                        fill
                        sizes="40px"
                        className="object-contain p-1"
                      />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-brand-navy">
                        ITMT Management System
                      </p>
                      <p className="mt-1 text-[10px] leading-5 text-slate-500">
                        Transport, management, technology and professional
                        education.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="py-5 text-center text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Excellence • Innovation • Professionalism
                </p>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Shared logout confirmation modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        isLoading={loggingOut}
        onClose={closeLogoutModal}
        onConfirm={confirmLogout}
      />
    </>
  );
}
