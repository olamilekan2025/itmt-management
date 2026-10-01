"use client";

import { useMemo, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";

import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Copy,
  GraduationCap,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

interface StudentProgramme {
  _id?: string;
  name?: string;
  code?: string;
}

interface StudentAcademicSession {
  _id?: string;
  name?: string;
}

interface StudentUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  matricNumber?: string | null;
  level?: string | number | null;
  programme?: StudentProgramme | string | null;
  academicSession?: StudentAcademicSession | string | null;
}

interface StudentSession {
  user?: StudentUser;
}

/* =========================================================
   HELPERS
========================================================= */

function getInitials(name?: string | null, email?: string | null) {
  const value = name?.trim() || email?.trim() || "Student";
  const parts = value.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return value.slice(0, 2).toUpperCase();
}

function getProgrammeName(programme: StudentUser["programme"]) {
  if (!programme) return "Programme not assigned";
  if (typeof programme === "string") return programme;
  return programme.name || "Programme not assigned";
}

function getProgrammeCode(programme: StudentUser["programme"]) {
  if (!programme || typeof programme === "string") return "";
  return programme.code || "";
}

function getSessionName(academicSession: StudentUser["academicSession"]) {
  if (!academicSession) return "Academic session not assigned";
  if (typeof academicSession === "string") return academicSession;
  return academicSession.name || "Academic session not assigned";
}

