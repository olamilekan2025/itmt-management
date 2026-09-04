"use client";

import {
  AlertCircle,
  Archive,
  Banknote,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  FileText,
  Filter,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Tag,
  TrendingUp,
  WalletCards,
  X,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getSession } from "next-auth/react";

import { apiGet, apiPatch, apiPost } from "@/lib/api";

/* =========================================================
  TYPES
========================================================= */

type Programme = {
  _id: string;
  name: string;
  code?: string;
  isActive?: boolean;
};

type Semester = {
  _id: string;
  name: string;
  order?: number;
};

type FeeCategory = {
  _id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
};

type FeeStructure = {
  _id: string;

  programme:
    | string
    | {
        _id: string;
        name: string;
        code?: string;
      };

  feeCategory?:
    | string
    | {
        _id: string;
        name: string;
        code?: string;
      };

  level: string;

  semester:
    | string
    | {
        _id: string;
        name: string;
        order?: number;
      };

  amount: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type FeeStructuresResponse = {
  success: boolean;
  feeStructures: FeeStructure[];
};

type ProgrammesResponse = {
  success: boolean;
  programmes: Programme[];
};

type SemestersResponse = {
  success: boolean;
  semesters: Semester[];
};

type FeeCategoriesResponse = {
  success: boolean;
  feeCategories: FeeCategory[];
};

type CreateFeeResponse = {
  success: boolean;
  message: string;
  feeStructure: FeeStructure;
};

type ArchiveResponse = {
  success: boolean;
  message: string;
};

/* =========================================================
  HELPERS
========================================================= */

function getProgrammeName(programme: FeeStructure["programme"]) {
  if (typeof programme === "string") {
    return programme;
  }

  return programme?.name ?? "Unknown programme";
}

function getProgrammeCode(programme: FeeStructure["programme"]) {
  if (typeof programme === "string") {
    return "";
  }

  return programme?.code ?? "";
}

function getSemesterName(semester: FeeStructure["semester"]) {
  if (typeof semester === "string") {
    return semester;
  }

  return semester?.name ?? "Unknown semester";
}

function getFeeCategoryName(
  category: FeeStructure["feeCategory"],
) {
  if (!category) {
    return "Uncategorized";
  }

  if (typeof category === "string") {
    return category;
  }

  return category?.name ?? "Uncategorized";
}

function getFeeCategoryCode(
  category: FeeStructure["feeCategory"],
) {
  if (!category || typeof category === "string") {
    return "";
  }

  return category?.code ?? "";
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: string) {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

/* =========================================================
  PAGE
========================================================= */

export default function FinanceFeesPage() {
  const [feeStructures, setFeeStructures] = useState<
    FeeStructure[]
  >([]);

  const [programmes, setProgrammes] = useState<Programme[]>([]);

  const [semesters, setSemesters] = useState<Semester[]>([]);

  const [feeCategories, setFeeCategories] = useState<
    FeeCategory[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [loadingOptions, setLoadingOptions] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [programmeFilter, setProgrammeFilter] =
    useState("");

  const [semesterFilter, setSemesterFilter] =
    useState("");

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [creating, setCreating] = useState(false);

  const [archiveId, setArchiveId] = useState<
    string | null
  >(null);

  const [archiving, setArchiving] = useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [actionError, setActionError] = useState("");

  const [form, setForm] = useState({
    programme: "",
    feeCategory: "",
    level: "",
    semester: "",
    amount: "",
    description: "",
  });

  /* =========================================================
    FETCH FEE STRUCTURES
  ========================================================= */

  const fetchFeeStructures = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const session = await getSession();

      const accessToken = session?.accessToken;

      if (!accessToken) {
        throw new Error(
          "Your session has expired. Please sign in again.",
        );
      }

      const query = new URLSearchParams();

      if (programmeFilter) {
        query.set("programme", programmeFilter);
      }

      if (semesterFilter) {
        query.set("semester", semesterFilter);
      }

      const endpoint = query.toString()
        ? `/fee-structures?${query.toString()}`
        : "/fee-structures";

      const response =
        await apiGet<FeeStructuresResponse>(
          endpoint,
          accessToken,
        );

      setFeeStructures(
        response.feeStructures ?? [],
      );
    } catch (err) {
      console.error(
        "Fetch fee structures error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load fee structures.",
      );
    } finally {
      setLoading(false);
    }
  }, [programmeFilter, semesterFilter]);

  /* =========================================================
    FETCH PROGRAMMES + SEMESTERS + FEE CATEGORIES
  ========================================================= */

  const fetchOptions = useCallback(async () => {
    try {
      setLoadingOptions(true);
      setActionError("");

      const session = await getSession();

      const accessToken = session?.accessToken;

      if (!accessToken) {
        throw new Error(
          "Your session has expired. Please sign in again.",
        );
      }

      const [
        programmeResponse,
        semesterResponse,
        feeCategoryResponse,
      ] = await Promise.all([
        apiGet<ProgrammesResponse>(
          "/programmes",
          accessToken,
        ),

        apiGet<SemestersResponse>(
          "/semesters",
          accessToken,
        ),

        apiGet<FeeCategoriesResponse>(
          "/fee-categories?isActive=true",
          accessToken,
        ),
      ]);

      setProgrammes(
        programmeResponse.programmes ?? [],
      );

      setSemesters(
        semesterResponse.semesters ?? [],
      );

      setFeeCategories(
        feeCategoryResponse.feeCategories ?? [],
      );
    } catch (err) {
      console.error(
        "Fetch fee options error:",
        err,
      );

      setActionError(
        err instanceof Error
          ? err.message
          : "Unable to load programmes, semesters, and fee categories.",
      );
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  /* =========================================================
    INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    const load = async () => {
      await Promise.all([
        fetchFeeStructures(),
        fetchOptions(),
      ]);
    };

    void load();
  }, [fetchFeeStructures, fetchOptions]);

  /* =========================================================
    CREATE FEE STRUCTURE
  ========================================================= */

  async function handleCreateFee(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    setCreating(true);
    setActionError("");
    setSuccessMessage("");

    try {
      const session = await getSession();

      const accessToken = session?.accessToken;

      if (!accessToken) {
        throw new Error(
          "Your session has expired. Please sign in again.",
        );
      }

      const amount = Number(form.amount);

      if (!form.feeCategory) {
        throw new Error(
          "Please select a fee category.",
        );
      }

      if (!form.programme) {
        throw new Error(
          "Please select a programme.",
        );
      }

      if (!form.level.trim()) {
        throw new Error(
          "Please enter the student level.",
        );
      }

      if (!form.semester) {
        throw new Error(
          "Please select a semester.",
        );
      }

      if (
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        throw new Error(
          "Enter a valid fee amount.",
        );
      }

      if (feeCategories.length === 0) {
        throw new Error(
          "No active fee categories are available. Create or activate a fee category first.",
        );
      }

      const response =
        await apiPost<CreateFeeResponse>(
          "/fee-structures",
          {
            feeCategory: form.feeCategory,
            programme: form.programme,
            level: form.level.trim(),
            semester: form.semester,
            amount,
            ...(form.description.trim()
              ? {
                  description:
                    form.description.trim(),
                }
              : {}),
          },
          accessToken,
        );

      setSuccessMessage(
        response.message ||
          "Fee structure created successfully.",
      );

      setForm({
        programme: "",
        feeCategory: "",
        level: "",
        semester: "",
        amount: "",
        description: "",
      });

      setShowCreateModal(false);

      await fetchFeeStructures();
    } catch (err) {
      console.error(
        "Create fee structure error:",
        err,
      );

      setActionError(
        err instanceof Error
          ? err.message
          : "Unable to create fee structure.",
      );
    } finally {
      setCreating(false);
    }
  }

  /* =========================================================
    ARCHIVE FEE STRUCTURE
  ========================================================= */

  async function handleArchive() {
    if (!archiveId) {
      return;
    }

    setArchiving(true);
    setActionError("");
    setSuccessMessage("");

    try {
      const session = await getSession();

      const accessToken = session?.accessToken;

      if (!accessToken) {
        throw new Error(
          "Your session has expired. Please sign in again.",
        );
      }

      const response =
        await apiPatch<ArchiveResponse>(
          `/fee-structures/${archiveId}/archive`,
          {},
          accessToken,
        );

      setSuccessMessage(
        response.message ||
          "Fee structure archived successfully.",
      );

      setArchiveId(null);

      await fetchFeeStructures();
    } catch (err) {
      console.error(
        "Archive fee structure error:",
        err,
      );

      setActionError(
        err instanceof Error
          ? err.message
          : "Unable to archive fee structure.",
      );
    } finally {
      setArchiving(false);
    }
  }

  /* =========================================================
    CLIENT-SIDE SEARCH
  ========================================================= */

  const filteredFeeStructures = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return feeStructures;
    }

    return feeStructures.filter((fee) => {
      const programmeName =
        getProgrammeName(
          fee.programme,
        ).toLowerCase();

      const programmeCode =
        getProgrammeCode(
          fee.programme,
        ).toLowerCase();

      const semesterName =
        getSemesterName(
          fee.semester,
        ).toLowerCase();

      const categoryName =
        getFeeCategoryName(
          fee.feeCategory,
        ).toLowerCase();

      const categoryCode =
        getFeeCategoryCode(
          fee.feeCategory,
        ).toLowerCase();

      const level =
        fee.level.toLowerCase();

      const description =
        fee.description?.toLowerCase() ?? "";

      return (
        programmeName.includes(term) ||
        programmeCode.includes(term) ||
        semesterName.includes(term) ||
        categoryName.includes(term) ||
        categoryCode.includes(term) ||
        level.includes(term) ||
        description.includes(term)
      );
    });
  }, [feeStructures, search]);

  /* =========================================================
    STATISTICS
  ========================================================= */

  const statistics = useMemo(() => {
    const totalValue =
      feeStructures.reduce(
        (sum, fee) =>
          sum + Number(fee.amount || 0),
        0,
      );

    const programmeCount = new Set(
      feeStructures.map((fee) =>
        typeof fee.programme === "string"
          ? fee.programme
          : fee.programme?._id,
      ),
    ).size;

    const categoryCount = new Set(
      feeStructures
        .map((fee) => {
          if (!fee.feeCategory) {
            return null;
          }

          if (
            typeof fee.feeCategory === "string"
          ) {
            return fee.feeCategory;
          }

          return fee.feeCategory._id;
        })
        .filter(Boolean),
    ).size;

    const average =
      feeStructures.length > 0
        ? totalValue /
          feeStructures.length
        : 0;

    return {
      active: feeStructures.length,
      totalValue,
      programmeCount,
      categoryCount,
      average,
    };
  }, [feeStructures]);

  /* =========================================================
    RESET FILTERS
  ========================================================= */

  function clearFilters() {
    setSearch("");
    setProgrammeFilter("");
    setSemesterFilter("");
  }

  /* =========================================================
    OPEN CREATE MODAL
  ========================================================= */

  function openCreateModal() {
    setActionError("");
    setSuccessMessage("");

    setForm({
      programme: "",
      feeCategory: "",
      level: "",
      semester: "",
      amount: "",
      description: "",
    });

    setShowCreateModal(true);
  }

  /* =========================================================
    RENDER
  ========================================================= */

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden rounded-3xl bg-brand-navy p-6 shadow-xl sm:p-8">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />

        <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-brand-gold">
              <WalletCards className="h-4 w-4" />

              Finance Management
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Fee Structures
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
              Configure and manage academic fees by
              category, programme, level, and
              semester.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-gold px-5 text-sm font-semibold text-brand-navy shadow-lg transition hover:bg-yellow-400 hover:shadow-xl"
          >
            <Plus className="h-5 w-5" />

            Create Fee Structure
          </button>
        </div>
      </section>

      {/* =====================================================
          ALERTS
      ===================================================== */}

      {successMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

          <div className="flex-1">
            <p className="font-semibold">
              Success
            </p>

            <p className="mt-0.5">
              {successMessage}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setSuccessMessage("")
            }
            className="rounded-lg p-1 hover:bg-emerald-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <div className="flex-1">
            <p className="font-semibold">
              Action failed
            </p>

            <p className="mt-0.5">
              {actionError}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setActionError("")
            }
            className="rounded-lg p-1 hover:bg-red-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Active Structures"
          value={statistics.active.toString()}
          description="Currently configured"
          icon={FileText}
          iconClass="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Total Fee Value"
          value={formatCurrency(
            statistics.totalValue,
          )}
          description="Across active structures"
          icon={CircleDollarSign}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Programmes Covered"
          value={statistics.programmeCount.toString()}
          description="With configured fees"
          icon={BookOpen}
          iconClass="bg-amber-50 text-amber-600"
        />

        <StatCard
          title="Fee Categories"
          value={statistics.categoryCount.toString()}
          description="Categories currently used"
          icon={Tag}
          iconClass="bg-violet-50 text-violet-600"
        />
      </section>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              Fee Structures
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Search and filter configured academic
              fees.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void fetchFeeStructures()
            }
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </button>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search category, programme, level, semester..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-navy/10"
            />
          </div>

          <SelectField
            value={programmeFilter}
            onChange={setProgrammeFilter}
            disabled={loadingOptions}
            icon={
              <BookOpen className="h-4 w-4" />
            }
            placeholder="All programmes"
            options={programmes.map(
              (programme) => ({
                value: programme._id,
                label: programme.code
                  ? `${programme.code} — ${programme.name}`
                  : programme.name,
              }),
            )}
          />

          <SelectField
            value={semesterFilter}
            onChange={setSemesterFilter}
            disabled={loadingOptions}
            icon={
              <Filter className="h-4 w-4" />
            }
            placeholder="All semesters"
            options={semesters
              .slice()
              .sort(
                (a, b) =>
                  (a.order ?? 999) -
                  (b.order ?? 999),
              )
              .map((semester) => ({
                value: semester._id,
                label: semester.name,
              }))}
          />

          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <X className="h-4 w-4" />

            Clear
          </button>
        </div>
      </section>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-slate-900">
                Configured Fees
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {loading
                  ? "Loading fee structures..."
                  : `${filteredFeeStructures.length} ${
                      filteredFeeStructures.length ===
                      1
                        ? "structure"
                        : "structures"
                    } found`}
              </p>
            </div>

            <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              Active only
            </div>
          </div>
        </div>

        {loading ? (
          <FeeTableSkeleton />
        ) : error ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 rounded-2xl bg-red-50 p-4">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>

            <h3 className="font-semibold text-slate-900">
              Unable to load fee structures
            </h3>

            <p className="mt-2 max-w-md text-sm text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                void fetchFeeStructures()
              }
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95"
            >
              <RefreshCw className="h-4 w-4" />

              Try again
            </button>
          </div>
        ) : filteredFeeStructures.length ===
          0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 rounded-2xl bg-slate-100 p-4">
              <WalletCards className="h-8 w-8 text-slate-500" />
            </div>

            <h3 className="font-semibold text-slate-900">
              {search ||
              programmeFilter ||
              semesterFilter
                ? "No matching fee structures"
                : "No fee structures yet"}
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              {search ||
              programmeFilter ||
              semesterFilter
                ? "Try adjusting your search or filters."
                : "Create your first fee structure to start managing academic fees."}
            </p>

            {search ||
            programmeFilter ||
            semesterFilter ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Clear filters
              </button>
            ) : (
              <button
                type="button"
                onClick={openCreateModal}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95"
              >
                <Plus className="h-4 w-4" />

                Create Fee Structure
              </button>
            )}
          </div>
        ) : (
          <>
            {/* =================================================
                DESKTOP TABLE
            ================================================= */}

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1250px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Programme
                    </th>

                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Category
                    </th>

                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Level
                    </th>

                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Semester
                    </th>

                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Amount
                    </th>

                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Description
                    </th>

                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Created
                    </th>

                    <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredFeeStructures.map(
                    (fee) => (
                      <tr
                        key={fee._id}
                        className="transition hover:bg-slate-50/70"
                      >
                        {/* Programme */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-white">
                              <BookOpen className="h-4 w-4" />
                            </div>

                            <div>
                              <p className="font-semibold text-slate-900">
                                {getProgrammeName(
                                  fee.programme,
                                )}
                              </p>

                              {getProgrammeCode(
                                fee.programme,
                              ) && (
                                <p className="mt-0.5 text-xs font-medium text-brand-navy">
                                  {getProgrammeCode(
                                    fee.programme,
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                              <Tag className="h-4 w-4" />
                            </div>

                            <div>
                              <p className="font-semibold text-slate-800">
                                {getFeeCategoryName(
                                  fee.feeCategory,
                                )}
                              </p>

                              {getFeeCategoryCode(
                                fee.feeCategory,
                              ) && (
                                <p className="mt-0.5 text-xs font-medium text-violet-600">
                                  {getFeeCategoryCode(
                                    fee.feeCategory,
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Level */}

                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                            {fee.level}
                          </span>
                        </td>

                        {/* Semester */}

                        <td className="px-5 py-4 text-sm font-medium text-slate-700">
                          {getSemesterName(
                            fee.semester,
                          )}
                        </td>

                        {/* Amount */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Banknote className="h-4 w-4 text-emerald-600" />

                            <span className="font-bold text-slate-900">
                              {formatCurrency(
                                fee.amount,
                              )}
                            </span>
                          </div>
                        </td>

                        {/* Description */}

                        <td className="max-w-[220px] px-5 py-4">
                          <p
                            className="truncate text-sm text-slate-500"
                            title={
                              fee.description ||
                              undefined
                            }
                          >
                            {fee.description ||
                              "No description"}
                          </p>
                        </td>

                        {/* Status */}

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                            Active
                          </span>
                        </td>

                        {/* Created */}

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {formatDate(
                            fee.createdAt,
                          )}
                        </td>

                        {/* Action */}

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setArchiveId(
                                fee._id,
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                          >
                            <Archive className="h-3.5 w-3.5" />

                            Archive
                          </button>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            {/* =================================================
                MOBILE / TABLET CARDS
            ================================================= */}

            <div className="divide-y divide-slate-100 lg:hidden">
              {filteredFeeStructures.map(
                (fee) => (
                  <div
                    key={fee._id}
                    className="p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-white">
                          <BookOpen className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">
                            {getProgrammeName(
                              fee.programme,
                            )}
                          </p>

                          <p className="mt-0.5 text-xs text-brand-navy">
                            {getProgrammeCode(
                              fee.programme,
                            ) ||
                              "Programme"}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        Active
                      </span>
                    </div>

                    {/* Category */}

                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-violet-100 bg-violet-50/60 px-3 py-2.5">
                      <Tag className="h-4 w-4 text-violet-600" />

                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-500">
                          Fee Category
                        </p>

                        <p className="truncate text-sm font-semibold text-violet-900">
                          {getFeeCategoryName(
                            fee.feeCategory,
                          )}

                          {getFeeCategoryCode(
                            fee.feeCategory,
                          ) && (
                            <span className="ml-1 text-xs font-medium text-violet-600">
                              (
                              {getFeeCategoryCode(
                                fee.feeCategory,
                              )}
                              )
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4">
                      <InfoItem
                        label="Level"
                        value={fee.level}
                      />

                      <InfoItem
                        label="Semester"
                        value={getSemesterName(
                          fee.semester,
                        )}
                      />

                      <InfoItem
                        label="Amount"
                        value={formatCurrency(
                          fee.amount,
                        )}
                        highlighted
                      />

                      <InfoItem
                        label="Created"
                        value={formatDate(
                          fee.createdAt,
                        )}
                      />
                    </div>

                    {fee.description && (
                      <div className="mt-4 rounded-xl bg-slate-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Description
                        </p>

                        <p className="mt-1 text-sm text-slate-600">
                          {fee.description}
                        </p>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setArchiveId(
                          fee._id,
                        )
                      }
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                    >
                      <Archive className="h-4 w-4" />

                      Archive Fee Structure
                    </button>
                  </div>
                ),
              )}
            </div>
          </>
        )}
      </section>

      {/* =====================================================
          INFORMATION PANEL
      ===================================================== */}

      <section className="rounded-2xl border border-brand-navy/10 bg-brand-navy/[0.03] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-brand-gold">
            <ShieldCheck className="h-5 w-5" />
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">
              Fee structure management
            </h3>

            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
              Each fee structure is linked to a fee
              category, programme, student level, and
              semester. The system allows different
              categories such as tuition, registration,
              examination, and other academic charges
              for the same programme, level, and
              semester. Duplicate structures should be
              prevented for the same category,
              programme, level, and semester combination.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          CREATE MODAL
      ===================================================== */}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-fee-title"
            className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            {/* Modal Header */}

            <div className="bg-brand-navy px-6 py-5 sm:px-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-brand-gold">
                    <CircleDollarSign className="h-4 w-4" />

                    Finance Management
                  </div>

                  <h2
                    id="create-fee-title"
                    className="text-xl font-bold text-white"
                  >
                    Create Fee Structure
                  </h2>

                  <p className="mt-1 text-sm text-white/65">
                    Configure an academic fee by
                    category, programme, level, and
                    semester.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!creating) {
                      setShowCreateModal(
                        false,
                      );
                    }
                  }}
                  disabled={creating}
                  className="rounded-xl p-2 text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateFee}>
              <div className="max-h-[70vh] overflow-y-auto p-6 sm:p-7">
                <div className="grid gap-5 sm:grid-cols-2">
                  {/* Programme */}

                  <FormField
                    label="Programme"
                    required
                  >
                    <div className="relative">
                      <BookOpen className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <select
                        value={
                          form.programme
                        }
                        onChange={(e) =>
                          setForm(
                            (current) => ({
                              ...current,
                              programme:
                                e.target
                                  .value,
                            }),
                          )
                        }
                        disabled={
                          loadingOptions ||
                          creating
                        }
                        className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-900 outline-none transition focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-navy/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="">
                          {loadingOptions
                            ? "Loading programmes..."
                            : "Select programme"}
                        </option>

                        {programmes.map(
                          (
                            programme,
                          ) => (
                            <option
                              key={
                                programme._id
                              }
                              value={
                                programme._id
                              }
                            >
                              {programme.code
                                ? `${programme.code} — ${programme.name}`
                                : programme.name}
                            </option>
                          ),
                        )}
                      </select>

                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                  </FormField>

                  {/* Fee Category */}

                  <FormField
                    label="Fee Category"
                    required
                  >
                    <div className="relative">
                      <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <select
                        value={
                          form.feeCategory
                        }
                        onChange={(e) =>
                          setForm(
                            (current) => ({
                              ...current,
                              feeCategory:
                                e.target
                                  .value,
                            }),
                          )
                        }
                        disabled={
                          loadingOptions ||
                          creating ||
                          feeCategories.length ===
                            0
                        }
                        className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-900 outline-none transition focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-navy/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="">
                          {loadingOptions
                            ? "Loading categories..."
                            : feeCategories.length ===
                              0
                            ? "No active categories"
                            : "Select fee category"}
                        </option>

                        {feeCategories.map(
                          (
                            category,
                          ) => (
                            <option
                              key={
                                category._id
                              }
                              value={
                                category._id
                              }
                            >
                              {category.code
                                ? `${category.code} — ${category.name}`
                                : category.name}
                            </option>
                          ),
                        )}
                      </select>

                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>

                    {!loadingOptions &&
                      feeCategories.length ===
                        0 && (
                        <p className="mt-2 text-xs leading-5 text-red-600">
                          No active fee categories
                          are available. Create or
                          activate a category from
                          the Fee Categories page
                          before creating a fee
                          structure.
                        </p>
                      )}
                  </FormField>

                  {/* Level */}

                  <FormField
                    label="Level"
                    required
                  >
                    <input
                      type="text"
                      value={form.level}
                      onChange={(e) =>
                        setForm(
                          (current) => ({
                            ...current,
                            level: e.target
                              .value,
                          }),
                        )
                      }
                      disabled={creating}
                      placeholder="e.g. ND I, ND II, HND I"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-navy/10 disabled:opacity-60"
                    />
                  </FormField>

                  {/* Semester */}

                  <FormField
                    label="Semester"
                    required
                  >
                    <div className="relative">
                      <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <select
                        value={
                          form.semester
                        }
                        onChange={(e) =>
                          setForm(
                            (current) => ({
                              ...current,
                              semester:
                                e.target
                                  .value,
                            }),
                          )
                        }
                        disabled={
                          loadingOptions ||
                          creating
                        }
                        className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-900 outline-none transition focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-navy/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="">
                          {loadingOptions
                            ? "Loading semesters..."
                            : "Select semester"}
                        </option>

                        {semesters
                          .slice()
                          .sort(
                            (a, b) =>
                              (a.order ??
                                999) -
                              (b.order ??
                                999),
                          )
                          .map(
                            (
                              semester,
                            ) => (
                              <option
                                key={
                                  semester._id
                                }
                                value={
                                  semester._id
                                }
                              >
                                {
                                  semester.name
                                }
                              </option>
                            ),
                          )}
                      </select>

                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                  </FormField>

                  {/* Amount */}

                  <FormField
                    label="Fee Amount"
                    required
                  >
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                        ₦
                      </span>

                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={
                          form.amount
                        }
                        onChange={(e) =>
                          setForm(
                            (current) => ({
                              ...current,
                              amount:
                                e.target
                                  .value,
                            }),
                          )
                        }
                        disabled={creating}
                        placeholder="0.00"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-navy/10 disabled:opacity-60"
                      />
                    </div>
                  </FormField>

                  {/* Description */}

                  <div className="sm:col-span-2">
                    <FormField label="Description">
                      <textarea
                        value={
                          form.description
                        }
                        onChange={(e) =>
                          setForm(
                            (current) => ({
                              ...current,
                              description:
                                e.target
                                  .value,
                            }),
                          )
                        }
                        disabled={creating}
                        rows={4}
                        maxLength={300}
                        placeholder="Optional description for this fee structure..."
                        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-navy/10 disabled:opacity-60"
                      />

                      <p className="mt-1 text-right text-xs text-slate-400">
                        {
                          form
                            .description
                            .length
                        }
                        /300
                      </p>
                    </FormField>
                  </div>
                </div>

                {/* =================================================
                    PREVIEW
                ================================================= */}

                {(form.amount ||
                  form.programme ||
                  form.feeCategory ||
                  form.level ||
                  form.semester) && (
                  <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Fee Preview
                      </p>

                      {form.feeCategory && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">
                          <Tag className="h-3 w-3" />

                          {feeCategories.find(
                            (item) =>
                              item._id ===
                              form.feeCategory,
                          )?.code ||
                            "Category"}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {programmes.find(
                            (item) =>
                              item._id ===
                              form.programme,
                          )?.name ||
                            "Selected programme"}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {form.feeCategory
                            ? feeCategories.find(
                                (
                                  item,
                                ) =>
                                  item._id ===
                                  form.feeCategory,
                              )?.name ||
                              "Fee category"
                            : "Fee category"}{" "}
                          •{" "}
                          {form.level ||
                            "Level"}{" "}
                          •{" "}
                          {semesters.find(
                            (item) =>
                              item._id ===
                              form.semester,
                          )?.name ||
                            "Semester"}
                        </p>
                      </div>

                      <p className="text-xl font-bold text-brand-navy">
                        {form.amount
                          ? formatCurrency(
                              Number(
                                form.amount,
                              ),
                            )
                          : "₦0.00"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:justify-end sm:px-7">
                <button
                  type="button"
                  onClick={() =>
                    setShowCreateModal(
                      false,
                    )
                  }
                  disabled={creating}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    creating ||
                    loadingOptions ||
                    feeCategories.length ===
                      0
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />

                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />

                      Create Fee Structure
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          ARCHIVE CONFIRMATION
      ========================================================= */}

      {archiveId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-7">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
              <Archive className="h-6 w-6 text-red-600" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Archive fee structure?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              This will deactivate the selected fee
              structure. It will no longer appear in
              the active fee structures list or be used
              by the current fee calculation.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setArchiveId(null)
                }
                disabled={archiving}
                className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() =>
                  void handleArchive()
                }
                disabled={archiving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {archiving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />

                    Archiving...
                  </>
                ) : (
                  <>
                    <Archive className="h-4 w-4" />

                    Archive Structure
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
  STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClass,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
  SELECT FIELD
========================================================= */

function SelectField({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  icon,
}: {
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
  placeholder: string;
  disabled?: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400">
        {icon}
      </div>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        disabled={disabled}
        className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-700 outline-none transition focus:border-brand-navy focus:bg-white focus:ring-2 focus:ring-brand-navy/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value="">
          {placeholder}
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

/* =========================================================
  FORM FIELD
========================================================= */

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

/* =========================================================
  INFO ITEM
========================================================= */

function InfoItem({
  label,
  value,
  highlighted,
}: {
  label: string;
  value: string;
  highlighted?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-semibold ${
          highlighted
            ? "text-emerald-600"
            : "text-slate-700"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

/* =========================================================
  TABLE SKELETON
========================================================= */

function FeeTableSkeleton() {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: 6 }).map(
        (_, index) => (
          <div
            key={index}
            className="flex items-center gap-5 px-5 py-5"
          >
            <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />

            <div className="flex-1">
              <div className="h-4 w-48 animate-pulse rounded bg-slate-100" />

              <div className="mt-2 h-3 w-24 animate-pulse rounded bg-slate-100" />
            </div>

            <div className="hidden h-7 w-24 animate-pulse rounded-lg bg-slate-100 md:block" />

            <div className="hidden h-7 w-20 animate-pulse rounded-lg bg-slate-100 md:block" />

            <div className="hidden h-4 w-28 animate-pulse rounded bg-slate-100 lg:block" />

            <div className="hidden h-4 w-28 animate-pulse rounded bg-slate-100 lg:block" />

            <div className="h-8 w-20 animate-pulse rounded-full bg-slate-100" />
          </div>
        ),
      )}
    </div>
  );
}