import Link from "next/link";
import {
  Mail,
  MapPin,
  Phone,
  ArrowUpRight,
} from "lucide-react";

const quickLinks = [
  { href: "/about", label: "About" },
  { href: "/courses", label: "Courses" },
  { href: "/admissions", label: "Admissions" },
  { href: "/results", label: "Results" },
  { href: "/contact", label: "Contact" },
];

const studentLinks = [
  { href: "/auth/login", label: "Student Login / Create Account" },
  { href: "/auth/forgot-password", label: "Forgot Password" },
];

export default function PublicFooter() {
  return (
    <footer className="bg-brand-navy text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-bold text-brand-navy">
                IT
              </div>

              <div>
                <p className="text-sm font-bold">ITMT</p>
                <p className="text-[10px] uppercase tracking-[0.15em] text-white/50">
                  Management System
                </p>
              </div>
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-6 text-white/60">
              A modern academic management platform for student enrollment,
              courses, results, and institutional records.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold">Explore</h3>

            <ul className="mt-4 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Student */}
          <div>
            <h3 className="text-sm font-semibold">Student Portal</h3>

            <ul className="mt-4 space-y-3">
              {studentLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-1 text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold">Contact</h3>

            <ul className="mt-4 space-y-4">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" />
                <span className="text-sm leading-5 text-white/60">
                  ITMT Academy
                  <br />
                  Nigeria
                </span>
              </li>

              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-brand-gold" />
                <span className="text-sm text-white/60">
                  +234 000 000 0000
                </span>
              </li>

              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-brand-gold" />
                <span className="text-sm text-white/60">
                  info@itmt.edu.ng
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <div className="flex flex-col gap-3 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} ITMT Academy. All rights reserved.
            </p>

            <div className="flex gap-5">
              <Link
                href="/privacy"
                className="transition-colors hover:text-white"
              >
                Privacy
              </Link>

              <Link
                href="/terms"
                className="transition-colors hover:text-white"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}