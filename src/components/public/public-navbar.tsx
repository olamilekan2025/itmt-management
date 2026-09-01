"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogIn, UserPlus } from "lucide-react";
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
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          onClick={closeMobileMenu}
          className="flex items-center gap-3"
        >
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl shadow-sm">
            <Image
              src="/logo.png"
              alt="ITMT logo"
              fill
              sizes="40px"
              className="object-cover"
              priority
            />
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-bold leading-none tracking-tight text-brand-navy">
              ITMT
            </p>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
              Management System
            </p>
          </div>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => {
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-brand-light text-brand-navy"
                    : "text-slate-600 hover:bg-slate-50 hover:text-brand-navy"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-brand-navy transition-colors hover:bg-brand-light"
          >
            <LogIn className="h-4 w-4" />
            Sign in
          </Link>

          <Link
                      href="/admission-form/apply"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-brand-dark hover:shadow-md"
          >
            <UserPlus className="h-4 w-4" />
            Apply Now
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((current) => !current)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-brand-navy transition-colors hover:bg-slate-50 lg:hidden"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile navigation */}
      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white lg:hidden">
          <nav className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <div className="space-y-1">
              {navLinks.map((link) => {
                const active = isActive(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className={`block rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                      active
                        ? "bg-brand-light text-brand-navy"
                        : "text-slate-600 hover:bg-slate-50 hover:text-brand-navy"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
              <Link
                href="/auth/login"
                onClick={closeMobileMenu}
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-brand-navy transition-colors hover:bg-slate-50"
              >
                <LogIn className="h-4 w-4" />
                Sign in
              </Link>

              <Link
                href="/auth/login"
                onClick={closeMobileMenu}
                className="flex items-center justify-center gap-2 rounded-lg bg-brand-navy px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
              >
                <UserPlus className="h-4 w-4" />
                Apply Now
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}