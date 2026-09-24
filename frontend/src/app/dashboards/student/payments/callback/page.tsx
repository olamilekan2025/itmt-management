"use client";

import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  ReceiptText,
} from "lucide-react";
import { useSession } from "next-auth/react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useEffect, useState } from "react";

import { apiPost } from "@/lib/api";

interface VerifyResponse {
  success: boolean;
  message?: string;
  payment?: {
    paymentReference?: string;
    status?: string;
  };
}

export default function PaymentCallbackPage() {
  const { data: session, status: sessionStatus } =
    useSession();

  const searchParams = useSearchParams();
  const router = useRouter();

  const referenceParam =
    searchParams.get("reference") ??
    searchParams.get("trxref");

  const accessToken = (
    session as { accessToken?: string } | null
  )?.accessToken;

  const [error, setError] = useState("");
  const [message, setMessage] = useState(
    "Confirming your payment with Paystack...",
  );

  useEffect(() => {
    if (sessionStatus === "loading") {
      return;
    }

    if (
      sessionStatus !== "authenticated" ||
      !accessToken
    ) {
      router.replace("/auth/login");
      return;
    }

    if (!referenceParam) {
      setError(
        "No Paystack transaction reference was returned.",
      );
      return;
    }

    // searchParams.get() returns string | null.
    // At this point we have already checked that it exists.
    const reference: string = referenceParam;

    let cancelled = false;

    async function verifyPayment() {
      try {
        setError("");
        setMessage(
          "Verifying your transaction with Paystack...",
        );

        const response =
          await apiPost<VerifyResponse>(
            "/payments/paystack/verify",
            {
              reference,
            },
            accessToken,
          );

        if (cancelled) {
          return;
        }

        if (
          !response.success ||
          !response.payment
        ) {
          throw new Error(
            response.message ||
              "Payment verification failed.",
          );
        }

        setMessage(
          "Payment confirmed successfully. Preparing your receipt...",
        );

        const receiptReference =
          response.payment.paymentReference ??
          reference;

        setTimeout(() => {
          if (cancelled) {
            return;
          }

          router.replace(
            `/dashboards/student/payments/receipt?reference=${encodeURIComponent(
              receiptReference,
            )}`,
          );
        }, 700);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Payment verification error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to verify your payment.",
        );
      }
    }

    void verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [
    sessionStatus,
    accessToken,
    referenceParam,
    router,
  ]);

  const retryVerification = () => {
    window.location.reload();
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
        <div className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
          {/* Header */}
          <div className="bg-brand-navy px-6 py-8 text-center sm:px-10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
              <ReceiptText className="h-8 w-8 text-brand-gold" />
            </div>

            <h1 className="text-xl font-bold text-white sm:text-2xl">
              Payment Verification
            </h1>

            <p className="mt-2 text-sm text-white/70">
              ITMT Student Finance Portal
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-10 sm:px-10">
            {error ? (
              <div className="text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>

                <h2 className="text-xl font-bold text-slate-900">
                  Payment Verification Failed
                </h2>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
                  {error}
                </p>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={retryVerification}
                    className="inline-flex items-center justify-center rounded-xl bg-brand-navy px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-navy/90"
                  >
                    Try Again
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/dashboards/student/payments",
                      )
                    }
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Back to Payments
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-gold/10">
                  {message.includes(
                    "confirmed successfully",
                  ) ? (
                    <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                  ) : (
                    <Loader2 className="h-10 w-10 animate-spin text-brand-gold" />
                  )}
                </div>

                <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  {message.includes(
                    "confirmed successfully",
                  )
                    ? "Payment Confirmed"
                    : "Verifying Payment"}
                </h2>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
                  {message}
                </p>

                {referenceParam && (
                  <div className="mx-auto mt-7 max-w-md rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Transaction Reference
                    </p>

                    <p className="mt-1 break-all font-mono text-sm font-semibold text-slate-800">
                      {referenceParam}
                    </p>
                  </div>
                )}

                <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>
                    Secure payment verification
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}