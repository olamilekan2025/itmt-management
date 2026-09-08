"use client";

import { useCallback, useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import Link from "next/link";
import { apiGet } from "@/lib/api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Search,
  RefreshCw,
  Eye,
  WalletCards,
  CheckCircle2,
  Clock3,
  XCircle,
  AlertCircle,
  SlidersHorizontal,
  TrendingDown,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Users,
  DollarSign,
  Info,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

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

/* =========================================================
   CONSTANTS
========================================================= */

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

/* =========================================================
   HELPERS
========================================================= */

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
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
  const variants: Record<
    FeeStatus,
    {
      label: string;
      className: string;
      icon: React.ElementType;
    }
  > = {
    paid: {
      label: "Paid",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      icon: CheckCircle2,
    },
    partial: {
      label: "Partially Paid",
      className: "border-amber-200 bg-amber-50 text-amber-700",
      icon: Clock3,
    },
    outstanding: {
      label: "Outstanding",
      className: "border-red-200 bg-red-50 text-red-700",
      icon: XCircle,
    },
    no_fee: {
      label: "No Fee",
      className: "border-slate-200 bg-slate-50 text-slate-600",
      icon: AlertCircle,
    },
  };

  return variants[status];
}

/* =========================================================
   COMPONENTS
========================================================= */

