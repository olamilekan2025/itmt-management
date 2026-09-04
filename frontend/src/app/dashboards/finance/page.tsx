"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

import {
  Wallet,
  Banknote,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  CreditCard,
  CheckCircle,
  ReceiptText,
  ShieldCheck,
  Clock3,
  ArrowUpRight,
  CircleDollarSign,
  type LucideIcon,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/* =========================================================
   TYPES
========================================================= */

type PaymentMethod =
  | "cash"
  | "bank_transfer"
  | "card"
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

  amount: number;

  method: PaymentMethod;

  reference?: string;

  recordedBy?: {
    name: string;
  };

  createdAt: string;
}

interface FinanceDashboardResponse {
  success: boolean;

  summary: {
    totalRevenue: number;
    todayRevenue: number;
    monthlyRevenue: number;
    totalPayments: number;
    outstandingAmount: number;
    studentsWithOutstanding: number;
  };

  paymentMethods: {
    method: PaymentMethod;
    amount: number;
    count: number;
  }[];

  revenueByMonth: {
    year: number;
    month: number;
    amount: number;
    count: number;
    date: string;
  }[];

  recentPayments: Payment[];
}

/* =========================================================
   CHART COLORS
========================================================= */

const CHART_COLORS = [
  "#1B2847",
  "#C8A951",
  "#3B82F6",
  "#94A3B8",
];

/* =========================================================
   PAGE
========================================================= */

