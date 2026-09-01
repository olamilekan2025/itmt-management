"use client";

import { FormEvent, useRef, useState } from "react";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowRight, ShieldCheck } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
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

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#1877F2"
        d="M18 9c0-4.97-4.03-9-9-9S0 4.03 0 9c0 4.49 3.29 8.21 7.59 8.89v-6.29H5.31V9h2.28V7.02c0-2.25 1.34-3.49 3.39-3.49.98 0 2.01.18 2.01.18v2.21h-1.13c-1.11 0-1.46.69-1.46 1.4V9h2.49l-.4 2.6h-2.09v6.29C14.71 17.21 18 13.49 18 9z"
      />
    </svg>
  );
}

type LoginStep = "credentials" | "otp";

export default function AuthPage() {
  const router = useRouter();

  const [loginStep, setLoginStep] = useState<LoginStep>("credentials");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);

  const [isLoading, setIsLoading] = useState(false);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");

  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  async function handleCredentialsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Invalid email or password.");
        setIsLoading(false);
        return;
      }

      if (data.requiresOtp) {
        setLoginStep("otp");
        setOtpDigits(["", "", "", "", "", ""]);
        setIsLoading(false);
        toast.success("A verification code has been sent to your email.");
        setTimeout(() => otpInputRefs.current[0]?.focus(), 0);
        return;
      }

      await completeSignIn(email, password);
    } catch {
      toast.error("Unable to sign in. Please try again.");
      setIsLoading(false);
    }
  }

  async function handleOtpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    await completeSignIn(email, password, otpDigits.join(""));
  }

  async function handleResendCode() {
    setResendState("sending");

    try {
      const res = await fetch(`${API_URL}/auth/login-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message || "Unable to resend code.");
        setResendState("idle");
        return;
      }

      setOtpDigits(["", "", "", "", "", ""]);
      setResendState("sent");
      toast.success("A new code has been sent.");
      setTimeout(() => otpInputRefs.current[0]?.focus(), 0);
    } catch {
      toast.error("Unable to resend code. Please try again.");
      setResendState("idle");
    }
  }

  async function completeSignIn(signInEmail: string, signInPassword: string, signInOtp?: string) {
    const result = await signIn("credentials", {
      email: signInEmail,
      password: signInPassword,
      otp: signInOtp,
      redirect: false,
    });

    if (result?.error) {
      toast.error(loginStep === "otp" ? "Invalid or expired code." : "Invalid email or password.");
      setIsLoading(false);
      return;
    }

    toast.success("Signed in successfully.");

    const session = await getSession();
    const role = session?.user.role || "student";
    router.replace(`/dashboards/${role}`);
    router.refresh();
  }

  function handleOtpDigitChange(index: number, value: string) {
    const digits = value.replace(/\D/g, "");

    if (!digits) {
      setOtpDigits((prev) => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
      return;
    }

    if (digits.length > 1) {
      const next = [...otpDigits];
      for (let i = 0; i < digits.length && index + i < 6; i++) {
        next[index + i] = digits[i];
      }
      setOtpDigits(next);
      const nextIndex = Math.min(index + digits.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = digits;
      return next;
    });

    if (index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace") {
      event.preventDefault();

      setOtpDigits((prev) => {
        const next = [...prev];
        if (next[index]) {
          next[index] = "";
        } else if (index > 0) {
          next[index - 1] = "";
        }
        return next;
      });

      if (!otpDigits[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      }
      return;
    }

    if (event.key === "Delete") {
      event.preventDefault();
      setOtpDigits((prev) => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      otpInputRefs.current[index - 1]?.focus();
      return;
    }

    if (event.key === "ArrowRight" && index < 5) {
      event.preventDefault();
      otpInputRefs.current[index + 1]?.focus();
      return;
    }
  }

  function handleOtpPaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();

    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setOtpDigits(next);

    const focusIndex = Math.min(pasted.length, 5);
    setTimeout(() => otpInputRefs.current[focusIndex]?.focus(), 0);
  }

  function renderOtpForm() {
    return (
      <form onSubmit={handleOtpSubmit} className="space-y-6">
        <div>
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gold/10">
            <ShieldCheck className="h-6 w-6 text-brand-gold" />
          </div>

          <h2 className="font-sans text-2xl font-semibold tracking-tight text-brand-navy">
            Verify your account
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            We sent a 6-digit verification code to{" "}
            <span className="font-medium text-slate-700">{email}</span>.
          </p>
        </div>

        <div className="flex justify-between gap-2">
          {otpDigits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                otpInputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              maxLength={1}
              required
              value={digit}
              onChange={(e) => handleOtpDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              onPaste={handleOtpPaste}
              className="h-14 w-12 rounded-xl border border-slate-200 bg-slate-50 text-center text-xl font-semibold text-slate-900 outline-none transition-all focus:border-brand-navy focus:bg-white focus:ring-4 focus:ring-brand-navy/5"
              aria-label={`Verification code digit ${index + 1}`}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading || otpDigits.some((d) => !d)}
          className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-brand-navy px-4 text-sm font-semibold text-white shadow-lg shadow-brand-navy/10 transition-all hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
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
            disabled={resendState === "sending"}
            className="text-sm font-medium text-brand-navy transition-colors hover:text-brand-blue disabled:opacity-60"
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
              setLoginStep("credentials");
              setOtpDigits(["", "", "", "", "", ""]);
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

  function renderCredentialsForm() {
    return (
      <form onSubmit={handleCredentialsSubmit} className="space-y-5">
        <div className="mb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
            Welcome back
          </p>

          <h2 className="mt-2 font-sans text-3xl font-semibold tracking-tight text-brand-navy">
            Sign in to your account
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Access your academic and institutional services securely.
          </p>
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
            Email Address
          </label>

          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand-navy focus:bg-white focus:ring-4 focus:ring-brand-navy/5"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>

            <Link
              href="/auth/forgot-password"
              className="text-xs font-medium text-brand-navy transition-colors hover:text-brand-blue"
            >
              Forgot password?
            </Link>
          </div>

          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand-navy focus:bg-white focus:ring-4 focus:ring-brand-navy/5"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
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

        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-medium text-slate-400">OR CONTINUE WITH</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm"
          >
            <GoogleIcon />
            Google
          </button>

          <button
            type="button"
            onClick={() => signIn("facebook", { callbackUrl: "/" })}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-all hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm"
          >
            <FacebookIcon />
            Facebook
          </button>
        </div>
      </form>
    );
  }

  return (
    <main className="min-h-screen bg-white flex items-center">
      <div className="mx-auto flex h-170 px-4 py-0 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-3xl bg-white shadow-2xl shadow-brand-navy/10 lg:grid-cols-2">
          {/* LEFT — Brand / Welcome */}
          <div className="relative hidden overflow-hidden bg-brand-navy lg:flex">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />
            <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-brand-blue/10 blur-3xl" />

            <div className="relative flex w-full flex-col justify-center p-12 xl:p-16">
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

              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-gold">
                ITMT Academy
              </p>

              <h1 className="mt-4 max-w-md font-sans text-4xl font-semibold leading-tight text-white xl:text-5xl">
                Welcome back.
              </h1>

              <p className="mt-5 max-w-sm text-base leading-7 text-white/65">
                Sign in to access your academic dashboard and stay connected with ITMT.
              </p>

              <div className="mt-10 flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-brand-gold" />
                <span className="text-sm text-white/60">Secure academic management</span>
              </div>
            </div>
          </div>

          {/* RIGHT — Login */}
          <div className="flex items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-16">
            <div className="w-full max-w-md">
              <div className="mb-8 flex items-center gap-3 lg:hidden">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy">
                  <span className="text-xs font-bold text-white">ITMT</span>
                </div>

                <div>
                  <p className="text-sm font-semibold text-brand-navy">ITMT Academy</p>
                  <p className="text-xs text-slate-500">Management System</p>
                </div>
              </div>

              {loginStep === "otp" ? renderOtpForm() : renderCredentialsForm()}

              {loginStep === "credentials" && (
                <div className="mt-7 space-y-3 border-t border-slate-100 pt-6">
                  <Link
                    href="/auth/student/login"
                    className="block text-center text-sm text-slate-500 transition-colors hover:text-brand-navy"
                  >
                    Student?{" "}
                    <span className="font-semibold text-brand-navy">Sign in with Matric Number</span>
                  </Link>

                  <Link
                    href="/admissions/apply"
                    className="block text-center text-sm text-slate-500 transition-colors hover:text-brand-navy"
                  >
                    New student?{" "}
                    <span className="font-semibold text-brand-navy">Apply for Admission</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}