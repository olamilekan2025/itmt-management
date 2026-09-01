"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      setStatus("error");
      setMessage("This verification link is missing required information.");
      return;
    }

    if (!API_URL) {
      setStatus("error");
      setMessage("Server configuration error. Please contact support.");
      return;
    }

    fetch(`${API_URL}/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, email }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully.");
        } else {
          setStatus("error");
          setMessage(data.message || "Unable to verify email.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      });
  }, [searchParams]);

  async function handleResend() {
    const email = searchParams.get("email");
    if (!email) return;

    setResendState("sending");

    await fetch(`${API_URL}/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setResendState("sent");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-light p-6">
      <div className="w-full max-w-md space-y-4 rounded-xl bg-white p-8 text-center shadow-sm">
        {status === "loading" && (
          <p className="text-slate-600">Verifying your email...</p>
        )}

        {status === "success" && (
          <>
            <h1 className="text-2xl font-bold text-brand-navy">Email verified</h1>
            <p className="text-slate-600">{message}</p>
            <Link
              href="/auth/login"
              className="mt-4 inline-block rounded-md bg-brand-navy px-4 py-2 font-medium text-white transition-colors hover:bg-brand-dark"
            >
              Go to login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-2xl font-bold text-brand-navy">Verification failed</h1>
            <p className="text-slate-600">{message}</p>
            <Link
              href="/auth/login"
              className="mt-4 inline-block rounded-md bg-brand-navy px-4 py-2 font-medium text-white transition-colors hover:bg-brand-dark"
            >
              Back to login
            </Link>

            {searchParams.get("email") && (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendState !== "idle"}
                className="mt-2 w-full text-sm text-brand-navy underline hover:text-brand-blue disabled:opacity-60"
              >
                {resendState === "sent"
                  ? "A new link has been sent (if the account exists)"
                  : resendState === "sending"
                  ? "Sending..."
                  : "Resend verification email"}
              </button>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-brand-light">Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}