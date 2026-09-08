"use client";

import { useCallback, useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
  ArrowLeft,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  GraduationCap,
  Hash,
  Loader2,
  Mail,
  Receipt,
  RefreshCw,
  ShieldCheck,
  User,
  UserCheck,
  XCircle,
} from "lucide-react";

import { apiGet, apiPost } from "@/lib/api";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Badge } from "@/components/ui/badge";

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
    _id?: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    matricNumber?: string;
    email?: string;
    phone?: string;
  };

  semester?: {
    _id?: string;
    name?: string;
    semesterNumber?: number;
  };

  session?: {
    _id?: string;
    name?: string;
  };

  programme?: {
    _id?: string;
    name?: string;
    code?: string;
  };

  department?: {
    _id?: string;
    name?: string;
    code?: string;
  };

  amount: number;
  currency?: string;

  method: PaymentMethod;
  purpose: PaymentPurpose;

  reference?: string;
  providerReference?: string;
  invoiceReference?: string;

  status: PaymentStatus;

  notes?: string;

  recordedBy?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };

  verifiedBy?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };

  verifiedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

interface PaymentResponse {
  success: boolean;
  payment?: Payment;
}

interface DetailRowProps {
  icon?: React.ElementType;
  label: string;
  value: React.ReactNode;
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: DetailRowProps) {
  return (
    <div className="flex flex-col gap-2 border-b border-slate-100 py-4 last:border-0 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <div className="flex min-w-0 items-center gap-3">
        {Icon && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <Icon className="h-4 w-4" />
          </div>
        )}

        <span className="text-sm text-slate-500">
          {label}
        </span>
      </div>

      <div className="min-w-0 max-w-full break-words text-left text-sm font-semibold text-slate-900 sm:max-w-[60%] sm:text-right">
        {value}
      </div>
    </div>
  );
}

interface SectionHeaderProps {
  icon: React.ElementType;
  title: string;
  description?: string;
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-white shadow-sm">
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0">
        <CardTitle className="text-base font-bold text-slate-900">
          {title}
        </CardTitle>

        {description && (
          <p className="mt-0.5 break-words text-xs text-slate-500">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function formatCurrency(
  amount: number,
  currency = "NGN"
) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date?: string) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function formatPurpose(purpose?: PaymentPurpose) {
  if (!purpose) return "—";

  return purpose
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatMethod(method?: PaymentMethod) {
  if (!method) return "—";

  return method
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
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
      className:
        "border-amber-200 bg-amber-50 text-amber-700",
      icon: Clock3,
    },

    successful: {
      label: "Successful",
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
      icon: CheckCircle2,
    },

    failed: {
      label: "Failed",
      className:
        "border-red-200 bg-red-50 text-red-700",
      icon: XCircle,
    },

    refunded: {
      label: "Refunded",
      className:
        "border-purple-200 bg-purple-50 text-purple-700",
      icon: RefreshCw,
    },

    cancelled: {
      label: "Cancelled",
      className:
        "border-slate-200 bg-slate-50 text-slate-600",
      icon: XCircle,
    },
  };

  return variants[status];
}

function getMethodIcon(method?: PaymentMethod) {
  switch (method) {
    case "cash":
      return Banknote;

    case "bank_transfer":
      return ArrowUpRight;

    case "card":
      return CreditCard;

    default:
      return Receipt;
  }
}

export default function PaymentDetailsPage() {
  const params = useParams();

  const paymentId = params?.id as string;

  const [payment, setPayment] = useState<Payment | null>(
    null
  );

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);

