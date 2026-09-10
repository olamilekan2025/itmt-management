"use client";

import type {
  ClipboardEvent,
  FormEvent,
  KeyboardEvent,
} from "react";

import { useRef, useState } from "react";
import { getSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  LogIn,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

/* =========================================================
   API CONFIGURATION
========================================================= */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

/* =========================================================
   TYPES
========================================================= */

type LoginStep = "credentials" | "otp";

type UserRole =
  | "admin"
  | "registrar"
  | "finance"
  | "lecturer"
  | "student";

const VALID_ROLES: UserRole[] = [
  "admin",
  "registrar",
  "finance",
  "lecturer",
  "student",
];

/* =========================================================
   GOOGLE ICON
========================================================= */

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.85 2.09-1.81 2.73v2.27h2.92c1.71-1.57 2.69-3.88 2.69-6.64z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.27c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34C2.44 15.98 5.48 18 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.71c-.18-.54-.28-1.11-.28-1.71s.1-1.17.28-1.71V4.95H.96A8.996 8.996 0 000 9c0 1.45.35 2.83.96 4.05l3.01-2.34z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.95l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}

/* =========================================================
   FACEBOOK ICON
========================================================= */

function FacebookIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      aria-hidden="true"
    >
      <path
        fill="#1877F2"
        d="M18 9c0-4.97-4.03-9-9-9S0 4.03 0 9c0 4.49 3.29 8.21 7.59 8.89v-6.29H5.31V9h2.28V7.02c0-2.25 1.34-3.49 3.39-3.49.98 0 2.01.18 2.01.18v2.21h-1.13c-1.11 0-1.46.69-1.46 1.4V9h2.49l-.4 2.6h-2.09v6.29C14.71 17.21 18 13.49 18 9z"
      />
    </svg>
  );
}

/* =========================================================
   AUTH PAGE
========================================================= */

