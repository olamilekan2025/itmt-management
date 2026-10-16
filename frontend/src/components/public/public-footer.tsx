"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Loader2,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { FormEvent, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { apiPost } from "@/lib/api";

const quickLinks = [
  { href: "/about", label: "About" },
  { href: "/courses", label: "Courses" },
  { href: "/admissions", label: "Admissions" },
  { href: "/results", label: "Results" },
  { href: "/contact", label: "Contact" },
];

const studentLinks = [
  { href: "/auth/student/login", label: "Student Login" },
  { href: "/auth/login", label: "Create Account" },
  { href: "/auth/forgot-password", label: "Forgot Password" },
];

type IconProps = { className?: string };

function SvgIcon({
  className,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

const InstagramIcon = ({ className }: IconProps) => (
  <SvgIcon className={className}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
  </SvgIcon>
);

const FacebookIcon = ({ className }: IconProps) => (
  <SvgIcon className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </SvgIcon>
);

const XIcon = ({ className }: IconProps) => (
  <SvgIcon className={className}>
    <path d="M4 4l11.733 16h4.267l-11.733-16z" />
    <path d="M4 20l6.768-6.768m2.46-2.46L20 4" />
  </SvgIcon>
);

const TikTokIcon = ({ className }: IconProps) => (
  <SvgIcon className={className}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </SvgIcon>
);

// Replace the "#" links below with ITMT's real social profile URLs.
const socialLinks = [
  { href: "#", label: "ITMT on Instagram", icon: InstagramIcon },
  { href: "#", label: "ITMT on Facebook", icon: FacebookIcon },
  { href: "#", label: "ITMT on X (Twitter)", icon: XIcon },
  { href: "#", label: "ITMT on TikTok", icon: TikTokIcon },
];

interface NewsletterResponse {
  success: boolean;
  message?: string;
}

function FooterLinkList({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <nav aria-label={title}>
      <h3 className="text-sm font-semibold text-white">{title}</h3>

      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={`${link.href}-${link.label}`}>
            <Link
              href={link.href}
              className="group inline-flex items-center text-sm text-slate-400 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:text-white"
            >
              {link.label}
              <ArrowUpRight
                aria-hidden="true"
                className="ml-1 h-3.5 w-3.5 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
              />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function PublicFooter() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      toast.error("Email address required", {
        description:
          "Please enter your email address to subscribe to ITMT updates.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiPost<NewsletterResponse>("/subscriptions", {
        email: cleanEmail,
      });

      if (!response?.success) {
        throw new Error(
          response?.message || "Unable to complete your subscription.",
        );
      }

      setEmail("");

      const message =
        response.message ||
        "You have successfully subscribed to ITMT updates.";

      if (message.toLowerCase().includes("already subscribed")) {
        toast.info("Already subscribed", { description: message });
      } else {
        toast.success("Subscription successful", { description: message });
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error);

      toast.error("Subscription failed", {
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="relative overflow-hidden bg-brand-navy text-white">
      {/* Atmosphere */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-brand-gold/10 blur-3xl" />
        <div className="absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-brand-blue/15 blur-3xl" />
      </div>

      {/* Gold hairline */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold/60 to-transparent"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Main */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-12 lg:grid-cols-12 lg:gap-x-10 lg:py-14">
          {/* Brand + newsletter */}
          <div className="col-span-2 lg:col-span-4">
            <Link href="/" className="group inline-flex items-center gap-3">
              <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white shadow-lg transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/newLogo.png"
                  alt="ITMT Academy"
                  fill
                  sizes="44px"
                  className="object-contain p-1.5"
                />
              </span>

              <span>
                <span className="block text-base font-bold tracking-tight text-white">
                  ITMT Academy
                </span>
                <span className="mt-0.5 block text-xs text-white/50">
                  Management System
                </span>
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">
              A connected platform for academic, administrative, financial, and
              institutional operations.
            </p>

            <form onSubmit={handleSubscribe} className="mt-6 max-w-sm">
              <label
                htmlFor="footer-email"
                className="text-sm font-semibold text-white"
              >
                Get updates from ITMT
              </label>

              <div className="mt-3 flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.06] p-1.5 transition-colors duration-200 focus-within:border-brand-gold/50 focus-within:bg-white/[0.09]">
                <input
                  id="footer-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={isSubmitting}
                  placeholder="Your email address"
                  className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-brand-gold px-4 py-2 text-sm font-semibold text-brand-navy transition-colors duration-200 hover:bg-[#D6B965] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-brand-gold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Subscribing
                    </>
                  ) : (
                    <>
                      Subscribe
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Relevant ITMT updates only. Unsubscribe any time.
              </p>
            </form>
          </div>

          {/* Links */}
          <div className="lg:col-span-2">
            <FooterLinkList title="Explore" links={quickLinks} />
          </div>

          <div className="lg:col-span-2">
            <FooterLinkList title="Student Portal" links={studentLinks} />
          </div>

          {/* Contact */}
          <div className="col-span-2 lg:col-span-4">
            <h3 className="text-sm font-semibold text-white">Contact</h3>

            <ul className="mt-4 space-y-3">
              <li className="flex items-center gap-3 text-sm text-slate-400">
                <MapPin
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-brand-gold"
                />
                ITMT Academy, Nigeria
              </li>

              <li>
                <a
                  href="tel:+2347074052461"
                  className="flex items-center gap-3 text-sm text-slate-400 transition-colors hover:text-white"
                >
                  <Phone
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-brand-gold"
                  />
                  +234 707 405 2461
                </a>
              </li>

              <li>
                <a
                  href="mailto:info@itmt.edu.ng"
                  className="flex items-center gap-3 break-all text-sm text-slate-400 transition-colors hover:text-white"
                >
                  <Mail
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-brand-gold"
                  />
                  itmtadmin@gmail.com
                </a>
              </li>
            </ul>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-white">Follow us</h3>

              <ul className="mt-3 flex items-center gap-2.5">
                {socialLinks.map(({ href, label, icon: Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-slate-300 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-gold hover:bg-brand-gold hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy"
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-3 border-t border-white/10 py-5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p className="text-slate-500">
            © {new Date().getFullYear()} ITMT Academy. All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            <Link
              href="/privacy"
              className="text-slate-500 transition-colors hover:text-white"
            >
              Privacy Policy
            </Link>

            <span aria-hidden="true" className="h-3 w-px bg-white/10" />

            <Link
              href="/terms"
              className="text-slate-500 transition-colors hover:text-white"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}