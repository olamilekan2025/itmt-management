"use client"

import type { FormEvent } from "react";
import { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  ShieldCheck,
  UserPlus,
  LogIn,
} from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function StudentLoginPage() {
  const router = useRouter();

  const [matricNumber, setMatricNumber] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  /* =======================================================
     SUBMIT
  ======================================================= */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const normalizedMatricNumber =
      matricNumber.trim().toUpperCase();

    if (!normalizedMatricNumber) {
      toast.error(
        "Please enter your matric number.",
      );
      return;
    }

    if (!password) {
      toast.error(
        "Please enter your password.",
      );
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn(
        "credentials",
        {
          matricNumber:
            normalizedMatricNumber,
          password,
          redirect: false,
        },
      );

      if (result?.error) {
        toast.error("Sign in failed", {
          description:
            "Invalid matric number or password.",
        });

        setIsLoading(false);
        return;
      }

      toast.success("Welcome back!", {
        description:
          "You have signed in successfully.",
      });

      router.replace(
        "/dashboards/student",
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Student sign-in error:",
        error,
      );

      toast.error("Unable to sign in", {
        description:
          "Something went wrong. Please try again.",
      });

      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-brand-light">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-3xl bg-white shadow-2xl shadow-brand-navy/10 lg:grid-cols-2">

          {/* =================================================
              LEFT — STUDENT BRAND + NAVIGATION
          ================================================= */}

          <div className="relative hidden overflow-hidden bg-brand-navy lg:flex">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />

            <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-brand-blue/10 blur-3xl" />

            <div className="absolute right-16 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full border border-white/5" />

            <div className="relative flex w-full flex-col justify-center p-12 xl:p-16">

              {/* LOGO */}
              <div className="mb-10">
                <Link
                  href="/"
                  aria-label="Back to Home"
                  className="group relative flex h-16 w-16 items-center overflow-hidden rounded-2xl bg-white p-2 shadow-lg transition-all duration-300 hover:w-44 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl">
                    <img
                      src="/newLog.png"
                      alt="ITMT Academy"
                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-95"
                    />
                  </div>

                  <span className="ml-3 whitespace-nowrap text-sm font-semibold text-brand-navy opacity-0 transition-all duration-300 group-hover:opacity-100">
                    Back to Home
                  </span>
                </Link>
              </div>

              {/* BRAND COPY */}
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-gold">
                ITMT Student Portal
              </p>

              <h1 className="mt-4 max-w-md font-sans text-4xl font-semibold leading-tight text-white xl:text-5xl">
                Welcome back.
              </h1>

              <p className="mt-5 max-w-sm text-base leading-7 text-white/65">
                Sign in to access your
                academic information,
                results, courses, and
                student dashboard.
              </p>

              {/* LEFT SIDE ACTIONS */}
              <div className="mt-10 space-y-3">

                {/* STAFF LOGIN */}
                <Link
                  href="/auth/login"
                  className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10 hover:shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                      <LogIn className="h-5 w-5 text-white/80" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white">
                        Staff & Admin
                      </p>

                      <p className="mt-0.5 text-xs text-white/45">
                        Sign in with email
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="h-4 w-4 text-white/40 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-brand-gold" />
                </Link>

                {/* ADMISSION APPLICATION */}
                <Link
                  href="/admissions/apply"
                  className="group flex items-center justify-between rounded-2xl border border-brand-gold/20 bg-brand-gold/5 px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-gold/40 hover:bg-brand-gold/10 hover:shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gold/10">
                      <UserPlus className="h-5 w-5 text-brand-gold" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white">
                        New Student?
                      </p>

                      <p className="mt-0.5 text-xs text-white/45">
                        Apply for admission
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="h-4 w-4 text-white/40 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-brand-gold" />
                </Link>
              </div>

              {/* SECURITY */}
              <div className="mt-8 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                  <ShieldCheck className="h-4 w-4 text-brand-gold" />
                </div>

                <span className="text-sm text-white/50">
                  Secure student access
                </span>
              </div>
            </div>
          </div>

          {/* =================================================
              RIGHT — STUDENT LOGIN
          ================================================= */}

          <div className="flex items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-16">
            <div className="w-full max-w-md">

              {/* MOBILE BRAND */}
              <div className="mb-8 flex items-center gap-3 lg:hidden">
                <Link
                  href="/"
                  className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-slate-200"
                  aria-label="Back to Home"
                >
                   <img
                      src="/login.png"
                      alt="ITMT Academy"
                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-95"
                    />
                </Link>

                <div>
                  <p className="text-sm font-semibold text-brand-navy">
                    ITMT Academy
                  </p>

                  <p className="text-xs text-slate-500">
                    Student Portal
                  </p>
                </div>
              </div>

              {/* HEADING */}
              <div className="mb-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gold/10">
                  <GraduationCap className="h-6 w-6 text-brand-gold" />
                </div>

                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
                  Student Access
                </p>

                <h2 className="mt-2 font-sans text-3xl font-semibold tracking-tight text-brand-navy">
                  Student Sign In
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Access your student dashboard
                  and academic information.
                </p>
              </div>

              {/* FORM */}
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* MATRIC NUMBER */}
                <div>
                  <label
                    htmlFor="matricNumber"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Matric Number
                  </label>

                  <input
                    id="matricNumber"
                    type="text"
                    required
                    autoComplete="username"
                    placeholder="ITMT/2026/000001"
                    value={matricNumber}
                    onChange={(event) =>
                      setMatricNumber(
                        event.target.value,
                      )
                    }
                    disabled={isLoading}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-medium uppercase tracking-wide text-slate-900 outline-none transition-all placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:border-brand-navy focus:bg-white focus:ring-4 focus:ring-brand-navy/5 disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </div>

                {/* PASSWORD */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Password
                    </label>

                    <Link
                      href="/auth/forgot-password"
                      className="text-xs font-medium text-brand-navy transition-colors hover:text-brand-blue"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="relative">
                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      required
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target.value,
                        )
                      }
                      disabled={isLoading}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 pr-12 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand-navy focus:bg-white focus:ring-4 focus:ring-brand-navy/5 disabled:cursor-not-allowed disabled:opacity-70"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (previous) =>
                            !previous,
                        )
                      }
                      disabled={isLoading}
                      className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-slate-400 transition-colors hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-navy disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      title={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* SIGN IN */}
                <button
                  type="submit"
                  disabled={isLoading}
                  aria-busy={isLoading}
                  className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-brand-navy px-4 text-sm font-semibold text-white shadow-lg shadow-brand-navy/10 transition-all hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* MOBILE NAVIGATION */}
              <div className="mt-7 space-y-3 border-t border-slate-100 pt-6 lg:hidden">
                <Link
                  href="/auth/login"
                  className="flex items-center justify-center gap-2 text-sm text-slate-500 transition-colors hover:text-brand-navy"
                >
                  <LogIn className="h-4 w-4" />

                  Admin/Staff?
                  <span className="font-semibold text-brand-navy">
                    Sign in with Email
                  </span>
                </Link>

                <Link
                  href="/admissions/apply"
                  className="flex items-center justify-center gap-2 text-sm text-slate-500 transition-colors hover:text-brand-navy"
                >
                  <UserPlus className="h-4 w-4" />

                  New student?
                  <span className="font-semibold text-brand-navy">
                    Apply for Admission
                  </span>
                </Link>
              </div>

              {/* SECURITY NOTE */}
              <div className="mt-6 text-center">
                <p className="text-xs text-slate-400">
                  Secure access to the ITMT student
                  portal
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

