"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  ArrowDownToLine,
  Banknote,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CreditCard,
  ExternalLink,
  FileText,
  Loader2,
  ReceiptText,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";

import { useSession } from "next-auth/react";

import { useRouter } from "next/navigation";

import { apiGet } from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

type PaymentStatus =
  | "pending"
  | "successful"
  | "failed"
  | "refunded"
  | "cancelled";

type PaymentMethod =
  | "cash"
  | "bank_transfer"
  | "card"
  | "other";

type PaymentPurpose =
  | "tuition"
  | "registration"
  | "examination"
  | "acceptance"
  | "transcript"
  | "certificate"
  | "hostel"
  | "other";

interface Semester {
  _id: string;
  name: string;
  order?: number;

  academicSession?: {
    _id?: string;
    name?: string;
  };
}

interface Payment {
  _id: string;

  student?:
    | string
    | {
        _id?: string;
        name?: string;
        firstName?: string;
        lastName?: string;
        matricNumber?: string;
      };

  semester?:
    | string
    | {
        _id?: string;
        name?: string;
        order?: number;
      };

  academicSession?:
    | string
    | {
        _id?: string;
        name?: string;
      };

  programme?:
    | string
    | {
        _id?: string;
        name?: string;
        code?: string;
      };

  amount: number;

  currency?: string;

  method: PaymentMethod;

  purpose: PaymentPurpose;

  paymentReference: string;

  invoiceNumber?: string;

  paymentProvider?: string;

  providerTransactionRef?: string;

  status: PaymentStatus;

  notes?: string;

  paidAt?: string;

  receiptUrl?: string;

  createdAt: string;

  updatedAt: string;
}

interface PaymentsResponse {
  success: boolean;
  count?: number;
  payments: Payment[];
}

interface SemestersResponse {
  success: boolean;
  semesters: Semester[];
}

/* =========================================================
   HELPERS
========================================================= */

function formatCurrency(
  amount: number,
  currency = "NGN",
): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
}

