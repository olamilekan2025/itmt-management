"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

function getApiUrl(): string {
  const rawApiUrl =
    process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!rawApiUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not defined. Add it to frontend/.env.local and restart Next.js.",
    );
  }

  let apiUrl = rawApiUrl.replace(/\/+$/, "");

  if (!/\/api$/i.test(apiUrl)) {
    apiUrl = `${apiUrl}/api`;
  }

  return apiUrl;
}

const API_URL = getApiUrl();

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
        }),
      });

      let data: { message?: string } = {};

      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Something went wrong. Please try again."
        );
      }

      setMessage(
        data.message ||
          "If an account exists with that email, a password reset link has been sent."
      );

      setIsSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send the reset link. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f7fb]">
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-brand-navy/[0.06] blur-3xl" />
        <div className="absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-brand-gold/[0.10] blur-3xl" />

        <div className="absolute left-[8%] top-[18%] h-2 w-2 rounded-full bg-brand-gold/50" />
        <div className="absolute right-[12%] top-[24%] h-3 w-3 rounded-full bg-brand-navy/10" />
        <div className="absolute bottom-[20%] left-[14%] h-3 w-3 rounded-full bg-brand-blue/10" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="w-full max-w-[460px]">
          {/* Brand */}
          <div className="mb-7 flex flex-col items-center text-center sm:mb-8">
            <Link
              href="/"
              className="group inline-flex items-center justify-center rounded-2xl bg-white p-3 shadow-[0_12px_35px_rgba(27,40,71,0.10)] ring-1 ring-slate-200/70 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(27,40,71,0.14)]"
              aria-label="ITMT Management System home"
            >
              <Image
                src="/newLogo.png"
                alt="ITMT Management System"
                width={58}
                height={58}
                priority
                className="h-12 w-12 object-contain transition-transform duration-300 group-hover:scale-105 sm:h-14 sm:w-14"
              />
            </Link>

            <div className="mt-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-gold">
                ITMT Management System
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Secure student & staff portal
              </p>
            </div>
          </div>

          {/* Main card */}
          <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_24px_70px_rgba(27,40,71,0.12)]">
            {/* Top accent */}
            <div className="h-1.5 bg-gradient-to-r from-brand-navy via-brand-gold to-brand-navy" />

            <div className="p-6 sm:p-9">
              {!isSubmitted ? (
                <>
                  {/* Icon */}
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy/[0.07] ring-1 ring-brand-navy/10">
                    <LockKeyhole className="h-7 w-7 text-brand-navy" />
                  </div>

                  {/* Heading */}
                  <div>
                    <h1 className="text-2xl font-black tracking-tight text-brand-navy sm:text-[30px]">
                      Reset your password
                    </h1>

                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 sm:text-[15px]">
                      Forgot your password? Enter the email address associated
                      with your ITMT account and we&apos;ll send you a secure
                      reset link.
                    </p>
                  </div>

                  {/* Form */}
                  <form
                    onSubmit={handleSubmit}
                    className="mt-7 space-y-5"
                  >
                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-semibold text-slate-800"
                      >
                        Email address
                      </label>

                      <div className="group relative">
                        <Mail
                          aria-hidden="true"
                          className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400 transition-colors duration-200 group-focus-within:text-brand-navy"
                        />

                        <input
                          id="email"
                          name="email"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          required
                          value={email}
                          onChange={(event) => {
                            setEmail(event.target.value);
                            if (error) setError("");
                          }}
                          placeholder="you@example.com"
                          disabled={isLoading}
                          className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-navy focus:bg-white focus:ring-4 focus:ring-brand-navy/10 disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </div>

                      {error && (
                        <div className="mt-2.5 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-700">
                          {error}
                        </div>
                      )}
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-brand-navy px-5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(27,40,71,0.20)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-[0_14px_30px_rgba(27,40,71,0.25)] focus:outline-none focus:ring-4 focus:ring-brand-navy/20 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
                    >
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                      {isLoading ? (
                        <>
                          <Loader2 className="relative h-4.5 w-4.5 animate-spin" />
                          <span className="relative">Sending reset link...</span>
                        </>
                      ) : (
                        <>
                          <Mail className="relative h-4.5 w-4.5" />
                          <span className="relative">Send reset link</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Security note */}
                  <div className="mt-6 flex gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-gold" />

                    <p className="text-xs leading-5 text-slate-500">
                      For your security, we&apos;ll only send a reset link if
                      the email is associated with an account.
                    </p>
                  </div>
                </>
              ) : (
                /* Success state */
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/60">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                  </div>

                  <h1 className="mt-6 text-2xl font-black tracking-tight text-brand-navy sm:text-[30px]">
                    Check your email
                  </h1>

                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 sm:text-[15px]">
                    {message}
                  </p>

                  {email && (
                    <div className="mx-auto mt-5 inline-flex max-w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700">
                      <Mail className="h-4 w-4 shrink-0 text-brand-navy" />
                      <span className="truncate">{email}</span>
                    </div>
                  )}

                  <div className="mt-7 space-y-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSubmitted(false);
                        setMessage("");
                        setError("");
                      }}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-brand-navy transition-all duration-200 hover:border-brand-navy/30 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-brand-navy/10"
                    >
                      Try another email
                    </button>

                    <Link
                      href="/auth/login"
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(27,40,71,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-[0_12px_26px_rgba(27,40,71,0.22)] focus:outline-none focus:ring-4 focus:ring-brand-navy/20"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to login
                    </Link>
                  </div>

                  <p className="mt-6 text-xs leading-5 text-slate-400">
                    Didn&apos;t receive the email? Check your spam or junk
                    folder.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-center gap-2 text-center">
            <LockKeyhole className="h-3.5 w-3.5 text-slate-400" />
            <p className="text-xs text-slate-400">
              Your account security is important to us.
            </p>
          </div>

          <div className="mt-3 text-center">
            {!isSubmitted && (
              <Link
                href="/auth/login"
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-brand-navy transition-colors hover:text-brand-blue"
              >
                <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
                Back to login
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}