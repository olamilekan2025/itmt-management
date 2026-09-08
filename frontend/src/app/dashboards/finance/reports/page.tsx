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
  FileText,
  Download,
  Printer,
  WalletCards,
  CheckCircle2,
  Clock3,
  XCircle,
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Receipt,
  RotateCcw,
  Info,
  BarChart3,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type PaymentMethod =
  | "cash"
  | "bank_transfer"
  | "card"
  | "other";

type PaymentStatus =
  | "pending"
  | "successful"
  | "failed"
  | "refunded"
  | "cancelled";

type PaymentPurpose =
  | "tuition"
  | "registration"
  | "examination"
  | "acceptance"
  | "transcript"
  | "certificate"
  | "hostel"
  | "other";

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

type Payment = {
  _id: string;

  student?: {
    _id: string;
    name: string;
    matricNumber?: string;
    email: string;
  };

  semester?: {
    _id: string;
    name: string;
  };

  academicSession?: {
    _id: string;
    name: string;
  };

  programme?: {
    _id: string;
    name: string;
    code: string;
  };

  department?: {
    _id: string;
    name: string;
    code: string;
  };

  amount: number;
  currency: string;

  method: PaymentMethod;
  purpose: PaymentPurpose;

  paymentReference: string;
  invoiceNumber?: string;

  status: PaymentStatus;

  notes?: string;

  recordedBy?: {
    name: string;
  };

  verifiedBy?: {
    name: string;
  };

  paidAt?: string;
  createdAt: string;
};

type PaymentsResponse = {
  success: boolean;
  payments: Payment[];

  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

type DashboardResponse = {
  success: boolean;
  summary?: {
    totalRevenue: number;
    todayRevenue: number;
    monthlyRevenue: number;
    totalPayments: number;
    outstandingAmount: number;
    studentsWithOutstanding: number;
  };
  paymentMethods?: Array<{
    _id: string;
    amount: number;
    count: number;
  }>;
  revenueByMonth?: Array<{
    year: number;
    month: number;
    amount: number;
    count: number;
  }>;
  recentPayments?: Payment[];
};

type SemestersResponse = {
  success: boolean;
  semesters: Semester[];
};

type ProgrammesResponse = {
  success: boolean;
  programmes: Programme[];
};

type ReportType =
  | "payment-collection"
  | "outstanding-fees"
  | "refunds"
  | "failed-payments";

/* =========================================================
   CONSTANTS
========================================================= */

const REPORT_TYPES: Record<
  ReportType,
  { label: string; description: string; icon: React.ElementType }
> = {
  "payment-collection": {
    label: "Payment Collection Report",
    description: "View all collected payments with detailed breakdown",
    icon: WalletCards,
  },
  "outstanding-fees": {
    label: "Outstanding Fees Report",
    description: "Track unpaid and partially paid student fees",
    icon: TrendingDown,
  },
  refunds: {
    label: "Refund Report",
    description: "View all refunded payments and refund history",
    icon: RotateCcw,
  },
  "failed-payments": {
    label: "Failed Payments Report",
    description: "Review failed and cancelled payment transactions",
    icon: XCircle,
  },
};

const STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pending",
  successful: "Successful",
  failed: "Failed",
  refunded: "Refunded",
  cancelled: "Cancelled",
};

const PURPOSE_LABELS: Record<PaymentPurpose, string> = {
  tuition: "Tuition",
  registration: "Registration",
  examination: "Examination",
  acceptance: "Acceptance",
  transcript: "Transcript",
  certificate: "Certificate",
  hostel: "Hostel",
  other: "Other",
};

const METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  bank_transfer: "Bank Transfer",
  card: "Card",
  other: "Other",
};

/* =========================================================
   HELPERS
========================================================= */

