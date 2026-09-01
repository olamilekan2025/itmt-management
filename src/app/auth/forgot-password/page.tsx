"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    setMessage(data.message || "If an account exists with that email, a reset link has been sent.");
    setIsSubmitted(true);
    setIsLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-light p-6">
      <div className="w-full max-w-md space-y-5 rounded-xl bg-white p-8 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Reset your password</h1>
          <p className="mt-1 text-sm text-slate-600">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {isSubmitted ? (
          <p className="rounded-md bg-brand-light p-3 text-sm text-brand-navy">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="text-sm font-medium">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-brand-navy px-4 py-2 font-medium text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-slate-600">
          <Link href="/auth/login" className="font-medium text-brand-navy hover:text-brand-blue">
            Back to login
          </Link>
        </p>
      </div>
    </main>
  );
}