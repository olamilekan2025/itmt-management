"use client";

import { FormEvent, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
} from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";

export default function StudentLoginPage() {
  const router = useRouter();

  const [matricNumber, setMatricNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        matricNumber,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Sign in failed", {
          description: "Invalid matric number or password.",
        });

        setIsLoading(false);
        return;
      }

      toast.success("Welcome back!", {
        description: "You have signed in successfully.",
      });

      router.replace("/dashboards/student");
      router.refresh();
    } catch {
      toast.error("Unable to sign in", {
        description: "Something went wrong. Please try again.",
      });

      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-brand-light">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-3xl bg-white shadow-2xl shadow-brand-navy/10 lg:grid-cols-2">

          {/* LEFT — STUDENT BRAND PANEL */}
          <div className="relative hidden overflow-hidden bg-brand-navy lg:flex">

            {/* Decorative glow */}
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />

            <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-brand-blue/10 blur-3xl" />

            <div className="relative flex w-full flex-col justify-center p-12 xl:p-16">

              {/* Logo / Back to Home */}
              <div className="mb-10">
                <Link
                  href="/"
                  aria-label="Back to Home"
                  className="group relative flex h-16 w-16 items-center overflow-hidden rounded-2xl bg-white p-2 shadow-lg transition-all duration-300 hover:w-44 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy"
                >
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl">
                    <img
  src="/newLog.png"
  alt="ITMT Academy"
  className="h-full w-full object-contain"
/>

                    <span className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 bg-brand-gold transition-all duration-300 group-hover:w-7" />
                  </div>

                  <span className="ml-3 whitespace-nowrap text-sm font-semibold text-brand-navy opacity-0 transition-all duration-300 group-hover:opacity-100">
                    Back to Home
                  </span>
                </Link>
              </div>

              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-gold">
                ITMT Student Portal
              </p>

              <h1 className="mt-4 max-w-md font-sans text-4xl font-semibold leading-tight text-white xl:text-5xl">
                Welcome back.
              </h1>

              <p className="mt-5 max-w-sm text-base leading-7 text-white/65">
                Sign in to access your academic information and student
                dashboard.
              </p>

              <div className="mt-10 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                  <GraduationCap className="h-4 w-4 text-brand-gold" />
                </div>

                <span className="text-sm text-white/60">
                  Your academic journey, connected.
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT — STUDENT LOGIN */}
          <div className="flex items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-16">
            <div className="w-full max-w-md">

              {/* Mobile brand */}
              <div className="mb-8 flex items-center gap-3 lg:hidden">
                <Link
                  href="/"
                  className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white p-1.5 shadow-md"
                  aria-label="Back to Home"
                >
                  <img
                    src="/images/newLog.png"
                    alt="ITMT Academy"
                    className="h-full w-full object-contain"
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

              {/* Heading */}
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
                  Student Access
                </p>

                <h2 className="mt-2 font-sans text-3xl font-semibold tracking-tight text-brand-navy">
                  Student Sign In
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Access your student dashboard.
                </p>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* Matric Number */}
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
                    onChange={(e) =>
                      setMatricNumber(e.target.value)
                    }
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-medium uppercase tracking-wide text-slate-900 outline-none transition-all placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:border-brand-navy focus:bg-white focus:ring-4 focus:ring-brand-navy/5"
                  />
                </div>

                {/* Password */}
                {/* Password */}
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
      type={showPassword ? "text" : "password"}
      required
      autoComplete="current-password"
      placeholder="Enter your password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 pr-12 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand-navy focus:bg-white focus:ring-4 focus:ring-brand-navy/5"
    />

    <button
      type="button"
      onClick={() => setShowPassword((prev) => !prev)}
      className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-slate-400 transition-colors hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-navy"
      aria-label={showPassword ? "Hide password" : "Show password"}
      title={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? (
        <EyeOff className="h-5 w-5" />
      ) : (
        <Eye className="h-5 w-5" />
      )}
    </button>
  </div>
</div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
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

              {/* Bottom links */}
              <div className="mt-7 space-y-3 border-t border-slate-100 pt-6">
                <Link
                  href="/auth/login"
                  className="block text-center text-sm text-slate-500 transition-colors hover:text-brand-navy"
                >
                  Admin/Staff?{" "}
                  <span className="font-semibold text-brand-navy">
                    Sign in with Email
                  </span>
                </Link>

                <Link
                  href="/admissions/apply"
                  className="block text-center text-sm text-slate-500 transition-colors hover:text-brand-navy"
                >
                  New student?{" "}
                  <span className="font-semibold text-brand-navy">
                    Apply for Admission
                  </span>
                </Link>
              </div>

              {/* Security note */}
              <div className="mt-6 text-center">
                <p className="text-xs text-slate-400">
                  Secure access to the ITMT student portal
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}