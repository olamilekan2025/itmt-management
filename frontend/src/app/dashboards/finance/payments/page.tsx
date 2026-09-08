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
  CheckCircle2,
  Clock3,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  CreditCard,
  Receipt,
  SlidersHorizontal,
  WalletCards,
  ArrowUpRight,
  RotateCcw,
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
   PAGE
========================================================= */

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  /*
   * Use "all" instead of "" because Radix Select
   * does not allow an empty SelectItem value.
   */
  const [status, setStatus] = useState("all");
  const [purpose, setPurpose] = useState("all");
  const [method, setMethod] = useState("all");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  /* =======================================================
     LOAD PAYMENTS
  ======================================================= */

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const session = await getSession();
      const token = session?.accessToken;

      if (!token) {
        throw new Error(
          "Your session has expired. Please sign in again.",
        );
      }

      const params = new URLSearchParams();

      params.append("page", String(page));
      params.append("limit", String(limit));

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (status !== "all") {
        params.append("status", status);
      }

      if (purpose !== "all") {
        params.append("purpose", purpose);
      }

      if (method !== "all") {
        params.append("method", method);
      }

      const response = await apiGet<PaymentsResponse>(
        `/payments?${params.toString()}`,
        token,
      );

      if (!response?.success) {
        throw new Error("Unable to load payment records.");
      }

      setPayments(response.payments || []);

      setTotal(response.pagination?.total || 0);
      setTotalPages(response.pagination?.totalPages || 0);
    } catch (err) {
      console.error("Load payments error:", err);

      setPayments([]);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load payment records.",
      );
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    search,
    status,
    purpose,
    method,
  ]);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  /* =======================================================
     SEARCH
  ======================================================= */

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  /* =======================================================
     FILTERS
  ======================================================= */

  const handleStatusChange = (value: string | null) => {
    if (value !== null) {
      setStatus(value);
      setPage(1);
    }
  };

  const handlePurposeChange = (value: string | null) => {
    if (value !== null) {
      setPurpose(value);
      setPage(1);
    }
  };

  const handleMethodChange = (value: string | null) => {
    if (value !== null) {
      setMethod(value);
      setPage(1);
    }
  };

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setPurpose("all");
    setMethod("all");
    setPage(1);
  };

  const hasFilters =
    search.trim() !== "" ||
    status !== "all" ||
    purpose !== "all" ||
    method !== "all";

  /* =======================================================
     FORMAT CURRENCY
  ======================================================= */

  const formatCurrency = (
    amount: number,
    currency: string = "NGN",
  ) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  /* =======================================================
     FORMAT DATE
  ======================================================= */

  const formatDate = (
    dateString: string | null | undefined,
  ) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleDateString("en-NG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* =======================================================
     STATUS BADGE
  ======================================================= */

  const getStatusBadge = (
    paymentStatus: PaymentStatus,
  ) => {
    const variants: Record<
      PaymentStatus,
      {
        icon: typeof CheckCircle2;
        className: string;
      }
    > = {
      pending: {
        icon: Clock3,
        className:
          "border-amber-200 bg-amber-50 text-amber-700",
      },

      successful: {
        icon: CheckCircle2,
        className:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
      },

      failed: {
        icon: XCircle,
        className:
          "border-red-200 bg-red-50 text-red-700",
      },

      refunded: {
        icon: RotateCcw,
        className:
          "border-slate-200 bg-slate-50 text-slate-700",
      },

      cancelled: {
        icon: AlertCircle,
        className:
          "border-slate-200 bg-slate-50 text-slate-700",
      },
    };

    const config = variants[paymentStatus];

    const Icon = config.icon;

    return (
      <Badge
        variant="outline"
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${config.className}`}
      >
        <Icon className="h-3.5 w-3.5" />
        {STATUS_LABELS[paymentStatus]}
      </Badge>
    );
  };

  /* =======================================================
     METHOD ICON
  ======================================================= */

  const getMethodIcon = (
    paymentMethod: PaymentMethod,
  ) => {
    switch (paymentMethod) {
      case "card":
        return CreditCard;

      case "bank_transfer":
        return ArrowUpRight;

      case "cash":
        return WalletCards;

      default:
        return Receipt;
    }
  };

  /* =======================================================
     STUDENT INITIAL
  ======================================================= */

  const getStudentInitial = (name?: string) => {
    if (!name) return "S";

    return name
      .trim()
      .charAt(0)
      .toUpperCase();
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-full w-full bg-slate-50/60 pb-10">
      {/* =====================================================
          PREMIUM HEADER
      ===================================================== */}

      <div className="relative overflow-hidden rounded-2xl bg-brand-navy text-white shadow-lg">
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

          <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />

          <div className="absolute right-1/4 top-1/2 h-40 w-40 rounded-full bg-blue-400/5 blur-3xl" />
        </div>

        <div className="relative mx-auto w-full max-w-[1600px] px-4 py-7 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Title */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-inner backdrop-blur-sm">
                <CreditCard className="h-6 w-6 text-white" />
              </div>

              <div>
                <div className="mb-1 flex items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                    Finance
                  </p>

                  <span className="h-1 w-1 rounded-full bg-brand-gold" />

                  <p className="text-xs font-medium text-white/50">
                    Payments
                  </p>
                </div>

                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Payment Records
                </h1>

                <p className="mt-1 max-w-xl text-sm text-white/65">
                  View, search and manage student payment
                  transactions across the institution.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadPayments()}
                disabled={loading}
                className="border-white/15 bg-white/10 text-white backdrop-blur-sm hover:bg-white/15 hover:text-white"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${
                    loading ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </Button>

              <Link href="/dashboards/finance/payments/record">
                <Button
                  size="sm"
                  className="border-0 bg-white text-brand-navy shadow-lg hover:bg-slate-100"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Record Payment
                </Button>
              </Link>
            </div>
          </div>

          {/* Header stats */}
          <div className="mt-7 grid grid-cols-2 gap-3 border-t border-white/10 pt-5 sm:max-w-md">
            <div>
              <p className="text-xs font-medium text-white/45">
                Total Records
              </p>

              <p className="mt-1 text-xl font-bold">
                {total.toLocaleString()}
              </p>
            </div>

            <div className="border-l border-white/10 pl-4">
              <p className="text-xs font-medium text-white/45">
                Current Page
              </p>

              <p className="mt-1 text-xl font-bold">
                {totalPages > 0
                  ? `${page} / ${totalPages}`
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="mx-auto w-full max-w-[1600px] space-y-6 px-4 pt-6 sm:px-6 lg:px-8">
        {/* ===================================================
            FILTER PANEL
        =================================================== */}

        <Card className="overflow-hidden border-slate-200/80 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-5 py-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-navy/10">
                  <SlidersHorizontal className="h-4 w-4 text-brand-navy" />
                </div>

                <div>
                  <CardTitle className="text-sm font-semibold text-slate-900">
                    Search & Filters
                  </CardTitle>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Find specific payment transactions
                  </p>
                </div>
              </div>

              {hasFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="w-fit text-xs text-slate-500 hover:text-brand-navy"
                >
                  Clear filters
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-5">
            <div className="grid gap-4 lg:grid-cols-12">
              {/* Search */}
              <div className="lg:col-span-5">
                <label className="mb-2 block text-xs font-semibold text-slate-600">
                  Search payments
                </label>

                <div className="relative">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <Input
                    placeholder="Reference, student name, matric number..."
                    value={search}
                    onChange={(e) =>
                      handleSearch(e.target.value)
                    }
                    className="h-10 border-slate-200 bg-white pl-10 text-sm shadow-sm focus:border-brand-navy focus:ring-brand-navy/10"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="lg:col-span-2">
                <label className="mb-2 block text-xs font-semibold text-slate-600">
                  Status
                </label>

                <Select
                  value={status}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="h-10 border-slate-200 bg-white shadow-sm">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">
                      All statuses
                    </SelectItem>

                    <SelectItem value="pending">
                      Pending
                    </SelectItem>

                    <SelectItem value="successful">
                      Successful
                    </SelectItem>

                    <SelectItem value="failed">
                      Failed
                    </SelectItem>

                    <SelectItem value="refunded">
                      Refunded
                    </SelectItem>

                    <SelectItem value="cancelled">
                      Cancelled
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Purpose */}
              <div className="lg:col-span-2">
                <label className="mb-2 block text-xs font-semibold text-slate-600">
                  Purpose
                </label>

                <Select
                  value={purpose}
                  onValueChange={handlePurposeChange}
                >
                  <SelectTrigger className="h-10 border-slate-200 bg-white shadow-sm">
                    <SelectValue placeholder="All purposes" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">
                      All purposes
                    </SelectItem>

                    <SelectItem value="tuition">
                      Tuition
                    </SelectItem>

                    <SelectItem value="registration">
                      Registration
                    </SelectItem>

                    <SelectItem value="examination">
                      Examination
                    </SelectItem>

                    <SelectItem value="acceptance">
                      Acceptance
                    </SelectItem>

                    <SelectItem value="transcript">
                      Transcript
                    </SelectItem>

                    <SelectItem value="certificate">
                      Certificate
                    </SelectItem>

                    <SelectItem value="hostel">
                      Hostel
                    </SelectItem>

                    <SelectItem value="other">
                      Other
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Method */}
              <div className="lg:col-span-2">
                <label className="mb-2 block text-xs font-semibold text-slate-600">
                  Method
                </label>

                <Select
                  value={method}
                  onValueChange={handleMethodChange}
                >
                  <SelectTrigger className="h-10 border-slate-200 bg-white shadow-sm">
                    <SelectValue placeholder="All methods" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">
                      All methods
                    </SelectItem>

                    <SelectItem value="cash">
                      Cash
                    </SelectItem>

                    <SelectItem value="bank_transfer">
                      Bank Transfer
                    </SelectItem>

                    <SelectItem value="card">
                      Card
                    </SelectItem>

                    <SelectItem value="other">
                      Other
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Limit */}
              <div className="lg:col-span-1">
                <label className="mb-2 block text-xs font-semibold text-slate-600">
                  Show
                </label>

                <Select
                  value={String(limit)}
                  onValueChange={(value) => {
                    if (value !== null) {
                      setLimit(Number(value));
                      setPage(1);
                    }
                  }}
                >
                  <SelectTrigger className="h-10 border-slate-200 bg-white shadow-sm">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="10">
                      10
                    </SelectItem>

                    <SelectItem value="20">
                      20
                    </SelectItem>

                    <SelectItem value="50">
                      50
                    </SelectItem>

                    <SelectItem value="100">
                      100
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (
          <Card className="overflow-hidden border-red-200 bg-red-50/70 shadow-sm">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>

              <div>
                <p className="text-sm font-semibold text-red-800">
                  Unable to load payments
                </p>

                <p className="mt-0.5 text-xs text-red-700">
                  {error}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ===================================================
            TABLE CARD
        =================================================== */}

        <Card className="overflow-hidden border-slate-200/80 bg-white shadow-sm">
          {/* Table Header */}
          <CardHeader className="border-b border-slate-100 px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                  <Receipt className="h-4 w-4 text-brand-navy" />
                  Transactions
                </CardTitle>

                <p className="mt-1 text-xs text-slate-500">
                  {total.toLocaleString()} payment{" "}
                  {total === 1
                    ? "record"
                    : "records"}{" "}
                  found
                </p>
              </div>

              {hasFilters && (
                <Badge
                  variant="outline"
                  className="w-fit rounded-full border-brand-navy/15 bg-brand-navy/5 px-3 py-1 text-[11px] font-semibold text-brand-navy"
                >
                  Filters applied
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Loading */}
            {loading ? (
              <div className="space-y-0">
                {[...Array(7)].map((_, index) => (
                  <div
                    key={index}
                    className="flex h-[76px] animate-pulse items-center gap-4 border-b border-slate-100 px-5"
                  >
                    <div className="h-10 w-10 rounded-xl bg-slate-100" />

                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-40 rounded bg-slate-100" />
                      <div className="h-2.5 w-24 rounded bg-slate-100" />
                    </div>

                    <div className="hidden h-3 w-20 rounded bg-slate-100 md:block" />

                    <div className="hidden h-3 w-24 rounded bg-slate-100 sm:block" />

                    <div className="h-3 w-16 rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            ) : payments.length === 0 ? (
              /* Empty */
              <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-navy/5">
                  <Receipt className="h-7 w-7 text-brand-navy/60" />
                </div>

                <h3 className="mt-5 text-base font-bold text-slate-900">
                  No payment records found
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  {hasFilters
                    ? "Try adjusting your search or filters to find the payment you are looking for."
                    : "There are currently no payment transactions recorded in the system."}
                </p>

                {hasFilters ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="mt-5 gap-2"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Clear filters
                  </Button>
                ) : (
                  <Link
                    href="/dashboards/finance/payments/record"
                    className="mt-5"
                  >
                    <Button
                      size="sm"
                      className="gap-2 bg-brand-navy hover:bg-brand-navy/90"
                    >
                      <Plus className="h-4 w-4" />
                      Record Payment
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              /* Table */
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70">
                      <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                        Payment
                      </th>

                      <th className="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                        Student
                      </th>

                      <th className="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                        Purpose
                      </th>

                      <th className="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                        Amount
                      </th>

                      <th className="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                        Method
                      </th>

                      <th className="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                        Status
                      </th>

                      <th className="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                        Date
                      </th>

                      <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {payments.map((payment) => {
                      const MethodIcon = getMethodIcon(
                        payment.method,
                      );

                      const studentName =
                        payment.student?.name ||
                        "Unknown Student";

                      return (
                        <tr
                          key={payment._id}
                          className="group transition-colors hover:bg-slate-50/80"
                        >
                          {/* Payment */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/5 text-brand-navy transition-colors group-hover:bg-brand-navy group-hover:text-white">
                                <Receipt className="h-4 w-4" />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate font-semibold text-slate-900">
                                  {payment.paymentReference}
                                </p>

                                {payment.invoiceNumber && (
                                  <p className="mt-0.5 text-[11px] text-slate-400">
                                    Invoice:{" "}
                                    {payment.invoiceNumber}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Student */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-brand-navy">
                                {getStudentInitial(
                                  studentName,
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate font-semibold text-slate-800">
                                  {studentName}
                                </p>

                                <p className="mt-0.5 truncate text-xs text-slate-500">
                                  {payment.student
                                    ?.matricNumber ||
                                    "No matric number"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Purpose */}
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-medium text-slate-700">
                                {PURPOSE_LABELS[
                                  payment.purpose
                                ] || payment.purpose}
                              </p>

                              {payment.semester?.name && (
                                <p className="mt-0.5 text-xs text-slate-400">
                                  {payment.semester.name}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Amount */}
                          <td className="px-4 py-4">
                            <p className="font-bold text-slate-900">
                              {formatCurrency(
                                payment.amount,
                                payment.currency,
                              )}
                            </p>

                            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                              {payment.currency}
                            </p>
                          </td>

                          {/* Method */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                                <MethodIcon className="h-3.5 w-3.5 text-slate-600" />
                              </div>

                              <span className="text-xs font-medium text-slate-600">
                                {METHOD_LABELS[
                                  payment.method
                                ] || payment.method}
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-4">
                            {getStatusBadge(
                              payment.status,
                            )}
                          </td>

                          {/* Date */}
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-medium text-slate-700">
                                {formatDate(
                                  payment.paidAt ||
                                    payment.createdAt,
                                )}
                              </p>

                              <p className="mt-0.5 text-[11px] text-slate-400">
                                {payment.paidAt
                                  ? "Paid"
                                  : "Recorded"}
                              </p>
                            </div>
                          </td>

                          {/* Action */}
                          <td className="px-5 py-4 text-right">
                            <Link
                              href={`/dashboards/finance/payments/${payment._id}`}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 border-slate-200 bg-white text-xs font-semibold text-slate-700 opacity-90 shadow-sm transition-all hover:border-brand-navy/20 hover:bg-brand-navy hover:text-white group-hover:opacity-100"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                View
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* =================================================
                PAGINATION
            ================================================= */}

            {!loading && payments.length > 0 && (
              <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {total === 0
                      ? 0
                      : (page - 1) * limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-slate-700">
                    {Math.min(
                      page * limit,
                      total,
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-700">
                    {total.toLocaleString()}
                  </span>{" "}
                  records
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((current) =>
                          Math.max(1, current - 1),
                        )
                      }
                      disabled={page === 1}
                      className="h-9 gap-1.5 border-slate-200 bg-white text-xs"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Previous
                    </Button>

                    <div className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-brand-navy px-3 text-xs font-bold text-white shadow-sm">
                      {page}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((current) =>
                          Math.min(
                            totalPages,
                            current + 1,
                          ),
                        )
                      }
                      disabled={page === totalPages}
                      className="h-9 gap-1.5 border-slate-200 bg-white text-xs"
                    >
                      Next
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}