function formatDate(
  value?: string,
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(
  value?: string,
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatMethod(
  method: PaymentMethod,
): string {
  switch (method) {
    case "bank_transfer":
      return "Bank Transfer";

    case "cash":
      return "Cash";

    case "card":
      return "Card";

    case "other":
      return "Other";

    default:
      return "Other";
  }
}

function formatPurpose(
  purpose: PaymentPurpose,
): string {
  switch (purpose) {
    case "tuition":
      return "Tuition";

    case "registration":
      return "Registration";

    case "examination":
      return "Examination";

    case "acceptance":
      return "Acceptance";

    case "transcript":
      return "Transcript";

    case "certificate":
      return "Certificate";

    case "hostel":
      return "Hostel";

    case "other":
      return "Other";

    default:
      return "Other";
  }
}

function getSemesterName(
  semester:
    | string
    | {
        _id?: string;
        name?: string;
      }
    | undefined,
): string {
  if (!semester) {
    return "—";
  }

  if (typeof semester === "string") {
    return semester;
  }

  return semester.name || "—";
}

function getProgrammeName(
  programme:
    | string
    | {
        _id?: string;
        name?: string;
        code?: string;
      }
    | undefined,
): string {
  if (!programme) {
    return "—";
  }

  if (typeof programme === "string") {
    return programme;
  }

  return programme.name || programme.code || "—";
}

/* =========================================================
   STATUS CONFIG
========================================================= */

function getStatusConfig(
  status: PaymentStatus,
) {
  switch (status) {
    case "successful":
      return {
        label: "Successful",
        icon: CheckCircle2,
        className:
          "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
      };

    case "pending":
      return {
        label: "Pending",
        icon: Clock3,
        className:
          "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
      };

    case "failed":
      return {
        label: "Failed",
        icon: XCircle,
        className:
          "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
      };

    case "refunded":
      return {
        label: "Refunded",
        icon: ArrowDownToLine,
        className:
          "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
      };

    case "cancelled":
      return {
        label: "Cancelled",
        icon: XCircle,
        className:
          "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
      };

    default:
      return {
        label: "Unknown",
        icon: AlertCircle,
        className:
          "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
      };
  }
}

/* =========================================================
   PAGE
========================================================= */

export default function StudentPaymentsPage() {
  const router = useRouter();

  const {
    data: session,
    status: sessionStatus,
  } = useSession();

  const accessToken = session?.accessToken;

  const [semesters, setSemesters] =
    useState<Semester[]>([]);

  const [selectedSemester, setSelectedSemester] =
    useState("");

  const [payments, setPayments] =
    useState<Payment[]>([]);

  const [loadingSemesters, setLoadingSemesters] =
    useState(true);

  const [loadingPayments, setLoadingPayments] =
    useState(false);

  const [error, setError] =
    useState("");

  const [semesterOpen, setSemesterOpen] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<"all" | PaymentStatus>("all");

  const [methodFilter, setMethodFilter] =
    useState<"all" | PaymentMethod>("all");

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const handleMakePayment = () => {
    router.push(
      "/dashboards/student/payments/make",
    );
  };

  const handleViewReceipt = (
    paymentReference: string,
  ) => {
    if (!paymentReference) {
      return;
    }

    router.push(
      `/dashboards/student/payments/receipt?reference=${encodeURIComponent(
        paymentReference,
      )}`,
    );
  };

  /* =======================================================
     LOAD SEMESTERS
  ======================================================= */

  const loadSemesters =
    useCallback(async () => {
      if (!accessToken) {
        return;
      }

      try {
        setLoadingSemesters(true);
        setError("");

        const response =
          (await apiGet(
            "/semesters",
            accessToken,
          )) as SemestersResponse;

        const list = Array.isArray(
          response?.semesters,
        )
          ? response.semesters
          : [];

        setSemesters(list);

        if (list.length > 0) {
          setSelectedSemester(
            (current) =>
              current || list[0]._id,
          );
        }
      } catch (error) {
        console.error(
          "Failed to load semesters:",
          error,
        );

        setError(
          "Unable to load semesters.",
        );
      } finally {
        setLoadingSemesters(false);
      }
    }, [accessToken]);

  /* =======================================================
     LOAD PAYMENTS
  ======================================================= */

  const loadPayments =
    useCallback(async () => {
      if (
        !accessToken ||
        !selectedSemester
      ) {
        return;
      }

      try {
        setLoadingPayments(true);
        setError("");

        const response =
          (await apiGet(
            `/payments/me?semester=${encodeURIComponent(
              selectedSemester,
            )}`,
            accessToken,
          )) as PaymentsResponse;

        setPayments(
          Array.isArray(
            response?.payments,
          )
            ? response.payments
            : [],
        );
      } catch (error) {
        console.error(
          "Failed to load payment history:",
          error,
        );

        setPayments([]);

        setError(
          "Unable to load your payment history.",
        );
      } finally {
        setLoadingPayments(false);
      }
    }, [
      accessToken,
      selectedSemester,
    ]);

  /* =======================================================
     EFFECTS
  ======================================================= */

  useEffect(() => {
    if (
      sessionStatus ===
      "authenticated"
    ) {
      loadSemesters();
    }
  }, [
    sessionStatus,
    loadSemesters,
  ]);

  useEffect(() => {
    if (
      sessionStatus ===
        "authenticated" &&
      selectedSemester
    ) {
      loadPayments();
    }
  }, [
    sessionStatus,
    selectedSemester,
    loadPayments,
  ]);

  /* =======================================================
     SELECTED SEMESTER
  ======================================================= */

  const selectedSemesterData =
    useMemo(
      () =>
        semesters.find(
          (semester) =>
            semester._id ===
            selectedSemester,
        ),
      [
        semesters,
        selectedSemester,
      ],
    );

  /* =======================================================
     FILTERED PAYMENTS
  ======================================================= */

  const filteredPayments =
    useMemo(() => {
      const searchValue =
        search.trim().toLowerCase();

      return payments.filter(
        (payment) => {
          if (
            statusFilter !== "all" &&
            payment.status !==
              statusFilter
          ) {
            return false;
          }

          if (
            methodFilter !== "all" &&
            payment.method !==
              methodFilter
          ) {
            return false;
          }

          if (!searchValue) {
            return true;
          }

          const searchableText = [
            payment.paymentReference,
            payment.invoiceNumber,
            payment.providerTransactionRef,
            formatMethod(
              payment.method,
            ),
            formatPurpose(
              payment.purpose,
            ),
            getSemesterName(
              payment.semester,
            ),
            getProgrammeName(
              payment.programme,
            ),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableText.includes(
            searchValue,
          );
        },
      );
    }, [
      payments,
      search,
      statusFilter,
      methodFilter,
    ]);

  /* =======================================================
     SUMMARY
  ======================================================= */

  const summary = useMemo(() => {
    const successful =
      payments.filter(
        (payment) =>
          payment.status ===
          "successful",
      );

    const pending =
      payments.filter(
        (payment) =>
          payment.status ===
          "pending",
      );

    const totalSuccessful =
      successful.reduce(
        (sum, payment) =>
          sum +
          Number(
            payment.amount || 0,
          ),
        0,
      );

    const totalPending =
      pending.reduce(
        (sum, payment) =>
          sum +
          Number(
            payment.amount || 0,
          ),
        0,
      );

    return {
      total: payments.length,
      successful:
        successful.length,
      pending: pending.length,
      totalSuccessful,
      totalPending,
    };
  }, [payments]);

  /* =======================================================
     SESSION LOADING
  ======================================================= */

  if (
    sessionStatus ===
    "loading"
  ) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />

          <p className="text-sm font-medium">
            Loading payment history...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-navy text-brand-gold">
                <ReceiptText className="h-4 w-4" />
              </div>

              <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand-navy/70">
                Student Finance
              </span>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-brand-navy sm:text-3xl">
              Payment History
            </h1>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              Review your recorded payments,
              references, payment methods, and
              transaction status.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            {/* Make Payment */}

            <button
              type="button"
              onClick={handleMakePayment}
              className="
                inline-flex
                h-10
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-brand-navy
                px-4
                text-sm
                font-bold
                text-white
                shadow-sm
                transition
                hover:bg-brand-navy/90
                active:scale-[0.98]
              "
            >
              <CreditCard className="h-4 w-4" />

              Make Payment
            </button>

            {/* Refresh */}

            <button
              type="button"
              onClick={loadPayments}
              disabled={
                loadingPayments ||
                !selectedSemester
              }
              className="
                inline-flex
                h-10
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                text-sm
                font-semibold
                text-slate-700
                shadow-sm
                transition
                hover:bg-slate-50
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loadingPayments
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh
            </button>
          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">
                Unable to load payments
              </p>

              <p className="mt-1 text-sm text-rose-600">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setError("");
                loadPayments();
              }}
              className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-rose-700 shadow-sm ring-1 ring-rose-200 hover:bg-rose-100"
            >
              Retry
            </button>
          </div>
        )}

        {/* =================================================
            SEMESTER
        ================================================= */}

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/5 text-brand-navy">
                <CalendarDays className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900">
                  Payment Semester
                </p>

                <p className="text-xs text-slate-500">
                  Select the semester whose payments
                  you want to view.
                </p>
              </div>
            </div>

            <div className="relative w-full md:w-[320px]">
              <button
                type="button"
                disabled={
                  loadingSemesters ||
                  semesters.length === 0
                }
                onClick={() =>
                  setSemesterOpen(
                    (value) => !value,
                  )
                }
                className="
                  flex
                  h-12
                  w-full
                  items-center
                  justify-between
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  text-left
                  text-sm
                  font-semibold
                  text-slate-800
                  shadow-sm
                  transition
                  hover:border-brand-navy/30
                  focus:border-brand-gold
                  focus:ring-4
                  focus:ring-brand-gold/10
                  disabled:cursor-not-allowed
                  disabled:bg-slate-50
                "
              >
                <span className="truncate">
                  {loadingSemesters
                    ? "Loading semesters..."
                    : selectedSemesterData?.name ||
                      "Select semester"}
                </span>

                {loadingSemesters ? (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                ) : (
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform ${
                      semesterOpen
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                )}
              </button>

              {semesterOpen &&
                semesters.length > 0 && (
                  <>
                    <button
                      type="button"
                      aria-label="Close semester selector"
                      className="fixed inset-0 z-10 cursor-default"
                      onClick={() =>
                        setSemesterOpen(false)
                      }
                    />

                    <div className="absolute right-0 z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                      {semesters.map(
                        (semester) => (
                          <button
                            key={
                              semester._id
                            }
                            type="button"
                            onClick={() => {
                              setSelectedSemester(
                                semester._id,
                              );

                              setSemesterOpen(
                                false,
                              );
                            }}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-semibold transition ${
                              selectedSemester ===
                              semester._id
                                ? "bg-brand-navy text-white"
                                : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <span className="truncate">
                              {
                                semester.name
                              }
                            </span>

                            {selectedSemester ===
                              semester._id && (
                              <CheckCircle2 className="ml-3 h-4 w-4 shrink-0 text-brand-gold" />
                            )}
                          </button>
                        ),
                      )}
                    </div>
                  </>
                )}
            </div>
          </div>
        </section>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* Transactions */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Transactions
                </p>

                <p className="mt-2 text-2xl font-black text-brand-navy">
                  {summary.total}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Recorded payments
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy/5 text-brand-navy">
                <ReceiptText className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Successful */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Successful
                </p>

                <p className="mt-2 text-2xl font-black text-emerald-600">
                  {summary.successful}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Confirmed transactions
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Amount Paid */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Amount Paid
                </p>

                <p className="mt-2 text-xl font-black text-brand-navy">
                  {formatCurrency(
                    summary.totalSuccessful,
                  )}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Successful payments
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gold/10 text-brand-navy">
                <Banknote className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Pending */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Pending
                </p>

                <p className="mt-2 text-xl font-black text-amber-600">
                  {formatCurrency(
                    summary.totalPending,
                  )}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Awaiting confirmation
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock3 className="h-5 w-5" />
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            FILTERS
        ================================================= */}

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row">

            {/* Search */}

            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search reference, invoice, method..."
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  pl-10
                  pr-10
                  text-sm
                  text-slate-800
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-brand-gold
                  focus:bg-white
                  focus:ring-4
                  focus:ring-brand-gold/10
                "
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Status */}

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target
                    .value as
                    | "all"
                    | PaymentStatus,
                )
              }
              className="
                h-11
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-3
                text-sm
                font-semibold
                text-slate-700
                outline-none
                transition
                focus:border-brand-gold
                focus:bg-white
                focus:ring-4
                focus:ring-brand-gold/10
                xl:w-44
              "
            >
              <option value="all">
                All Statuses
              </option>

              <option value="successful">
                Successful
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="failed">
                Failed
              </option>

              <option value="refunded">
                Refunded
              </option>

              <option value="cancelled">
                Cancelled
              </option>
            </select>

            {/* Method */}

            <select
              value={methodFilter}
              onChange={(event) =>
                setMethodFilter(
                  event.target
                    .value as
                    | "all"
                    | PaymentMethod,
                )
              }
              className="
                h-11
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-3
                text-sm
                font-semibold
                text-slate-700
                outline-none
                transition
                focus:border-brand-gold
                focus:bg-white
                focus:ring-4
                focus:ring-brand-gold/10
                xl:w-44
              "
            >
              <option value="all">
                All Methods
              </option>

              <option value="bank_transfer">
                Bank Transfer
              </option>

              <option value="card">
                Card
              </option>

              <option value="cash">
                Cash
              </option>

              <option value="other">
                Other
              </option>
            </select>
          </div>
        </section>

        {/* =================================================
            PAYMENT CONTENT
        ================================================= */}

        {loadingPayments ? (
          <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <Loader2 className="h-7 w-7 animate-spin text-brand-gold" />

              <p className="text-sm font-medium">
                Loading payment history...
              </p>
            </div>
          </div>
        ) : filteredPayments.length ===
          0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <FileText className="h-7 w-7" />
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              No payments found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {payments.length > 0
                ? "No payments match your current search or filters."
                : "There are no recorded payments for the selected semester yet."}
            </p>

            {payments.length === 0 && (
              <button
                type="button"
                onClick={handleMakePayment}
                className="
                  mt-5
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-brand-navy
                  px-4
                  py-2.5
                  text-sm
                  font-bold
                  text-white
                  transition
                  hover:bg-brand-navy/90
                "
              >
                <CreditCard className="h-4 w-4" />

                Make Payment
              </button>
            )}

            {(search ||
              statusFilter !== "all" ||
              methodFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setMethodFilter("all");
                }}
                className="ml-2 mt-5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* =================================================
                DESKTOP TABLE
            ================================================== */}

            <section className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
              <div className="border-b border-slate-200 px-6 py-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Transactions
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {filteredPayments.length}{" "}
                      transaction
                      {filteredPayments.length ===
                      1
                        ? ""
                        : "s"}{" "}
                      displayed
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                    <CalendarDays className="h-4 w-4" />

                    {selectedSemesterData?.name}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 text-left">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                        Payment
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                        Purpose
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                        Method
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                        Date
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                        Amount
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredPayments.map(
                      (payment) => {
                        const status =
                          getStatusConfig(
                            payment.status,
                          );

                        const StatusIcon =
                          status.icon;

                        return (
                          <tr
                            key={
                              payment._id
                            }
                            className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/70"
                          >
                            {/* Payment */}

                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/5 text-brand-navy">
                                  <ReceiptText className="h-4 w-4" />
                                </div>

                                <div className="min-w-0">
                                  <p className="max-w-[190px] truncate text-sm font-bold text-slate-900">
                                    {
                                      payment.paymentReference
                                    }
                                  </p>

                                  {payment.invoiceNumber && (
                                    <p className="mt-1 max-w-[190px] truncate text-xs text-slate-400">
                                      Invoice:{" "}
                                      {
                                        payment.invoiceNumber
                                      }
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Purpose */}

                            <td className="px-6 py-5">
                              <p className="text-sm font-semibold text-slate-700">
                                {formatPurpose(
                                  payment.purpose,
                                )}
                              </p>
                            </td>

                            {/* Method */}

                            <td className="px-6 py-5">
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <CreditCard className="h-4 w-4 text-slate-400" />

                                {formatMethod(
                                  payment.method,
                                )}
                              </div>
                            </td>

                            {/* Date */}

                            <td className="px-6 py-5">
                              <p className="text-sm font-medium text-slate-700">
                                {formatDate(
                                  payment.paidAt ||
                                    payment.createdAt,
                                )}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                {formatDateTime(
                                  payment.paidAt ||
                                    payment.createdAt,
                                )}
                              </p>
                            </td>

                            {/* Amount */}

                            <td className="px-6 py-5 text-right">
                              <p className="text-sm font-black text-brand-navy">
                                {formatCurrency(
                                  payment.amount,
                                  payment.currency ||
                                    "NGN",
                                )}
                              </p>
                            </td>

                            {/* Status */}

                            <td className="px-6 py-5 text-right">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-bold ${status.className}`}
                              >
                                <StatusIcon className="h-3.5 w-3.5" />

                                {
                                  status.label
                                }
                              </span>
                            </td>

                            {/* Action */}

                            <td className="px-6 py-5 text-right">
                              {payment.status ===
                                "successful" &&
                              payment.paymentReference ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleViewReceipt(
                                      payment.paymentReference,
                                    )
                                  }
                                  className="
                                    inline-flex
                                    items-center
                                    gap-1.5
                                    rounded-lg
                                    border
                                    border-slate-200
                                    bg-white
                                    px-3
                                    py-2
                                    text-xs
                                    font-bold
                                    text-brand-navy
                                    transition
                                    hover:border-brand-gold/40
                                    hover:bg-brand-gold/5
                                  "
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />

                                  Receipt
                                </button>
                              ) : (
                                <span className="text-xs font-medium text-slate-300">
                                  —
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      },
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* =================================================
                MOBILE / TABLET
            ================================================== */}

            <section className="space-y-3 lg:hidden">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Transactions
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    {filteredPayments.length}{" "}
                    result
                    {filteredPayments.length ===
                    1
                      ? ""
                      : "s"}
                  </p>
                </div>

                <span className="max-w-[150px] truncate text-xs font-semibold text-slate-400">
                  {selectedSemesterData?.name}
                </span>
              </div>

              {filteredPayments.map(
                (payment) => {
                  const status =
                    getStatusConfig(
                      payment.status,
                    );

                  const StatusIcon =
                    status.icon;

                  return (
                    <article
                      key={
                        payment._id
                      }
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      {/* Top */}

                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/5 text-brand-navy">
                            <ReceiptText className="h-4 w-4" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">
                              {
                                payment.paymentReference
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {formatDate(
                                payment.paidAt ||
                                  payment.createdAt,
                              )}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${status.className}`}
                        >
                          <StatusIcon className="h-3 w-3" />

                          {status.label}
                        </span>
                      </div>

                      {/* Details */}

                      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Purpose
                          </p>

                          <p className="mt-1 text-xs font-semibold text-slate-700">
                            {formatPurpose(
                              payment.purpose,
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Method
                          </p>

                          <p className="mt-1 text-xs font-semibold text-slate-700">
                            {formatMethod(
                              payment.method,
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Amount
                          </p>

                          <p className="mt-1 text-sm font-black text-brand-navy">
                            {formatCurrency(
                              payment.amount,
                              payment.currency ||
                                "NGN",
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Semester
                          </p>

                          <p className="mt-1 truncate text-xs font-semibold text-slate-700">
                            {getSemesterName(
                              payment.semester,
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Invoice */}

                      {payment.invoiceNumber && (
                        <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2.5">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Invoice Number
                          </p>

                          <p className="mt-1 break-all text-xs font-semibold text-slate-700">
                            {
                              payment.invoiceNumber
                            }
                          </p>
                        </div>
                      )}

                      {/* Notes */}

                      {payment.notes && (
                        <div className="mt-3 rounded-xl border border-slate-100 bg-white px-3 py-2.5">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Note
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {payment.notes}
                          </p>
                        </div>
                      )}

                      {/* Mobile Action */}

                      {payment.status ===
                        "successful" &&
                        payment.paymentReference && (
                          <button
                            type="button"
                            onClick={() =>
                              handleViewReceipt(
                                payment.paymentReference,
                              )
                            }
                            className="
                              mt-4
                              flex
                              h-10
                              w-full
                              items-center
                              justify-center
                              gap-2
                              rounded-xl
                              bg-brand-navy
                              px-4
                              text-xs
                              font-bold
                              text-white
                              transition
                              hover:bg-brand-navy/90
                              active:scale-[0.99]
                            "
                          >
                            <ReceiptText className="h-4 w-4" />

                            View Payment Receipt

                            <ExternalLink className="h-3.5 w-3.5" />
                          </button>
                        )}
                    </article>
                  );
                },
              )}
            </section>
          </>
        )}

        {/* =================================================
            FOOTER NOTE
        ================================================= */}

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

          <p className="text-xs leading-5 text-slate-500">
            Payment history reflects transactions
            recorded against your student account.
            Only payments with a{" "}
            <strong className="font-semibold text-slate-700">
              Successful
            </strong>{" "}
            status are counted toward your school
            fee balance.
          </p>
        </div>

      </div>
    </div>
  );
}