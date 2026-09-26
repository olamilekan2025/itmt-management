"use client";

import { signOut } from "next-auth/react";

interface Props {
  userName: string;
}

export default function StudentHeader({ userName }: Props) {
  return (
    <header className="sticky top-0 z-40 flex h-[73px] items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 shadow-sm backdrop-blur-md sm:px-6 lg:px-8">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 sm:text-xs">
          Student Portal
        </p>

        <p className="mt-0.5 truncate text-base font-bold text-brand-navy sm:text-lg">
          Welcome, {userName}
        </p>
      </div>

      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/auth/login" })}
        className="rounded-xl bg-brand-navy px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-md active:translate-y-0 md:hidden"
      >
        Sign out
      </button>
    </header>
  );
}