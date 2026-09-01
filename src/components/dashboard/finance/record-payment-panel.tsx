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

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RecordPaymentPanel({
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
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [reference, setReference] = useState("");
  const [message, setMessage] = useState("");
  const [balance, setBalance] = useState<{
    feeAmount: number;
    totalPaid: number;
    balance: number;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!student || !semester || !amount) {
      setMessage("Fill in student, semester, and amount.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    const res = await fetch(`${API_URL}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        student,
        semester,
        amount: Number(amount),
        method,
        ...(reference ? { reference } : {}),
      }),
    });

    const data = await res.json();

    setMessage(data.message || (res.ok ? "Payment recorded." : "Something went wrong."));
    setIsSubmitting(false);

    if (res.ok) {
      setBalance(data.balance);
      setAmount("");
      setReference("");
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-xl font-semibold text-brand-navy">Record Payment</h2>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
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

        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          type="number"
          min={0}
          className="rounded-md border border-slate-300 px-3 py-2"
        />

        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2"
        >
          <option value="cash">Cash</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="card">Card</option>
          <option value="other">Other</option>
        </select>

        <input
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Reference (optional)"
          className="rounded-md border border-slate-300 px-3 py-2 sm:col-span-2"
        />
      </div>

      {message && <p className="mt-3 text-sm text-brand-navy">{message}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="mt-4 rounded-md bg-brand-navy px-4 py-2 font-medium text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Recording..." : "Record payment"}
      </button>

      {balance && (
        <div className="mt-6 rounded-lg bg-brand-light p-4 text-sm">
          <p className="font-medium text-brand-navy">Updated balance</p>
          <p className="mt-1 text-slate-600">
            Fee: {balance.feeAmount.toLocaleString()} • Paid: {balance.totalPaid.toLocaleString()} •{" "}
            <span className={balance.balance > 0 ? "font-semibold text-red-600" : "font-semibold text-green-600"}>
              {balance.balance > 0
                ? `Balance owed: ${balance.balance.toLocaleString()}`
                : "Fully paid"}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}