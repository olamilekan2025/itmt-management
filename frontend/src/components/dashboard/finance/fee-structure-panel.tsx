"use client";

import { useState } from "react";

interface Programme {
  _id: string;
  name: string;
  code: string;
}

interface Semester {
  _id: string;
  name: string;
}

interface FeeStructure {
  _id: string;
  programme: { name: string; code: string };
  level: string;
  semester: { name: string };
  amount: number;
  description?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function FeeStructurePanel({
  accessToken,
  programmes,
  semesters,
  feeStructures,
}: {
  accessToken: string;
  programmes: Programme[];
  semesters: Semester[];
  feeStructures: FeeStructure[];
}) {
  const [programme, setProgramme] = useState("");
  const [level, setLevel] = useState("");
  const [semester, setSemester] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!programme || !level || !semester || !amount) {
      setMessage("Fill in programme, level, semester, and amount.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    const res = await fetch(`${API_URL}/fee-structures`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        programme,
        level,
        semester,
        amount: Number(amount),
        ...(description ? { description } : {}),
      }),
    });

    const data = await res.json();

    setMessage(data.message || (res.ok ? "Fee structure created." : "Something went wrong."));
    setIsSubmitting(false);

    if (res.ok) {
      setLevel("");
      setAmount("");
      setDescription("");
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-xl font-semibold text-brand-navy">Fee Structures</h2>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <select
          value={programme}
          onChange={(e) => setProgramme(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2"
        >
          <option value="">Programme</option>
          {programmes.map((p) => (
            <option key={p._id} value={p._id}>
              {p.code}
            </option>
          ))}
        </select>

        <input
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          placeholder="Level (e.g. ND 1)"
          className="rounded-md border border-slate-300 px-3 py-2"
        />

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

        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
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
        {isSubmitting ? "Creating..." : "Create fee structure"}
      </button>

      <div className="mt-8 border-t border-slate-100 pt-6">
        <h3 className="text-sm font-semibold text-brand-navy">Existing Fee Structures</h3>

        {feeStructures.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">No fee structures yet.</p>
        ) : (
          <table className="mt-3 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-2">Programme</th>
                <th className="pb-2">Level</th>
                <th className="pb-2">Semester</th>
                <th className="pb-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {feeStructures.map((f) => (
                <tr key={f._id} className="border-b border-slate-100">
                  <td className="py-2">{f.programme.code}</td>
                  <td className="py-2">{f.level}</td>
                  <td className="py-2">{f.semester.name}</td>
                  <td className="py-2 font-medium text-brand-navy">
                    {f.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}