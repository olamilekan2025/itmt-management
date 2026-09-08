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
  RotateCcw,
  CheckCircle2,
  Clock3,
  XCircle,
  Receipt,
  SlidersHorizontal,
  Wallet,
  TrendingDown,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Banknote,
  ArrowUpRight,
  CreditCard,
  FileText,
  Info,
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

interface Payment {
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
    order?: number;
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
  updatedAt: string;
}

interface PaymentsResponse {
  success: boolean;
  payments: Payment[];

  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/* =========================================================
   CONSTANTS
========================================================= */

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
      return Banknote;
    case "bank_transfer":
      return ArrowUpRight;
    case "card":
      return CreditCard;
    default:
      return FileText;
  }
}

/* =========================================================
   COMPONENTS
========================================================= */

function RefundStatusBadge({ status }: { status: PaymentStatus }) {
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
  icon: Icon,
  className,
  valueClassName,
}: {
  title: string;
  value: string | number;
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
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-navy/5 text-brand-navy">
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RefundSkeleton() {
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
          <RotateCcw className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">No refunds found</h3>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Refunded payments matching your current filters will appear here.
        </p>
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="mt-6 gap-2"
        >
          <RotateCcw className="h-4 w-4" />
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
          Unable to load refunds
        </h3>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Something went wrong while retrieving refund records. Please try again.
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

export default function RefundsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [purpose, setPurpose] = useState("all");
  const [method, setMethod] = useState("all");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  /* =======================================================
     LOAD REFUNDS
  ======================================================= */

  const loadRefunds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const session = await getSession();
      const token = session?.accessToken;

      if (!token) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", String(limit));
      params.append("status", "refunded"); // Filter for refunded payments

      if (search) params.append("search", search);
      if (purpose !== "all") params.append("purpose", purpose);
      if (method !== "all") params.append("method", method);

      const response = await apiGet<PaymentsResponse>(
        `/payments?${params.toString()}`,
        token,
      );

      if (!response?.success) {
        throw new Error("Unable to load refunds.");
      }

      setPayments(response.payments || []);
      setTotal(response.pagination?.total || 0);
      setTotalPages(response.pagination?.totalPages || 0);
    } catch (err) {
      console.error("Load refunds error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load refunds.",
      );
      setPayments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, purpose, method, page, limit]);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    void loadRefunds();
  }, [loadRefunds]);

  /* =======================================================
     HANDLERS
  ======================================================= */

  const handleRefresh = () => {
    setRefreshing(true);
    void loadRefunds();
  };

  const handleClearFilters = () => {
    setSearch("");
    setPurpose("all");
    setMethod("all");
    setPage(1);
  };

  /* =======================================================
     CALCULATE SUMMARY
  ======================================================= */

  const summary = {
    total: payments.length,
    totalRefunded: payments.reduce((sum, p) => sum + p.amount, 0),
  };

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
                  Refunds
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Refunds
              </h1>
              <p className="mt-2 text-sm text-white/60">
                Review, manage and track student payment refunds.
              </p>
            </div>

            {/* Header actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="border-white/15 bg-white/10 text-white hover:bg-white/15 hover:text-white"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
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
              About Refunds
            </p>
            <p className="text-sm text-slate-600">
              This page displays all payments that have been marked as refunded.
              Refund details are recorded in the payment notes. To process a new refund,
              navigate to the payment details page.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ===================================================
          SUMMARY CARDS
      =================================================== */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Refunds"
          value={summary.total}
          icon={RotateCcw}
        />
        <SummaryCard
          title="Total Refunded"
          value={formatCurrency(summary.totalRefunded)}
          icon={TrendingDown}
          valueClassName="text-purple-600"
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
              <RotateCcw className="mr-2 h-4 w-4" />
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
                  placeholder="Search by student name, matric number, or payment reference..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Purpose */}
            <Select value={purpose} onValueChange={(v) => setPurpose(v ?? "all")}>
              <SelectTrigger>
                <SelectValue placeholder="Purpose" />
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

            {/* Method */}
            <Select value={method} onValueChange={(v) => setMethod(v ?? "all")}>
              <SelectTrigger>
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ===================================================
          REFUNDS LIST
      =================================================== */}
      {loading && !error ? (
        <RefundSkeleton />
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
                        Payment
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Student
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Purpose
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Refund Amount
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Method
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Refunded Date
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
                    {payments.map((payment) => {
                      const MethodIcon = getMethodIcon(payment.method);

                      return (
                        <tr
                          key={payment._id}
                          className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/70"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Receipt className="h-4 w-4 text-slate-400" />
                              <span className="font-mono text-xs font-medium text-slate-600">
                                {payment.paymentReference}
                              </span>
                            </div>
                          </td>

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

                          <td className="px-4 py-4">
                            <span className="font-semibold text-purple-600">
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
                            <span className="text-slate-500">
                              {formatDate(payment.updatedAt)}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <RefundStatusBadge status={payment.status} />
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/dashboards/finance/payments/${payment._id}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  <Eye className="h-4 w-4" />
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
            {payments.map((payment) => {
              const MethodIcon = getMethodIcon(payment.method);
              const statusConfig = getStatusConfig(payment.status);
              const StatusIcon = statusConfig.icon;

              return (
                <Card
                  key={payment._id}
                  className="border-slate-200 bg-white shadow-sm"
                >
                  <CardContent className="p-4">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <Receipt className="h-4 w-4 shrink-0 text-slate-400" />
                        <span className="break-all font-mono text-xs font-medium text-slate-600">
                          {payment.paymentReference}
                        </span>
                      </div>
                      <RefundStatusBadge status={payment.status} />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-slate-500">Student</span>
                        <span className="break-words text-right text-sm font-medium text-slate-900">
                          {payment.student?.name || "Unknown"}
                        </span>
                      </div>

                      {payment.student?.matricNumber && (
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-xs text-slate-500">
                            Matric Number
                          </span>
                          <span className="break-all text-right text-xs font-medium text-slate-600">
                            {payment.student.matricNumber}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-slate-500">Purpose</span>
                        <span className="text-right text-sm text-slate-700">
                          {PURPOSE_LABELS[payment.purpose]}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-slate-500">
                          Refund Amount
                        </span>
                        <span className="break-words text-right text-sm font-bold text-purple-600">
                          {formatCurrency(payment.amount, payment.currency)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-slate-500">
                          Payment Method
                        </span>
                        <div className="flex items-center gap-1.5 text-right text-sm text-slate-600">
                          <MethodIcon className="h-3.5 w-3.5" />
                          <span>{METHOD_LABELS[payment.method]}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-slate-500">
                          Refunded Date
                        </span>
                        <span className="text-right text-xs text-slate-500">
                          {formatDate(payment.updatedAt)}
                        </span>
                      </div>

                      {payment.notes && (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-slate-500">Notes</span>
                          <span className="break-words text-xs text-slate-600">
                            {payment.notes}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <Link href={`/dashboards/finance/payments/${payment._id}`} className="flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Payment Details
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
                Page {page} of {totalPages} • {total} total refunds
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
