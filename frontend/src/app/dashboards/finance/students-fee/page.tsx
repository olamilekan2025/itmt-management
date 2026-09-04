"use client";

import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CreditCard,
  DollarSign,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  UserRound,
  Users,
  WalletCards,
  X,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getSession } from "next-auth/react";

import { apiGet } from "@/lib/api";

type Programme = {
  _id: string;
  name: string;
  code: string;
};

type Semester = {
  _id: string;
  name: string;
  order: number;
};

type Student = {
  _id: string;
  name: string;
  email: string;
  matricNumber?: string;
  programme?: Programme | null;
  level?: string;
};

type FeeStatus =
  | "no_fee"
  | "outstanding"
  | "partial"
  | "paid";

type StudentFee = {
  student: Student;
  semester: Semester;
  feeAmount: number;
  totalPaid: number;
  outstanding: number;
  overpayment: number;
  status: FeeStatus;
};

type Summary = {
  totalStudents: number;
  studentsWithFees: number;
  totalFees: number;
  totalPaid: number;
  totalOutstanding: number;
  paidStudents: number;
  partialStudents: number;
  outstandingStudents: number;
  noFeeStudents: number;
};

type StudentsFeesResponse = {
  success: boolean;
  semester: Semester;
  studentsFees: StudentFee[];
  summary: Summary;
};

type SemestersResponse = {
  success: boolean;
  semesters: Semester[];
};

type ProgrammesResponse = {
  success: boolean;
  programmes: Programme[];
};

type Payment = {
  _id: string;
  amount: number;
  method: string;
  reference?: string;
  createdAt: string;
};

type PaymentsResponse = {
  success: boolean;
  payments: Payment[];
};

const EMPTY_SUMMARY: Summary = {
  totalStudents: 0,
  studentsWithFees: 0,
  totalFees: 0,
  totalPaid: 0,
  totalOutstanding: 0,
  paidStudents: 0,
  partialStudents: 0,
  outstandingStudents: 0,
  noFeeStudents: 0,
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
}

function getInitials(name?: string) {
  if (!name?.trim()) {
    return "ST";
  }

  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "ST"
  );
}

function getStatusConfig(status: FeeStatus) {
  switch (status) {
    case "paid":
      return {
        label: "Paid",
        icon: CheckCircle2,
        className:
          "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
        dot: "bg-emerald-500",
      };

    case "partial":
      return {
        label: "Partial",
        icon: Clock3,
        className:
          "bg-amber-50 text-amber-700 ring-amber-600/20",
        dot: "bg-amber-500",
      };

    case "outstanding":
      return {
        label: "Outstanding",
        icon: XCircle,
        className:
          "bg-red-50 text-red-700 ring-red-600/20",
        dot: "bg-red-500",
      };

    default:
      return {
        label: "No Fee",
        icon: AlertCircle,
        className:
          "bg-slate-100 text-slate-600 ring-slate-500/20",
        dot: "bg-slate-400",
      };
  }
}

