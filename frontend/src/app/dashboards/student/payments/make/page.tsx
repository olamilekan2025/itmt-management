"use client";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { apiGet, apiPost } from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

interface Semester {
  _id: string;
  name: string;
  semesterNumber?: number;
  order?: number;
  academicSession?: {
    _id?: string;
    name?: string;
  };
}

interface BalanceData {
  feeAmount?: number;
  totalFees?: number;
  totalPaid?: number;
  balance?: number;
  outstanding?: number;
  overpayment?: number;
  currency?: string;
  hasFeeStructure?: boolean;
  feeBreakdown?: unknown[];
}

interface BalanceResponse {
  success: boolean;

  /*
   * Current backend shape:
   *
   * {
   *   success: true,
   *   student: {...},
   *   semester: "...",
   *   balance: {
   *     feeAmount,
   *     totalPaid,
   *     balance,
   *     outstanding,
   *     overpayment,
   *     hasFeeStructure,
   *     feeBreakdown
   *   }
   * }
   */
  balance?: BalanceData;

  /*
   * Supports an older/alternative API shape too.
   */
  data?: BalanceData;

  student?: unknown;
  semester?: unknown;
  message?: string;
}

interface PaymentInitializeResponse {
  success: boolean;
  message?: string;
  authorizationUrl?: string;
  accessCode?: string;
  reference?: string;
  payment?: {
    paymentReference?: string;
    amount?: number;
    status?: string;
  };
}

/* =========================================================
   PAYMENT PURPOSES
========================================================= */

