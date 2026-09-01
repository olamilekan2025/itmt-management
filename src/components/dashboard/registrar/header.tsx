"use client";

import { signOut } from "next-auth/react";

interface Props {
  userName: string;
}

export default function RegistrarHeader({ userName }: Props) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Registrar Portal
        </p>
        <p className="text-lg font-semibold text-brand-navy">
          Welcome, {userName}
        </p>
      </div>

      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/auth/login" })}
        className="rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark md:hidden"
      >
        Sign out
      </button>
    </header>
  );
}