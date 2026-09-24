"use client";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Download,
  Loader2,
  Printer,
  ReceiptText,
} from "lucide-react";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams  } from "next/navigation";

import {
  useEffect,
  useState,
} from "react";

import { apiGet } from "@/lib/api";

interface PaymentReceipt {
  paymentReference: string;
  invoiceNumber?: string;
  amount: number;
  currency?: string;
  method?: string;
  purpose?: string;
  status: string;
  paidAt?: string;
  createdAt?: string;
  student?: {
    name?: string;
    email?: string;
    matricNumber?: string;
  };
  semester?: {
    _id?: string;
    name?: string;
  };
  academicSession?: {
    _id?: string;
    name?: string;
  };
  programme?: {
    _id?: string;
    name?: string;
  };
}

interface ReceiptResponse {
  success: boolean;
  message?: string;
  payment?: PaymentReceipt;
  data?: PaymentReceipt;
}

function formatCurrency(
  amount: number,
  currency = "NGN",
) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(
  value?: string,
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-NG",
    {
      dateStyle: "long",
      timeStyle: "short",
    },
  ).format(date);
}

function getPurposeLabel(
  purpose?: string,
) {
  if (!purpose) {
    return "School Payment";
  }

  const labels: Record<
    string,
    string
  > = {
    tuition: "Tuition Fee",
    registration: "Registration Fee",
    examination: "Examination Fee",
    acceptance: "Acceptance Fee",
    transcript: "Transcript Fee",
    certificate: "Certificate Fee",
    hostel: "Hostel Fee",
    other: "Other",
  };

  return (
    labels[purpose] ??
    purpose.charAt(0).toUpperCase() +
      purpose.slice(1)
  );
}

function getMethodLabel(
  method?: string,
) {
  if (!method) {
    return "Paystack";
  }

  const labels: Record<
    string,
    string
  > = {
    cash: "Cash",
    bank_transfer: "Bank Transfer",
    card: "Card",
    other: "Other",
  };

  return (
    labels[method] ??
    method
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase(),
      )
  );
}

