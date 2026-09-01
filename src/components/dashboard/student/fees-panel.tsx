"use client";

import { useEffect, useState } from "react";

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

interface Balance {
  feeAmount: number;
  totalPaid: number;
  balance: number;
  hasFeeStructure: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-xl font-semibold text-brand-navy">Fees</h2>

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
                Fee: {balance.feeAmount.toLocaleString()} • Paid:{" "}
                {balance.totalPaid.toLocaleString()} •{" "}
                <span
                  className={
                    balance.balance > 0
                      ? "font-semibold text-red-600"
                      : "font-semibold text-green-600"
                  }
                >
                  {balance.balance > 0
                    ? `Balance owed: ${balance.balance.toLocaleString()}`
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
        </>
      )}
    </div>
  );
}