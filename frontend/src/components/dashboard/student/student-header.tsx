
"use client";

import { useState } from "react";

import LogoutConfirmModal from "@/components/common/logout-confirm-modal";
import { logoutUser } from "@/lib/auth/sign-out";

interface Props {
  userName: string;
}

export default function StudentHeader({ userName }: Props) {
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;

    try {
      setLoggingOut(true);
      await logoutUser("/");
    } catch (error) {
      console.error("Student header logout failed:", error);
      setLoggingOut(false);
      setLogoutOpen(false);
    }
  };

  const closeLogoutModal = () => {
    if (loggingOut) return;
    setLogoutOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex h-[73px] items-center justify-between gap-4 border-b border-slate-200/80 bg-white/95 px-4 shadow-sm backdrop-blur-md sm:px-6 lg:px-8">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 sm:text-xs">
            Student Portal
          </p>

          <p className="mt-0.5 truncate text-base font-bold text-brand-navy sm:text-lg">
            Welcome, {userName?.trim() || "Student"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setLogoutOpen(true)}
          aria-label="Sign out of your student account"
          className="shrink-0 rounded-xl bg-brand-navy px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 active:scale-[0.98] md:hidden"
        >
          Sign out
        </button>
      </header>

      <LogoutConfirmModal
        isOpen={logoutOpen}
        isLoading={loggingOut}
        onClose={closeLogoutModal}
        onConfirm={handleLogout}
      />
    </>
  );
}
