"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";

import Header from "@/components/dashboard/finance/header";
import Sidebar from "@/components/dashboard/finance/sidebar";

import {
  FinanceDashboardProvider,
  useFinanceDashboard,
} from "@/components/dashboard/finance/finance-dashboard-context";

function FinanceDashboardShell({
  children,
  userName,
}: {
  children: ReactNode;
  userName: string;
}) {
  const { collapsed } = useFinanceDashboard();

  return (
    <div
      className="
        min-h-screen
        bg-slate-50
        text-slate-900
        dark:bg-slate-950
        dark:text-slate-100
      "
    >
      <Sidebar />

      <div
        className={`
          min-h-screen
          transition-[padding]
          duration-300
          ease-in-out
          ${
            collapsed
              ? "md:pl-[88px]"
              : "md:pl-72"
          }
        `}
      >
        <Header userName={userName} />

        <main className="min-h-screen pt-16">
          <div
            className="
              mx-auto
              w-full
              max-w-[1680px]
              px-4
              py-5
              sm:px-6
              sm:py-6
              lg:px-8
              lg:py-8
            "
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function FinanceDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [userName, setUserName] =
    useState("Finance User");

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      try {
        const session = await getSession();

        if (!mounted) return;

        const name = session?.user?.name?.trim();

        setUserName(name || "Finance User");
      } catch (error) {
        console.error(
          "Unable to load finance session:",
          error,
        );
      }
    };

    void loadSession();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <FinanceDashboardProvider>
      <FinanceDashboardShell userName={userName}>
        {children}
      </FinanceDashboardShell>
    </FinanceDashboardProvider>
  );
}