"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  MapPin,
  Phone,
  ArrowUpRight,
  ArrowRight,
  Loader2,
} from "lucide-react";
import {
  FormEvent,
  useState,
} from "react";
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

interface NewsletterResponse {
  success: boolean;
  message?: string;
}

export default function PublicFooter() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
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
      const response = await apiPost<NewsletterResponse>(
        "/subscriptions",
        {
          email: cleanEmail,
        },
      );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Unable to complete your subscription.",
        );
      }

      setEmail("");

      const message =
        response.message ||
        "You have successfully subscribed to ITMT updates.";

      if (
        message.toLowerCase().includes("already subscribed")
      ) {
        toast.info("Already subscribed", {
          description: message,
        });
      } else {
        toast.success("Subscription successful", {
          description: message,
        });
      }
    } catch (error) {
      console.error(
        "Newsletter subscription error:",
        error,
      );

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
      {/* ================================================================ */}
      {/* Background atmosphere                                             */}
      {/* ================================================================ */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        {/* Gold glow */}
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand-gold/10 blur-3xl" />

        {/* Blue glow */}
        <div className="absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-brand-blue/10 blur-3xl" />

        {/* Institutional grid */}
        {/* <div
          className="
            absolute inset-0 opacity-[0.035]
            [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]
            [background-size:48px_48px]
          "
        /> */}
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ================================================================ */}
        {/* Newsletter / CTA                                                 */}
        {/* ================================================================ */}

        <div className="border-b border-white/10 py-14 md:py-16">
          <div
            className="
              relative overflow-hidden rounded-3xl
              border border-white/10
              bg-white/[0.04]
              px-6 py-8
              shadow-2xl shadow-black/10
              sm:px-8 md:px-10 md:py-10
            "
          >
            {/* Newsletter decoration */}
            <div
              aria-hidden="true"
              className="
                pointer-events-none absolute right-0 top-0
                h-48 w-48 translate-x-1/3 -translate-y-1/3
                rounded-full bg-brand-gold/10 blur-3xl
              "
            />

            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              {/* Text */}
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2">
                  <span className="h-px w-8 bg-brand-gold" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-gold">
                    Stay Connected
                  </span>
                </div>

                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Stay informed with ITMT.
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                  Get important academic announcements,
                  admissions updates, institutional news, and
                  platform updates delivered to your inbox.
                </p>
              </div>

              {/* Subscription */}
              <div className="w-full lg:w-[430px]">
                <form onSubmit={handleSubscribe}>
                  <label
                    htmlFor="footer-email"
                    className="sr-only"
                  >
                    Email address
                  </label>

                  <div
                    className="
                      flex flex-col gap-2 rounded-2xl
                      border border-white/10
                      bg-white/[0.06]
                      p-2
                      transition-all duration-300
                      focus-within:border-brand-gold/40
                      focus-within:bg-white/[0.08]
                      sm:flex-row
                    "
                  >
                    <input
                      id="footer-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      disabled={isSubmitting}
                      placeholder="Enter your email address"
                      className="
                        min-w-0 flex-1 rounded-xl
                        border-0 bg-transparent
                        px-4 py-3
                        text-sm text-white
                        outline-none
                        placeholder:text-slate-500
                        focus:ring-0
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    />

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="
                        inline-flex shrink-0 items-center
                        justify-center gap-2
                        rounded-xl
                        bg-brand-gold
                        px-5 py-3
                        text-sm font-semibold
                        text-brand-navy
                        transition-all duration-300
                        hover:-translate-y-0.5
                        hover:bg-white
                        hover:shadow-lg
                        hover:shadow-brand-gold/10
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                        disabled:hover:translate-y-0
                        disabled:hover:bg-brand-gold
                      "
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Subscribing...
                        </>
                      ) : (
                        <>
                          Subscribe
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>

                  <p className="mt-3 px-1 text-[11px] text-slate-500">
                    By subscribing, you agree to receive relevant
                    ITMT updates. You can unsubscribe at any time.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* Main footer content                                               */}
        {/* ================================================================ */}

        <div className="py-14 md:py-16">
          <div className="grid gap-12 lg:grid-cols-[1.5fr_0.7fr_0.8fr_1fr]">
            {/* ------------------------------------------------------------ */}
            {/* Brand                                                         */}
            {/* ------------------------------------------------------------ */}

            <div>
              <Link
                href="/"
                className="group inline-flex items-center gap-3"
              >
                <div
                  className="
                    relative flex h-12 w-12 items-center justify-center
                    overflow-hidden rounded-xl
                    border border-white/10
                    bg-white
                    shadow-lg
                    transition-transform duration-300
                    group-hover:scale-105
                  "
                >
                  <Image
                    src="/newLogo.png"
                    alt="ITMT Academy"
                    fill
                    sizes="48px"
                    className="object-contain p-1.5"
                  />
                </div>

                <div>
                  <p className="text-base font-bold tracking-tight text-white">
                    ITMT Academy
                  </p>

                  <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.2em] text-white/40">
                    Management System
                  </p>
                </div>
              </Link>

              <p className="mt-6 max-w-sm text-sm leading-7 text-slate-400">
                A connected digital platform designed to support
                academic, administrative, financial, and
                institutional operations at ITMT Academy.
              </p>

              {/* Institutional statement */}
              <div className="mt-7 flex items-center gap-3">
                <span className="h-px w-8 bg-brand-gold" />

                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">
                  Learn • Manage • Connect
                </span>
              </div>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* Explore                                                       */}
            {/* ------------------------------------------------------------ */}

            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-white">
                Explore
              </h3>

              <ul className="mt-5 space-y-3.5">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="
                        group inline-flex items-center
                        text-sm text-slate-400
                        transition-colors duration-200
                        hover:text-white
                      "
                    >
                      <span>{link.label}</span>

                      <ArrowUpRight
                        className="
                          ml-1 h-3.5 w-3.5
                          opacity-0
                          transition-all duration-200
                          group-hover:translate-x-0.5
                          group-hover:opacity-100
                        "
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* Student Portal                                                */}
            {/* ------------------------------------------------------------ */}

            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-white">
                Student Portal
              </h3>

              <ul className="mt-5 space-y-3.5">
                {studentLinks.map((link) => (
                  <li key={`${link.href}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="
                        group inline-flex items-center
                        text-sm text-slate-400
                        transition-colors duration-200
                        hover:text-white
                      "
                    >
                      <span>{link.label}</span>

                      <ArrowUpRight
                        className="
                          ml-1 h-3.5 w-3.5
                          opacity-0
                          transition-all duration-200
                          group-hover:translate-x-0.5
                          group-hover:opacity-100
                        "
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* Contact                                                       */}
            {/* ------------------------------------------------------------ */}

            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-white">
                Contact
              </h3>

              <ul className="mt-5 space-y-5">
                {/* Location */}
                <li className="flex gap-3">
                  <span
                    className="
                      flex h-8 w-8 shrink-0 items-center justify-center
                      rounded-lg border border-brand-gold/15
                      bg-brand-gold/5
                    "
                  >
                    <MapPin className="h-4 w-4 text-brand-gold" />
                  </span>

                  <div>
                    <p className="text-xs font-semibold text-white">
                      Campus
                    </p>

                    <p className="mt-1 text-sm leading-5 text-slate-400">
                      ITMT Academy
                      <br />
                      Nigeria
                    </p>
                  </div>
                </li>

                {/* Phone */}
                <li className="flex gap-3">
                  <span
                    className="
                      flex h-8 w-8 shrink-0 items-center justify-center
                      rounded-lg border border-brand-gold/15
                      bg-brand-gold/5
                    "
                  >
                    <Phone className="h-4 w-4 text-brand-gold" />
                  </span>

                  <div>
                    <p className="text-xs font-semibold text-white">
                      Phone
                    </p>

                    <a
                      href="tel:+2347074052461"
                      className="
                        mt-1 block text-sm text-slate-400
                        transition-colors hover:text-white
                      "
                    >
                      +234 707 405 2461
                    </a>
                  </div>
                </li>

                {/* Email */}
                <li className="flex gap-3">
                  <span
                    className="
                      flex h-8 w-8 shrink-0 items-center justify-center
                      rounded-lg border border-brand-gold/15
                      bg-brand-gold/5
                    "
                  >
                    <Mail className="h-4 w-4 text-brand-gold" />
                  </span>

                  <div>
                    <p className="text-xs font-semibold text-white">
                      Email
                    </p>

                    <a
                      href="mailto:info@itmt.edu.ng"
                      className="
                        mt-1 block break-all text-sm text-slate-400
                        transition-colors hover:text-white
                      "
                    >
                      info@itmt.edu.ng
                    </a>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* Bottom bar                                                        */}
        {/* ================================================================ */}

        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col gap-5 text-xs sm:flex-row sm:items-center sm:justify-between">
            {/* Copyright */}
            <p className="text-slate-500">
              © {new Date().getFullYear()} ITMT Academy. All rights reserved.
            </p>

            {/* Legal */}
            <div className="flex items-center gap-5">
              <Link
                href="/privacy"
                className="
                  text-slate-500
                  transition-colors
                  hover:text-white
                "
              >
                Privacy Policy
              </Link>

              <span className="h-3 w-px bg-white/10" />

              <Link
                href="/terms"
                className="
                  text-slate-500
                  transition-colors
                  hover:text-white
                "
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}