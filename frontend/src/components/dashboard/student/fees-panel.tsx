"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";

interface Semester {
  _id: string;
  name: string;
}

type PaymentMethod = "cash" | "bank_transfer" | "card" | "other";
type PaymentStatus = "pending" | "successful" | "failed" | "refunded" | "cancelled";
type PaymentPurpose = "tuition" | "registration" | "examination" | "acceptance" | "transcript" | "certificate" | "hostel" | "other";

interface Payment {
  _id: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  purpose: PaymentPurpose;
  paymentReference: string;
  status: PaymentStatus;
  semester?: {
    _id: string;
    name: string;
  };
  createdAt: string;
  paidAt?: string;
}

interface Balance {
  feeAmount: number;
  totalPaid: number;
  balance: number;
  hasFeeStructure: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

export default function FeesPanel({ accessToken }: { accessToken: string }) {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [balance, setBalance] = useState<Balance | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/semesters`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const list = data.semesters || [];
        setSemesters(list);
        if (list.length > 0) {
          setSelectedSemester(list[0]._id);
        }
      });
  }, [accessToken]);

  useEffect(() => {
    if (!selectedSemester) return;

    setIsLoading(true);

    Promise.all([
      fetch(`${API_URL}/payments/me/balance?semester=${selectedSemester}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }).then((r) => r.json()),
      fetch(`${API_URL}/payments/me?semester=${selectedSemester}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }).then((r) => r.json()),
    ]).then(([balanceData, paymentsData]) => {
      setBalance(balanceData.balance || null);
      setPayments(paymentsData.payments || []);
      setIsLoading(false);
    });
  }, [selectedSemester, accessToken]);

  const formatCurrency = (amount: number, currency: string = "NGN") => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-NG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: PaymentStatus) => {
    const variants: Record<PaymentStatus, { bg: string; text: string; icon: any }> = {
      pending: { bg: "bg-amber-50", text: "text-amber-700", icon: Clock },
      successful: { bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle },
      failed: { bg: "bg-red-50", text: "text-red-700", icon: XCircle },
      refunded: { bg: "bg-slate-50", text: "text-slate-700", icon: AlertCircle },
      cancelled: { bg: "bg-slate-50", text: "text-slate-700", icon: XCircle },
    };

    const { bg, text, icon: Icon } = variants[status];

    return (
      <Badge className={`border-0 ${bg} ${text} shadow-none`}>
        <Icon className="mr-1 h-3 w-3" />
        {STATUS_LABELS[status]}
      </Badge>
    );
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-xl font-semibold text-brand-navy">Fees & Payments</h2>

      <label className="mt-4 block text-sm font-medium">Semester</label>
      <select
        value={selectedSemester}
        onChange={(e) => setSelectedSemester(e.target.value)}
        className="mt-1 w-full max-w-xs rounded-md border border-slate-300 px-3 py-2"
      >
        {semesters.map((s) => (
          <option key={s._id} value={s._id}>
            {s.name}
          </option>
        ))}
      </select>

      {isLoading && <p className="mt-4 text-sm text-slate-500">Loading...</p>}

      {!isLoading && balance && (
        <>
          {!balance.hasFeeStructure ? (
            <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
              No fee has been set for your programme this semester yet.
            </p>
          ) : (
            <div className="mt-4 rounded-lg bg-brand-light p-4 text-sm">
              <p className="font-medium text-brand-navy">Balance summary</p>
              <p className="mt-1 text-slate-600">
                Fee: {formatCurrency(balance.feeAmount)} • Paid:{" "}
                {formatCurrency(balance.totalPaid)} •{" "}
                <span
                  className={
                    balance.balance > 0
                      ? "font-semibold text-red-600"
                      : "font-semibold text-green-600"
                  }
                >
                  {balance.balance > 0
                    ? `Balance owed: ${formatCurrency(balance.balance)}`
                    : "Fully paid"}
                </span>
              </p>
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-brand-navy">Payment history</h3>

            {payments.length === 0 ? (
              <p className="mt-2 text-sm text-slate-600">No payments recorded yet.</p>
            ) : (
              <table className="mt-2 w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Reference</th>
                    <th className="pb-2">Purpose</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Method</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p._id} className="border-b border-slate-100">
                      <td className="py-2">{formatDate(p.paidAt || p.createdAt)}</td>
                      <td className="py-2 font-medium text-brand-navy">{p.paymentReference}</td>
                      <td className="py-2">{PURPOSE_LABELS[p.purpose]}</td>
                      <td className="py-2 font-medium text-brand-navy">
                        {formatCurrency(p.amount, p.currency)}
                      </td>
                      <td className="py-2">{METHOD_LABELS[p.method]}</td>
                      <td className="py-2">{getStatusBadge(p.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}