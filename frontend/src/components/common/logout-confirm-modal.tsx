
"use client";

import { useEffect } from "react";
import { LogOut, ShieldCheck, X } from "lucide-react";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export default function LogoutConfirmModal({
  isOpen,
  isLoading = false,
  onClose,
  onConfirm,
}: LogoutConfirmModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isLoading) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto p-4"
      role="presentation"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close logout confirmation"
        tabIndex={isLoading ? -1 : 0}
        disabled={isLoading}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-brand-dark/60 backdrop-blur-[3px] disabled:cursor-default"
      />

      {/* Modal */}
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-modal-title"
        aria-describedby="logout-modal-description"
        className="relative z-10 my-auto w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_24px_80px_rgba(15,27,51,0.24)]"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 sm:px-7">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-600">
              <LogOut className="h-5 w-5" />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-gold">
                ITMT Account
              </p>

              <h2
                id="logout-modal-title"
                className="mt-1 text-lg font-bold tracking-tight text-brand-navy"
              >
                Sign out?
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close dialog"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-brand-navy disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 sm:px-7">
          <p
            id="logout-modal-description"
            className="text-sm leading-6 text-slate-600"
          >
            Are you sure you want to sign out of your ITMT account? You will
            need to sign in again to access your dashboard.
          </p>

          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-200 bg-[#FAFAFA] p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-navy" />

            <div>
              <p className="text-xs font-bold text-brand-navy">
                Your account stays protected
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Make sure you have saved any work before signing out.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-brand-navy disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing out...
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4" />
                  Confirm sign out
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-3.5 text-center sm:px-7">
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            ITMT Management System
          </p>
        </div>
      </section>
    </div>
  );
}
