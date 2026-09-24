"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { useSession } from "next-auth/react";

import {
  AlertCircle,
  ArrowDownToLine,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  FileText,
  GraduationCap,
  Loader2,
  RefreshCw,
  Wallet,
} from "lucide-react";

import { apiGet } from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

interface Student {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  matricNumber?: string;
  programme?: {
    _id?: string;
    name?: string;
    code?: string;
  } | string;
  level?: string;
}

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
  academicSession?: {
    _id?: string;
    name?: string;
  } | string;
}

interface FeeBreakdown {
  _id?: string;
  id?: string;
  name?: string;
  category?: string;
  feeCategory?: {
    _id?: string;
    name?: string;
    code?: string;
  } | string;
  amount?: number | string | null;
  description?: string;
}

interface NormalizedBalance {
  success: boolean;
  student?: Student;
  semester?: string;
  totalFees: number;
  totalPaid: number;
  balance: number;
  feeBreakdown: FeeBreakdown[];
}

/* =========================================================
   HELPERS
========================================================= */

function toNumber(value: unknown): number {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
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

function formatCurrency(value: unknown): string {
  const amount = toNumber(value);

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
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

function getFeeCategoryName(
  fee: FeeBreakdown,
): string {
  if (typeof fee.name === "string" && fee.name.trim()) {
    return fee.name;
  }

  if (
    typeof fee.category === "string" &&
    fee.category.trim()
  ) {
    return fee.category;
  }

  if (
    fee.feeCategory &&
    typeof fee.feeCategory === "object"
  ) {
    return (
      fee.feeCategory.name ||
      fee.feeCategory.code ||
      "Fee"
    );
  }

  if (
    typeof fee.feeCategory === "string" &&
    fee.feeCategory.trim()
  ) {
    return fee.feeCategory;
  }

  return "School Fee";
}

function getSemesterOrder(
  semester: Semester,
): number {
  if (
    typeof semester.order === "number" &&
    Number.isFinite(semester.order)
  ) {
    return semester.order;
  }

  const text = getSemesterName(semester)
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

/* =========================================================
   PAGE
========================================================= */

export default function StudentFinancePage() {
  const { data: session, status } = useSession();

  const accessToken =
    (
      session as {
        accessToken?: string;
      } | null
    )?.accessToken || "";

  /* =======================================================
     STATE
  ======================================================= */

  const [semesters, setSemesters] =
    useState<Semester[]>([]);

  const [selectedSemester, setSelectedSemester] =
    useState("");

  const [balanceData, setBalanceData] =
    useState<NormalizedBalance | null>(null);

  const [loadingSemesters, setLoadingSemesters] =
    useState(true);

  const [loadingBalance, setLoadingBalance] =
    useState(false);

  const [error, setError] = useState("");

  /* =======================================================
     LOAD SEMESTERS
  ======================================================= */

  const loadSemesters = useCallback(
    async () => {
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
          "STUDENT SEMESTERS API RESPONSE:",
          response,
        );

        console.log(
          "==========================================",
        );

        /*
         * The API may return:
         *
         * [
         *   {...},
         *   {...}
         * ]
         *
         * OR
         *
         * {
         *   data: [...]
         * }
         *
         * OR
         *
         * {
         *   semesters: [...]
         * }
         */

        let semesterList: unknown[] = [];

        if (Array.isArray(response)) {
          semesterList = response;
        } else if (
          response &&
          typeof response === "object"
        ) {
          const raw =
            response as Record<
              string,
              unknown
            >;

          if (Array.isArray(raw.data)) {
            semesterList = raw.data;
          } else if (
            Array.isArray(raw.semesters)
          ) {
            semesterList = raw.semesters;
          } else if (
            raw.data &&
            typeof raw.data === "object" &&
            !Array.isArray(raw.data)
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
                item.isActive === true,

              status:
                typeof item.status ===
                "string"
                  ? item.status
                  : undefined,

              academicSession:
                item.academicSession as
                  | Semester["academicSession"]
                  | undefined,
            }))
            .filter(
              (semester) =>
                Boolean(semester._id),
            );

        /*
         * Sort semesters.
         *
         * Active semester first,
         * then order,
         * then name.
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
              orderDifference !== 0
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

        /*
         * IMPORTANT:
         *
         * Prefer active semester.
         * Otherwise use the first semester
         * after sorting.
         */

        const activeSemester =
          normalizedSemesters.find(
            (semester) =>
              semester.isActive ===
              true,
          );

        const defaultSemester =
          activeSemester ||
          normalizedSemesters[0];

        if (defaultSemester) {
          setSelectedSemester(
            defaultSemester._id,
          );
        } else {
          setSelectedSemester("");
        }
      } catch (err) {
        console.error(
          "Failed to load semesters:",
          err,
        );

        setSemesters([]);
        setSelectedSemester("");

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load semesters.",
        );
      } finally {
        setLoadingSemesters(false);
      }
    },
    [accessToken],
  );

  /* =======================================================
     LOAD BALANCE
  ======================================================= */

  const loadBalance = useCallback(
    async () => {
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
          "Loading student balance:",
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
          "STUDENT BALANCE API RESPONSE:",
          response,
        );

        console.log(
          "==========================================",
        );

        /*
         * We intentionally process the response
         * as unknown because the backend may return
         * different valid wrappers.
         */

        const raw =
          response &&
          typeof response === "object"
            ? (response as Record<
                string,
                unknown
              >)
            : {};

        /*
         * Possible backend shapes:
         *
         * 1.
         * {
         *   success: true,
         *   totalFees: 5000,
         *   totalPaid: 0,
         *   balance: 5000
         * }
         *
         * 2.
         * {
         *   success: true,
         *   data: {
         *     totalFees: 5000,
         *     totalPaid: 0,
         *     balance: 5000
         *   }
         * }
         *
         * 3.
         * {
         *   success: true,
         *   balance: {
         *     totalFees: 5000,
         *     totalPaid: 0,
         *     balance: 5000
         *   }
         * }
         *
         * 4.
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

        let payload: Record<
          string,
          unknown
        > = raw;

        /*
         * First unwrap data.
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
         * Then unwrap balance if balance
         * itself is an object.
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
         * It is also possible that the first
         * unwrap exposed another data object.
         */

        if (
          payload.data &&
          typeof payload.data ===
            "object" &&
          !Array.isArray(
            payload.data,
          )
        ) {
          const nestedData =
            payload.data as Record<
              string,
              unknown
            >;

          if (
            nestedData.totalFees !==
              undefined ||
            nestedData.totalPaid !==
              undefined ||
            nestedData.balance !==
              undefined ||
            nestedData.feeBreakdown !==
              undefined ||
            nestedData.breakdown !==
              undefined
          ) {
            payload = nestedData;
          }
        }

        console.log(
          "UNWRAPPED BALANCE PAYLOAD:",
          payload,
        );

        /* ---------------------------------------------------
           FEE BREAKDOWN
        --------------------------------------------------- */

        const rawBreakdown =
          payload.feeBreakdown ??
          payload.breakdown ??
          [];

        const feeBreakdown: FeeBreakdown[] =
          Array.isArray(
            rawBreakdown,
          )
            ? rawBreakdown
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
                  _id:
                    typeof item._id ===
                    "string"
                      ? item._id
                      : undefined,

                  id:
                    typeof item.id ===
                    "string"
                      ? item.id
                      : undefined,

                  name:
                    typeof item.name ===
                    "string"
                      ? item.name
                      : undefined,

                  category:
                    typeof item.category ===
                    "string"
                      ? item.category
                      : undefined,

                  feeCategory:
                    item.feeCategory as
                      | FeeBreakdown["feeCategory"]
                      | undefined,

                  amount:
                    typeof item.amount ===
                      "number" ||
                    typeof item.amount ===
                      "string"
                      ? item.amount
                      : 0,

                  description:
                    typeof item.description ===
                    "string"
                      ? item.description
                      : undefined,
                }))
            : [];

        /* ---------------------------------------------------
           CALCULATE TOTAL FEES
        --------------------------------------------------- */

        const breakdownTotal =
          feeBreakdown.reduce(
            (sum, fee) =>
              sum + toNumber(fee.amount),
            0,
          );

        const backendTotalFees =
          toNumber(
            payload.totalFees,
          );

        const backendTotalPaid =
          toNumber(
            payload.totalPaid,
          );

        /*
         * If backend explicitly returns a
         * positive total, use it.
         *
         * Otherwise calculate from breakdown.
         */

        const totalFees =
          backendTotalFees > 0
            ? backendTotalFees
            : breakdownTotal;

        const totalPaid =
          backendTotalPaid;

        /* ---------------------------------------------------
           BALANCE
        --------------------------------------------------- */

        const rawBalance =
          payload.balance;

        let outstanding = 0;

        /*
         * If balance is a number/string,
         * use it.
         */

        if (
          typeof rawBalance ===
            "number" ||
          typeof rawBalance ===
            "string"
        ) {
          outstanding = Math.max(
            toNumber(rawBalance),
            0,
          );
        } else {
          /*
           * Otherwise calculate:
           *
           * Total Fees - Total Paid
           */

          outstanding = Math.max(
            totalFees - totalPaid,
            0,
          );
        }

        /*
         * If the backend has an invalid or
         * missing balance but fees are available,
         * calculate from totals.
         */

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

        const normalizedResponse: NormalizedBalance =
          {
            success:
              raw.success === false
                ? false
                : true,

            student:
              payload.student as
                | Student
                | undefined,

            semester:
              typeof payload.semester ===
              "string"
                ? payload.semester
                : selectedSemester,

            totalFees,

            totalPaid,

            balance: outstanding,

            feeBreakdown,
          };

        console.log(
          "==========================================",
        );

        console.log(
          "NORMALIZED STUDENT BALANCE:",
          normalizedResponse,
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
          normalizedResponse.success ===
          false
        ) {
          throw new Error(
            "Unable to retrieve your fee balance.",
          );
        }

        setBalanceData(
          normalizedResponse,
        );
      } catch (err) {
        console.error(
          "Failed to load student balance:",
          err,
        );

        setBalanceData(null);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your school fee information for this semester.",
        );
      } finally {
        setLoadingBalance(false);
      }
    },
    [
      accessToken,
      selectedSemester,
    ],
  );

  /* =======================================================
     EFFECTS
  ======================================================= */

  useEffect(() => {
    if (
      status === "authenticated" &&
      accessToken
    ) {
      void loadSemesters();
    }
  }, [
    status,
    accessToken,
    loadSemesters,
  ]);

  useEffect(() => {
    if (
      status === "authenticated" &&
      accessToken &&
      selectedSemester
    ) {
      void loadBalance();
    }
  }, [
    status,
    accessToken,
    selectedSemester,
    loadBalance,
  ]);

  /* =======================================================
     DERIVED VALUES
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

  const outstandingBalance =
    useMemo(() => {
      if (
        balanceData?.balance !==
          undefined &&
        balanceData?.balance !== null
      ) {
        return Math.max(
          toNumber(
            balanceData.balance,
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

  const feeBreakdown = useMemo(() => {
    return Array.isArray(
      balanceData?.feeBreakdown,
    )
      ? balanceData.feeBreakdown
      : [];
  }, [balanceData]);

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

  const selectedSemesterObject =
    useMemo(() => {
      return semesters.find(
        (semester) =>
          semester._id ===
          selectedSemester,
      );
    }, [
      semesters,
      selectedSemester,
    ]);

  /* =======================================================
     LOADING SESSION
  ======================================================= */

  if (status === "loading") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-navy" />

          <p className="text-sm font-medium text-slate-500">
            Loading finance portal...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
        {/* =================================================
            HEADER
        ================================================= */}

        <section className="mb-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-navy text-white shadow-sm">
                  <Wallet className="h-5 w-5" />
                </div>

                <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">
                  Student Finance
                </span>
              </div>

              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                My School Fees
              </h1>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                View your fee assessment,
                payment history, and
                outstanding balance for
                the selected semester.
              </p>
            </div>

            {/* Semester selector */}

            <div className="w-full lg:w-[300px]">
              <label
                htmlFor="semester"
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                Academic Semester
              </label>

              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <select
                  id="semester"
                  value={selectedSemester}
                  onChange={(event) =>
                    setSelectedSemester(
                      event.target.value,
                    )
                  }
                  disabled={
                    loadingSemesters ||
                    semesters.length === 0
                  }
                  className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  {semesters.length ===
                    0 && (
                    <option value="">
                      {loadingSemesters
                        ? "Loading semesters..."
                        : "No semesters available"}
                    </option>
                  )}

                  {semesters.map(
                    (semester) => (
                      <option
                        key={semester._id}
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
                  )}
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

              <div>
                <p className="text-sm font-bold text-red-800">
                  Unable to load finance
                  information
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                void loadBalance();
              }}
              disabled={loadingBalance}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-red-700 shadow-sm ring-1 ring-red-200 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loadingBalance
                    ? "animate-spin"
                    : ""
                }`}
              />

              Retry
            </button>
          </div>
        )}

        {/* =================================================
            MAIN CONTENT LOADING
        ================================================= */}

        {loadingBalance ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy/5">
                <Loader2 className="h-7 w-7 animate-spin text-brand-navy" />
              </div>

              <p className="text-sm font-semibold text-slate-600">
                Loading your fee
                information...
              </p>

              <p className="text-xs text-slate-400">
                Please wait a moment.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* =============================================
                STUDENT INFO
            ============================================= */}

            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-navy text-white shadow-sm">
                    <GraduationCap className="h-6 w-6" />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Student Account
                    </p>

                    <h2 className="mt-1 text-lg font-black text-slate-900">
                      {balanceData?.student
                        ?.name ||
                        "Student"}
                    </h2>

                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      {balanceData
                        ?.student
                        ?.matricNumber && (
                        <span className="font-semibold">
                          {
                            balanceData
                              .student
                              .matricNumber
                          }
                        </span>
                      )}

                      {balanceData
                        ?.student
                        ?.email && (
                        <>
                          <span className="hidden sm:inline">
                            •
                          </span>

                          <span>
                            {
                              balanceData
                                .student
                                .email
                            }
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Selected Semester
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-700">
                    {selectedSemesterObject
                      ? getSemesterName(
                          selectedSemesterObject,
                        )
                      : "Not selected"}
                  </p>
                </div>
              </div>
            </section>

            {/* =============================================
                SUMMARY CARDS
            ============================================= */}

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {/* Total Fees */}

              <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Total Fees
                    </p>

                    <p className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                      {formatCurrency(
                        totalFees,
                      )}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy/5 text-brand-navy">
                    <FileText className="h-5 w-5" />
                  </div>
                </div>

                <p className="mt-4 text-xs text-slate-400">
                  Total assessed fees for
                  this semester
                </p>
              </div>

              {/* Total Paid */}

              <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Total Paid
                    </p>

                    <p className="mt-3 text-2xl font-black tracking-tight text-emerald-600 sm:text-3xl">
                      {formatCurrency(
                        totalPaid,
                      )}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                </div>

                <p className="mt-4 text-xs text-slate-400">
                  Successful payments
                  recorded
                </p>
              </div>

              {/* Outstanding */}

              <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:col-span-2 xl:col-span-1 sm:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Outstanding Balance
                    </p>

                    <p
                      className={`mt-3 text-2xl font-black tracking-tight sm:text-3xl ${
                        outstandingBalance >
                        0
                          ? "text-amber-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {formatCurrency(
                        outstandingBalance,
                      )}
                    </p>
                  </div>

                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      outstandingBalance >
                      0
                        ? "bg-amber-50 text-amber-600"
                        : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    {outstandingBalance >
                    0 ? (
                      <Banknote className="h-5 w-5" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5" />
                    )}
                  </div>
                </div>

                <p className="mt-4 text-xs text-slate-400">
                  {outstandingBalance >
                  0
                    ? "Amount remaining to be paid"
                    : "Your fees are fully settled"}
                </p>
              </div>
            </section>

            {/* =============================================
                PAYMENT PROGRESS
            ============================================= */}

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Payment Progress
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {paymentPercentage.toFixed(
                      1,
                    )}
                    % of your assessed
                    fees have been paid.
                  </p>
                </div>

                <p className="text-sm font-black text-brand-navy">
                  {formatCurrency(
                    totalPaid,
                  )}{" "}
                  /{" "}
                  {formatCurrency(
                    totalFees,
                  )}
                </p>
              </div>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-brand-navy transition-all duration-700"
                  style={{
                    width: `${paymentPercentage}%`,
                  }}
                />
              </div>
            </section>

            {/* =============================================
                FEE BREAKDOWN
            ============================================= */}

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Fee Breakdown
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Detailed fee assessment
                    for the selected
                    semester.
                  </p>
                </div>

                {feeBreakdown.length >
                  0 && (
                  <span className="inline-flex w-fit items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {feeBreakdown.length}{" "}
                    {feeBreakdown.length ===
                    1
                      ? "fee"
                      : "fees"}
                  </span>
                )}
              </div>

              {feeBreakdown.length >
              0 ? (
                <div className="divide-y divide-slate-100">
                  {feeBreakdown.map(
                    (fee, index) => (
                      <div
                        key={
                          fee._id ||
                          fee.id ||
                          `${getFeeCategoryName(
                            fee,
                          )}-${index}`
                        }
                        className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/5 text-brand-navy">
                            <CreditCard className="h-4 w-4" />
                          </div>

                          <div>
                            <p className="text-sm font-bold text-slate-800">
                              {getFeeCategoryName(
                                fee,
                              )}
                            </p>

                            {fee.description && (
                              <p className="mt-0.5 text-xs text-slate-400">
                                {
                                  fee.description
                                }
                              </p>
                            )}
                          </div>
                        </div>

                        <p className="text-sm font-black text-slate-900 sm:text-right">
                          {formatCurrency(
                            fee.amount,
                          )}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <div className="p-8 text-center sm:p-12">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <FileText className="h-6 w-6" />
                  </div>

                  <h3 className="mt-4 text-base font-bold text-slate-800">
                    No fee assessment
                    found
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    No fee structure has
                    been assigned to your
                    programme, level, and
                    selected semester yet.
                  </p>
                </div>
              )}
            </section>

            {/* =============================================
                PAYMENT ACTION
            ============================================= */}

            <section className="mt-6">
              {outstandingBalance >
              0 ? (
                <div className="overflow-hidden rounded-2xl bg-brand-navy shadow-lg">
                  <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:p-7">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-brand-gold">
                        <Wallet className="h-6 w-6" />
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-brand-gold">
                          Payment Required
                        </p>

                        <h2 className="mt-1 text-xl font-black text-white">
                          {formatCurrency(
                            outstandingBalance,
                          )}{" "}
                          outstanding
                        </h2>

                        <p className="mt-1 max-w-xl text-sm leading-6 text-white/65">
                          Complete your
                          outstanding school
                          fee payment for
                          this semester.
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/dashboards/student/payments/make-payment?semester=${encodeURIComponent(
                        selectedSemester,
                      )}`}
                      className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-gold px-5 text-sm font-black text-brand-navy shadow-sm transition hover:brightness-105"
                    >
                      Make Payment

                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50">
                  <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>

                      <div>
                        <h2 className="text-base font-black text-emerald-900">
                          No Outstanding
                          Balance
                        </h2>

                        <p className="mt-1 text-sm text-emerald-700">
                          There is currently
                          no outstanding
                          balance for this
                          semester.
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/dashboards/student/payments"
                      className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-emerald-700 shadow-sm ring-1 ring-emerald-200 transition hover:bg-emerald-100"
                    >
                      Payment History

                      <ArrowDownToLine className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}
            </section>

            {/* =============================================
                REFRESH
            ============================================= */}

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  void loadBalance();
                }}
                disabled={loadingBalance}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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
          </>
        )}
      </main>
    </div>
  );
}