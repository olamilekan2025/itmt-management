"use client";

import { useState } from "react";

interface Student {
  _id: string;
  name: string;
  email: string;
  programme?: { _id: string; name: string; code: string };
  matricNumber?: string;
}

interface Programme {
  _id: string;
  name: string;
  code: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function StudentsPanel({
  accessToken,
  students,
  programmes,
}: {
  accessToken: string;
  students: Student[];
  programmes: Programme[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedProgramme, setSelectedProgramme] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function startEdit(student: Student) {
    setEditingId(student._id);
    setSelectedProgramme(student.programme?._id || "");
    setMatricNumber(student.matricNumber || "");
    setMessage("");
  }

  async function saveEdit(studentId: string) {
    if (!selectedProgramme) {
      setMessage("Select a programme first.");
      return;
    }

    setIsSubmitting(true);

    const res = await fetch(`${API_URL}/users/${studentId}/programme`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        programme: selectedProgramme,
        ...(matricNumber ? { matricNumber } : {}),
      }),
    });

    const data = await res.json();

    setMessage(data.message || (res.ok ? "Updated." : "Something went wrong."));
    setIsSubmitting(false);

    if (res.ok) {
      setEditingId(null);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-xl font-semibold text-brand-navy">Students</h2>

      {message && <p className="mt-2 text-sm text-brand-navy">{message}</p>}

      <table className="mt-4 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500">
            <th className="pb-2">Name</th>
            <th className="pb-2">Email</th>
            <th className="pb-2">Programme</th>
            <th className="pb-2">Matric No.</th>
            <th className="pb-2"></th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s._id} className="border-b border-slate-100 align-top">
              <td className="py-2">{s.name}</td>
              <td className="py-2">{s.email}</td>
              <td className="py-2">
                {editingId === s._id ? (
                  <select
                    value={selectedProgramme}
                    onChange={(e) => setSelectedProgramme(e.target.value)}
                    className="rounded-md border border-slate-300 px-2 py-1"
                  >
                    <option value="">Select programme</option>
                    {programmes.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.code}
                      </option>
                    ))}
                  </select>
                ) : (
                  s.programme?.name || "—"
                )}
              </td>
              <td className="py-2">
                {editingId === s._id ? (
                  <input
                    value={matricNumber}
                    onChange={(e) => setMatricNumber(e.target.value)}
                    className="w-32 rounded-md border border-slate-300 px-2 py-1"
                  />
                ) : (
                  s.matricNumber || "—"
                )}
              </td>
              <td className="py-2">
                {editingId === s._id ? (
                  <button
                    type="button"
                    onClick={() => saveEdit(s._id)}
                    disabled={isSubmitting}
                    className="rounded-md bg-brand-navy px-3 py-1 text-white hover:bg-brand-dark disabled:opacity-60"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => startEdit(s)}
                    className="text-brand-navy underline hover:text-brand-blue"
                  >
                    Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}