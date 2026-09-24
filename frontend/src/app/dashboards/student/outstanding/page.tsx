"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  ArrowDownRight,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  CreditCard,
  FileText,
  Loader2,
  RefreshCw,
  Wallet,
} from "lucide-react";

import { useSession } from "next-auth/react";

import { apiGet } from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

interface Semester {
  _id: string;
  name?: string;
  title?: string;
  semester?: string;
  label?: string;
  code?: string;
  order?: number;
  isActive?: boolean;
  status?: string;
}

interface FeeBreakdownItem {
  _id?: string;
  id?: string;

  feeCategory?: {
    _id?: string;
    name?: string;
    code?: string;
  } | string | null;

  category?: string;
  name?: string;

  amount?: number | string | null;
  paid?: number | string | null;
  outstanding?: number | string | null;

  description?: string;
}

interface NormalizedBalance {
  success: boolean;
  semester?: string;

  totalFees: number;
  totalPaid: number;
  outstanding: number;

  feeBreakdown: FeeBreakdownItem[];
}

interface NormalizedFeeItem
  extends FeeBreakdownItem {
  amount: number;
  paid: number;
  outstanding: number;
}

/* =========================================================
   HELPERS
========================================================= */

function toNumber(
  value: unknown,
): number {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value)
      ? value
      : 0;
  }

  if (typeof value === "string") {
    const cleaned = value
      .replace(/₦/g, "")
      .replace(/,/g, "")
      .trim();

    const parsed = Number(cleaned);

    return Number.isFinite(parsed)
      ? parsed
      : 0;
  }

  return 0;
}