function formatCurrency(amount: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

function getStatusConfig(status: PaymentStatus) {
  const variants: Record<
    PaymentStatus,
    {
      label: string;
      className: string;
      icon: React.ElementType;
    }
  > = {
    pending: {
      label: "Pending",
      className: "border-amber-200 bg-amber-50 text-amber-700",
      icon: Clock3,
    },
    successful: {
      label: "Successful",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      icon: CheckCircle2,
    },
    failed: {
      label: "Failed",
      className: "border-red-200 bg-red-50 text-red-700",
      icon: XCircle,
    },
    refunded: {
      label: "Refunded",
      className: "border-purple-200 bg-purple-50 text-purple-700",
      icon: RotateCcw,
    },
    cancelled: {
      label: "Cancelled",
      className: "border-slate-200 bg-slate-50 text-slate-600",
      icon: XCircle,
    },
  };

  return variants[status];
}

function getMethodIcon(method: PaymentMethod) {
  switch (method) {
    case "cash":
      return WalletCards;
    case "bank_transfer":
      return TrendingUp;
    case "card":
      return Receipt;
    default:
      return FileText;
  }
}

/* =========================================================
   COMPONENTS
========================================================= */

function ReportStatusBadge({ status }: { status: PaymentStatus }) {
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

function ReportSkeleton() {
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
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <FileText className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">No Report Data</h3>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          There are no financial records matching your selected filters. Try changing the report type, date range, or filters.
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
          Unable to generate report
        </h3>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          We couldn't retrieve the financial report right now. Please try again.
        </p>
        <div className="mt-6 flex gap-3">
          <Button onClick={onRetry} className="gap-2 bg-brand-navy">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Link href="/dashboards/finance">
            <Button variant="outline">Back to Finance</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function FinanceReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("payment-collection");
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);

  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedProgramme, setSelectedProgramme] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedMethod, setSelectedMethod] = useState("all");
  const [selectedPurpose, setSelectedPurpose] = useState("all");
  const [search, setSearch] = useState("");

  const [payments, setPayments] = useState<Payment[]>([]);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

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
        err instanceof Error ? err.message : "Unable to load report filters.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /* =======================================================
     LOAD REPORT
  ======================================================= */

  const loadReport = useCallback(async () => {
    try {
      setLoadingReport(true);
      setError(null);

      const session = await getSession();
      const token = session?.accessToken;

      if (!token) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", String(limit));

      // Apply report-specific filters
      if (reportType === "refunds") {
        params.append("status", "refunded");
      } else if (reportType === "failed-payments") {
        params.append("status", "failed");
      } else if (reportType === "payment-collection") {
        params.append("status", "successful");
      }

      if (selectedSemester) params.append("semester", selectedSemester);
      if (selectedProgramme) params.append("programme", selectedProgramme);
      if (selectedStatus !== "all") params.append("status", selectedStatus);
      if (selectedMethod !== "all") params.append("method", selectedMethod);
      if (selectedPurpose !== "all") params.append("purpose", selectedPurpose);
      if (search.trim()) params.append("search", search.trim());

      const response = await apiGet<PaymentsResponse>(
        `/payments?${params.toString()}`,
        token,
      );

      setPayments(response.payments || []);
      setTotal(response.pagination?.total || 0);
      setTotalPages(response.pagination?.totalPages || 0);

      // Load dashboard summary for payment collection report
      if (reportType === "payment-collection") {
        const dashboardResponse = await apiGet<DashboardResponse>(
          "/payments/dashboard",
          token,
        );
        setDashboard(dashboardResponse);
      }
    } catch (err) {
      console.error("Load report error:", err);
      setError(
        err instanceof Error ? err.message : "Unable to generate report.",
      );
      setPayments([]);
      setDashboard(null);
    } finally {
      setLoadingReport(false);
    }
  }, [
    reportType,
    selectedSemester,
    selectedProgramme,
    selectedStatus,
    selectedMethod,
    selectedPurpose,
    search,
    page,
    limit,
  ]);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    void loadFilters();
  }, [loadFilters]);

  useEffect(() => {
    if (!loading) {
      void loadReport();
    }
  }, [loading, loadReport]);

  /* =======================================================
     HANDLERS
  ======================================================= */

  const handleRefresh = () => {
    void loadReport();
  };

  const handleClearFilters = () => {
    setSearch("");
    setSelectedSemester("");
    setSelectedProgramme("");
    setSelectedStatus("all");
    setSelectedMethod("all");
    setSelectedPurpose("all");
    setPage(1);
  };

  const handleExport = () => {
    // Placeholder for export functionality
    // This would require backend export endpoints
    alert("Export functionality requires backend implementation");
  };

  const handlePrint = () => {
    window.print();
  };

  /* =======================================================
     CALCULATIONS
  ======================================================= */

  const reportSummary = {
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    totalCount: payments.length,
    successful: payments.filter((p) => p.status === "successful").length,
    pending: payments.filter((p) => p.status === "pending").length,
    failed: payments.filter((p) => p.status === "failed").length,
    refunded: payments.filter((p) => p.status === "refunded").length,
  };

  const selectedReportConfig = REPORT_TYPES[reportType];
  const ReportIcon = selectedReportConfig.icon;

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
                  Reports
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Finance Reports
              </h1>
              <p className="mt-2 text-sm text-white/60">
                Generate and analyze financial reports across ITMT.
              </p>
            </div>

            {/* Header actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loadingReport}
                className="border-white/15 bg-white/10 text-white hover:bg-white/15 hover:text-white"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${loadingReport ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="border-white/15 bg-white/10 text-white hover:bg-white/15 hover:text-white"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="border-white/15 bg-white/10 text-white hover:bg-white/15 hover:text-white"
              >
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
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
              About Finance Reports
            </p>
            <p className="text-sm text-slate-600">
              Generate financial reports based on payment data. Select a report type and apply filters to view specific financial information.
              For advanced reporting features, additional backend endpoints may be required.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ===================================================
          REPORT TYPE SELECTOR
      =================================================== */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100 px-6 py-4">
          <CardTitle className="text-base font-semibold text-slate-900">
            Generate Financial Report
          </CardTitle>
          <CardDescription className="text-xs">
            Select a report type and apply filters to generate an accurate financial report.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(REPORT_TYPES).map(([key, config]) => (
              <button
                key={key}
                type="button"
                onClick={() => setReportType(key as ReportType)}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                  reportType === key
                    ? "border-brand-navy bg-brand-navy/5 ring-2 ring-brand-navy/20"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    reportType === key
                      ? "bg-brand-navy text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <config.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-semibold ${
                      reportType === key ? "text-brand-navy" : "text-slate-900"
                    }`}
                  >
                    {config.label}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                    {config.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

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
                  placeholder="Search by student name, matric number, or reference..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Semester */}
            <Select value={selectedSemester} onValueChange={(v) => setSelectedSemester(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="All Semesters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Semesters</SelectItem>
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

            {/* Status */}
            <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v ?? "all")}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="successful">Successful</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Method */}
            <Select value={selectedMethod} onValueChange={(v) => setSelectedMethod(v ?? "all")}>
              <SelectTrigger>
                <SelectValue placeholder="All Methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            {/* Purpose */}
            <Select value={selectedPurpose} onValueChange={(v) => setSelectedPurpose(v ?? "all")}>
              <SelectTrigger>
                <SelectValue placeholder="All Purposes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Purposes</SelectItem>
                <SelectItem value="tuition">Tuition</SelectItem>
                <SelectItem value="registration">Registration</SelectItem>
                <SelectItem value="examination">Examination</SelectItem>
                <SelectItem value="acceptance">Acceptance</SelectItem>
                <SelectItem value="transcript">Transcript</SelectItem>
                <SelectItem value="certificate">Certificate</SelectItem>
                <SelectItem value="hostel">Hostel</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ===================================================
          SUMMARY CARDS
      =================================================== */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Amount"
          value={formatCurrency(reportSummary.totalAmount)}
          subtitle={`${reportSummary.totalCount} transactions`}
          icon={DollarSign}
        />
        <SummaryCard
          title="Successful"
          value={reportSummary.successful}
          subtitle="Completed payments"
          icon={CheckCircle2}
          valueClassName="text-emerald-600"
        />
        <SummaryCard
          title="Pending"
          value={reportSummary.pending}
          subtitle="Awaiting processing"
          icon={Clock3}
          valueClassName="text-amber-600"
        />
        <SummaryCard
          title="Failed/Refunded"
          value={reportSummary.failed + reportSummary.refunded}
          subtitle="Problematic transactions"
          icon={XCircle}
          valueClassName="text-red-600"
        />
      </div>

      {/* ===================================================
          REPORT DATA
      =================================================== */}
      {loadingReport && !error ? (
        <ReportSkeleton />
      ) : error ? (
        <ErrorState onRetry={handleRefresh} />
      ) : payments.length === 0 ? (
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
                        Purpose
                      </th>
                      <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Amount
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Method
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Reference
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Status
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Date
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => {
                      const MethodIcon = getMethodIcon(payment.method);

                      return (
                        <tr
                          key={payment._id}
                          className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/70"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-slate-900">
                                {payment.student?.name || "Unknown Student"}
                              </p>
                              <p className="text-xs text-slate-500">
                                {payment.student?.matricNumber || "N/A"}
                              </p>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span className="text-slate-700">
                              {PURPOSE_LABELS[payment.purpose]}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-right">
                            <span className="font-semibold text-brand-navy">
                              {formatCurrency(payment.amount, payment.currency)}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2 text-slate-600">
                              <MethodIcon className="h-4 w-4" />
                              <span className="text-xs">
                                {METHOD_LABELS[payment.method]}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span className="font-mono text-xs text-slate-600">
                              {payment.paymentReference}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <ReportStatusBadge status={payment.status} />
                          </td>

                          <td className="px-4 py-4">
                            <span className="text-slate-500">
                              {formatDate(payment.createdAt)}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <Link href={`/dashboards/finance/payments/${payment._id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </Link>
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
            {payments.map((payment) => {
              const MethodIcon = getMethodIcon(payment.method);
              const status = getStatusConfig(payment.status);
              const StatusIcon = status.icon;

              return (
                <Card
                  key={payment._id}
                  className="border-slate-200 bg-white shadow-sm"
                >
                  <CardContent className="p-4">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-slate-900">
                          {payment.student?.name || "Unknown Student"}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {payment.student?.matricNumber || "N/A"}
                        </p>
                      </div>
                      <ReportStatusBadge status={payment.status} />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-slate-500">Purpose</span>
                        <span className="text-right text-sm text-slate-700">
                          {PURPOSE_LABELS[payment.purpose]}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-slate-500">Amount</span>
                        <span className="break-words text-right text-sm font-bold text-brand-navy">
                          {formatCurrency(payment.amount, payment.currency)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-slate-500">Method</span>
                        <div className="flex items-center gap-1.5 text-right text-sm text-slate-600">
                          <MethodIcon className="h-3.5 w-3.5" />
                          <span>{METHOD_LABELS[payment.method]}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-slate-500">Reference</span>
                        <span className="break-all text-right text-xs font-mono text-slate-600">
                          {payment.paymentReference}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-slate-500">Date</span>
                        <span className="text-right text-xs text-slate-500">
                          {formatDate(payment.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Link href={`/dashboards/finance/payments/${payment._id}`} className="flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          View Payment
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* ===================================================
              PAGINATION
          =================================================== */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-slate-500">
                Showing {payments.length} of {total} records • Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