export default function FinanceDashboard() {
  const [dashboard, setDashboard] =
    useState<FinanceDashboardResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [refreshing, setRefreshing] =
    useState(false);

  /* =======================================================
     LOAD DASHBOARD
  ======================================================= */

  const loadData = useCallback(async () => {
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

      const response =
        await apiGet<FinanceDashboardResponse>(
          "/payments/dashboard",
          token,
        );

      if (!response?.success) {
        throw new Error(
          "Unable to load finance dashboard data.",
        );
      }

      setDashboard(response);
    } catch (err) {
      console.error(
        "Finance dashboard loading error:",
        err,
      );

      setDashboard(null);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load finance dashboard data.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    void loadData();
  }, [loadData]);

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  /* =======================================================
     FORMAT CURRENCY
  ======================================================= */

  const formatCurrency = (
    amount: number | null | undefined,
  ) => {
    const value = Number(amount ?? 0);

    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(
      Number.isFinite(value) ? value : 0,
    );
  };

  /* =======================================================
     FORMAT DATE
  ======================================================= */

  const formatDate = (
    dateString: string | null | undefined,
  ) => {
    if (!dateString) {
      return "N/A";
    }

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
     FORMAT PAYMENT METHOD
  ======================================================= */

  const getPaymentMethodLabel = (
    method: string | null | undefined,
  ) => {
    const labels: Record<string, string> = {
      cash: "Cash",
      bank_transfer: "Bank Transfer",
      card: "Card",
      other: "Other",
    };

    if (!method) {
      return "Unknown";
    }

    return labels[method] || method;
  };

  /* =======================================================
     PAYMENT METHOD ICON
  ======================================================= */

  const getPaymentMethodIcon = (
    method: PaymentMethod,
  ) => {
    switch (method) {
      case "cash":
        return Banknote;

      case "bank_transfer":
        return ArrowUpRight;

      case "card":
        return CreditCard;

      default:
        return ReceiptText;
    }
  };

  /* =======================================================
     PAYMENT STATUS
  ======================================================= */

  const getStatusBadge = () => {
    return (
      <Badge className="border-0 bg-emerald-50 px-2.5 py-1 text-emerald-700 shadow-none hover:bg-emerald-100">
        <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
        Paid
      </Badge>
    );
  };

  /* =======================================================
     BACKEND DATA
  ======================================================= */

  const summary = dashboard?.summary;

  const totalRevenue =
    Number(summary?.totalRevenue ?? 0);

  const todayRevenue =
    Number(summary?.todayRevenue ?? 0);

  const currentMonthRevenue =
    Number(summary?.monthlyRevenue ?? 0);

  const totalPayments =
    Number(summary?.totalPayments ?? 0);

  const outstandingAmount =
    Number(summary?.outstandingAmount ?? 0);

  const outstandingStudents =
    Number(summary?.studentsWithOutstanding ?? 0);

  const recentPayments =
    dashboard?.recentPayments ?? [];

  /* =======================================================
     PAYMENT METHOD DATA
  ======================================================= */

  const paymentMethodChartData = useMemo(() => {
    const methods =
      dashboard?.paymentMethods ?? [];

    return methods
      .filter(
        (item) => item && item.method,
      )
      .map((item) => {
        const amount = Number(
          item.amount ?? 0,
        );

        const safeAmount =
          Number.isFinite(amount)
            ? amount
            : 0;

        const count = Number(
          item.count ?? 0,
        );

        return {
          name: getPaymentMethodLabel(
            item.method,
          ),
          value: safeAmount,
          count: Number.isFinite(count)
            ? count
            : 0,
          percentage:
            totalRevenue > 0
              ? (
                  (safeAmount /
                    totalRevenue) *
                  100
                ).toFixed(1)
              : "0.0",
        };
      });
  }, [
    dashboard?.paymentMethods,
    totalRevenue,
  ]);

  /* =======================================================
     REVENUE DATA
  ======================================================= */

  const revenueChartData = useMemo(() => {
    return (
      dashboard?.revenueByMonth ?? []
    ).map((item) => ({
      ...item,
      amount: Number(item.amount ?? 0),
      count: Number(item.count ?? 0),
    }));
  }, [dashboard?.revenueByMonth]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="mx-auto w-full space-y-6">
      {/* =================================================
          PREMIUM PAGE HEADER
      ================================================= */}

      <section className="relative overflow-hidden rounded-2xl bg-brand-navy px-6 py-7 shadow-xl sm:px-8 lg:px-10">
        {/* Decorative background */}
        <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-brand-gold/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="pointer-events-none absolute right-20 top-10 h-32 w-32 rounded-full border border-white/5" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gold/15 text-brand-gold">
                <CircleDollarSign className="h-4 w-4" />
              </span>

              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold">
                Finance & Revenue
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Finance Dashboard
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Monitor institutional revenue,
              student payments, outstanding
              fees and financial activity from
              one central dashboard.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-10 gap-2 border-white/15 bg-white/5 px-4 text-white hover:bg-white/10 hover:text-white"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh Data"}
            </Button>

            <Link href="/dashboards/finance/payments/record">
              <Button
                size="sm"
                className="h-10 gap-2 bg-brand-gold px-4 font-semibold text-brand-navy hover:bg-brand-gold/90"
              >
                <Banknote className="h-4 w-4" />
                Record Payment
              </Button>
            </Link>
          </div>
        </div>

        {/* Header bottom status */}
        <div className="relative mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-5">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
            Financial system operational
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure finance operations
          </div>
        </div>
      </section>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <Card className="overflow-hidden border-red-200 bg-white shadow-sm">
          <CardContent className="p-0">
            <div className="flex flex-col gap-4 border-l-4 border-red-500 bg-red-50/70 p-5 text-red-700 sm:flex-row sm:items-center">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>

              <div className="flex-1">
                <p className="font-semibold">
                  Unable to load financial data
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="border-red-200 bg-white text-red-700 hover:bg-red-50 hover:text-red-700"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* =================================================
          KPI CARDS
      ================================================= */}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          subtitle="All-time collections"
          icon={Wallet}
          loading={loading}
          accent="navy"
        />

        <KPICard
          title="Today's Revenue"
          value={formatCurrency(todayRevenue)}
          subtitle="Collected today"
          icon={Banknote}
          loading={loading}
          accent="green"
        />

        <KPICard
          title="Monthly Revenue"
          value={formatCurrency(
            currentMonthRevenue,
          )}
          subtitle="Current month"
          icon={TrendingUp}
          loading={loading}
          accent="gold"
        />

        <KPICard
          title="Total Payments"
          value={totalPayments.toLocaleString(
            "en-NG",
          )}
          subtitle="Recorded transactions"
          icon={CreditCard}
          loading={loading}
          accent="blue"
        />
      </div>

      {/* =================================================
          SECONDARY FINANCIAL SUMMARY
      ================================================= */}

      <div className="grid gap-5 md:grid-cols-2">
        {/* Outstanding Fees */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <AlertCircle className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Outstanding Fees
                </p>

                <p className="text-xs text-slate-500">
                  Students with unpaid balances
                </p>
              </div>
            </div>

            <Link href="/dashboards/finance/outstanding">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-brand-navy hover:bg-slate-100"
              >
                View
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">
                Students owing
              </p>

              {loading ? (
                <div className="mt-2 h-8 w-20 animate-pulse rounded bg-slate-200" />
              ) : (
                <p className="mt-1 text-2xl font-bold text-brand-navy">
                  {outstandingStudents.toLocaleString(
                    "en-NG",
                  )}
                </p>
              )}
            </div>

            <div className="rounded-xl bg-amber-50 p-4">
              <p className="text-xs font-medium text-amber-700">
                Amount outstanding
              </p>

              {loading ? (
                <div className="mt-2 h-8 w-28 animate-pulse rounded bg-amber-100" />
              ) : (
                <p className="mt-1 text-xl font-bold text-amber-700">
                  {formatCurrency(
                    outstandingAmount,
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Payment Operations */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Payment Operations
                </p>

                <p className="text-xs text-slate-500">
                  Current transaction activity
                </p>
              </div>
            </div>

            <Link href="/dashboards/finance/payments">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-brand-navy hover:bg-slate-100"
              >
                Payments
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-xs font-medium text-emerald-700">
                Today's collection
              </p>

              {loading ? (
                <div className="mt-2 h-8 w-28 animate-pulse rounded bg-emerald-100" />
              ) : (
                <p className="mt-1 text-xl font-bold text-emerald-700">
                  {formatCurrency(todayRevenue)}
                </p>
              )}
            </div>

            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-xs font-medium text-blue-700">
                Transactions
              </p>

              {loading ? (
                <div className="mt-2 h-8 w-20 animate-pulse rounded bg-blue-100" />
              ) : (
                <p className="mt-1 text-2xl font-bold text-blue-700">
                  {totalPayments.toLocaleString(
                    "en-NG",
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          CHARTS
      ================================================= */}

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        {/* Revenue Overview */}
        <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100 px-6 py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base font-bold text-brand-navy">
                  Revenue Overview
                </CardTitle>

                <CardDescription className="mt-1">
                  Payment trends over the last
                  six months
                </CardDescription>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-brand-gold" />

                <span className="text-xs font-medium text-slate-600">
                  Revenue
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {loading ? (
              <ChartSkeleton />
            ) : revenueChartData.length === 0 ? (
              <EmptyChart
                icon={TrendingUp}
                title="No revenue data"
                description="Revenue statistics will appear here when payment data becomes available."
              />
            ) : (
              <ResponsiveContainer
                width="100%"
                height={320}
              >
                <AreaChart
                  data={revenueChartData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -15,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="revenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#1B2847"
                        stopOpacity={0.28}
                      />

                      <stop
                        offset="100%"
                        stopColor="#1B2847"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E2E8F0"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="date"
                    tick={{
                      fill: "#64748B",
                      fontSize: 12,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{
                      fill: "#64748B",
                      fontSize: 12,
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) =>
                      `₦${Number(
                        value ?? 0,
                      ).toLocaleString(
                        "en-NG",
                      )}`
                    }
                  />

                  <Tooltip
                    cursor={{
                      stroke: "#C8A951",
                      strokeDasharray:
                        "4 4",
                    }}
                    formatter={(value) => {
                      const numericValue =
                        typeof value ===
                        "number"
                          ? value
                          : Number(value ?? 0);

                      return [
                        formatCurrency(
                          numericValue,
                        ),
                        "Revenue",
                      ];
                    }}
                    contentStyle={{
                      backgroundColor:
                        "#ffffff",
                      border:
                        "1px solid #E2E8F0",
                      borderRadius:
                        "12px",
                      boxShadow:
                        "0 10px 30px rgba(15, 23, 42, 0.10)",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#1B2847"
                    strokeWidth={3}
                    fill="url(#revenueGradient)"
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: "#C8A951",
                      stroke:
                        "#ffffff",
                      strokeWidth: 3,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100 px-6 py-5">
            <CardTitle className="text-base font-bold text-brand-navy">
              Payment Methods
            </CardTitle>

            <CardDescription className="mt-1">
              Collection distribution by method
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            {loading ? (
              <ChartSkeleton />
            ) : paymentMethodChartData.length ===
              0 ? (
              <EmptyChart
                icon={CreditCard}
                title="No payment data"
                description="Payment method distribution will appear here when transactions are recorded."
              />
            ) : (
              <>
                <ResponsiveContainer
                  width="100%"
                  height={250}
                >
                  <PieChart>
                    <Pie
                      data={
                        paymentMethodChartData
                      }
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="#ffffff"
                      strokeWidth={3}
                    >
                      {paymentMethodChartData.map(
                        (
                          entry,
                          index,
                        ) => (
                          <Cell
                            key={`payment-method-${entry.name}-${index}`}
                            fill={
                              CHART_COLORS[
                                index %
                                  CHART_COLORS.length
                              ]
                            }
                          />
                        ),
                      )}
                    </Pie>

                    <Tooltip
                      formatter={(value) => {
                        const numericValue =
                          typeof value ===
                          "number"
                            ? value
                            : Number(
                                value ?? 0,
                              );

                        return [
                          formatCurrency(
                            numericValue,
                          ),
                          "Amount",
                        ];
                      }}
                      contentStyle={{
                        backgroundColor:
                          "#ffffff",
                        border:
                          "1px solid #E2E8F0",
                        borderRadius:
                          "12px",
                        boxShadow:
                          "0 10px 30px rgba(15, 23, 42, 0.10)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="mt-2 space-y-3">
                  {paymentMethodChartData.map(
                    (
                      item,
                      index,
                    ) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{
                              backgroundColor:
                                CHART_COLORS[
                                  index %
                                    CHART_COLORS.length
                                ],
                            }}
                          />

                          <span className="text-sm text-slate-600">
                            {item.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-brand-navy">
                            {formatCurrency(
                              item.value,
                            )}
                          </span>

                          <span className="w-10 text-right text-xs text-slate-400">
                            {
                              item.percentage
                            }
                            %
                          </span>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* =================================================
          OUTSTANDING FEES
      ================================================= */}

      <Card className="overflow-hidden border-amber-200 bg-gradient-to-r from-amber-50 via-white to-white shadow-sm">
        <CardHeader className="px-6 py-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <AlertCircle className="h-6 w-6" />
              </div>

              <div>
                <CardTitle className="text-base font-bold text-brand-navy">
                  Outstanding Fees
                </CardTitle>

                <CardDescription className="mt-1">
                  Monitor students with unpaid
                  financial obligations.
                </CardDescription>
              </div>
            </div>

            <Link href="/dashboards/finance/outstanding">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-amber-200 bg-white text-amber-800 hover:bg-amber-50 hover:text-amber-900"
              >
                View Outstanding Fees
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  Students Owing
                </p>

                <Clock3 className="h-4 w-4 text-slate-400" />
              </div>

              {loading ? (
                <div className="mt-3 h-9 w-24 animate-pulse rounded bg-slate-200" />
              ) : (
                <p className="mt-2 text-3xl font-bold tracking-tight text-brand-navy">
                  {outstandingStudents.toLocaleString(
                    "en-NG",
                  )}
                </p>
              )}

              <p className="mt-2 text-xs text-slate-400">
                Students requiring payment
                follow-up
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-amber-700">
                  Total Outstanding
                </p>

                <Wallet className="h-4 w-4 text-amber-600" />
              </div>

              {loading ? (
                <div className="mt-3 h-9 w-32 animate-pulse rounded bg-amber-100" />
              ) : (
                <p className="mt-2 text-2xl font-bold tracking-tight text-amber-700 sm:text-3xl">
                  {formatCurrency(
                    outstandingAmount,
                  )}
                </p>
              )}

              <p className="mt-2 text-xs text-amber-700/70">
                Total unpaid fee balance
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* =================================================
          RECENT TRANSACTIONS
      ================================================= */}

      <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100 px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-bold text-brand-navy">
                Recent Transactions
              </CardTitle>

              <CardDescription className="mt-1">
                Latest recorded student payments
              </CardDescription>
            </div>

            <Link href="/dashboards/finance/payments">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-slate-200 text-brand-navy hover:bg-slate-50"
              >
                View All Payments
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <TransactionSkeleton />
          ) : recentPayments.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <ReceiptText className="h-7 w-7" />
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-700">
                No transactions yet
              </p>

              <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
                Payment transactions will appear
                here once payments are recorded.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-sm">
                <thead>
                  <tr className="bg-slate-50/80">
                    <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Student
                    </th>

                    <th className="px-4 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Matric Number
                    </th>

                    <th className="px-4 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Amount
                    </th>

                    <th className="px-4 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Method
                    </th>

                    <th className="px-4 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentPayments.map(
                    (payment) => {
                      const MethodIcon =
                        getPaymentMethodIcon(
                          payment.method,
                        );

                      return (
                        <tr
                          key={payment._id}
                          className="group border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/70"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-white">
                                {payment.student?.name
                                  ?.charAt(0)
                                  ?.toUpperCase() ||
                                  "S"}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate font-semibold text-brand-navy">
                                  {payment.student
                                    ?.name ||
                                    "Unknown Student"}
                                </p>

                                <p className="truncate text-xs text-slate-400">
                                  {payment.student
                                    ?.email ||
                                    "No email"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs font-medium text-slate-600">
                              {payment.student
                                ?.matricNumber ||
                                "N/A"}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <span className="font-bold text-brand-navy">
                              {formatCurrency(
                                payment.amount,
                              )}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2 text-slate-600">
                              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                                <MethodIcon className="h-4 w-4" />
                              </span>

                              <span className="text-xs font-medium">
                                {getPaymentMethodLabel(
                                  payment.method,
                                )}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            {getStatusBadge()}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-slate-500">
                              <Clock3 className="h-3.5 w-3.5" />

                              <span className="text-xs">
                                {formatDate(
                                  payment.createdAt,
                                )}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* =================================================
          QUICK ACTIONS
      ================================================= */}

      <div>
        <div className="mb-4">
          <h2 className="text-base font-bold text-brand-navy">
            Quick Actions
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Access common finance operations
            quickly.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <QuickAction
            href="/dashboards/finance/payments/record"
            title="Record Payment"
            description="Add a new student payment"
            icon={Banknote}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <QuickAction
            href="/dashboards/finance/payments"
            title="View Payments"
            description="Browse payment transactions"
            icon={CreditCard}
            iconClass="bg-blue-50 text-blue-600"
          />

          <QuickAction
            href="/dashboards/finance/fees"
            title="Fee Structures"
            description="Manage academic fees"
            icon={Wallet}
            iconClass="bg-amber-50 text-amber-600"
          />

          <QuickAction
            href="/dashboards/finance/outstanding"
            title="Outstanding Fees"
            description="Review unpaid balances"
            icon={AlertCircle}
            iconClass="bg-red-50 text-red-600"
          />

          <QuickAction
            href="/dashboards/finance/reports"
            title="Financial Reports"
            description="View finance reports"
            icon={TrendingUp}
            iconClass="bg-violet-50 text-violet-600"
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   KPI CARD
========================================================= */

function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  loading,
  accent,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  loading: boolean;
  accent:
    | "navy"
    | "green"
    | "gold"
    | "blue";
}) {
  const accentStyles = {
    navy: {
      icon: "bg-brand-navy text-white",
      border: "hover:border-brand-navy/20",
      glow: "bg-brand-navy/5",
    },

    green: {
      icon: "bg-emerald-600 text-white",
      border: "hover:border-emerald-200",
      glow: "bg-emerald-50",
    },

    gold: {
      icon: "bg-brand-gold text-brand-navy",
      border: "hover:border-brand-gold/40",
      glow: "bg-brand-gold/10",
    },

    blue: {
      icon: "bg-blue-600 text-white",
      border: "hover:border-blue-200",
      glow: "bg-blue-50",
    },
  };

  const styles = accentStyles[accent];

  return (
    <Card
      className={`group relative overflow-hidden border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${styles.border}`}
    >
      {/* Decorative accent */}
      <div
        className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${styles.glow} transition-transform duration-500 group-hover:scale-125`}
      />

      <CardContent className="relative p-5 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {title}
            </p>

            {loading ? (
              <div className="mt-3 h-8 w-32 animate-pulse rounded-lg bg-slate-200" />
            ) : (
              <p className="mt-2 truncate text-2xl font-bold tracking-tight text-brand-navy sm:text-[27px]">
                {value}
              </p>
            )}

            <p className="mt-2 text-xs text-slate-400">
              {subtitle}
            </p>
          </div>

          <div
            className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm ${styles.icon}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* =========================================================
   QUICK ACTION
========================================================= */

function QuickAction({
  href,
  title,
  description,
  icon: Icon,
  iconClass,
}: {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  iconClass: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-brand-navy">
            {title}
          </p>

          <p className="mt-0.5 truncate text-xs text-slate-400">
            {description}
          </p>
        </div>

        <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-brand-navy" />
      </div>
    </Link>
  );
}

/* =========================================================
   CHART SKELETON
========================================================= */

function ChartSkeleton() {
  return (
    <div className="flex h-[320px] items-end gap-3 px-4 pb-5">
      <div className="h-24 flex-1 animate-pulse rounded-t-lg bg-slate-100" />
      <div className="h-40 flex-1 animate-pulse rounded-t-lg bg-slate-100" />
      <div className="h-32 flex-1 animate-pulse rounded-t-lg bg-slate-100" />
      <div className="h-52 flex-1 animate-pulse rounded-t-lg bg-slate-100" />
      <div className="h-44 flex-1 animate-pulse rounded-t-lg bg-slate-100" />
      <div className="h-64 flex-1 animate-pulse rounded-t-lg bg-slate-100" />
    </div>
  );
}

/* =========================================================
   EMPTY CHART
========================================================= */

function EmptyChart({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex h-[320px] flex-col items-center justify-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Icon className="h-7 w-7" />
      </div>

      <p className="mt-4 text-sm font-semibold text-slate-700">
        {title}
      </p>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   TRANSACTION SKELETON
========================================================= */

function TransactionSkeleton() {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: 5 }).map(
        (_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 px-6 py-5"
          >
            <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200" />

            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />

              <div className="h-2.5 w-24 animate-pulse rounded bg-slate-100" />
            </div>

            <div className="hidden h-4 w-24 animate-pulse rounded bg-slate-100 sm:block" />

            <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />

            <div className="hidden h-7 w-20 animate-pulse rounded-full bg-slate-100 md:block" />
          </div>
        ),
      )}
    </div>
  );
}