function formatCurrency(
  value: unknown,
): string {
  const amount = toNumber(value);

  return new Intl.NumberFormat(
    "en-NG",
    {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  ).format(amount);
}

function getSemesterName(
  semester: Semester,
): string {
  return (
    semester.name ||
    semester.title ||
    semester.semester ||
    semester.label ||
    semester.code ||
    "Semester"
  );
}

function getSemesterOrder(
  semester: Semester,
): number {
  if (
    typeof semester.order ===
      "number" &&
    Number.isFinite(semester.order)
  ) {
    return semester.order;
  }

  const text =
    getSemesterName(
      semester,
    )
      .toLowerCase()
      .trim();

  if (
    text.includes("first") ||
    text.includes("1st") ||
    text.includes("one")
  ) {
    return 1;
  }

  if (
    text.includes("second") ||
    text.includes("2nd") ||
    text.includes("two")
  ) {
    return 2;
  }

  if (
    text.includes("third") ||
    text.includes("3rd") ||
    text.includes("three")
  ) {
    return 3;
  }

  return 999;
}

function getFeeCategoryName(
  item: FeeBreakdownItem,
): string {
  if (
    typeof item.name ===
      "string" &&
    item.name.trim()
  ) {
    return item.name;
  }

  if (
    typeof item.category ===
      "string" &&
    item.category.trim()
  ) {
    return item.category;
  }

  if (
    item.feeCategory &&
    typeof item.feeCategory ===
      "object"
  ) {
    return (
      item.feeCategory.name ||
      item.feeCategory.code ||
      "Fee Category"
    );
  }

  if (
    typeof item.feeCategory ===
      "string" &&
    item.feeCategory.trim()
  ) {
    return item.feeCategory;
  }

  return "Fee Category";
}

function getFeeCategoryCode(
  item: FeeBreakdownItem,
): string {
  if (
    item.feeCategory &&
    typeof item.feeCategory ===
      "object"
  ) {
    return (
      item.feeCategory.code ||
      ""
    );
  }

  return "";
}

/* =========================================================
   PAGE
========================================================= */

export default function StudentOutstandingFeesPage() {
  const {
    data: session,
    status: sessionStatus,
  } = useSession();

  const accessToken =
    typeof session?.accessToken ===
    "string"
      ? session.accessToken
      : undefined;

  /* =======================================================
     STATE
  ======================================================= */

  const [semesters, setSemesters] =
    useState<Semester[]>([]);

  const [
    selectedSemester,
    setSelectedSemester,
  ] = useState("");

  const [
    balanceData,
    setBalanceData,
  ] =
    useState<NormalizedBalance | null>(
      null,
    );

  const [
    loadingSemesters,
    setLoadingSemesters,
  ] = useState(true);

  const [
    loadingBalance,
    setLoadingBalance,
  ] = useState(false);

  const [error, setError] =
    useState("");

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
          )) as unknown;

        console.log(
          "==========================================",
        );

        console.log(
          "OUTSTANDING SEMESTERS API RESPONSE:",
          response,
        );

        console.log(
          "==========================================",
        );

        let semesterList: unknown[] =
          [];

        /*
         * Possible responses:
         *
         * []
         *
         * { data: [] }
         *
         * { semesters: [] }
         *
         * {
         *   data: {
         *     semesters: []
         *   }
         * }
         */

        if (
          Array.isArray(response)
        ) {
          semesterList = response;
        } else if (
          response &&
          typeof response ===
            "object"
        ) {
          const raw =
            response as Record<
              string,
              unknown
            >;

          if (
            Array.isArray(
              raw.semesters,
            )
          ) {
            semesterList =
              raw.semesters;
          } else if (
            Array.isArray(raw.data)
          ) {
            semesterList =
              raw.data;
          } else if (
            raw.data &&
            typeof raw.data ===
              "object" &&
            !Array.isArray(
              raw.data,
            )
          ) {
            const nested =
              raw.data as Record<
                string,
                unknown
              >;

            if (
              Array.isArray(
                nested.semesters,
              )
            ) {
              semesterList =
                nested.semesters;
            } else if (
              Array.isArray(
                nested.data,
              )
            ) {
              semesterList =
                nested.data;
            }
          }
        }

        const normalizedSemesters =
          semesterList
            .filter(
              (
                item,
              ): item is Record<
                string,
                unknown
              > =>
                Boolean(
                  item &&
                    typeof item ===
                      "object",
                ),
            )
            .map((item) => ({
              _id: String(
                item._id ??
                  item.id ??
                  "",
              ),

              name:
                typeof item.name ===
                "string"
                  ? item.name
                  : undefined,

              title:
                typeof item.title ===
                "string"
                  ? item.title
                  : undefined,

              semester:
                typeof item.semester ===
                "string"
                  ? item.semester
                  : undefined,

              label:
                typeof item.label ===
                "string"
                  ? item.label
                  : undefined,

              code:
                typeof item.code ===
                "string"
                  ? item.code
                  : undefined,

              order:
                typeof item.order ===
                "number"
                  ? item.order
                  : undefined,

              isActive:
                item.isActive ===
                true,

              status:
                typeof item.status ===
                "string"
                  ? item.status
                  : undefined,
            }))
            .filter(
              (semester) =>
                Boolean(
                  semester._id,
                ),
            );

        /*
         * Active semester first,
         * then semester order.
         */

        normalizedSemesters.sort(
          (a, b) => {
            if (
              a.isActive &&
              !b.isActive
            ) {
              return -1;
            }

            if (
              !a.isActive &&
              b.isActive
            ) {
              return 1;
            }

            const orderDifference =
              getSemesterOrder(a) -
              getSemesterOrder(b);

            if (
              orderDifference !==
              0
            ) {
              return orderDifference;
            }

            return getSemesterName(
              a,
            ).localeCompare(
              getSemesterName(b),
            );
          },
        );

        setSemesters(
          normalizedSemesters,
        );

        setSelectedSemester(
          (current) => {
            if (
              current &&
              normalizedSemesters.some(
                (semester) =>
                  semester._id ===
                  current,
              )
            ) {
              return current;
            }

            const activeSemester =
              normalizedSemesters.find(
                (semester) =>
                  semester.isActive,
              );

            return (
              activeSemester?._id ??
              normalizedSemesters[0]
                ?._id ??
              ""
            );
          },
        );

        if (
          normalizedSemesters.length ===
          0
        ) {
          setBalanceData(null);
        }
      } catch (err: unknown) {
        console.error(
          "Failed to load semesters:",
          err,
        );

        const message =
          err instanceof Error
            ? err.message
            : "Unable to load semesters. Please try again.";

        setError(message);
        setSemesters([]);
        setSelectedSemester("");
        setBalanceData(null);
      } finally {
        setLoadingSemesters(false);
      }
    }, [accessToken]);

  /* =======================================================
     LOAD BALANCE
  ======================================================= */

  const loadBalance =
    useCallback(async () => {
      if (
        !accessToken ||
        !selectedSemester
      ) {
        setBalanceData(null);
        return;
      }

      try {
        setLoadingBalance(true);
        setError("");

        const endpoint =
          `/payments/me/balance?semester=${encodeURIComponent(
            selectedSemester,
          )}`;

        console.log(
          "Loading outstanding balance:",
          endpoint,
        );

        const response =
          (await apiGet(
            endpoint,
            accessToken,
          )) as unknown;

        console.log(
          "==========================================",
        );

        console.log(
          "OUTSTANDING BALANCE API RESPONSE:",
          response,
        );

        console.log(
          "==========================================",
        );

        /*
         * Backend can return several shapes.
         *
         * Shape 1:
         *
         * {
         *   success: true,
         *   totalFees: 5000,
         *   totalPaid: 0,
         *   balance: 5000
         * }
         *
         * Shape 2:
         *
         * {
         *   success: true,
         *   data: {
         *     totalFees: 5000,
         *     totalPaid: 0,
         *     balance: 5000
         *   }
         * }
         *
         * Shape 3:
         *
         * {
         *   success: true,
         *   balance: {
         *     totalFees: 5000,
         *     totalPaid: 0,
         *     balance: 5000,
         *     feeBreakdown: [...]
         *   }
         * }
         *
         * Shape 4:
         *
         * {
         *   success: true,
         *   data: {
         *     balance: {
         *       totalFees: 5000,
         *       totalPaid: 0,
         *       balance: 5000
         *     }
         *   }
         * }
         */

        const raw =
          response &&
          typeof response ===
            "object"
            ? (response as Record<
                string,
                unknown
              >)
            : {};

        let payload: Record<
          string,
          unknown
        > = raw;

        /*
         * Unwrap data.
         */

        if (
          payload.data &&
          typeof payload.data ===
            "object" &&
          !Array.isArray(
            payload.data,
          )
        ) {
          payload =
            payload.data as Record<
              string,
              unknown
            >;
        }

        /*
         * Unwrap balance when balance
         * is an object.
         */

        if (
          payload.balance &&
          typeof payload.balance ===
            "object" &&
          !Array.isArray(
            payload.balance,
          )
        ) {
          payload =
            payload.balance as Record<
              string,
              unknown
            >;
        }

        /*
         * Handle another nested data
         * wrapper if present.
         */

        if (
          payload.data &&
          typeof payload.data ===
            "object" &&
          !Array.isArray(
            payload.data,
          )
        ) {
          const nested =
            payload.data as Record<
              string,
              unknown
            >;

          if (
            nested.totalFees !==
              undefined ||
            nested.totalPaid !==
              undefined ||
            nested.balance !==
              undefined ||
            nested.feeBreakdown !==
              undefined ||
            nested.breakdown !==
              undefined
          ) {
            payload = nested;
          }
        }

        console.log(
          "UNWRAPPED OUTSTANDING PAYLOAD:",
          payload,
        );

        /* ---------------------------------------------------
           BREAKDOWN
        --------------------------------------------------- */

        const rawBreakdown =
          payload.feeBreakdown ??
          payload.breakdown ??
          [];

        const feeBreakdown: FeeBreakdownItem[] =
          Array.isArray(
            rawBreakdown,
          )
            ? rawBreakdown.filter(
                (
                  item,
                ): item is FeeBreakdownItem =>
                  Boolean(
                    item &&
                      typeof item ===
                        "object",
                  ),
              )
            : [];

        /* ---------------------------------------------------
           TOTAL FEES
        --------------------------------------------------- */

        const breakdownTotal =
          feeBreakdown.reduce(
            (sum, item) =>
              sum +
              Math.max(
                toNumber(
                  item.amount,
                ),
                0,
              ),
            0,
          );

        const backendTotalFees =
          toNumber(
            payload.totalFees ??
              payload.totalAmount,
          );

        const backendTotalPaid =
          toNumber(
            payload.totalPaid ??
              payload.paidAmount,
          );

        /*
         * Use backend total when available.
         * Otherwise calculate from breakdown.
         */

        const totalFees =
          backendTotalFees > 0
            ? backendTotalFees
            : breakdownTotal;

        const totalPaid =
          backendTotalPaid;

        /* ---------------------------------------------------
           OUTSTANDING
        --------------------------------------------------- */

        const rawOutstanding =
          payload.outstanding ??
          payload.outstandingAmount ??
          payload.balance;

        let outstanding = 0;

        /*
         * Only treat balance as an amount
         * when it is actually numeric/string.
         *
         * If it is an object, it has already
         * been unwrapped above.
         */

        if (
          typeof rawOutstanding ===
            "number" ||
          typeof rawOutstanding ===
            "string"
        ) {
          outstanding = Math.max(
            toNumber(
              rawOutstanding,
            ),
            0,
          );
        } else {
          outstanding = Math.max(
            totalFees - totalPaid,
            0,
          );
        }

        if (
          !Number.isFinite(
            outstanding,
          )
        ) {
          outstanding = Math.max(
            totalFees - totalPaid,
            0,
          );
        }

        const normalized: NormalizedBalance =
          {
            success:
              raw.success === false
                ? false
                : true,

            semester:
              typeof payload.semester ===
              "string"
                ? payload.semester
                : selectedSemester,

            totalFees,

            totalPaid,

            outstanding,

            feeBreakdown,
          };

        console.log(
          "==========================================",
        );

        console.log(
          "NORMALIZED OUTSTANDING BALANCE:",
          normalized,
        );

        console.log(
          "TOTAL FEES:",
          totalFees,
        );

        console.log(
          "TOTAL PAID:",
          totalPaid,
        );

        console.log(
          "OUTSTANDING:",
          outstanding,
        );

        console.log(
          "FEE BREAKDOWN:",
          feeBreakdown,
        );

        console.log(
          "==========================================",
        );

        if (
          normalized.success ===
          false
        ) {
          throw new Error(
            "Unable to retrieve your outstanding fee information.",
          );
        }

        setBalanceData(
          normalized,
        );
      } catch (err: unknown) {
        console.error(
          "Failed to load outstanding fees:",
          err,
        );

        setBalanceData(null);

        const message =
          err instanceof Error
            ? err.message
            : "Unable to load your outstanding fees. Please try again.";

        setError(message);
      } finally {
        setLoadingBalance(false);
      }
    }, [
      accessToken,
      selectedSemester,
    ]);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    if (
      sessionStatus ===
        "authenticated" &&
      accessToken
    ) {
      void loadSemesters();
    }
  }, [
    sessionStatus,
    accessToken,
    loadSemesters,
  ]);

  /* =======================================================
     LOAD BALANCE WHEN SEMESTER CHANGES
  ======================================================= */

  useEffect(() => {
    if (
      !accessToken ||
      !selectedSemester
    ) {
      return;
    }

    setBalanceData(null);

    void loadBalance();
  }, [
    accessToken,
    selectedSemester,
    loadBalance,
  ]);

  /* =======================================================
     NORMALIZED TOTALS
  ======================================================= */

  const totalFees = useMemo(() => {
    return Math.max(
      toNumber(
        balanceData?.totalFees,
      ),
      0,
    );
  }, [balanceData]);

  const totalPaid = useMemo(() => {
    return Math.max(
      toNumber(
        balanceData?.totalPaid,
      ),
      0,
    );
  }, [balanceData]);

  const outstanding = useMemo(() => {
    if (
      balanceData?.outstanding !==
        undefined &&
      balanceData?.outstanding !==
        null
    ) {
      return Math.max(
        toNumber(
          balanceData.outstanding,
        ),
        0,
      );
    }

    return Math.max(
      totalFees - totalPaid,
      0,
    );
  }, [
    balanceData,
    totalFees,
    totalPaid,
  ]);

  /* =======================================================
     PAYMENT PERCENTAGE
  ======================================================= */

  const paymentPercentage =
    useMemo(() => {
      if (totalFees <= 0) {
        return 0;
      }

      return Math.min(
        Math.max(
          (totalPaid / totalFees) *
            100,
          0,
        ),
        100,
      );
    }, [
      totalFees,
      totalPaid,
    ]);

  /* =======================================================
     BREAKDOWN
  ======================================================= */

  const rawBreakdown =
    useMemo(() => {
      return Array.isArray(
        balanceData?.feeBreakdown,
      )
        ? balanceData.feeBreakdown
        : [];
    }, [balanceData]);

  const breakdown =
    useMemo<NormalizedFeeItem[]>(
      () => {
        return rawBreakdown.map(
          (item) => {
            const amount =
              Math.max(
                toNumber(
                  item.amount,
                ),
                0,
              );

            /*
             * Paid cannot be greater than
             * assessed amount.
             */

            const paid =
              Math.min(
                Math.max(
                  toNumber(
                    item.paid,
                  ),
                  0,
                ),
                amount,
              );

            /*
             * If backend supplied
             * outstanding, use it.
             *
             * Otherwise calculate:
             *
             * amount - paid
             */

            const backendOutstanding =
              item.outstanding !==
                undefined &&
              item.outstanding !==
                null
                ? toNumber(
                    item.outstanding,
                  )
                : amount - paid;

            const calculatedOutstanding =
              Math.max(
                backendOutstanding,
                0,
              );

            return {
              ...item,

              amount,

              paid,

              outstanding:
                calculatedOutstanding,
            };
          },
        );
      },
      [rawBreakdown],
    );

  /* =======================================================
     OUTSTANDING CATEGORIES
  ======================================================= */

  const outstandingCategories =
    useMemo(() => {
      return breakdown.filter(
        (item) =>
          item.outstanding > 0,
      );
    }, [breakdown]);

  /* =======================================================
     PAID CATEGORIES
  ======================================================= */

  const paidCategories =
    useMemo(() => {
      return breakdown.filter(
        (item) =>
          item.outstanding <= 0 &&
          item.amount > 0,
      );
    }, [breakdown]);

  /* =======================================================
     SELECTED SEMESTER
  ======================================================= */

  const selectedSemesterName =
    useMemo(() => {
      const semester =
        semesters.find(
          (item) =>
            item._id ===
            selectedSemester,
        );

      return semester
        ? getSemesterName(
            semester,
          )
        : "Selected Semester";
    }, [
      semesters,
      selectedSemester,
    ]);

  /* =======================================================
     RETRY
  ======================================================= */

  const handleRetry =
    useCallback(() => {
      setError("");

      if (!selectedSemester) {
        void loadSemesters();
        return;
      }

      void loadBalance();
    }, [
      selectedSemester,
      loadSemesters,
      loadBalance,
    ]);

  /* =======================================================
     SESSION LOADING
  ======================================================= */

  if (
    sessionStatus ===
    "loading"
  ) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="flex min-h-[70vh] items-center justify-center px-4">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy/5">
              <Loader2 className="h-7 w-7 animate-spin text-brand-navy" />
            </div>

            <p className="text-sm font-medium text-slate-500">
              Loading your finance
              information...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        {/* =================================================
            HEADER
        ================================================= */}

        <header className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy shadow-sm">
                <Wallet className="h-5 w-5 text-brand-gold" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">
                  Student Finance
                </p>

                <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Outstanding Fees
                </h1>
              </div>
            </div>

            <p className="max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              View your current outstanding
              school fees, payment progress,
              and fee category breakdown.
            </p>
          </div>

          {/* =================================================
              SEMESTER SELECTOR
          ================================================= */}

          <div className="w-full lg:w-[300px]">
            <label
              htmlFor="semester"
              className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500"
            >
              Academic Semester
            </label>

            <div className="relative">
              <select
                id="semester"
                value={selectedSemester}
                onChange={(event) => {
                  setSelectedSemester(
                    event.target.value,
                  );
                }}
                disabled={
                  loadingSemesters ||
                  semesters.length === 0
                }
                className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm font-semibold text-slate-800 shadow-sm outline-none transition focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                {loadingSemesters ? (
                  <option value="">
                    Loading semesters...
                  </option>
                ) : semesters.length ===
                  0 ? (
                  <option value="">
                    No semesters available
                  </option>
                ) : (
                  semesters.map(
                    (semester) => (
                      <option
                        key={
                          semester._id
                        }
                        value={
                          semester._id
                        }
                      >
                        {getSemesterName(
                          semester,
                        )}
                        {semester.isActive
                          ? " • Active"
                          : ""}
                      </option>
                    ),
                  )
                )}
              </select>

              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </header>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-red-800">
                  Unable to load finance
                  information
                </p>

                <p className="mt-1 break-words text-sm leading-5 text-red-700">
                  {error}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={
                handleRetry
              }
              disabled={
                loadingBalance ||
                loadingSemesters
              }
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loadingBalance ||
                  loadingSemesters
                    ? "animate-spin"
                    : ""
                }`}
              />

              Try Again
            </button>
          </div>
        )}

        {/* =================================================
            BALANCE LOADING
        ================================================= */}

        {loadingBalance ? (
          <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy/5">
                <Loader2 className="h-7 w-7 animate-spin text-brand-navy" />
              </div>

              <div>
                <p className="font-semibold text-slate-800">
                  Loading outstanding
                  fees
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Fetching your finance
                  records...
                </p>
              </div>
            </div>
          </div>
        ) : !selectedSemester ? (
          /* =================================================
             NO SEMESTER
          ================================================= */

          <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 shadow-sm">
            <div className="max-w-md text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>

              <h2 className="text-lg font-bold text-slate-900">
                No semester available
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                There is currently no
                academic semester
                available for your
                finance records.
              </p>

              <button
                type="button"
                onClick={() => {
                  void loadSemesters();
                }}
                disabled={
                  loadingSemesters
                }
                className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-navy px-4 text-sm font-semibold text-white transition hover:bg-brand-navy/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    loadingSemesters
                      ? "animate-spin"
                      : ""
                  }`}
                />

                Refresh Semesters
              </button>
            </div>
          </div>
        ) : !balanceData ? (
          /* =================================================
             NO BALANCE DATA
          ================================================= */

          <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 shadow-sm">
            <div className="max-w-md text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <CircleDollarSign className="h-8 w-8 text-slate-400" />
              </div>

              <h2 className="text-lg font-bold text-slate-900">
                No finance record
                found
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                We could not find a
                finance balance for{" "}
                <span className="font-semibold text-slate-700">
                  {
                    selectedSemesterName
                  }
                </span>
                .
              </p>

              <button
                type="button"
                onClick={() => {
                  void loadBalance();
                }}
                disabled={
                  loadingBalance
                }
                className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-navy px-4 text-sm font-semibold text-white transition hover:bg-brand-navy/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    loadingBalance
                      ? "animate-spin"
                      : ""
                  }`}
                />

                Refresh
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* =================================================
                OUTSTANDING HERO
            ================================================= */}

            <section className="relative mb-6 overflow-hidden rounded-3xl bg-brand-navy p-6 shadow-xl sm:p-8 lg:p-10">
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-gold/10 blur-2xl" />

              <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />

              <div className="relative">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
                        {
                          selectedSemesterName
                        }
                      </span>

                      {outstanding <=
                      0 ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Fully Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-3 py-1 text-xs font-semibold text-amber-300">
                          <Clock3 className="h-3.5 w-3.5" />
                          Payment Due
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-medium text-slate-300">
                      Outstanding Balance
                    </p>

                    <p className="mt-2 break-words text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                      {formatCurrency(
                        outstanding,
                      )}
                    </p>

                    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                      {outstanding >
                      0
                        ? "This is the remaining amount required to complete your fee payment for the selected semester."
                        : "You have completed your fee payment for the selected semester."}
                    </p>
                  </div>

                  {/* Payment Progress */}

                  <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-slate-300">
                        Payment Progress
                      </span>

                      <span className="text-sm font-bold text-brand-gold">
                        {paymentPercentage.toFixed(
                          0,
                        )}
                        %
                      </span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-brand-gold transition-all duration-500"
                        style={{
                          width: `${paymentPercentage}%`,
                        }}
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-400">
                      <span>
                        Paid:{" "}
                        {formatCurrency(
                          totalPaid,
                        )}
                      </span>

                      <span>
                        Total:{" "}
                        {formatCurrency(
                          totalFees,
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {/* Total Fees */}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Total Fees
                    </p>

                    <p className="mt-2 break-words text-2xl font-bold text-slate-900">
                      {formatCurrency(
                        totalFees,
                      )}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-400">
                  Total assessed fees
                </p>
              </div>

              {/* Total Paid */}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Total Paid
                    </p>

                    <p className="mt-2 break-words text-2xl font-bold text-emerald-600">
                      {formatCurrency(
                        totalPaid,
                      )}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-400">
                  Successful payments
                </p>
              </div>

              {/* Outstanding */}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Outstanding
                    </p>

                    <p className="mt-2 break-words text-2xl font-bold text-red-600">
                      {formatCurrency(
                        outstanding,
                      )}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50">
                    <ArrowDownRight className="h-5 w-5 text-red-600" />
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-400">
                  Remaining balance
                </p>
              </div>

              {/* Categories */}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Outstanding Categories
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {
                        outstandingCategories.length
                      }
                    </p>
                  </div>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50">
                    <CreditCard className="h-5 w-5 text-amber-600" />
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-400">
                  Categories with balance
                </p>
              </div>
            </section>

            {/* =================================================
                CONTENT
            ================================================= */}

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              {/* =================================================
                  OUTSTANDING BREAKDOWN
              ================================================= */}

              <div className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-5 sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Outstanding Fee
                        Breakdown
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Fee categories that
                        still have an unpaid
                        balance.
                      </p>
                    </div>

                    <span className="inline-flex w-fit items-center rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600">
                      {
                        outstandingCategories.length
                      }{" "}
                      {outstandingCategories.length ===
                      1
                        ? "category"
                        : "categories"}
                    </span>
                  </div>
                </div>

                {outstandingCategories.length ===
                0 ? (
                  <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-10 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
                      <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">
                      No outstanding
                      fees
                    </h3>

                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                      You have fully settled
                      the fees recorded for{" "}
                      <span className="font-semibold text-slate-700">
                        {
                          selectedSemesterName
                        }
                      </span>
                      .
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {outstandingCategories.map(
                      (
                        item,
                        index,
                      ) => {
                        const categoryName =
                          getFeeCategoryName(
                            item,
                          );

                        const categoryCode =
                          getFeeCategoryCode(
                            item,
                          );

                        const amount =
                          item.amount;

                        const paid =
                          item.paid;

                        const itemOutstanding =
                          item.outstanding;

                        const progress =
                          amount > 0
                            ? Math.min(
                                Math.max(
                                  (paid /
                                    amount) *
                                    100,
                                  0,
                                ),
                                100,
                              )
                            : 0;

                        return (
                          <div
                            key={
                              item._id ||
                              item.id ||
                              (item.feeCategory &&
                              typeof item.feeCategory ===
                                "object"
                                ? item
                                    .feeCategory
                                    ._id
                                : undefined) ||
                              `${categoryName}-${index}`
                            }
                            className="p-5 transition hover:bg-slate-50/70 sm:p-6"
                          >
                            <div className="flex flex-col gap-5">
                              {/* Category */}

                              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex min-w-0 items-start gap-3">
                                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50">
                                    <CircleDollarSign className="h-5 w-5 text-red-600" />
                                  </div>

                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h3 className="break-words font-bold text-slate-900">
                                        {
                                          categoryName
                                        }
                                      </h3>

                                      {categoryCode && (
                                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                                          {
                                            categoryCode
                                          }
                                        </span>
                                      )}
                                    </div>

                                    <p className="mt-1 text-xs text-slate-500">
                                      Fee category{" "}
                                      {index +
                                        1}
                                    </p>

                                    {item.description && (
                                      <p className="mt-1 text-xs leading-5 text-slate-400">
                                        {
                                          item.description
                                        }
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="sm:text-right">
                                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Outstanding
                                  </p>

                                  <p className="mt-1 break-words text-xl font-extrabold text-red-600">
                                    {formatCurrency(
                                      itemOutstanding,
                                    )}
                                  </p>
                                </div>
                              </div>

                              {/* Progress */}

                              <div>
                                <div className="mb-2 flex items-center justify-between text-xs">
                                  <span className="font-medium text-slate-500">
                                    Payment progress
                                  </span>

                                  <span className="font-bold text-slate-700">
                                    {progress.toFixed(
                                      0,
                                    )}
                                    %
                                  </span>
                                </div>

                                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                                  <div
                                    className="h-full rounded-full bg-brand-gold transition-all duration-500"
                                    style={{
                                      width: `${progress}%`,
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Amounts */}

                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <div className="rounded-xl bg-slate-50 p-3">
                                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                    Assessed
                                  </p>

                                  <p className="mt-1 text-sm font-bold text-slate-800">
                                    {formatCurrency(
                                      amount,
                                    )}
                                  </p>
                                </div>

                                <div className="rounded-xl bg-emerald-50 p-3">
                                  <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">
                                    Paid
                                  </p>

                                  <p className="mt-1 text-sm font-bold text-emerald-700">
                                    {formatCurrency(
                                      paid,
                                    )}
                                  </p>
                                </div>

                                <div className="rounded-xl bg-red-50 p-3">
                                  <p className="text-[11px] font-semibold uppercase tracking-wide text-red-500">
                                    Balance
                                  </p>

                                  <p className="mt-1 text-sm font-bold text-red-700">
                                    {formatCurrency(
                                      itemOutstanding,
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                )}
              </div>

              {/* =================================================
                  RIGHT SIDEBAR
              ================================================= */}

              <aside className="min-w-0 space-y-6">
                {/* Payment Summary */}

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-5">
                    <h2 className="text-lg font-bold text-slate-900">
                      Payment Summary
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Overview for{" "}
                      {
                        selectedSemesterName
                      }
                      .
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-slate-500">
                        Total assessed
                      </span>

                      <span className="text-right text-sm font-bold text-slate-900">
                        {formatCurrency(
                          totalFees,
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-slate-500">
                        Total paid
                      </span>

                      <span className="text-right text-sm font-bold text-emerald-600">
                        {formatCurrency(
                          totalPaid,
                        )}
                      </span>
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-semibold text-slate-700">
                          Outstanding
                        </span>

                        <span className="text-right text-base font-extrabold text-red-600">
                          {formatCurrency(
                            outstanding,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">
                        Overall progress
                      </span>

                      <span className="text-xs font-bold text-brand-navy">
                        {paymentPercentage.toFixed(
                          0,
                        )}
                        %
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-brand-navy transition-all duration-500"
                        style={{
                          width: `${paymentPercentage}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Fully Paid Categories */}

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-lg font-bold text-slate-900">
                        Fully Paid
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Categories with no
                        remaining balance.
                      </p>
                    </div>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>
                  </div>

                  {paidCategories.length ===
                  0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
                      <p className="text-sm text-slate-500">
                        No fully paid
                        categories found.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {paidCategories.map(
                        (
                          item,
                          index,
                        ) => {
                          const categoryName =
                            getFeeCategoryName(
                              item,
                            );

                          const categoryId =
                            item.feeCategory &&
                            typeof item.feeCategory ===
                              "object"
                              ? item
                                  .feeCategory
                                  ._id
                              : undefined;

                          return (
                            <div
                              key={
                                item._id ||
                                item.id ||
                                categoryId ||
                                `${categoryName}-paid-${index}`
                              }
                              className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                </div>

                                <p className="truncate text-sm font-semibold text-slate-700">
                                  {
                                    categoryName
                                  }
                                </p>
                              </div>

                              <span className="shrink-0 text-xs font-bold text-emerald-600">
                                Paid
                              </span>
                            </div>
                          );
                        },
                      )}
                    </div>
                  )}
                </div>

                {/* Finance Records */}

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                      <Clock3 className="h-5 w-5 text-blue-600" />
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800">
                        Finance Records
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Your outstanding
                        balance is calculated
                        from your assigned fee
                        structures and
                        successful payments.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      void loadBalance();
                    }}
                    disabled={
                      loadingBalance
                    }
                    className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${
                        loadingBalance
                          ? "animate-spin"
                          : ""
                      }`}
                    />

                    Refresh Balance
                  </button>
                </div>
              </aside>
            </section>
          </>
        )}
      </div>
    </main>
  );
}