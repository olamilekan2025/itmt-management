"use client";

import { useState } from "react";

import AdminHeader from "@/components/dashboard/admin/admin-header";
import AdminSidebar from "@/components/dashboard/admin/admin-sidebar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      <div
        className={`min-h-screen transition-[padding] duration-300 ${
          sidebarCollapsed
            ? "lg:pl-20"
            : "lg:pl-72"
        }`}
      >
        <AdminHeader
          onMenuClick={() => setMobileSidebarOpen(true)}
        />

        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}