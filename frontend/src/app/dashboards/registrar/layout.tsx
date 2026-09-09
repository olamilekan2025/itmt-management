"use client";

import { useState } from "react";

import Sidebar from "@/components/dashboard/registrar/sidebar";
import Header from "@/components/dashboard/registrar/header";

export default function RegistrarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Registrar Sidebar — render ONLY here */}
      <Sidebar
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main application area */}
      <div
        className={[
          "min-h-screen",
          "transition-[padding-left] duration-300 ease-in-out",
          collapsed ? "lg:pl-20" : "lg:pl-72",
        ].join(" ")}
      >
        {/* Registrar Header — render ONLY here */}
        <Header
          userName="Registrar"
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

