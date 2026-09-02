"use client";

import { signOut } from "next-auth/react";

interface NavItem {
  label: string;
  sectionId: string;
}

const navItems: NavItem[] = [
  { label: "Overview", sectionId: "overview" },
  { label: "Courses", sectionId: "courses" },
  { label: "Results", sectionId: "results" },
  { label: "Fees", sectionId: "fees" },
  { label: "Register", sectionId: "register" },
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function StudentSidebar() {
  return (
    <aside className="hidden w-64 flex-col bg-brand-navy p-6 text-white md:flex">
      <div className="flex items-center gap-2 border-b border-white/10 pb-6">
        <span className="h-2 w-2 rounded-full bg-brand-gold" />
        <span className="font-semibold">ITMT</span>
      </div>

      <nav className="mt-6 flex-1 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.sectionId}
            type="button"
            onClick={() => scrollToSection(item.sectionId)}
            className="block w-full rounded-md px-3 py-2 text-left text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            {item.label}
          </button>
        ))}
      </nav>

      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/auth/login" })}
        className="mt-6 rounded-md border border-white/20 px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
      >
        Sign out
      </button>
    </aside>
  );
}