  const loadPayment = useCallback(
    async (showRefresh = false) => {
      if (!paymentId) return;

      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const session = await getSession();

        const token = session?.accessToken;

        const data = await apiGet<PaymentResponse>(
          `/payments/${paymentId}`,
          token
        );

        setPayment(data?.payment ?? (data as unknown as Payment));
      } catch (error) {
        console.error(error);

        toast.error(
          "Unable to load payment details."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [paymentId]
  );

  useEffect(() => {
    loadPayment();
  }, [loadPayment]);

  const handleVerify = async () => {
    if (!payment) return;

    try {
      setVerifying(true);

      const session = await getSession();

      const token = session?.accessToken;

      await apiPost(
        `/payments/${payment._id}/verify`,
        {},
        token
      );

      toast.success("Payment verified successfully.");

      setVerifyOpen(false);

      await loadPayment(true);
    } catch (error) {
      console.error(error);

      toast.error(
        "Unable to verify this payment."
      );
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-navy" />

          <p className="text-sm text-slate-500">
            Loading payment details...
          </p>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <XCircle className="h-7 w-7" />
            </div>

            <h2 className="text-lg font-bold text-slate-900">
              Payment not found
            </h2>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              The payment record could not be found or may
              have been removed.
            </p>

            <Link href="/dashboards/finance/payments">
              <Button className="mt-6 w-full sm:w-auto">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Payments
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig = getStatusConfig(
    payment.status
  );

  const StatusIcon = statusConfig.icon;

  const MethodIcon = getMethodIcon(
    payment.method
  );

  const studentName =
    [
      payment.student?.firstName,
      payment.student?.middleName,
      payment.student?.lastName,
    ]
      .filter(Boolean)
      .join(" ") || "Unknown Student";

  const recordedByName =
    [
      payment.recordedBy?.firstName,
      payment.recordedBy?.lastName,
    ]
      .filter(Boolean)
      .join(" ") || "Unknown";

  const verifiedByName =
    [
      payment.verifiedBy?.firstName,
      payment.verifiedBy?.lastName,
    ]
      .filter(Boolean)
      .join(" ") || "—";

  return (
    <>
      <div className="mx-auto w-full max-w-7xl space-y-4 overflow-x-hidden pb-8 sm:space-y-6 sm:pb-10">
        {/* =====================================================
            HEADER
        ====================================================== */}
        <div className="no-print overflow-hidden rounded-2xl bg-brand-navy shadow-xl">
          <div className="relative px-4 py-5 sm:px-6 sm:py-7 md:px-8">
            {/* Decorative background */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

            <div className="relative">
              <Link
                href="/dashboards/finance/payments"
                className="inline-flex min-h-10 items-center gap-2 rounded-lg px-1 text-sm font-medium text-white/75 transition hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Payments</span>
              </Link>

              <div className="mt-5 flex flex-col gap-5 lg:mt-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/80">
                      Payment Details
                    </span>

                    <Badge
                      variant="outline"
                      className={`border ${statusConfig.className}`}
                    >
                      <StatusIcon className="mr-1.5 h-3.5 w-3.5" />
                      {statusConfig.label}
                    </Badge>
                  </div>

                  <h1 className="break-words text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
                    {formatCurrency(
                      payment.amount,
                      payment.currency
                    )}
                  </h1>

                  <p className="mt-2 break-all text-sm text-white/60">
                    Reference:{" "}
                    {payment.reference || payment._id}
                  </p>
                </div>

                {/* ACTIONS */}
                <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => loadPayment(true)}
                    disabled={refreshing}
                    className="min-h-10 w-full border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white sm:w-auto"
                  >
                    {refreshing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}

                    Refresh
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.print()}
                    className="min-h-10 w-full border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white sm:w-auto"
                  >
                    <Receipt className="mr-2 h-4 w-4" />
                    Print Receipt
                  </Button>

                  {payment.status === "pending" && (
                    <Button
                      type="button"
                      onClick={() => setVerifyOpen(true)}
                      className="min-h-10 w-full bg-brand-gold text-brand-navy hover:bg-brand-gold/90 sm:w-auto"
                    >
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Verify Payment
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Status strip */}
          <div className="border-t border-white/10 bg-black/10 px-4 py-4 sm:px-6 md:px-8">
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-2 text-sm text-white/70">
                <CalendarDays className="h-4 w-4 shrink-0" />

                <span className="break-words">
                  Recorded {formatDate(payment.createdAt)}
                </span>
              </div>

              <div className="flex min-w-0 items-center gap-2 text-sm text-white/70">
                <FileText className="h-4 w-4 shrink-0" />

                <span className="break-all">
                  ID: {payment._id}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            MAIN CONTENT
        ====================================================== */}
        <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* ===================================================
              LEFT COLUMN
          ==================================================== */}
          <div className="min-w-0 space-y-4 sm:space-y-6">
            {/* Payment Summary */}
            <Card className="min-w-0 overflow-hidden rounded-2xl border-slate-200 shadow-sm">
              <CardHeader className="px-4 py-4 sm:px-6 sm:py-5">
                <SectionHeader
                  icon={Receipt}
                  title="Payment Summary"
                  description="Core information about this payment"
                />
              </CardHeader>

              <div className="border-y border-slate-100 bg-slate-50 px-4 py-5 sm:px-6 sm:py-7">
                <div className="flex min-w-0 flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Amount Paid
                  </span>

                  <div className="break-words text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
                    {formatCurrency(
                      payment.amount,
                      payment.currency
                    )}
                  </div>
                </div>
              </div>

              <CardContent className="px-4 sm:px-6">
                <DetailRow
                  icon={FileText}
                  label="Purpose"
                  value={formatPurpose(payment.purpose)}
                />

                <DetailRow
                  icon={MethodIcon}
                  label="Payment Method"
                  value={formatMethod(payment.method)}
                />

                <DetailRow
                  icon={Hash}
                  label="Payment Reference"
                  value={
                    <span className="break-all">
                      {payment.reference || "—"}
                    </span>
                  }
                />

                <DetailRow
                  icon={Hash}
                  label="Provider Reference"
                  value={
                    <span className="break-all">
                      {payment.providerReference || "—"}
                    </span>
                  }
                />

                <DetailRow
                  icon={FileText}
                  label="Invoice Reference"
                  value={
                    <span className="break-all">
                      {payment.invoiceReference || "—"}
                    </span>
                  }
                />

                <DetailRow
                  icon={CalendarDays}
                  label="Payment Date"
                  value={formatDate(payment.createdAt)}
                />

                {payment.updatedAt && (
                  <DetailRow
                    icon={RefreshCw}
                    label="Last Updated"
                    value={formatDate(payment.updatedAt)}
                  />
                )}
              </CardContent>
            </Card>

            {/* Student */}
            <Card className="min-w-0 rounded-2xl border-slate-200 shadow-sm">
              <CardHeader className="px-4 py-4 sm:px-6 sm:py-5">
                <SectionHeader
                  icon={GraduationCap}
                  title="Student Information"
                  description="Student associated with this payment"
                />
              </CardHeader>

              <CardContent className="px-4 sm:px-6">
                <div className="flex min-w-0 flex-col gap-4 border-b border-slate-100 py-5 sm:flex-row sm:items-center">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-navy text-white shadow-sm">
                    <User className="h-7 w-7" />
                  </div>

                  <div className="min-w-0">
                    <p className="break-words text-lg font-bold text-slate-900">
                      {studentName}
                    </p>

                    {payment.student?.matricNumber && (
                      <p className="mt-1 break-all text-sm font-medium text-brand-navy">
                        {payment.student.matricNumber}
                      </p>
                    )}

                    <div className="mt-2 flex min-w-0 flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      {payment.student?.email && (
                        <span className="flex min-w-0 max-w-full items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 shrink-0" />

                          <span className="break-all">
                            {payment.student.email}
                          </span>
                        </span>
                      )}

                      {payment.student?.phone && (
                        <span className="break-all">
                          {payment.student.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <DetailRow
                  icon={GraduationCap}
                  label="Programme"
                  value={
                    <span className="break-words">
                      {payment.programme?.name || "—"}
                      {payment.programme?.code && (
                        <span className="ml-1 text-xs font-medium text-slate-400">
                          ({payment.programme.code})
                        </span>
                      )}
                    </span>
                  }
                />

                <DetailRow
                  icon={GraduationCap}
                  label="Department"
                  value={
                    <span className="break-words">
                      {payment.department?.name || "—"}
                      {payment.department?.code && (
                        <span className="ml-1 text-xs font-medium text-slate-400">
                          ({payment.department.code})
                        </span>
                      )}
                    </span>
                  }
                />
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card className="min-w-0 rounded-2xl border-slate-200 shadow-sm">
              <CardHeader className="px-4 py-4 sm:px-6 sm:py-5">
                <SectionHeader
                  icon={GraduationCap}
                  title="Academic Information"
                  description="Academic session and semester details"
                />
              </CardHeader>

              <CardContent className="px-4 sm:px-6">
                <DetailRow
                  icon={CalendarDays}
                  label="Academic Session"
                  value={
                    <span className="break-words">
                      {payment.session?.name || "—"}
                    </span>
                  }
                />

                <DetailRow
                  icon={CalendarDays}
                  label="Semester"
                  value={
                    <span className="break-words">
                      {payment.semester?.name ||
                        (payment.semester?.semesterNumber
                          ? `Semester ${payment.semester.semesterNumber}`
                          : "—")}
                    </span>
                  }
                />
              </CardContent>
            </Card>

            {/* Notes */}
            {payment.notes && (
              <Card className="min-w-0 rounded-2xl border-slate-200 shadow-sm">
                <CardHeader className="px-4 py-4 sm:px-6 sm:py-5">
                  <SectionHeader
                    icon={FileText}
                    title="Notes"
                    description="Additional information"
                  />
                </CardHeader>

                <CardContent className="px-4 pb-5 sm:px-6 sm:pb-6">
                  <div className="whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                    {payment.notes}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            <Card className="min-w-0 rounded-2xl border-slate-200 shadow-sm">
              <CardHeader className="px-4 py-4 sm:px-6 sm:py-5">
                <SectionHeader
                  icon={Clock3}
                  title="Payment Timeline"
                  description="Payment processing history"
                />
              </CardHeader>

              <CardContent className="px-4 sm:px-6">
                <div className="relative space-y-6 py-2">
                  {/* Created */}
                  <div className="relative flex gap-4">
                    <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-navy text-white shadow-sm">
                      <Receipt className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 pt-0.5">
                      <p className="text-sm font-semibold text-slate-900">
                        Payment Recorded
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {formatDate(payment.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Verified */}
                  {payment.verifiedAt && (
                    <div className="relative flex gap-4">
                      <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 pt-0.5">
                        <p className="text-sm font-semibold text-slate-900">
                          Payment Verified
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(payment.verifiedAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Current Status */}
                  <div className="relative flex gap-4">
                    <div
                      className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-sm ${
                        payment.status === "successful"
                          ? "bg-emerald-600"
                          : payment.status === "failed"
                            ? "bg-red-600"
                            : payment.status === "refunded"
                              ? "bg-purple-600"
                              : payment.status === "cancelled"
                                ? "bg-slate-500"
                                : "bg-amber-500"
                      }`}
                    >
                      <StatusIcon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 pt-0.5">
                      <p className="text-sm font-semibold text-slate-900">
                        Status: {statusConfig.label}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Current payment status
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ===================================================
              RIGHT COLUMN / SIDEBAR
          ==================================================== */}
          <div className="min-w-0 space-y-4 sm:space-y-6">
            {/* Receipt Card */}
            <Card className="min-w-0 overflow-hidden rounded-2xl border-slate-200 shadow-sm">
              <div className="bg-brand-navy px-4 py-5 text-white sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                    <Receipt className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-base font-bold">
                      Payment Receipt
                    </h2>

                    <p className="text-xs text-white/60">
                      Official payment record
                    </p>
                  </div>
                </div>
              </div>

              <CardContent className="px-4 sm:px-6">
                <div className="border-b border-slate-100 py-5 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Amount
                  </p>

                  <p className="mt-1 break-words text-3xl font-bold tracking-tight text-brand-navy">
                    {formatCurrency(
                      payment.amount,
                      payment.currency
                    )}
                  </p>
                </div>

                <div className="space-y-1 py-4">
                  <div className="flex flex-col gap-1 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <span className="text-sm text-slate-500">
                      Purpose
                    </span>

                    <span className="break-words text-left text-sm font-semibold text-slate-900 sm:max-w-[60%] sm:text-right">
                      {formatPurpose(payment.purpose)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <span className="text-sm text-slate-500">
                      Method
                    </span>

                    <span className="break-words text-left text-sm font-semibold text-slate-900 sm:max-w-[60%] sm:text-right">
                      {formatMethod(payment.method)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <span className="text-sm text-slate-500">
                      Student
                    </span>

                    <span className="break-words text-left text-sm font-semibold text-slate-900 sm:max-w-[60%] sm:text-right">
                      {studentName}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <span className="text-sm text-slate-500">
                      Date
                    </span>

                    <span className="break-words text-left text-sm font-semibold text-slate-900 sm:max-w-[60%] sm:text-right">
                      {formatDate(payment.createdAt)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <span className="text-sm text-slate-500">
                      Status
                    </span>

                    <span>
                      <Badge
                        variant="outline"
                        className={`${statusConfig.className}`}
                      >
                        <StatusIcon className="mr-1.5 h-3.5 w-3.5" />
                        {statusConfig.label}
                      </Badge>
                    </span>
                  </div>
                </div>

                {payment.reference && (
                  <div className="border-t border-slate-100 py-4">
                    <p className="text-xs font-medium text-slate-400">
                      Reference
                    </p>

                    <p className="mt-1 break-all font-mono text-xs font-semibold text-slate-700">
                      {payment.reference}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recorded By */}
            <Card className="min-w-0 rounded-2xl border-slate-200 shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <UserCheck className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Recorded By
                    </p>

                    <p className="mt-1 break-words text-sm font-bold text-slate-900">
                      {recordedByName}
                    </p>

                    {payment.recordedBy?.email && (
                      <p className="mt-0.5 break-all text-xs text-slate-500">
                        {payment.recordedBy.email}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Verified By */}
            {payment.verifiedBy && (
              <Card className="min-w-0 rounded-2xl border-slate-200 shadow-sm">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <ShieldCheck className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Verified By
                      </p>

                      <p className="mt-1 break-words text-sm font-bold text-slate-900">
                        {verifiedByName}
                      </p>

                      {payment.verifiedBy.email && (
                        <p className="mt-0.5 break-all text-xs text-slate-500">
                          {payment.verifiedBy.email}
                        </p>
                      )}

                      {payment.verifiedAt && (
                        <p className="mt-2 text-xs text-slate-400">
                          {formatDate(payment.verifiedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Verification Action */}
            {payment.status === "pending" && (
              <Card className="min-w-0 overflow-hidden rounded-2xl border-amber-200 bg-amber-50/50 shadow-sm">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                      <ShieldCheck className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900">
                        Payment Requires Verification
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Review the payment information before
                        confirming that this transaction is
                        valid.
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => setVerifyOpen(true)}
                    className="mt-4 min-h-10 w-full bg-brand-navy text-white hover:bg-brand-navy/90"
                  >
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Verify Payment
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          VERIFY DIALOG
      ====================================================== */}
      <AlertDialog
        open={verifyOpen}
        onOpenChange={setVerifyOpen}
      >
        <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl p-5 sm:w-full sm:p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-slate-900">
              Verify Payment?
            </AlertDialogTitle>

            <AlertDialogDescription className="text-sm leading-6">
              You are about to mark this payment as verified.
              Please make sure the transaction details have
              been reviewed carefully.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400">
                  Payment
                </p>

                <p className="mt-1 break-all text-sm font-semibold text-slate-700">
                  {payment.reference ||
                    payment._id}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-xs font-medium text-slate-400">
                  Amount
                </p>

                <p className="mt-1 break-words text-lg font-bold text-brand-navy">
                  {formatCurrency(
                    payment.amount,
                    payment.currency
                  )}
                </p>
              </div>
            </div>
          </div>

          <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AlertDialogCancel
              disabled={verifying}
              className="min-h-10 w-full sm:w-auto"
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleVerify}
              disabled={verifying}
              className="min-h-10 w-full bg-brand-navy text-white hover:bg-brand-navy/90 sm:w-auto"
            >
              {verifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Verify Payment
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* =====================================================
          PRINT STYLES
      ====================================================== */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }

          body {
            background: white !important;
          }

          main {
            padding: 0 !important;
            margin: 0 !important;
          }

          .shadow-sm,
          .shadow-xl {
            box-shadow: none !important;
          }

          .rounded-2xl {
            border-radius: 0 !important;
          }
        }
      `}</style>
    </>
  );
}