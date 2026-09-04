"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  CircleDollarSign,
  LogOut,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useFinanceDashboard } from "@/components/dashboard/finance/finance-dashboard-context";

interface Props {
  userName: string;
}

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "FA"
  );
}

export default function FinanceHeader({
  userName,
}: Props) {
  const { data: session } = useSession();
  const { collapsed } = useFinanceDashboard();

  const [showLogoutDialog, setShowLogoutDialog] =
    useState(false);

  const [isSigningOut, setIsSigningOut] =
    useState(false);

  const displayName =
    userName?.trim() ||
    session?.user?.name?.trim() ||
    "Finance User";

  const email =
    session?.user?.email ||
    "Finance & Accounts";

  const initials = getInitials(displayName);

  async function handleConfirmSignOut() {
    if (isSigningOut) return;

    try {
      setIsSigningOut(true);

      await signOut({
        callbackUrl: "/auth/login",
      });
    } catch (error) {
      console.error("Sign out error:", error);
      setIsSigningOut(false);
    }
  }

  return (
    <>
      {/* =========================================================
          HEADER
      ========================================================== */}
      <header
        className={`
          fixed
          inset-x-0
          top-0
          z-40
          h-16
          border-b
          border-slate-200/80
          bg-white/90
          backdrop-blur-xl
          shadow-[0_1px_15px_rgba(15,23,42,0.05)]
          transition-[left]
          duration-300
          ease-in-out
          dark:border-slate-800
          dark:bg-slate-950/90
          md:left-[88px]
          ${collapsed ? "lg:left-[88px]" : "lg:left-72"}
        `}
      >
        <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-7">
          {/* =====================================================
              LEFT
          ====================================================== */}
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="
                hidden
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-brand-navy
                shadow-sm
                sm:flex
              "
            >
              <CircleDollarSign className="h-5 w-5 text-white" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p
                  className="
                    truncate
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-slate-400
                    sm:text-[11px]
                  "
                >
                  Finance & Accounts
                </p>

                <span className="hidden items-center gap-1.5 sm:flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                  <span className="text-[10px] font-medium text-emerald-600">
                    Online
                  </span>
                </span>
              </div>

              <p
                className="
                  truncate
                  text-sm
                  font-bold
                  tracking-tight
                  text-brand-navy
                  sm:text-base
                  dark:text-white
                "
              >
                Finance Portal
              </p>
            </div>
          </div>

          {/* =====================================================
              RIGHT
          ====================================================== */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* User profile */}
            <div
              className="
                flex
                items-center
                gap-2.5
                rounded-2xl
                border
                border-slate-200
                bg-slate-50/80
                px-2
                py-1.5
                sm:gap-3
                sm:px-3
                dark:border-slate-800
                dark:bg-slate-900/80
              "
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-gradient-to-br
                    from-brand-navy
                    to-brand-blue
                    text-xs
                    font-bold
                    text-white
                    shadow-sm
                    ring-2
                    ring-white
                    dark:ring-slate-950
                  "
                >
                  {initials}
                </div>

                <span
                  className="
                    absolute
                    -bottom-0.5
                    -right-0.5
                    h-2.5
                    w-2.5
                    rounded-full
                    border-2
                    border-white
                    bg-emerald-500
                    dark:border-slate-950
                  "
                />
              </div>

              {/* User details */}
              <div className="hidden min-w-0 md:block">
                <div className="flex items-center gap-1.5">
                  <p
                    className="
                      max-w-[150px]
                      truncate
                      text-sm
                      font-semibold
                      text-slate-900
                      dark:text-white
                    "
                  >
                    {displayName}
                  </p>

                  <ShieldCheck
                    className="h-3.5 w-3.5 shrink-0 text-brand-gold"
                    aria-label="Verified account"
                  />
                </div>

                <p
                  className="
                    max-w-[180px]
                    truncate
                    text-[11px]
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  {email}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden h-8 w-px bg-slate-200 sm:block dark:bg-slate-800" />

            {/* Logout */}
            <button
              type="button"
              onClick={() => setShowLogoutDialog(true)}
              aria-label="Sign out"
              title="Sign out"
              className="
                group
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                bg-white
                text-slate-500
                shadow-sm
                transition-all
                duration-200
                hover:border-red-200
                hover:bg-red-50
                hover:text-red-600
                hover:shadow-md
                focus:outline-none
                focus:ring-2
                focus:ring-red-500/20
                dark:border-slate-800
                dark:bg-slate-900
                dark:text-slate-400
              "
            >
              <LogOut
                className="
                  h-4
                  w-4
                  transition-transform
                  duration-200
                  group-hover:translate-x-0.5
                "
              />
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================
          LOGOUT DIALOG
      ========================================================== */}
      <Dialog
        open={showLogoutDialog}
        onOpenChange={(open) => {
          if (!isSigningOut) {
            setShowLogoutDialog(open);
          }
        }}
      >
        <DialogContent
          className="
            w-[calc(100%-2rem)]
            max-w-sm
            overflow-hidden
            rounded-2xl
            border-slate-200
            p-0
            shadow-2xl
          "
        >
          <div className="h-1 bg-gradient-to-r from-brand-navy via-brand-blue to-brand-gold" />

          <div className="p-6">
            <DialogHeader>
              <div
                className="
                  mx-auto
                  mb-3
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-red-50
                  ring-8
                  ring-red-50/50
                "
              >
                <LogOut className="h-6 w-6 text-red-600" />
              </div>

              <DialogTitle
                className="
                  text-center
                  text-xl
                  font-bold
                  tracking-tight
                  text-slate-900
                "
              >
                Sign out?
              </DialogTitle>

              <DialogDescription
                className="
                  mx-auto
                  max-w-xs
                  text-center
                  text-sm
                  leading-6
                  text-slate-500
                "
              >
                You are about to leave the Finance Portal.
                You&apos;ll need to sign in again to
                continue.
              </DialogDescription>
            </DialogHeader>

            {/* Account preview */}
            <div
              className="
                mt-5
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                p-3
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-brand-navy
                  text-xs
                  font-bold
                  text-white
                "
              >
                {initials}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {displayName}
                </p>

                <p className="truncate text-xs text-slate-500">
                  {email}
                </p>
              </div>
            </div>

            {/* Actions */}
            <DialogFooter className="mt-6 flex-col gap-2 sm:flex-col">
              <Button
                type="button"
                onClick={handleConfirmSignOut}
                disabled={isSigningOut}
                className="
                  h-11
                  w-full
                  rounded-xl
                  bg-brand-navy
                  font-semibold
                  text-white
                  shadow-sm
                  transition-all
                  hover:bg-brand-dark
                  hover:shadow-md
                "
              >
                {isSigningOut ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing out...
                  </>
                ) : (
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setShowLogoutDialog(false)
                }
                disabled={isSigningOut}
                className="
                  h-11
                  w-full
                  rounded-xl
                  border-slate-200
                  font-semibold
                  text-slate-700
                  hover:bg-slate-50
                "
              >
                Stay signed in
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}