/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({
  icon: Icon,
  label,
  value,
  copyable = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  copyable?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const canCopy =
    copyable && !!value && value !== "Not available" && value !== "Not assigned";

  const handleCopy = async () => {
    if (!canCopy) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <div className="group flex min-w-0 items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 transition-all duration-200 hover:border-brand-gold/20 hover:bg-white hover:shadow-sm sm:gap-4 sm:p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-navy/5 text-brand-navy transition group-hover:bg-brand-gold/10 group-hover:text-brand-gold sm:h-10 sm:w-10">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-800 [overflow-wrap:anywhere]">
          {value}
        </p>
      </div>

      {canCopy && (
        <button
          type="button"
          onClick={handleCopy}
          title={copied ? "Copied" : "Copy"}
          aria-label={copied ? "Copied" : `Copy ${label}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-300 transition hover:bg-brand-navy/5 hover:text-brand-navy active:bg-brand-navy/10 sm:h-8 sm:w-8"
        >
          {copied ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );
}

/* =========================================================
   SKELETON
========================================================= */

function ProfileSkeleton() {
  return (
    <main className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-[1600px] space-y-5 px-0 py-4 sm:space-y-6 lg:py-7">
        <div className="animate-pulse overflow-hidden rounded-3xl bg-brand-navy p-5 sm:p-8 lg:p-10">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
            <div className="h-24 w-24 shrink-0 rounded-3xl bg-white/10 sm:h-28 sm:w-28" />

            <div className="flex w-full flex-1 flex-col items-center space-y-3 sm:items-start">
              <div className="h-3 w-28 rounded bg-white/10" />
              <div className="h-8 w-64 max-w-full rounded-xl bg-white/10" />
              <div className="h-3 w-80 max-w-full rounded bg-white/10" />
            </div>
          </div>
        </div>

        <div className="grid gap-5 sm:gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-5 sm:space-y-6">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
              >
                <div className="h-5 w-40 max-w-full rounded bg-slate-200" />

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[1, 2, 3, 4].map((field) => (
                    <div
                      key={field}
                      className="h-[72px] rounded-2xl bg-slate-100 sm:h-20"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="h-5 w-36 rounded bg-slate-200" />

            <div className="mt-6 space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-16 rounded-2xl bg-slate-100 sm:h-20" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   PROFILE PAGE
========================================================= */

export default function StudentProfilePage() {
  const { data: rawSession, status } = useSession();

  const session = rawSession as StudentSession | null;
  const student = session?.user;

  const [editOpen, setEditOpen] = useState(false);

  const userName = student?.name?.trim() || "Student";
  const userEmail = student?.email?.trim() || "Email not available";
  const userImage = student?.image || null;

  const initials = useMemo(
    () => getInitials(student?.name, student?.email),
    [student?.name, student?.email],
  );

  const matricNumber = student?.matricNumber?.trim() || "Not assigned";
  const level = student?.level ? String(student.level) : "Not assigned";

  const programmeName = getProgrammeName(student?.programme);
  const programmeCode = getProgrammeCode(student?.programme);
  const academicSession = getSessionName(student?.academicSession);

  if (status === "loading") {
    return <ProfileSkeleton />;
  }

  return (
    <main className="min-h-full overflow-x-hidden bg-slate-50">
      <div className="mx-auto max-w-[1600px] space-y-5 px-0 py-4 sm:space-y-6 lg:py-7">
        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-slate-400">
              <Link
                href="/dashboards/student"
                className="transition hover:text-brand-navy"
              >
                Student Dashboard
              </Link>

              <ChevronRight className="h-3.5 w-3.5 shrink-0" />

              <span className="text-brand-navy">My Profile</span>
            </div>

            <h1 className="mt-2 text-xl font-bold tracking-tight text-brand-navy sm:text-2xl md:text-3xl">
              My Profile
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              View your personal and academic information.
            </p>
          </div>

          {/* Full-width tappable buttons on mobile */}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <Link
              href="/dashboards/student"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-brand-gold/30 hover:text-brand-gold sm:h-10"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Dashboard
            </Link>

            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-brand-gold/30 hover:text-brand-gold sm:h-10"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>

            <Link
              href="/dashboards/student/settings"
              className="col-span-2 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-brand-navy bg-brand-navy px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-dark sm:col-span-1 sm:h-10"
            >
              Account Settings
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* =================================================
            PROFILE HERO
        ================================================= */}

        <section className="relative overflow-hidden rounded-3xl bg-brand-navy shadow-xl shadow-slate-900/10">
          <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-brand-gold/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-brand-blue/10 blur-3xl" />

          <div className="relative p-5 sm:p-8 lg:p-10">
            {/* Stacked + centered on mobile, row from md */}
            <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-center md:gap-7 md:text-left">
              {/* Avatar */}

              <div className="relative shrink-0">
                <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-brand-gold to-yellow-600 text-2xl font-black text-brand-navy shadow-[0_15px_40px_rgba(0,0,0,0.25)] sm:h-28 sm:w-28 sm:text-3xl">
                  {userImage ? (
                    <Image
                      src={userImage}
                      alt={userName}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>

                <span
                  className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full border-4 border-brand-navy bg-emerald-400 text-brand-navy"
                  title="Active account"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </span>
              </div>

              {/* Identity */}

              <div className="w-full min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Active Student
                  </span>

                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] font-semibold text-white/45">
                    {level}
                  </span>
                </div>

                <h2 className="mt-3 break-words text-xl font-bold tracking-tight text-white [overflow-wrap:anywhere] sm:mt-4 sm:text-3xl lg:text-4xl">
                  {userName}
                </h2>

                <p className="mt-2 break-all text-xs text-white/45 sm:text-sm">
                  {userEmail}
                </p>

                {/* Chips: full-width on mobile, inline from sm */}
                <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center md:justify-start">
                  <div className="inline-flex min-w-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 md:justify-start">
                    <GraduationCap className="h-4 w-4 shrink-0 text-brand-gold" />

                    <span className="break-all text-xs font-semibold text-white/75">
                      {matricNumber}
                    </span>
                  </div>

                  <div className="inline-flex min-w-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 md:justify-start">
                    <BookOpen className="h-4 w-4 shrink-0 text-brand-gold" />

                    <span className="min-w-0 text-xs font-medium text-white/70 sm:max-w-[260px] sm:truncate">
                      {programmeName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Account status */}

              <div className="w-full md:max-w-[230px]">
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-left backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gold/10 text-brand-gold">
                      <ShieldCheck className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white">
                        Account secure
                      </p>

                      <p className="mt-0.5 text-[10px] text-white/35">
                        Student portal access
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            CONTENT
        ================================================= */}

        <section className="grid gap-5 sm:gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          {/* LEFT */}

          <div className="min-w-0 space-y-5 sm:space-y-6">
            {/* Personal information */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-4 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-gold">
                      Personal Information
                    </p>

                    <h2 className="mt-1 text-base font-bold text-brand-navy sm:text-lg">
                      Identity &amp; contact
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      Your basic account information.
                    </p>
                  </div>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/5 text-brand-navy">
                    <UserRound className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6">
                <InfoRow icon={UserRound} label="Full Name" value={userName} />

                <InfoRow
                  icon={Mail}
                  label="Email Address"
                  value={userEmail}
                  copyable
                />

                <InfoRow
                  icon={Phone}
                  label="Phone Number"
                  value="Not available"
                />

                <InfoRow icon={MapPin} label="Address" value="Not available" />
              </div>
            </section>

            {/* Academic information */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-4 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-gold">
                      Academic Information
                    </p>

                    <h2 className="mt-1 text-base font-bold text-brand-navy sm:text-lg">
                      Student academic record
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      Your current academic identity.
                    </p>
                  </div>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gold/10 text-brand-gold">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6">
                <InfoRow
                  icon={GraduationCap}
                  label="Matric Number"
                  value={matricNumber}
                  copyable
                />

                <InfoRow icon={BarChart3} label="Current Level" value={level} />

                <InfoRow
                  icon={BookOpen}
                  label="Programme"
                  value={programmeName}
                />

                <InfoRow
                  icon={CalendarDays}
                  label="Academic Session"
                  value={academicSession}
                />

                {programmeCode && (
                  <InfoRow
                    icon={BookOpen}
                    label="Programme Code"
                    value={programmeCode}
                    copyable
                  />
                )}

                <InfoRow
                  icon={ShieldCheck}
                  label="Student Status"
                  value="Active"
                />
              </div>
            </section>
          </div>

          {/* RIGHT — 2 columns on tablets, 1 column on phones and desktop */}

          <aside className="grid min-w-0 gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-1 xl:content-start">
            {/* Account summary */}

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-gold">
                    Account
                  </p>

                  <h2 className="mt-1 text-base font-bold text-brand-navy sm:text-lg">
                    Profile summary
                  </h2>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/5 text-brand-navy">
                  <UserRound className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5 space-y-3 sm:mt-6">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Account Status
                    </span>

                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Matric Number
                  </p>

                  <p className="mt-1.5 break-all text-sm font-semibold text-slate-700">
                    {matricNumber}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Current Level
                  </p>

                  <p className="mt-1.5 text-sm font-semibold text-slate-700">
                    {level}
                  </p>
                </div>
              </div>
            </section>

            {/* Academic identity */}

            <section className="overflow-hidden rounded-2xl bg-brand-navy p-5 text-white shadow-lg shadow-slate-900/10 sm:p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gold/15 text-brand-gold">
                <GraduationCap className="h-5 w-5" />
              </div>

              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-gold">
                Academic Identity
              </p>

              <h3 className="mt-2 break-words text-base font-bold sm:text-lg">
                {programmeName}
              </h3>

              <p className="mt-2 text-xs leading-5 text-white/40">
                {academicSession}
              </p>

              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                <span className="text-[10px] uppercase tracking-wider text-white/35">
                  Level
                </span>

                <span className="text-sm font-bold text-white">{level}</span>
              </div>
            </section>

            {/* Settings link */}

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 md:col-span-2 xl:col-span-1">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gold/10 text-brand-gold">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-brand-navy">
                    Manage your account
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Update account preferences and security settings.
                  </p>

                  <Link
                    href="/dashboards/student/settings"
                    className="mt-3 inline-flex min-h-10 items-center gap-1.5 text-xs font-bold text-brand-navy transition hover:text-brand-gold"
                  >
                    Open settings
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </section>
          </aside>
        </section>

        {/* =================================================
            FOOTER
        ================================================= */}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-white">
                <GraduationCap className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold text-brand-navy">
                  ITMT Student Portal
                </p>

                <p className="mt-0.5 text-xs text-slate-400">
                  Keep your student information up to date.
                </p>
              </div>
            </div>

            <Link
              href="/dashboards/student/settings"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-600 transition hover:border-brand-gold/30 hover:text-brand-gold sm:h-auto sm:w-auto sm:py-2.5"
            >
              Account settings
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </div>

      {/* =================================================
          EDIT INFORMATION NOTICE
          Bottom sheet on mobile, centered dialog from sm
      ================================================= */}

      {editOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-end justify-center bg-black/70 backdrop-blur-md sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setEditOpen(false)}
        >
          <div
            className="max-h-[90dvh] w-full overflow-y-auto rounded-t-3xl border border-white/10 bg-brand-dark shadow-[0_30px_100px_rgba(0,0,0,0.5)] sm:max-w-md sm:rounded-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/[0.07] p-4 sm:p-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-gold">
                  Profile
                </p>

                <h2 className="mt-1 text-lg font-bold text-white">
                  Profile information
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setEditOpen(false)}
                aria-label="Close"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white/40 transition hover:bg-white/[0.06] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-5">
              <div className="rounded-2xl border border-brand-gold/10 bg-brand-gold/5 p-4">
                <p className="text-sm font-semibold text-white">
                  Profile editing
                </p>

                <p className="mt-2 text-xs leading-5 text-white/45">
                  Your core student information is managed by the institution.
                  Editable fields can be enabled here once the student profile
                  update API is available.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="mt-5 flex h-11 w-full items-center justify-center rounded-xl bg-brand-gold text-sm font-bold text-brand-navy transition hover:bg-yellow-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}