export default function AuthPage() {
  const router = useRouter();

  const [loginStep, setLoginStep] =
    useState<LoginStep>("credentials");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [otpDigits, setOtpDigits] = useState<
    string[]
  >(["", "", "", "", "", ""]);

  const [isLoading, setIsLoading] =
    useState(false);

  const [resendState, setResendState] =
    useState<"idle" | "sending" | "sent">(
      "idle",
    );

  const otpInputRefs =
    useRef<Array<HTMLInputElement | null>>([]);

  /* =======================================================
     LOGIN REQUEST
  ======================================================= */

  async function handleCredentialsSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!API_URL) {
      toast.error("API URL is not configured.");
      return;
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      toast.error(
        "Please enter your email address.",
      );
      return;
    }

    if (!password) {
      toast.error("Please enter your password.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/login-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
            password,
          }),
          cache: "no-store",
        },
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        toast.error(
          data?.message ||
            "Invalid email or password.",
        );

        setIsLoading(false);
        return;
      }

      if (data?.requiresOtp) {
        setEmail(normalizedEmail);
        setLoginStep("otp");

        setOtpDigits([
          "",
          "",
          "",
          "",
          "",
          "",
        ]);

        setIsLoading(false);

        toast.success(
          "A verification code has been sent to your email.",
        );

        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 100);

        return;
      }

      await completeSignIn(
        normalizedEmail,
        password,
      );
    } catch (error) {
      console.error(
        "Login request error:",
        error,
      );

      toast.error(
        "Unable to sign in. Please try again.",
      );

      setIsLoading(false);
    }
  }

  /* =======================================================
     OTP SUBMIT
  ======================================================= */

  async function handleOtpSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const otp = otpDigits.join("");

    if (otp.length !== 6) {
      toast.error(
        "Please enter the complete 6-digit verification code.",
      );
      return;
    }

    setIsLoading(true);

    await completeSignIn(
      email.trim().toLowerCase(),
      password,
      otp,
    );
  }

  /* =======================================================
     RESEND OTP
  ======================================================= */

  async function handleResendCode() {
    if (!API_URL) {
      toast.error("API URL is not configured.");
      return;
    }

    if (resendState === "sending") {
      return;
    }

    setResendState("sending");

    try {
      const response = await fetch(
        `${API_URL}/api/auth/login-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
          cache: "no-store",
        },
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        toast.error(
          data?.message ||
            "Unable to resend code.",
        );

        setResendState("idle");
        return;
      }

      setOtpDigits([
        "",
        "",
        "",
        "",
        "",
        "",
      ]);

      setResendState("sent");

      toast.success(
        "A new verification code has been sent.",
      );

      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (error) {
      console.error(
        "Resend OTP error:",
        error,
      );

      toast.error(
        "Unable to resend code. Please try again.",
      );

      setResendState("idle");
    }
  }

  /* =======================================================
     COMPLETE NEXTAUTH CREDENTIAL SIGN IN
  ======================================================= */

  async function completeSignIn(
    signInEmail: string,
    signInPassword: string,
    signInOtp?: string,
  ) {
    try {
      const result = await signIn(
        "credentials",
        {
          email: signInEmail,
          password: signInPassword,
          ...(signInOtp
            ? {
                otp: signInOtp,
              }
            : {}),
          redirect: false,
        },
      );

      if (result?.error) {
        toast.error(
          signInOtp
            ? "Invalid or expired verification code."
            : "Invalid email or password.",
        );

        setIsLoading(false);
        return;
      }

      const session = await getSession();

      if (!session?.user) {
        toast.error(
          "Sign in completed, but your session could not be loaded.",
        );

        setIsLoading(false);
        return;
      }

      const rawRole = session.user.role;

      const role: UserRole =
        VALID_ROLES.includes(
          rawRole as UserRole,
        )
          ? (rawRole as UserRole)
          : "student";

      toast.success(
        "Signed in successfully.",
      );

      router.replace(
        `/dashboards/${role}`,
      );

      router.refresh();
    } catch (error) {
      console.error(
        "NextAuth sign-in error:",
        error,
      );

      toast.error(
        "Unable to complete sign in. Please try again.",
      );

      setIsLoading(false);
    }
  }

  /* =======================================================
     GOOGLE SIGN IN
  ======================================================= */

  async function handleGoogleSignIn() {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      await signIn("google", {
        callbackUrl:
          "/auth/oauth-success",
      });
    } catch (error) {
      console.error(
        "Google sign-in error:",
        error,
      );

      toast.error(
        "Unable to continue with Google.",
      );

      setIsLoading(false);
    }
  }

  /* =======================================================
     FACEBOOK SIGN IN
  ======================================================= */

  async function handleFacebookSignIn() {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      await signIn("facebook", {
        callbackUrl:
          "/auth/oauth-success",
      });
    } catch (error) {
      console.error(
        "Facebook sign-in error:",
        error,
      );

      toast.error(
        "Unable to continue with Facebook.",
      );

      setIsLoading(false);
    }
  }

  /* =======================================================
     OTP DIGIT CHANGE
  ======================================================= */

  function handleOtpDigitChange(
    index: number,
    value: string,
  ) {
    const digits = value.replace(
      /\D/g,
      "",
    );

    if (!digits) {
      setOtpDigits((previous) => {
        const next = [...previous];
        next[index] = "";
        return next;
      });

      return;
    }

    if (digits.length > 1) {
      const next = [...otpDigits];

      for (
        let i = 0;
        i < digits.length &&
        index + i < 6;
        i++
      ) {
        next[index + i] = digits[i];
      }

      setOtpDigits(next);

      const nextIndex = Math.min(
        index + digits.length,
        5,
      );

      setTimeout(() => {
        otpInputRefs.current[
          nextIndex
        ]?.focus();
      }, 0);

      return;
    }

    setOtpDigits((previous) => {
      const next = [...previous];
      next[index] = digits;
      return next;
    });

    if (index < 5) {
      setTimeout(() => {
        otpInputRefs.current[
          index + 1
        ]?.focus();
      }, 0);
    }
  }

  /* =======================================================
     OTP KEYBOARD
  ======================================================= */

  function handleOtpKeyDown(
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Backspace") {
      event.preventDefault();

      setOtpDigits((previous) => {
        const next = [...previous];

        if (next[index]) {
          next[index] = "";
        } else if (index > 0) {
          next[index - 1] = "";
        }

        return next;
      });

      if (
        !otpDigits[index] &&
        index > 0
      ) {
        otpInputRefs.current[
          index - 1
        ]?.focus();
      }

      return;
    }

    if (event.key === "Delete") {
      event.preventDefault();

      setOtpDigits((previous) => {
        const next = [...previous];
        next[index] = "";
        return next;
      });

      return;
    }

    if (
      event.key === "ArrowLeft" &&
      index > 0
    ) {
      event.preventDefault();

      otpInputRefs.current[
        index - 1
      ]?.focus();

      return;
    }

    if (
      event.key === "ArrowRight" &&
      index < 5
    ) {
      event.preventDefault();

      otpInputRefs.current[
        index + 1
      ]?.focus();

      return;
    }
  }

  /* =======================================================
     OTP PASTE
  ======================================================= */

  function handleOtpPaste(
    event: ClipboardEvent<HTMLInputElement>,
  ) {
    event.preventDefault();

    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) {
      return;
    }

    const next = [
      "",
      "",
      "",
      "",
      "",
      "",
    ];

    for (
      let i = 0;
      i < pasted.length;
      i++
    ) {
      next[i] = pasted[i];
    }

    setOtpDigits(next);

    const focusIndex = Math.min(
      pasted.length,
      5,
    );

    setTimeout(() => {
      otpInputRefs.current[
        focusIndex
      ]?.focus();
    }, 100);
  }

  /* =======================================================
     OTP FORM
  ======================================================= */

  function renderOtpForm() {
    return (
      <form
        onSubmit={handleOtpSubmit}
        className="space-y-6"
      >
        <div>
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gold/10">
            <ShieldCheck className="h-6 w-6 text-brand-gold" />
          </div>

          <h2 className="font-sans text-2xl font-semibold tracking-tight text-brand-navy">
            Verify your account
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            We sent a 6-digit
            verification code to{" "}
            <span className="font-medium text-slate-700">
              {email}
            </span>
            .
          </p>
        </div>

        <div
          className="flex justify-between gap-2"
          aria-label="Verification code"
        >
          {otpDigits.map(
            (digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  otpInputRefs.current[
                    index
                  ] = element;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete={
                  index === 0
                    ? "one-time-code"
                    : "off"
                }
                maxLength={1}
                required
                value={digit}
                onChange={(event) =>
                  handleOtpDigitChange(
                    index,
                    event.target.value,
                  )
                }
                onKeyDown={(event) =>
                  handleOtpKeyDown(
                    index,
                    event,
                  )
                }
                onPaste={
                  handleOtpPaste
                }
                aria-label={`Verification code digit ${
                  index + 1
                }`}
                className="h-14 w-12 rounded-xl border border-slate-200 bg-slate-50 text-center text-xl font-semibold text-slate-900 outline-none transition-all focus:border-brand-navy focus:bg-white focus:ring-4 focus:ring-brand-navy/5"
              />
            ),
          )}
        </div>

        <button
          type="submit"
          disabled={
            isLoading ||
            otpDigits.some(
              (digit) => !digit,
            )
          }
          aria-busy={isLoading}
          className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-brand-navy px-4 text-sm font-semibold text-white shadow-lg shadow-brand-navy/10 transition-all hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Verifying...
            </>
          ) : (
            <>
              Verify & Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </button>

        <div className="space-y-3 text-center">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={
              resendState === "sending"
            }
            className="text-sm font-medium text-brand-navy transition-colors hover:text-brand-blue disabled:cursor-not-allowed disabled:opacity-60"
          >
            {resendState === "sending"
              ? "Sending new code..."
              : resendState === "sent"
                ? "New code sent — resend again"
                : "Didn't get a code? Resend"}
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginStep(
                "credentials",
              );

              setOtpDigits([
                "",
                "",
                "",
                "",
                "",
                "",
              ]);

              setResendState("idle");
            }}
            className="block w-full text-sm text-slate-500 transition-colors hover:text-brand-navy"
          >
            Use a different account
          </button>
        </div>
      </form>
    );
  }

  /* =======================================================
     CREDENTIALS FORM
  ======================================================= */

  function renderCredentialsForm() {
    return (
      <form
        onSubmit={
          handleCredentialsSubmit
        }
        className="space-y-5"
      >
        <div className="mb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
            Welcome back
          </p>

          <h2 className="mt-2 font-sans text-3xl font-semibold tracking-tight text-brand-navy">
            Sign in to your account
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Access your academic and
            institutional services securely.
          </p>
        </div>

        {/* EMAIL */}
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Email Address
          </label>

          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            disabled={isLoading}
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand-navy focus:bg-white focus:ring-4 focus:ring-brand-navy/5 disabled:cursor-not-allowed disabled:opacity-70"
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
                  (previous) => !previous,
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

        {/* CONTINUE */}
        <button
          type="submit"
          disabled={isLoading}
          aria-busy={isLoading}
          className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-brand-navy px-4 text-sm font-semibold text-white shadow-lg shadow-brand-navy/10 transition-all hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Checking...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </button>

        {/* DIVIDER */}
        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-slate-200" />

          <span className="text-xs font-medium text-slate-400">
            OR CONTINUE WITH
          </span>

          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {/* SOCIAL LOGIN */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={
              handleGoogleSignIn
            }
            disabled={isLoading}
            aria-busy={isLoading}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <GoogleIcon />
            Google
          </button>

          <button
            type="button"
            onClick={
              handleFacebookSignIn
            }
            disabled={isLoading}
            aria-busy={isLoading}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FacebookIcon />
            Facebook
          </button>
        </div>
      </form>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="min-h-screen bg-brand-light">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-3xl bg-white shadow-2xl shadow-brand-navy/10 lg:grid-cols-2">

          {/* =================================================
              LEFT — BRAND + NAVIGATION
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
                      src="/login.png"
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
                ITMT Academy
              </p>

              <h1 className="mt-4 max-w-md font-sans text-4xl font-semibold leading-tight text-white xl:text-5xl">
                Welcome back.
              </h1>

              <p className="mt-5 max-w-sm text-base leading-7 text-white/65">
                Sign in to access your
                academic dashboard and
                stay connected with ITMT.
              </p>

              {/* LEFT SIDE ACTIONS */}
              <div className="mt-10 space-y-3">

                {/* STUDENT LOGIN */}
                <Link
                  href="/auth/student/login"
                  className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10 hover:shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gold/10">
                      <GraduationCap className="h-5 w-5 text-brand-gold" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white">
                        Student Portal
                      </p>

                      <p className="mt-0.5 text-xs text-white/45">
                        Sign in with matric number
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
                  Secure institutional access
                </span>
              </div>
            </div>
          </div>

          {/* =================================================
              RIGHT — LOGIN
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
                    src="/newLog.png"
                    alt="ITMT Academy"
                    className="h-full w-full object-contain"
                  />
                </Link>

                <div>
                  <p className="text-sm font-semibold text-brand-navy">
                    ITMT Academy
                  </p>

                  <p className="text-xs text-slate-500">
                    Management System
                  </p>
                </div>
              </div>

              {/* AUTH FORM */}
              {loginStep === "otp"
                ? renderOtpForm()
                : renderCredentialsForm()}

              {/* MOBILE NAVIGATION */}
              {loginStep ===
                "credentials" && (
                <div className="mt-7 space-y-3 border-t border-slate-100 pt-6 lg:hidden">
                  <Link
                    href="/auth/student/login"
                    className="flex items-center justify-center gap-2 text-sm text-slate-500 transition-colors hover:text-brand-navy"
                  >
                    <GraduationCap className="h-4 w-4" />

                    Student?
                    <span className="font-semibold text-brand-navy">
                      Sign in with Matric Number
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
              )}

              {/* SECURITY NOTE */}
              <div className="mt-6 text-center">
                <p className="text-xs text-slate-400">
                  Secure access to the ITMT
                  management system
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