export default function PaymentReceiptPage() {
  const { data: session, status: sessionStatus } =
    useSession();

  const searchParams = useSearchParams();
  const router = useRouter();

  const referenceParam =
    searchParams.get("reference");

  const accessToken = (
    session as { accessToken?: string } | null
  )?.accessToken;

  const [payment, setPayment] =
    useState<PaymentReceipt | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState("");

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
        "No payment reference was provided.",
      );
      setLoading(false);
      return;
    }

    const paymentReference: string =
      referenceParam;

    let cancelled = false;

    async function loadReceipt() {
      try {
        setLoading(true);
        setError("");

        const response =
          await apiGet<ReceiptResponse>(
            `/payments/paystack/receipt/${encodeURIComponent(
              paymentReference,
            )}`,
            accessToken,
          );

        if (cancelled) {
          return;
        }

        if (!response.success) {
          throw new Error(
            response.message ||
              "Unable to load payment receipt.",
          );
        }

        const receipt =
          response.payment ??
          response.data;

        if (!receipt) {
          throw new Error(
            "Payment receipt was not found.",
          );
        }

        setPayment(receipt);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Receipt loading error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load payment receipt.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadReceipt();

    return () => {
      cancelled = true;
    };
  }, [
    sessionStatus,
    accessToken,
    referenceParam,
    router,
  ]);

  const handlePrint = () => {
    window.print();
  };

  if (
    sessionStatus === "loading" ||
    loading
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin text-brand-gold" />
          Loading your receipt...
        </div>
      </main>
    );
  }

  if (error || !payment) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
          <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl sm:p-12">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>

            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Receipt Not Available
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
              {error ||
                "We could not find this payment receipt."}
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/dashboards/student/payments",
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-navy/90"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Payments
              </button>

              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const displayStudentName =
    payment.student?.name ||
    "Student";

  const currency =
    payment.currency || "NGN";

  const status =
    payment.status.toLowerCase();

  const isSuccessful =
    status === "successful";

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8 print:bg-white print:px-0 print:py-0">
      {/* Action bar */}
      <div className="mx-auto mb-6 flex max-w-4xl items-center justify-between gap-3 print:hidden">
        <button
          type="button"
          onClick={() =>
            router.push(
              "/dashboards/student/payments",
            )
          }
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-brand-navy"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Payments
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="hidden items-center gap-2 rounded-xl bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-navy/90 sm:inline-flex"
          >
            <Download className="h-4 w-4" />
            Save PDF
          </button>
        </div>
      </div>

      {/* Receipt */}
      <article className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40 print:max-w-none print:rounded-none print:border-0 print:shadow-none">
        {/* Receipt header */}
        <header className="bg-brand-navy px-6 py-8 sm:px-10">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white p-1">
                  <img
                    src="/newLogo.png"
                    alt="ITMT"
                    className="h-full w-full object-contain"
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
                    ITMT
                  </p>

                  <p className="text-xs text-white/60">
                    Student Finance Portal
                  </p>
                </div>
              </div>

              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                Payment Receipt
              </h1>

              <p className="mt-2 text-sm text-white/60">
                Official payment confirmation
              </p>
            </div>

            <div
              className={`inline-flex items-center gap-2 self-start rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide ${
                isSuccessful
                  ? "bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-300/20"
                  : "bg-amber-400/10 text-amber-300 ring-1 ring-amber-300/20"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              {payment.status}
            </div>
          </div>
        </header>

        {/* Receipt content */}
        <div className="p-6 sm:p-10">
          {/* Amount */}
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
              Amount Paid
            </p>

            <p className="mt-3 text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
              {formatCurrency(
                payment.amount,
                currency,
              )}
            </p>

            <div className="mt-4 flex flex-col items-center justify-center gap-2 text-xs text-slate-500 sm:flex-row">
              <span>
                Reference:
              </span>

              <span className="break-all font-mono font-semibold text-slate-700">
                {payment.paymentReference}
              </span>
            </div>
          </section>

          {/* Student information */}
          <section className="mt-8">
            <div className="mb-4 flex items-center gap-2">
              <ReceiptText className="h-5 w-5 text-brand-gold" />

              <h2 className="font-bold text-slate-900">
                Student Information
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoItem
                label="Student Name"
                value={displayStudentName}
              />

              <InfoItem
                label="Matric Number"
                value={
                  payment.student
                    ?.matricNumber ||
                  "—"
                }
              />

              <InfoItem
                label="Email"
                value={
                  payment.student?.email ||
                  "—"
                }
              />

              <InfoItem
                label="Programme"
                value={
                  payment.programme?.name ||
                  "—"
                }
              />
            </div>
          </section>

          {/* Payment information */}
          <section className="mt-8">
            <div className="mb-4 flex items-center gap-2">
              <ReceiptText className="h-5 w-5 text-brand-gold" />

              <h2 className="font-bold text-slate-900">
                Payment Information
              </h2>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <InfoRow
                label="Payment Purpose"
                value={getPurposeLabel(
                  payment.purpose,
                )}
              />

              <InfoRow
                label="Payment Method"
                value={getMethodLabel(
                  payment.method,
                )}
              />

              <InfoRow
                label="Semester"
                value={
                  payment.semester?.name ||
                  "—"
                }
              />

              <InfoRow
                label="Academic Session"
                value={
                  payment.academicSession
                    ?.name || "—"
                }
              />

              <InfoRow
                label="Payment Date"
                value={formatDate(
                  payment.paidAt ??
                    payment.createdAt,
                )}
              />

              <InfoRow
                label="Invoice Number"
                value={
                  payment.invoiceNumber ||
                  "—"
                }
                last
              />
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-10 border-t border-slate-200 pt-6">
            <div className="flex flex-col justify-between gap-4 text-xs text-slate-500 sm:flex-row">
              <div>
                <p className="font-semibold text-slate-700">
                  ITMT Management System
                </p>

                <p className="mt-1">
                  Please retain this receipt for
                  your records.
                </p>
              </div>

              <div className="text-left sm:text-right">
                <p>
                  Payment processed securely
                  through Paystack.
                </p>

                <p className="mt-1">
                  Generated electronically.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </article>
    </main>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function InfoRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 ${
        !last
          ? "border-b border-slate-100"
          : ""
      }`}
    >
      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </span>

      <span className="break-words text-sm font-semibold text-slate-800 sm:text-right">
        {value}
      </span>
    </div>
  );
}