function OutstandingStatusBadge({ status }: { status: FeeStatus }) {
  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge className={`rounded-full border px-3 py-1.5 shadow-none ${config.className}`}>
      <Icon className="mr-1.5 h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  className,
  valueClassName,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <Card className={`border-slate-200 bg-white shadow-sm ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              {title}
            </p>
            <p className={`text-2xl font-bold tracking-tight text-slate-900 ${valueClassName}`}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-slate-500">{subtitle}</p>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-navy/5 text-brand-navy">
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OutstandingFeesSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl border border-slate-200 p-4"
        >
          <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-1/4 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="h-8 w-20 animate-pulse rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">No Outstanding Fees</h3>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          All students matching your current filters have no outstanding balance.
        </p>
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="mt-6 gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Clear Filters
        </Button>
      </CardContent>
    </Card>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="border-red-200 bg-red-50/50 shadow-sm">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">
          Unable to load outstanding fees
        </h3>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Something went wrong while retrieving outstanding fee records. Please try again.
        </p>
        <div className="mt-6 flex gap-3">
          <Button onClick={onRetry} className="gap-2 bg-brand-navy">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Link href="/dashboards/finance/payments">
            <Button variant="outline">Back to Payments</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function OutstandingFeesPage() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);

  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedProgramme, setSelectedProgramme] = useState("");
  const [search, setSearch] = useState("");

  const [studentsFees, setStudentsFees] = useState<StudentFee[]>([]);
  const [summary, setSummary] = useState<Summary>(EMPTY_SUMMARY);

  const [loading, setLoading] = useState(true);
  const [loadingFees, setLoadingFees] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* =======================================================
     LOAD FILTERS
  ======================================================= */

  const loadFilters = useCallback(async () => {
    try {
      setError(null);

      const session = await getSession();
      const token = session?.accessToken;

      if (!token) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      const [semesterResponse, programmeResponse] = await Promise.all([
        apiGet<SemestersResponse>("/semesters", token),
        apiGet<ProgrammesResponse>("/programmes", token),
      ]);

      const loadedSemesters = semesterResponse.semesters ?? [];
      const loadedProgrammes = programmeResponse.programmes ?? [];

      const orderedSemesters = [...loadedSemesters].sort(
        (a, b) => a.order - b.order,
      );

      setSemesters(orderedSemesters);
      setProgrammes(loadedProgrammes);

      setSelectedSemester((current) => {
        if (current && orderedSemesters.some((s) => s._id === current)) {
          return current;
        }
        return orderedSemesters[0]?._id ?? "";
      });
    } catch (err) {
      console.error("Load filters error:", err);
      setError(
        err instanceof Error ? err.message : "Unable to load finance filters.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /* =======================================================
     LOAD OUTSTANDING FEES
  ======================================================= */

  const loadOutstandingFees = useCallback(async () => {
    if (!selectedSemester) {
      setStudentsFees([]);
      setSummary(EMPTY_SUMMARY);
      return;
    }

    try {
      setLoadingFees(true);
      setError(null);

      const session = await getSession();
      const token = session?.accessToken;

      if (!token) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      const params = new URLSearchParams();
      params.set("semester", selectedSemester);

      if (selectedProgramme) {
        params.set("programme", selectedProgramme);
      }

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const response = await apiGet<StudentsFeesResponse>(
        `/payments/students-fees?${params.toString()}`,
        token,
      );

      // Filter to show only outstanding and partial status students
      const outstandingFees = (response.studentsFees ?? []).filter(
        (fee) => fee.status === "outstanding" || fee.status === "partial"
      );

      setStudentsFees(outstandingFees);
      setSummary(response.summary ?? EMPTY_SUMMARY);
    } catch (err) {
      console.error("Load outstanding fees error:", err);
      setError(
        err instanceof Error ? err.message : "Unable to load outstanding fee records.",
      );
      setStudentsFees([]);
      setSummary(EMPTY_SUMMARY);
    } finally {
      setLoadingFees(false);
    }
  }, [selectedSemester, selectedProgramme, search]);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    void loadFilters();
  }, [loadFilters]);

  useEffect(() => {
    if (!loading && selectedSemester) {
      void loadOutstandingFees();
    }
  }, [loading, selectedSemester, loadOutstandingFees]);

  /* =======================================================
     HANDLERS
  ======================================================= */

  const handleRefresh = () => {
    void loadOutstandingFees();
  };

  const handleClearFilters = () => {
    setSearch("");
    setSelectedProgramme("");
  };

  /* =======================================================
     CALCULATIONS
  ======================================================= */

  const selectedSemesterName =
    semesters.find((s) => s._id === selectedSemester)?.name ?? "Select semester";

  const outstandingSummary = {
    totalOutstanding: studentsFees.reduce((sum, fee) => sum + fee.outstanding, 0),
    totalStudents: studentsFees.length,
    fullyUnpaid: studentsFees.filter((fee) => fee.status === "outstanding").length,
    partiallyPaid: studentsFees.filter((fee) => fee.status === "partial").length,
  };

  const collectionRate = summary.totalFees > 0
    ? Math.round((summary.totalPaid / summary.totalFees) * 100)
    : 0;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-10">
      {/* ===================================================
          HEADER
      =================================================== */}
      <div className="relative overflow-hidden rounded-2xl bg-brand-navy text-white shadow-lg">
        {/* Decorative background */}
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-brand-gold/10 blur-3xl" />

        <div className="relative px-6 py-7 sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-white/70 backdrop-blur">
                  Finance
                </span>
                <span className="h-1 w-1 rounded-full bg-brand-gold" />
                <span className="text-xs font-medium text-white/50">
                  Outstanding Fees
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Outstanding Fees
              </h1>
              <p className="mt-2 text-sm text-white/60">
                Monitor unpaid and partially paid student fees.
              </p>
            </div>

            {/* Header actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loadingFees}
                className="border-white/15 bg-white/10 text-white hover:bg-white/15 hover:text-white"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${loadingFees ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Link href="/dashboards/finance/payments/record">
                <Button
                  size="sm"
                  className="bg-brand-gold text-brand-navy shadow-sm hover:bg-brand-gold/90"
                >
                  <WalletCards className="mr-2 h-4 w-4" />
                  Record Payment
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================
          INFO CARD
      =================================================== */}
      <Card className="border-blue-200 bg-blue-50/50 shadow-sm">
        <CardContent className="flex items-start gap-3 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-slate-900">
              About Outstanding Fees
            </p>
            <p className="text-sm text-slate-600">
              This page displays students with unpaid or partially paid fees for the selected semester.
              Use the filters to narrow down by programme or search for specific students.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ===================================================
          SUMMARY CARDS
      =================================================== */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Outstanding"
          value={formatCurrency(outstandingSummary.totalOutstanding)}
          subtitle={`${outstandingSummary.totalStudents} students`}
          icon={TrendingDown}
          valueClassName="text-red-600"
        />
        <SummaryCard
          title="Fully Unpaid"
          value={outstandingSummary.fullyUnpaid}
          subtitle="No payment recorded"
          icon={XCircle}
          valueClassName="text-red-600"
        />
        <SummaryCard
          title="Partially Paid"
          value={outstandingSummary.partiallyPaid}
          subtitle="Has outstanding balance"
          icon={Clock3}
          valueClassName="text-amber-600"
        />
        <SummaryCard
          title="Collection Rate"
          value={`${collectionRate}%`}
          subtitle="Overall semester collection"
          icon={DollarSign}
          valueClassName="text-brand-navy"
        />
      </div>

      {/* ===================================================
          FILTER CARD
      =================================================== */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-slate-500" />
              <CardTitle className="text-base font-semibold text-slate-900">
                Filters
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-slate-500 hover:text-slate-700"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search by student name, matric number, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Semester */}
            <Select value={selectedSemester} onValueChange={(v) => setSelectedSemester(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Semester" />
              </SelectTrigger>
              <SelectContent>
                {semesters.map((semester) => (
                  <SelectItem key={semester._id} value={semester._id}>
                    {semester.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Programme */}
            <Select value={selectedProgramme} onValueChange={(v) => setSelectedProgramme(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="All Programmes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Programmes</SelectItem>
                {programmes.map((programme) => (
                  <SelectItem key={programme._id} value={programme._id}>
                    {programme.code} — {programme.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ===================================================
          OUTSTANDING FEES LIST
      =================================================== */}
      {loading && !error ? (
        <OutstandingFeesSkeleton />
      ) : error ? (
        <ErrorState onRetry={handleRefresh} />
      ) : !selectedSemester ? (
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Info className="mb-4 h-12 w-12 text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-900">Select a Semester</h3>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              Choose an academic semester to view outstanding fees.
            </p>
          </CardContent>
        </Card>
      ) : studentsFees.length === 0 ? (
        <EmptyState onClearFilters={handleClearFilters} />
      ) : (
        <>
          {/* Desktop Table */}
          <Card className="hidden border-slate-200 bg-white shadow-sm md:block">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80">
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Student
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Programme
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Level
                      </th>
                      <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Expected
                      </th>
                      <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Paid
                      </th>
                      <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Outstanding
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsFees.map((fee) => {
                      const status = getStatusConfig(fee.status);

                      return (
                        <tr
                          key={`${fee.student._id}-${fee.semester._id}`}
                          className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/70"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-white">
                                {getInitials(fee.student.name)}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-medium text-slate-900">
                                  {fee.student.name}
                                </p>
                                <p className="truncate text-xs text-slate-500">
                                  {fee.student.matricNumber || fee.student.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span className="text-slate-700">
                              {fee.student.programme?.name || "Not assigned"}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <span className="text-slate-600">
                              {fee.student.level || "—"}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-right">
                            <span className="text-slate-600">
                              {formatCurrency(fee.feeAmount)}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-right">
                            <span className="text-emerald-600">
                              {formatCurrency(fee.totalPaid)}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-right">
                            <span className="font-semibold text-red-600">
                              {formatCurrency(fee.outstanding)}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <OutstandingStatusBadge status={fee.status} />
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link href="/dashboards/finance/payments/record">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8"
                                >
                                  Record Payment
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Cards */}
          <div className="grid gap-4 md:hidden">
            {studentsFees.map((fee) => {
              const status = getStatusConfig(fee.status);
              const StatusIcon = status.icon;

              return (
                <Card
                  key={`${fee.student._id}-${fee.semester._id}`}
                  className="border-slate-200 bg-white shadow-sm"
                >
                  <CardContent className="p-4">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-white">
                          {getInitials(fee.student.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900">
                            {fee.student.name}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {fee.student.matricNumber || fee.student.email}
                          </p>
                        </div>
                      </div>
                      <OutstandingStatusBadge status={fee.status} />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-slate-500">Programme</span>
                        <span className="break-words text-right text-sm text-slate-700">
                          {fee.student.programme?.name || "Not assigned"}
                        </span>
                      </div>

                      {fee.student.level && (
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-xs text-slate-500">Level</span>
                          <span className="text-right text-sm text-slate-600">
                            {fee.student.level}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-slate-500">Expected</span>
                        <span className="break-words text-right text-sm text-slate-600">
                          {formatCurrency(fee.feeAmount)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-slate-500">Paid</span>
                        <span className="break-words text-right text-sm text-emerald-600">
                          {formatCurrency(fee.totalPaid)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-slate-500">Outstanding</span>
                        <span className="break-words text-right text-sm font-bold text-red-600">
                          {formatCurrency(fee.outstanding)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Link href="/dashboards/finance/payments/record" className="flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <WalletCards className="mr-2 h-4 w-4" />
                          Record Payment
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* ===================================================
              PAGINATION INFO
          =================================================== */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing {studentsFees.length} students with outstanding fees for {selectedSemesterName}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
