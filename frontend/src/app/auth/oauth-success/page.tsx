"use client";

import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ShieldCheck,
} from "lucide-react";

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

export default function OAuthSuccessPage() {
  const router = useRouter();

  const [message, setMessage] =
    useState("Completing secure sign in...");

  useEffect(() => {
    let mounted = true;

    async function completeOAuthLogin() {
      try {
        setMessage(
          "Verifying your account...",
        );

        let session =
          await getSession();

        /*
         * Give NextAuth a moment to finish
         * writing the JWT/session cookie.
         */
        if (!session?.user) {
          await new Promise(
            (resolve) =>
              setTimeout(resolve, 700),
          );

          session =
            await getSession();
        }

        if (!mounted) {
          return;
        }

        /* --------------------------------------------------
           No session
        -------------------------------------------------- */

        if (!session?.user) {
          setMessage(
            "We could not verify your sign-in session.",
          );

          setTimeout(() => {
            if (mounted) {
              router.replace(
                "/auth/login",
              );
            }
          }, 1500);

          return;
        }

        /* --------------------------------------------------
           Validate role
        -------------------------------------------------- */

        const rawRole =
          session.user.role;

        if (
          !VALID_ROLES.includes(
            rawRole as UserRole,
          )
        ) {
          console.error(
            "OAuth session contains invalid role:",
            rawRole,
          );

          setMessage(
            "Your account role could not be verified.",
          );

          setTimeout(() => {
            if (mounted) {
              router.replace(
                "/auth/login",
              );
            }
          }, 1500);

          return;
        }

        const role =
          rawRole as UserRole;

        /* --------------------------------------------------
           Successful authentication
        -------------------------------------------------- */

        setMessage(
          "Sign in successful. Redirecting...",
        );

        router.replace(
          `/dashboards/${role}`,
        );

        router.refresh();
      } catch (error) {
        console.error(
          "OAuth redirect error:",
          error,
        );

        if (!mounted) {
          return;
        }

        setMessage(
          "Unable to complete sign in. Please try again.",
        );

        setTimeout(() => {
          if (mounted) {
            router.replace(
              "/auth/login",
            );
          }
        }, 1500);
      }
    }

    completeOAuthLogin();

    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-brand-navy/10">
          {/* Logo / Security Icon */}

          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-navy shadow-lg shadow-brand-navy/20">
            <ShieldCheck className="h-8 w-8 text-brand-gold" />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-brand-navy">
            ITMT Academy
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Secure authentication
          </p>

          {/* Loading */}

          <div className="mt-8 flex items-center justify-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-brand-navy" />

            <p className="text-sm font-medium text-slate-700">
              {message}
            </p>
          </div>

          {/* Progress */}

          <div className="mt-6 h-1 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-brand-gold" />
          </div>
        </div>
      </div>
    </main>
  );
}