export default function FinanceStudentsFeePage() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);

  const [selectedSemester, setSelectedSemester] =
    useState("");

  const [selectedProgramme, setSelectedProgramme] =
    useState("");

  const [search, setSearch] = useState("");

  const [studentsFees, setStudentsFees] = useState<StudentFee[]>(
    [],
  );

  const [summary, setSummary] =
    useState<Summary>(EMPTY_SUMMARY);

  const [loading, setLoading] = useState(true);
  const [loadingFees, setLoadingFees] = useState(false);
  const [error, setError] = useState("");

  const [selectedStudent, setSelectedStudent] =
    useState<StudentFee | null>(null);

  const loadFilters = useCallback(async () => {
    try {
      setError("");

      const session = await getSession();
      const accessToken = session?.accessToken;

      if (!accessToken) {
        throw new Error("Your session has expired.");
      }

      const [
        semesterResponse,
        programmeResponse,
      ] = await Promise.all([
        apiGet<SemestersResponse>(
          "/semesters",
          accessToken,
        ),
        apiGet<ProgrammesResponse>(
          "/programmes",
          accessToken,
        ),
      ]);

      const loadedSemesters =
        semesterResponse.semesters ?? [];

      const loadedProgrammes =
        programmeResponse.programmes ?? [];

      const orderedSemesters = [...loadedSemesters].sort(
        (a, b) => a.order - b.order,
      );

      setSemesters(orderedSemesters);
      setProgrammes(loadedProgrammes);

      setSelectedSemester((current) => {
        if (
          current &&
          orderedSemesters.some(
            (semester) => semester._id === current,
          )
        ) {
          return current;
        }

        return orderedSemesters[0]?._id ?? "";
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load finance filters.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStudentsFees = useCallback(async () => {
    if (!selectedSemester) {
      setStudentsFees([]);
      setSummary(EMPTY_SUMMARY);
      return;
    }

    try {
      setLoadingFees(true);
      setError("");

      const session = await getSession();
      const accessToken = session?.accessToken;

      if (!accessToken) {
        throw new Error("Your session has expired.");
      }

      const params = new URLSearchParams();

      params.set("semester", selectedSemester);

      if (selectedProgramme) {
        params.set("programme", selectedProgramme);
      }

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const response =
        await apiGet<StudentsFeesResponse>(
          `/payments/students-fees?${params.toString()}`,
          accessToken,
        );

      setStudentsFees(response.studentsFees ?? []);
      setSummary(response.summary ?? EMPTY_SUMMARY);
    } catch (err) {
      setStudentsFees([]);
      setSummary(EMPTY_SUMMARY);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load student fee records.",
      );
    } finally {
      setLoadingFees(false);
    }
  }, [
    selectedSemester,
    selectedProgramme,
    search,
  ]);

  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  useEffect(() => {
    if (!loading && selectedSemester) {
      loadStudentsFees();
    }
  }, [
    loading,
    selectedSemester,
    loadStudentsFees,
  ]);

  const selectedSemesterName = useMemo(() => {
    return (
      semesters.find(
        (semester) =>
          semester._id === selectedSemester,
      )?.name ?? "Select semester"
    );
  }, [semesters, selectedSemester]);

  const collectionRate = useMemo(() => {
    if (summary.totalFees <= 0) return 0;

    return Math.min(
      100,
      Math.round(
        (summary.totalPaid / summary.totalFees) * 100,
      ),
    );
  }, [summary.totalFees, summary.totalPaid]);

  const refresh = useCallback(async () => {
    await loadStudentsFees();
  }, [loadStudentsFees]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[1600px] space-y-6">
          <div className="h-64 animate-pulse rounded-[28px] bg-slate-200" />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-36 animate-pulse rounded-2xl bg-slate-200"
              />
            ))}
          </div>

          <div className="h-24 animate-pulse rounded-2xl bg-slate-200" />

          <div className="h-[500px] animate-pulse rounded-2xl bg-slate-200" />
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">

          {/* HERO */}
          <section className="relative overflow-hidden rounded-[28px] bg-[#071A33] px-6 py-7 text-white shadow-[0_20px_60px_-25px_rgba(7,26,51,0.5)] sm:px-8 sm:py-8 lg:px-10">
            <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[#D4AF37]/15 blur-3xl" />

            <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="absolute right-1/4 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-cyan-400/5 blur-3xl" />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3.5 py-2 text-xs font-semibold text-slate-300 shadow-inner">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#D4AF37]/15">
                    <WalletCards className="h-3.5 w-3.5 text-[#D4AF37]" />
                  </span>
                  Finance Management
                </div>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[42px]">
                  Students Fee
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                  Monitor student payments, outstanding
                  balances and fee collection across
                  academic semesters from one place.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    {summary.paidStudents} fully paid
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    {summary.partialStudents} partial
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
                    <span className="h-2 w-2 rounded-full bg-red-400" />
                    {summary.outstandingStudents} owing
                  </div>
                </div>
              </div>

              <div className="w-full shrink-0 lg:w-[280px]">
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                      Current Semester
                    </p>

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D4AF37]/10">
                      <FileText className="h-4 w-4 text-[#D4AF37]" />
                    </div>
                  </div>

                  <p className="mt-3 text-xl font-bold">
                    {selectedSemesterName}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {summary.totalStudents.toLocaleString()} registered
                    students
                  </p>

                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="text-slate-400">
                        Collection rate
                      </span>

                      <span className="font-bold text-[#D4AF37]">
                        {collectionRate}%
                      </span>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-[#D4AF37] transition-all duration-500"
                        style={{
                          width: `${collectionRate}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ERROR */}
          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100">
                <AlertCircle className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-bold">
                  Unable to load finance data
                </p>

                <p className="mt-1 text-red-600">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setError("")}
                className="rounded-lg p-1.5 transition hover:bg-red-100"
                aria-label="Dismiss error"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* SUMMARY */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Total Fees"
              value={formatCurrency(summary.totalFees)}
              subtitle={`${summary.studentsWithFees.toLocaleString()} students with fees`}
              icon={DollarSign}
              iconClass="bg-blue-50 text-blue-600"
            />

            <SummaryCard
              title="Total Collected"
              value={formatCurrency(summary.totalPaid)}
              subtitle={`${summary.paidStudents.toLocaleString()} fully paid`}
              icon={CreditCard}
              iconClass="bg-emerald-50 text-emerald-600"
            />

            <SummaryCard
              title="Outstanding"
              value={formatCurrency(summary.totalOutstanding)}
              subtitle={`${
                summary.outstandingStudents +
                summary.partialStudents
              } students owing`}
              icon={WalletCards}
              danger={summary.totalOutstanding > 0}
              iconClass="bg-red-50 text-red-600"
            />

            <SummaryCard
              title="Total Students"
              value={summary.totalStudents.toLocaleString()}
              subtitle={`${summary.partialStudents} partial payments`}
              icon={Users}
              iconClass="bg-[#D4AF37]/10 text-[#B18C17]"
            />
          </section>

          {/* FILTERS */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Fee Records
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Search and filter student payment records.
                </p>
              </div>

              {loadingFees && (
                <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Updating records...
                </div>
              )}
            </div>

            <div className="grid gap-3 lg:grid-cols-[1fr_220px_250px_auto]">
              {/* SEARCH */}
              <div>
                <label className="sr-only">
                  Search students
                </label>

                <div className="relative">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search name, email or matric number..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#D4AF37] focus:bg-white focus:ring-4 focus:ring-[#D4AF37]/10"
                  />
                </div>
              </div>

              {/* SEMESTER */}
              <div>
                <label className="sr-only">
                  Semester
                </label>

                <div className="relative">
                  <select
                    value={selectedSemester}
                    onChange={(event) =>
                      setSelectedSemester(
                        event.target.value,
                      )
                    }
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-[#D4AF37] focus:bg-white focus:ring-4 focus:ring-[#D4AF37]/10"
                  >
                    <option value="">
                      Select semester
                    </option>

                    {semesters.map((semester) => (
                      <option
                        key={semester._id}
                        value={semester._id}
                      >
                        {semester.name}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* PROGRAMME */}
              <div>
                <label className="sr-only">
                  Programme
                </label>

                <div className="relative">
                  <select
                    value={selectedProgramme}
                    onChange={(event) =>
                      setSelectedProgramme(
                        event.target.value,
                      )
                    }
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-[#D4AF37] focus:bg-white focus:ring-4 focus:ring-[#D4AF37]/10"
                  >
                    <option value="">
                      All programmes
                    </option>

                    {programmes.map((programme) => (
                      <option
                        key={programme._id}
                        value={programme._id}
                      >
                        {programme.code} —{" "}
                        {programme.name}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* REFRESH */}
              <button
                type="button"
                onClick={refresh}
                disabled={loadingFees}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 hover:text-[#071A33] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    loadingFees ? "animate-spin" : ""
                  }`}
                />

                Refresh
              </button>
            </div>
          </section>

          {/* CONTENT */}
          {loadingFees ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D4AF37]/10">
                <Loader2 className="h-7 w-7 animate-spin text-[#D4AF37]" />
              </div>

              <p className="mt-5 text-sm font-bold text-slate-800">
                Loading student fee records
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Calculating payments and outstanding balances...
              </p>
            </section>
          ) : !selectedSemester ? (
            <EmptyState
              icon={FileText}
              title="Select a semester"
              description="Choose an academic semester above to view student fee records."
            />
          ) : studentsFees.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No student records found"
              description="No students match your current semester, programme or search filters."
            />
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <section className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
                <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Student Fee Records
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Showing{" "}
                      <span className="font-semibold text-slate-700">
                        {studentsFees.length}
                      </span>{" "}
                      records for{" "}
                      <span className="font-semibold text-slate-700">
                        {selectedSemesterName}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <StatusLegend
                      dot="bg-emerald-500"
                      label="Paid"
                      count={summary.paidStudents}
                    />

                    <StatusLegend
                      dot="bg-amber-500"
                      label="Partial"
                      count={summary.partialStudents}
                    />

                    <StatusLegend
                      dot="bg-red-500"
                      label="Owing"
                      count={summary.outstandingStudents}
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px]">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/80">
                        <TableHeader>
                          Student
                        </TableHeader>

                        <TableHeader>
                          Programme
                        </TableHeader>

                        <TableHeader>
                          Level
                        </TableHeader>

                        <TableHeader align="right">
                          Fee
                        </TableHeader>

                        <TableHeader align="right">
                          Paid
                        </TableHeader>

                        <TableHeader align="right">
                          Outstanding
                        </TableHeader>

                        <TableHeader>
                          Status
                        </TableHeader>

                        <TableHeader align="right">
                          Action
                        </TableHeader>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {studentsFees.map((record) => (
                        <StudentFeeRow
                          key={`${record.student._id}-${record.semester._id}`}
                          record={record}
                          onView={() =>
                            setSelectedStudent(record)
                          }
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* MOBILE */}
              <section className="space-y-3 lg:hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Student Fee Records
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      {studentsFees.length} records
                    </p>
                  </div>

                  <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200">
                    {selectedSemesterName}
                  </span>
                </div>

                {studentsFees.map((record) => (
                  <StudentFeeMobileCard
                    key={`${record.student._id}-${record.semester._id}`}
                    record={record}
                    onView={() =>
                      setSelectedStudent(record)
                    }
                  />
                ))}
              </section>
            </>
          )}
        </div>
      </main>

      {selectedStudent && (
        <StudentFeeDetailsModal
          record={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClass,
  danger = false,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  iconClass: string;
  danger?: boolean;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-slate-400">
            {title}
          </p>

          <p
            className={`mt-2 truncate text-2xl font-bold tracking-tight ${
              danger
                ? "text-red-600"
                : "text-slate-900"
            }`}
          >
            {value}
          </p>

          <p className="mt-1.5 truncate text-xs font-medium text-slate-400">
            {subtitle}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass} transition duration-200 group-hover:scale-105`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   TABLE
========================================================= */

function TableHeader({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-4 py-3.5 text-${align} text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 first:pl-6 last:pr-6`}
    >
      {children}
    </th>
  );
}

function StatusLegend({
  dot,
  label,
  count,
}: {
  dot: string;
  label: string;
  count: number;
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-500">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      <span>{count}</span>
      <span>{label}</span>
    </div>
  );
}

function StudentFeeRow({
  record,
  onView,
}: {
  record: StudentFee;
  onView: () => void;
}) {
  const status = getStatusConfig(record.status);
  const StatusIcon = status.icon;

  return (
    <tr className="group transition hover:bg-slate-50/70">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#071A33] text-xs font-bold text-white shadow-sm">
            {getInitials(record.student.name)}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">
              {record.student.name}
            </p>

            <p className="mt-0.5 truncate text-xs text-slate-400">
              {record.student.matricNumber ||
                record.student.email}
            </p>
          </div>
        </div>
      </td>

      <td className="px-4 py-4">
        <p className="max-w-[220px] truncate text-sm font-semibold text-slate-700">
          {record.student.programme?.name ||
            "Not assigned"}
        </p>

        {record.student.programme?.code && (
          <span className="mt-1 inline-flex rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
            {record.student.programme.code}
          </span>
        )}
      </td>

      <td className="px-4 py-4">
        <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-600">
          {record.student.level || "—"}
        </span>
      </td>

      <td className="px-4 py-4 text-right">
        <span className="text-sm font-semibold text-slate-800">
          {formatCurrency(record.feeAmount)}
        </span>
      </td>

      <td className="px-4 py-4 text-right">
        <span className="text-sm font-bold text-emerald-600">
          {formatCurrency(record.totalPaid)}
        </span>
      </td>

      <td className="px-4 py-4 text-right">
        <span
          className={`text-sm font-bold ${
            record.outstanding > 0
              ? "text-red-600"
              : "text-slate-700"
          }`}
        >
          {formatCurrency(record.outstanding)}
        </span>
      </td>

      <td className="px-4 py-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-bold ring-1 ring-inset ${status.className}`}
        >
          <StatusIcon className="h-3.5 w-3.5" />
          {status.label}
        </span>
      </td>

      <td className="px-6 py-4 text-right">
        <button
          type="button"
          onClick={onView}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm transition hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 hover:text-[#071A33]"
        >
          <Eye className="h-3.5 w-3.5" />
          View
        </button>
      </td>
    </tr>
  );
}

/* =========================================================
   MOBILE CARD
========================================================= */

function StudentFeeMobileCard({
  record,
  onView,
}: {
  record: StudentFee;
  onView: () => void;
}) {
  const status = getStatusConfig(record.status);
  const StatusIcon = status.icon;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#071A33] text-xs font-bold text-white">
            {getInitials(record.student.name)}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-slate-900">
              {record.student.name}
            </h3>

            <p className="mt-0.5 truncate text-xs text-slate-400">
              {record.student.matricNumber ||
                record.student.email}
            </p>
          </div>
        </div>

        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ring-1 ring-inset ${status.className}`}
        >
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <FeeMetric
          label="Fee"
          value={formatCurrency(record.feeAmount)}
        />

        <FeeMetric
          label="Paid"
          value={formatCurrency(record.totalPaid)}
          valueClass="text-emerald-600"
        />

        <FeeMetric
          label="Outstanding"
          value={formatCurrency(record.outstanding)}
          valueClass={
            record.outstanding > 0
              ? "text-red-600"
              : "text-slate-800"
          }
        />

        <FeeMetric
          label="Level"
          value={record.student.level || "—"}
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Programme
          </p>

          <p className="mt-1 truncate text-xs font-bold text-slate-700">
            {record.student.programme?.code ||
              record.student.programme?.name ||
              "Not assigned"}
          </p>
        </div>

        <button
          type="button"
          onClick={onView}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#071A33] px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#0B2547]"
        >
          <Eye className="h-3.5 w-3.5" />
          View Details
        </button>
      </div>
    </article>
  );
}

/* =========================================================
   MOBILE METRIC
========================================================= */

function FeeMetric({
  label,
  value,
  valueClass = "text-slate-800",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 truncate text-sm font-bold ${valueClass}`}
      >
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
        <Icon className="h-7 w-7 text-slate-300" />
      </div>

      <h3 className="mt-5 text-base font-bold text-slate-800">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
    </section>
  );
}

