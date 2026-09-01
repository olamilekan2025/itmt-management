"use client";

import { useEffect, useState } from "react";

interface StaffUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const ROLES = ["registrar", "finance", "lecturer", "admin"];

export default function CreateStaffPanel({ accessToken }: { accessToken: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("registrar");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(true);

  async function loadStaff() {
    setIsLoadingStaff(true);
    const res = await fetch(`${API_URL}/users/staff`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    setStaff(data.users || []);
    setIsLoadingStaff(false);
  }

  useEffect(() => {
    loadStaff();
  }, []);

  async function handleSubmit() {
    if (!name || !email || !password) {
      setMessage("Fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    const res = await fetch(`${API_URL}/users/staff`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json();

    setMessage(data.message || (res.ok ? "Staff account created." : "Something went wrong."));
    setIsSubmitting(false);

    if (res.ok) {
      setName("");
      setEmail("");
      setPassword("");
      loadStaff();
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-xl font-semibold text-brand-navy">Create Staff Account</h2>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          className="rounded-md border border-slate-300 px-3 py-2"
        />

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          className="rounded-md border border-slate-300 px-3 py-2"
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Temporary password"
          type="password"
          className="rounded-md border border-slate-300 px-3 py-2"
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {message && <p className="mt-3 text-sm text-brand-navy">{message}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="mt-4 rounded-md bg-brand-navy px-4 py-2 font-medium text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Creating..." : "Create staff account"}
      </button>

      <div className="mt-8 border-t border-slate-100 pt-6">
        <h3 className="text-sm font-semibold text-brand-navy">Existing Staff</h3>

        {isLoadingStaff ? (
          <p className="mt-2 text-sm text-slate-500">Loading...</p>
        ) : staff.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">No staff accounts yet.</p>
        ) : (
          <table className="mt-3 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-2">Name</th>
                <th className="pb-2">Email</th>
                <th className="pb-2">Role</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s._id} className="border-b border-slate-100">
                  <td className="py-2">{s.name}</td>
                  <td className="py-2">{s.email}</td>
                  <td className="py-2 capitalize">{s.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}