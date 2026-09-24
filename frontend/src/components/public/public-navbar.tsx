"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  LogIn,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/courses", label: "Courses" },
  { href: "/admissions", label: "Admissions" },
  { href: "/results", label: "Results" },
  { href: "/contact", label: "Contact" },
];

const NAVBAR_HEIGHT = 76;

export default function PublicNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  /**
   * Prevent the page behind the mobile menu from scrolling.
   */
  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  /**
   * Close mobile navigation when the viewport becomes desktop-sized.
   */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-white/90 shadow-[0_1px_0_rgba(15,23,42,0.02)] backdrop-blur-xl">
      {/* =====================================================
          MAIN NAVBAR
      ====================================================== */}
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ===================================================
            LOGO
        ==================================================== */}
        <Link
          href="/"
          onClick={closeMobileMenu}
          className="group flex shrink-0 items-center gap-3"
          aria-label="ITMT Management System home"
        >
          <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md">
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

        {/* ===================================================
            DESKTOP NAVIGATION
        ==================================================== */}
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
                className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "bg-white text-brand-navy shadow-sm"
                    : "text-slate-600 hover:bg-white/80 hover:text-brand-navy"
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

        {/* ===================================================
            DESKTOP ACTIONS
        ==================================================== */}
        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/auth/login"
            className="group inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-brand-navy transition-all duration-200 hover:bg-brand-light"
          >
            <LogIn className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            Sign in
          </Link>

          <Link
            href="/admission-form/apply"
            className="group inline-flex items-center gap-2 rounded-xl bg-brand-navy px-[18px] py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(15,23,42,0.15)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-[0_12px_25px_rgba(15,23,42,0.2)]"
          >
            Apply Now

            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* ===================================================
            MOBILE MENU BUTTON
        ==================================================== */}
        <button
          type="button"
          aria-label={
            mobileOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMobileOpen((current) => !current)}
          className="relative z-[70] inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-brand-navy shadow-sm transition-all duration-200 hover:border-brand-navy/20 hover:bg-brand-light lg:hidden"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* =====================================================
          MOBILE MENU
          Full viewport height below navbar
      ====================================================== */}

      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={closeMobileMenu}
        className={`fixed inset-0 z-[55] bg-brand-navy/20 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        style={{
          top: `${NAVBAR_HEIGHT}px`,
        }}
      />

      {/* Full-height mobile navigation */}
      <div
        id="mobile-navigation"
        className={`fixed left-0 right-0 z-[60] flex flex-col bg-white transition-all duration-300 ease-out lg:hidden ${
          mobileOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-3 opacity-0"
        }`}
        style={{
          top: `${NAVBAR_HEIGHT}px`,
          height: `calc(100dvh - ${NAVBAR_HEIGHT}px)`,
        }}
      >
        <nav
          className="flex h-full flex-col overflow-y-auto"
          aria-label="Mobile navigation"
        >
          <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 sm:px-6">
            {/* ===============================================
                MOBILE NAVIGATION HEADER
            ================================================ */}
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

            {/* ===============================================
                MOBILE LINKS
            ================================================ */}
            <div className="space-y-2">
              {navLinks.map((link) => {
                const active = isActive(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className={`group flex min-h-[56px] items-center justify-between rounded-2xl border px-5 py-4 text-sm font-semibold transition-all duration-200 ${
                      active
                        ? "border-brand-gold/20 bg-brand-light text-brand-navy shadow-sm"
                        : "border-transparent text-slate-600 hover:border-slate-100 hover:bg-slate-50 hover:text-brand-navy"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {active && (
                        <span className="h-2 w-2 rounded-full bg-brand-gold" />
                      )}

                      <span>{link.label}</span>
                    </div>

                    <ArrowRight
                      className={`h-4 w-4 transition-all duration-200 ${
                        active
                          ? "translate-x-0 opacity-100"
                          : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                      }`}
                    />
                  </Link>
                );
              })}
            </div>

            {/* ===============================================
                MOBILE ACTIONS
            ================================================ */}
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                href="/auth/login"
                onClick={closeMobileMenu}
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-brand-navy shadow-sm transition-all duration-200 hover:border-brand-navy/20 hover:bg-brand-light"
              >
                <LogIn className="h-4 w-4" />
                Sign in
              </Link>

              <Link
                href="/admission-form/apply"
                onClick={closeMobileMenu}
                className="group inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-brand-navy px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(15,23,42,0.12)] transition-all duration-200 hover:bg-brand-dark"
              >
                Apply Now

                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* ===============================================
                MOBILE INFORMATION CARD
            ================================================ */}
            <div className="mt-auto pt-8">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5">
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

                    <p className="mt-0.5 text-[10px] leading-5 text-slate-500">
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
  );
}