/* =========================================================
   DETAILS MODAL
========================================================= */

function StudentFeeDetailsModal({
  record,
  onClose,
}: {
  record: StudentFee;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);

      const session = await getSession();
      const accessToken = session?.accessToken;

      if (!accessToken) {
        throw new Error("Your session has expired.");
      }

      const response =
        await apiGet<PaymentsResponse>(
          `/payments?student=${encodeURIComponent(
            record.student._id,
          )}&semester=${encodeURIComponent(
            record.semester._id,
          )}`,
          accessToken,
        );

      setPayments(response.payments ?? []);
    } catch (error) {
      console.error(
        "Load payment history error:",
        error,
      );

      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [record]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [onClose]);

  const status = getStatusConfig(record.status);
  const StatusIcon = status.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-md sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_30px_100px_-20px_rgba(0,0,0,0.45)]">
        {/* MODAL HEADER */}
        <div className="relative shrink-0 overflow-hidden bg-[#071A33] px-5 py-5 text-white sm:px-7">
          <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[#D4AF37]/10 blur-3xl" />

          <div className="relative flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-sm font-bold ring-1 ring-white/10">
                {getInitials(record.student.name)}
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#D4AF37]">
                  Student Fee Profile
                </p>

                <h2 className="mt-1 truncate text-lg font-bold sm:text-xl">
                  {record.student.name}
                </h2>

                <p className="mt-0.5 truncate text-xs text-slate-400">
                  {record.student.matricNumber ||
                    record.student.email}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Close student details"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">
          {/* STUDENT INFORMATION */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DetailItem
              icon={UserRound}
              label="Student"
              value={record.student.name}
            />

            <DetailItem
              icon={FileText}
              label="Matric Number"
              value={
                record.student.matricNumber ||
                "Not available"
              }
            />

            <DetailItem
              icon={FileText}
              label="Programme"
              value={
                record.student.programme?.name ||
                "Not assigned"
              }
            />

            <DetailItem
              icon={Users}
              label="Level"
              value={
                record.student.level ||
                "Not assigned"
              }
            />
          </div>

          {/* FEE SUMMARY */}
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#D4AF37]" />

                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                    {record.semester.name}
                  </p>
                </div>

                <h3 className="mt-1 text-lg font-bold text-slate-900">
                  Fee Summary
                </h3>
              </div>

              <span
                className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ring-inset ${status.className}`}
              >
                <StatusIcon className="h-3.5 w-3.5" />
                {status.label}
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <FeeSummary
                label="Required Fee"
                value={formatCurrency(
                  record.feeAmount,
                )}
              />

              <FeeSummary
                label="Total Paid"
                value={formatCurrency(
                  record.totalPaid,
                )}
                className="text-emerald-600"
              />

              <FeeSummary
                label="Outstanding"
                value={formatCurrency(
                  record.outstanding,
                )}
                className={
                  record.outstanding > 0
                    ? "text-red-600"
                    : "text-slate-900"
                }
              />
            </div>

            {record.overpayment > 0 && (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs text-blue-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                <p>
                  This student has an overpayment of{" "}
                  <strong>
                    {formatCurrency(
                      record.overpayment,
                    )}
                  </strong>
                  .
                </p>
              </div>
            )}
          </div>

          {/* PAYMENT HISTORY */}
          <div className="mt-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Payment History
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Transactions recorded for this
                  semester.
                </p>
              </div>

              <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                {payments.length}{" "}
                {payments.length === 1
                  ? "payment"
                  : "payments"}
              </span>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-12">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D4AF37]/10">
                    <Loader2 className="h-5 w-5 animate-spin text-[#D4AF37]" />
                  </div>

                  <p className="mt-4 text-xs font-semibold text-slate-600">
                    Loading payment history...
                  </p>
                </div>
              ) : payments.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                    <CreditCard className="h-6 w-6 text-slate-300" />
                  </div>

                  <p className="mt-4 text-sm font-bold text-slate-700">
                    No payments recorded
                  </p>

                  <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
                    There are no payment transactions for
                    this student in this semester.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {payments.map((payment) => (
                    <div
                      key={payment._id}
                      className="flex flex-col gap-3 p-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                          <CreditCard className="h-4 w-4" />
                        </div>

                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {formatCurrency(
                              payment.amount,
                            )}
                          </p>

                          <p className="mt-0.5 text-xs capitalize text-slate-400">
                            {payment.method.replace(
                              /_/g,
                              " ",
                            )}

                            {payment.reference
                              ? ` • ${payment.reference}`
                              : ""}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs font-medium text-slate-400 sm:text-right">
                        {formatDate(
                          payment.createdAt,
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DETAIL ITEM
========================================================= */

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#D4AF37]/10">
          <Icon className="h-3.5 w-3.5 text-[#B18C17]" />
        </div>

        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>
      </div>

      <p className="mt-3 truncate text-sm font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   FEE SUMMARY
========================================================= */

function FeeSummary({
  label,
  value,
  className = "text-slate-900",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p
        className={`mt-2 text-lg font-bold ${className}`}
      >
        {value}
      </p>
    </div>
  );
}

