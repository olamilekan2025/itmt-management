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
import { useState } from "react";

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/courses", label: "Courses" },
  { href: "/admissions", label: "Admissions" },
  { href: "/results", label: "Results" },
  { href: "/contact", label: "Contact" },
];

export default function PublicNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-white/90 shadow-[0_1px_0_rgba(15,23,42,0.02)] backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ───────────────── Logo ───────────────── */}
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

        {/* ───────────────── Desktop Navigation ───────────────── */}
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

        {/* ───────────────── Desktop Actions ───────────────── */}
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
            className="group inline-flex items-center gap-2 rounded-xl bg-brand-navy px-4.5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(15,23,42,0.15)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-[0_12px_25px_rgba(15,23,42,0.2)]"
          >
            Apply Now
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* ───────────────── Mobile Menu Button ───────────────── */}
        <button
          type="button"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((current) => !current)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-brand-navy shadow-sm transition-all duration-200 hover:border-brand-navy/20 hover:bg-brand-light lg:hidden"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* ───────────────── Mobile Navigation ───────────────── */}
      <div
        className={`overflow-hidden border-t border-slate-100 bg-white transition-all duration-300 ease-out lg:hidden ${
          mobileOpen
            ? "max-h-[600px] opacity-100"
            : "pointer-events-none max-h-0 opacity-0"
        }`}
      >
        <nav
          className="mx-auto max-w-7xl px-4 py-5 sm:px-6"
          aria-label="Mobile navigation"
        >
          {/* Mobile links */}
          <div className="space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className={`group flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${
                    active
                      ? "bg-brand-light text-brand-navy"
                      : "text-slate-600 hover:bg-slate-50 hover:text-brand-navy"
                  }`}
                >
                  <span>{link.label}</span>

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

          {/* Mobile actions */}
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
            <Link
              href="/auth/login"
              onClick={closeMobileMenu}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-brand-navy transition-all duration-200 hover:border-brand-navy/20 hover:bg-brand-light"
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </Link>

            <Link
              href="/admission-form/apply"
              onClick={closeMobileMenu}
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-brand-navy px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-dark"
            >
              Apply Now
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Mobile institutional note */}
          <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
            <p className="text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              ITMT Management System
            </p>
          </div>
        </nav>
      </div>
    </header>
  );
}

