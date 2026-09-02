"use client";

import { FormEvent, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      setError("This reset link is missing required information.");
      setIsLoading(false);
      return;
    }

    if (!API_URL) {
      setError("Server configuration error. Please contact support.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Unable to reset password.");
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-light p-6">
      <div className="w-full max-w-md space-y-5 rounded-xl bg-white p-8 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Choose a new password</h1>
        </div>

        {error && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>
        )}

        {isSuccess ? (
          <>
            <p className="rounded-md bg-brand-light p-3 text-sm text-brand-navy">
              Your password has been reset successfully.
            </p>
            <button
              type="button"
              onClick={() => router.push("/auth/login")}
              className="w-full rounded-md bg-brand-navy px-4 py-2 font-medium text-white transition-colors hover:bg-brand-dark"
            >
              Go to login
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="password" className="text-sm font-medium">
                New password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-brand-navy px-4 py-2 font-medium text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Resetting..." : "Reset password"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-brand-light">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}