const paymentPurposes = [
  {
    value: "tuition",
    label: "Tuition Fee",
  },
  {
    value: "registration",
    label: "Registration Fee",
  },
  {
    value: "examination",
    label: "Examination Fee",
  },
  {
    value: "acceptance",
    label: "Acceptance Fee",
  },
  {
    value: "transcript",
    label: "Transcript Fee",
  },
  {
    value: "certificate",
    label: "Certificate Fee",
  },
  {
    value: "hostel",
    label: "Hostel Fee",
  },
  {
    value: "other",
    label: "Other",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function getBalanceData(
  response: BalanceResponse,
): BalanceData | null {
  if (response.balance) {
    return response.balance;
  }

  if (response.data) {
    return response.data;
  }

  return null;
}

function getOutstanding(
  balance: BalanceData | null,
): number {
  if (!balance) {
    return 0;
  }

  /*
   * Prefer the explicit outstanding field.
   */
  if (
    typeof balance.outstanding === "number" &&
    Number.isFinite(balance.outstanding)
  ) {
    return Math.max(0, balance.outstanding);
  }

  /*
   * Some backend responses may use "balance".
   */
  if (
    typeof balance.balance === "number" &&
    Number.isFinite(balance.balance)
  ) {
    return Math.max(0, balance.balance);
  }

  /*
   * Fallback:
   * total fees - successful payments
   */
  const totalFees =
    balance.totalFees ??
    balance.feeAmount ??
    0;

  const totalPaid =
    balance.totalPaid ?? 0;

  return Math.max(
    0,
    Number(totalFees) - Number(totalPaid),
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function MakePaymentPage() {
  const { data: session, status: sessionStatus } =
    useSession();

  const router = useRouter();
  const searchParams = useSearchParams();

  const accessToken = (
    session as { accessToken?: string } | null
  )?.accessToken;

  /*
   * If the student came from the Finance page with:
   *
   * ?semester=SEMESTER_ID
   *
   * we use that semester when available.
   */
  const semesterFromUrl =
    searchParams.get("semester") ?? "";

  const [semesters, setSemesters] =
    useState<Semester[]>([]);

  const [selectedSemester, setSelectedSemester] =
    useState("");

  const [purpose, setPurpose] =
    useState("tuition");

  const [amount, setAmount] =
    useState("");

  const [balance, setBalance] =
    useState<BalanceData | null>(null);

  const [loadingSemesters, setLoadingSemesters] =
    useState(true);

  const [loadingBalance, setLoadingBalance] =
    useState(false);

  const [processing, setProcessing] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =======================================================
     CURRENCY
  ======================================================= */

  const currency =
    balance?.currency || "NGN";

  /* =======================================================
     OUTSTANDING
  ======================================================= */

  const outstanding = useMemo(
    () => getOutstanding(balance),
    [balance],
  );

  /* =======================================================
     AMOUNT
  ======================================================= */

  const numericAmount = useMemo(() => {
    const parsed = Number(amount);

    if (!Number.isFinite(parsed)) {
      return 0;
    }

    return Math.max(0, parsed);
  }, [amount]);

  /* =======================================================
     FORMATTERS
  ======================================================= */

  const formatCurrency = useCallback(
    (value: number) => {
      return new Intl.NumberFormat(
        "en-NG",
        {
          style: "currency",
          currency,
          maximumFractionDigits: 2,
        },
      ).format(value);
    },
    [currency],
  );

  const formattedOutstanding =
    formatCurrency(outstanding);

  const formattedAmount =
    formatCurrency(numericAmount);

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
          await apiGet<
            | Semester[]
            | {
                success?: boolean;
                data?: Semester[];
                semesters?: Semester[];
                message?: string;
              }
          >(
            "/semesters",
            accessToken,
          );

        let items: Semester[] = [];

        if (Array.isArray(response)) {
          items = response;
        } else if (
          Array.isArray(response.data)
        ) {
          items = response.data;
        } else if (
          Array.isArray(response.semesters)
        ) {
          items = response.semesters;
        }

        const sorted =
          [...items].sort(
            (a, b) =>
              (a.order ?? 0) -
              (b.order ?? 0),
          );

        setSemesters(sorted);

        /*
         * Prefer the semester supplied by the URL
         * if it actually exists.
         */
        setSelectedSemester((current) => {
          if (
            current &&
            sorted.some(
              (semester) =>
                semester._id === current,
            )
          ) {
            return current;
          }

          if (
            semesterFromUrl &&
            sorted.some(
              (semester) =>
                semester._id ===
                semesterFromUrl,
            )
          ) {
            return semesterFromUrl;
          }

          return sorted[0]?._id ?? "";
        });
      } catch (err) {
        console.error(
          "Unable to load semesters:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load semesters.",
        );
      } finally {
        setLoadingSemesters(false);
      }
    }, [
      accessToken,
      semesterFromUrl,
    ]);

  /* =======================================================
     LOAD BALANCE
  ======================================================= */

  const loadBalance =
    useCallback(
      async (semesterId: string) => {
        if (
          !accessToken ||
          !semesterId
        ) {
          return;
        }

        try {
          setLoadingBalance(true);
          setError("");

          const response =
            await apiGet<BalanceResponse>(
              `/payments/me/balance?semester=${encodeURIComponent(
                semesterId,
              )}`,
              accessToken,
            );

          if (!response.success) {
            throw new Error(
              response.message ||
                "Unable to load your payment balance.",
            );
          }

          /*
           * IMPORTANT:
           *
           * Your backend returns:
           *
           * response.balance
           *
           * not:
           *
           * response.data
           */
          const normalizedBalance =
            getBalanceData(response);

          setBalance(
            normalizedBalance,
          );
        } catch (err) {
          console.error(
            "Unable to load balance:",
            err,
          );

          setBalance(null);

          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your payment balance.",
          );
        } finally {
          setLoadingBalance(false);
        }
      },
      [accessToken],
    );

  /* =======================================================
     AUTH + SEMESTERS
  ======================================================= */

  useEffect(() => {
    if (
      sessionStatus === "loading"
    ) {
      return;
    }

    if (
      sessionStatus !==
        "authenticated" ||
      !accessToken
    ) {
      router.replace(
        "/auth/login",
      );
      return;
    }

    void loadSemesters();
  }, [
    sessionStatus,
    accessToken,
    router,
    loadSemesters,
  ]);

  /* =======================================================
     BALANCE WHEN SEMESTER CHANGES
  ======================================================= */

  useEffect(() => {
    if (!selectedSemester) {
      setBalance(null);
      return;
    }

    void loadBalance(
      selectedSemester,
    );
  }, [
    selectedSemester,
    loadBalance,
  ]);

  /* =======================================================
     AMOUNT INPUT
  ======================================================= */

  const handleAmountChange = (
    value: string,
  ) => {
    if (value === "") {
      setAmount("");
      return;
    }

    /*
     * Allow:
     * 100
     * 100.5
     * 100.50
     */
    if (
      !/^\d*\.?\d{0,2}$/.test(
        value,
      )
    ) {
      return;
    }

    setAmount(value);
  };

  /* =======================================================
     PAY
  ======================================================= */

  const handlePay = async () => {
    setError("");

    if (!accessToken) {
      setError(
        "Your session has expired. Please log in again.",
      );
      return;
    }

    if (!selectedSemester) {
      setError(
        "Please select a semester.",
      );
      return;
    }

    if (
      !Number.isFinite(
        numericAmount,
      ) ||
      numericAmount <= 0
    ) {
      setError(
        "Please enter a valid payment amount.",
      );
      return;
    }

    /*
     * Do not allow payment above balance.
     */
    if (
      outstanding > 0 &&
      numericAmount > outstanding
    ) {
      setError(
        `Your payment cannot be greater than the outstanding balance of ${formattedOutstanding}.`,
      );
      return;
    }

    /*
     * IMPORTANT:
     *
     * This check protects the UI,
     * but the backend remains the final authority.
     */
    if (outstanding <= 0) {
      setError(
        "You currently do not have an outstanding balance for this semester.",
      );
      return;
    }

    try {
      setProcessing(true);

      const response =
        await apiPost<PaymentInitializeResponse>(
          "/payments/paystack/initialize",
          {
            semester:
              selectedSemester,
            amount: Number(
              numericAmount.toFixed(2),
            ),
            purpose,
          },
          accessToken,
        );

      if (
        !response.success ||
        !response.authorizationUrl
      ) {
        throw new Error(
          response.message ||
            "Unable to initialize Paystack payment.",
        );
      }

      /*
       * Paystack hosted checkout.
       */
      window.location.assign(
        response.authorizationUrl,
      );
    } catch (err) {
      console.error(
        "Payment initialization error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to start payment.",
      );

      setProcessing(false);
    }
  };

  /* =======================================================
     PAYMENT PROGRESS
  ======================================================= */

  const paymentProgress =
    outstanding > 0
      ? Math.min(
          100,
          (numericAmount /
            outstanding) *
            100,
        )
      : 0;

  /* =======================================================
     LOADING
  ======================================================= */

  if (
    sessionStatus === "loading"
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin text-brand-gold" />
          Loading payment portal...
        </div>
      </main>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

        {/* =================================================
            BACK
        ================================================= */}

        <button
          type="button"
          onClick={() =>
            router.push(
              "/dashboards/student/payments",
            )
          }
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-brand-navy"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Payments
        </button>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-navy/5 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-brand-navy">
            <CreditCard className="h-3.5 w-3.5" />
            Student Finance
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Make a Payment
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Pay your school fees securely
            through Paystack. You can make
            a full or partial payment toward
            your outstanding balance.
          </p>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-semibold">
                Payment Error
              </p>

              <p className="mt-1 leading-6">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">

          {/* =================================================
              PAYMENT FORM
          ================================================= */}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">

            <div className="mb-7 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy/5">
                <Wallet className="h-5 w-5 text-brand-navy" />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Payment Details
                </h2>

                <p className="text-xs text-slate-500">
                  Enter the amount you want
                  to pay.
                </p>
              </div>
            </div>

            {/* =================================================
                SEMESTER
            ================================================= */}

            <div className="mb-6">
              <label
                htmlFor="semester"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Semester
              </label>

              <select
                id="semester"
                value={
                  selectedSemester
                }
                onChange={(event) => {
                  setAmount("");
                  setError("");

                  setSelectedSemester(
                    event.target.value,
                  );
                }}
                disabled={
                  loadingSemesters ||
                  processing
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 disabled:cursor-not-allowed disabled:bg-slate-50"
              >
                <option value="">
                  {loadingSemesters
                    ? "Loading semesters..."
                    : "Select semester"}
                </option>

                {semesters.map(
                  (semester) => (
                    <option
                      key={
                        semester._id
                      }
                      value={
                        semester._id
                      }
                    >
                      {semester.name}

                      {semester
                        .academicSession
                        ?.name
                        ? ` — ${semester.academicSession.name}`
                        : ""}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* =================================================
                PURPOSE
            ================================================= */}

            <div className="mb-6">
              <label
                htmlFor="purpose"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Payment Purpose
              </label>

              <select
                id="purpose"
                value={purpose}
                onChange={(event) =>
                  setPurpose(
                    event.target.value,
                  )
                }
                disabled={
                  processing
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 disabled:cursor-not-allowed disabled:bg-slate-50"
              >
                {paymentPurposes.map(
                  (item) => (
                    <option
                      key={
                        item.value
                      }
                      value={
                        item.value
                      }
                    >
                      {item.label}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* =================================================
                AMOUNT
            ================================================= */}

            <div className="mb-6">
              <label
                htmlFor="amount"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Payment Amount
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                  ₦
                </span>

                <input
                  id="amount"
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) =>
                    handleAmountChange(
                      event.target.value,
                    )
                  }
                  placeholder="0.00"
                  disabled={
                    processing ||
                    loadingBalance ||
                    outstanding <= 0
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-4 text-lg font-semibold text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>

              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-xs text-slate-500">
                  Enter any amount up to
                  your outstanding balance.
                </p>

                <p className="shrink-0 text-xs font-semibold text-slate-600">
                  Max:{" "}
                  {
                    formattedOutstanding
                  }
                </p>
              </div>
            </div>

            {/* =================================================
                NO OUTSTANDING BALANCE
            ================================================= */}

            {!loadingBalance &&
              selectedSemester &&
              outstanding <= 0 &&
              !error && (
                <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                    <div>
                      <p className="text-sm font-bold text-emerald-900">
                        No Outstanding
                        Balance
                      </p>

                      <p className="mt-1 text-xs leading-5 text-emerald-800/80">
                        You currently do
                        not have any
                        outstanding
                        fees for this
                        semester.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {/* =================================================
                PROGRESS
            ================================================= */}

            {numericAmount >
              0 &&
              outstanding >
                0 && (
                <div className="mb-7 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">
                      Payment progress
                    </span>

                    <span className="font-bold text-brand-navy">
                      {Math.round(
                        paymentProgress,
                      )}
                      %
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-brand-gold transition-all duration-300"
                      style={{
                        width: `${paymentProgress}%`,
                      }}
                    />
                  </div>
                </div>
              )}

            {/* =================================================
                SUBMIT
            ================================================= */}

            <button
              type="button"
              onClick={
                handlePay
              }
              disabled={
                processing ||
                loadingBalance ||
                !selectedSemester ||
                numericAmount <=
                  0 ||
                outstanding <=
                  0
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-navy/10 transition hover:bg-brand-navy/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Connecting to
                  Paystack...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  Pay{" "}
                  {
                    formattedAmount
                  }
                </>
              )}
            </button>

            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
              <LockKeyhole className="h-3.5 w-3.5" />

              <span>
                Secure payment powered
                by Paystack
              </span>
            </div>
          </section>

          {/* =================================================
              SUMMARY
          ================================================= */}

          <aside className="space-y-6">

            {/* =================================================
                BALANCE CARD
            ================================================= */}

            <section className="overflow-hidden rounded-3xl bg-brand-navy shadow-xl shadow-brand-navy/10">
              <div className="p-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                    <ReceiptText className="h-5 w-5 text-brand-gold" />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-white/50">
                      Current Balance
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-white">
                      Outstanding Fees
                    </h2>
                  </div>
                </div>

                {loadingBalance ? (
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <Loader2 className="h-4 w-4 animate-spin" />

                    Loading balance...
                  </div>
                ) : (
                  <div>
                    <p className="text-3xl font-bold text-brand-gold">
                      {
                        formattedOutstanding
                      }
                    </p>

                    <p className="mt-2 text-xs leading-5 text-white/60">
                      This amount
                      represents the
                      current
                      outstanding
                      balance for the
                      selected
                      semester.
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 px-6 py-4">
                <div className="flex items-center gap-2 text-xs text-white/70">
                  <ShieldCheck className="h-4 w-4 text-brand-gold" />

                  <span>
                    Your payment is
                    securely
                    processed.
                  </span>
                </div>
              </div>
            </section>

            {/* =================================================
                PAYMENT SUMMARY
            ================================================= */}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-5 font-bold text-slate-900">
                Payment Summary
              </h3>

              <div className="space-y-4 text-sm">

                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">
                    Purpose
                  </span>

                  <span className="text-right font-semibold capitalize text-slate-800">
                    {
                      paymentPurposes.find(
                        (item) =>
                          item.value ===
                          purpose,
                      )?.label ??
                        "Payment"
                    }
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">
                    Amount
                  </span>

                  <span className="font-bold text-slate-900">
                    {
                      formattedAmount
                    }
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold text-slate-700">
                      Remaining after
                      payment
                    </span>

                    <span className="font-bold text-brand-navy">
                      {formatCurrency(
                        Math.max(
                          0,
                          outstanding -
                            numericAmount,
                        ),
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                SECURITY
            ================================================= */}

            <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                <div>
                  <p className="text-sm font-bold text-emerald-900">
                    Secure checkout
                  </p>

                  <p className="mt-1 text-xs leading-5 text-emerald-800/80">
                    You will be redirected
                    to Paystack to securely
                    complete your payment.
                    Your card details are not
                    stored by this portal.
                  </p>
                </div>
              </div>
            </section>

          </aside>
        </div>
      </div>
    </main>
  );
}

