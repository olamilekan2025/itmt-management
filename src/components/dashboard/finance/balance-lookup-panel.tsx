"use client";

import { useState } from "react";

interface Student {
  _id: string;
  name: string;
  matricNumber?: string;
}

interface Semester {
  _id: string;
  name: string;
}

interface Payment {
  _id: string;
  amount: number;
  method: string;
  reference?: string;
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function BalanceLookupPanel({
  accessToken,
  students,
  semesters,
}: {
  accessToken: string;
  students: Student[];
  semesters: Semester[];
}) {
  const [student, setStudent] = useState("");
  const [semester, setSemester] = useState("");
  const [balance, setBalance] = useState<{
    feeAmount: number;
    totalPaid: number;
    balance: number;
    hasFeeStructure: boolean;
  } | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function handleLookup() {
    if (!student || !semester) return;

    setIsLoading(true);

    const [balanceRes, paymentsRes] = await Promise.all([
      fetch(`${API_URL}/payments/balance?student=${student}&semester=${semester}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }).then((r) => r.json()),
      fetch(`${API_URL}/payments?student=${student}&semester=${semester}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }).then((r) => r.json()),
    ]);

    setBalance(balanceRes.balance || null);
    setPayments(paymentsRes.payments || []);
    setIsLoading(false);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-xl font-semibold text-brand-navy">Check Balance</h2>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <select
          value={student}
          onChange={(e) => setStudent(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2"
        >
          <option value="">Student</option>
          {students.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
              {s.matricNumber ? ` (${s.matricNumber})` : ""}
            </option>
          ))}
        </select>

        <select
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2"
        >
          <option value="">Semester</option>
          {semesters.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleLookup}
          disabled={isLoading || !student || !semester}
          className="rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Checking..." : "Check"}
        </button>
      </div>

      {balance && (
        <div className="mt-6 space-y-4">
          {!balance.hasFeeStructure && (
            <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
              No fee structure exists for this student&apos;s programme/level/semester yet.
            </p>
          )}

          <div className="rounded-lg bg-brand-light p-4 text-sm">
            <p className="font-medium text-brand-navy">Balance summary</p>
            <p className="mt-1 text-slate-600">
              Fee: {balance.feeAmount.toLocaleString()} • Paid: {balance.totalPaid.toLocaleString()} •{" "}
              <span className={balance.balance > 0 ? "font-semibold text-red-600" : "font-semibold text-green-600"}>
                {balance.balance > 0
                  ? `Balance owed: ${balance.balance.toLocaleString()}`
                  : "Fully paid"}
              </span>
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-brand-navy">Payment history</h3>
            {payments.length === 0 ? (
              <p className="mt-2 text-sm text-slate-600">No payments recorded yet.</p>
            ) : (
              <table className="mt-2 w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Method</th>
                    <th className="pb-2">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p._id} className="border-b border-slate-100">
                      <td className="py-2">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="py-2 font-medium text-brand-navy">
                        {p.amount.toLocaleString()}
                      </td>
                      <td className="py-2 capitalize">{p.method.replace("_", " ")}</td>
                      <td className="py-2">{p.reference || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}