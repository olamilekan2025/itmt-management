"use client";

import {
  useMemo,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";

import {
  ArrowLeft,
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

function getInitials(
  name?: string | null,
  email?: string | null,
) {
  const value =
    name?.trim() ||
    email?.trim() ||
    "Student";

  const parts = value
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return value.slice(0, 2).toUpperCase();
}

function getProgrammeName(
  programme: StudentUser["programme"],
) {
  if (!programme) {
    return "Programme not assigned";
  }

  if (typeof programme === "string") {
    return programme;
  }

  return (
    programme.name ||
    "Programme not assigned"
  );
}

function getProgrammeCode(
  programme: StudentUser["programme"],
) {
  if (
    !programme ||
    typeof programme === "string"
  ) {
    return "";
  }

  return programme.code || "";
}

function getSessionName(
  academicSession: StudentUser["academicSession"],
) {
  if (!academicSession) {
    return "Academic session not assigned";
  }

  if (typeof academicSession === "string") {
    return academicSession;
  }

  return (
    academicSession.name ||
    "Academic session not assigned"
  );
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
  const [copied, setCopied] =
    useState(false);

  const handleCopy = async () => {
    if (
      !copyable ||
      !value ||
      value === "Not available"
    ) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1600);
    } catch (error) {
      console.error(
        "Copy failed:",
        error,
      );
    }
  };

  return (
    <div
      className="
        group
        flex
        items-center
        gap-4
        rounded-2xl
        border
        border-slate-100
        bg-slate-50/70
        p-4
        transition-all
        duration-200
        hover:border-brand-gold/20
        hover:bg-white
        hover:shadow-sm
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
          bg-brand-navy/5
          text-brand-navy
          transition
          group-hover:bg-brand-gold/10
          group-hover:text-brand-gold
        "
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className="
            text-[10px]
            font-bold
            uppercase
            tracking-[0.14em]
            text-slate-400
          "
        >
          {label}
        </p>

        <p
          className="
            mt-1
            break-words
            text-sm
            font-semibold
            text-slate-800
          "
        >
          {value}
        </p>
      </div>

      {copyable && (
        <button
          type="button"
          onClick={handleCopy}
          title={
            copied
              ? "Copied"
              : "Copy"
          }
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-lg
            text-slate-300
            transition
            hover:bg-brand-navy/5
            hover:text-brand-navy
          "
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
      <div className="mx-auto max-w-[1600px] space-y-6 px-0 py-5 lg:py-7">

        <div className="animate-pulse overflow-hidden rounded-3xl bg-brand-navy p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="h-24 w-24 rounded-3xl bg-white/10 sm:h-28 sm:w-28" />

            <div className="flex-1 space-y-3">
              <div className="h-3 w-28 rounded bg-white/10" />
              <div className="h-8 w-64 rounded-xl bg-white/10" />
              <div className="h-3 w-80 max-w-full rounded bg-white/10" />
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="h-5 w-40 rounded bg-slate-200" />

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[1, 2, 3, 4].map(
                    (field) => (
                      <div
                        key={field}
                        className="h-20 rounded-2xl bg-slate-100"
                      />
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6">
            <div className="h-5 w-36 rounded bg-slate-200" />

            <div className="mt-6 space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-20 rounded-2xl bg-slate-100"
                />
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
  const {
    data: rawSession,
    status,
  } = useSession();

  const session =
    rawSession as StudentSession | null;

  const student = session?.user;

  const [editOpen, setEditOpen] =
    useState(false);

  const userName =
    student?.name?.trim() ||
    "Student";

  const userEmail =
    student?.email?.trim() ||
    "Email not available";

  const userImage =
    student?.image || null;

  const initials = useMemo(
    () =>
      getInitials(
        student?.name,
        student?.email,
      ),
    [student?.name, student?.email],
  );

  const matricNumber =
    student?.matricNumber?.trim() ||
    "Not assigned";

  const level = student?.level
    ? String(student.level)
    : "Not assigned";

  const programmeName =
    getProgrammeName(
      student?.programme,
    );

  const programmeCode =
    getProgrammeCode(
      student?.programme,
    );

  const academicSession =
    getSessionName(
      student?.academicSession,
    );

  if (status === "loading") {
    return <ProfileSkeleton />;
  }

  return (
    <main className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-[1600px] space-y-6 px-0 py-5 lg:py-7">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <Link
                href="/dashboards/student"
                className="transition hover:text-brand-navy"
              >
                Student Dashboard
              </Link>

              <ChevronRight className="h-3.5 w-3.5" />

              <span className="text-brand-navy">
                My Profile
              </span>
            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-brand-navy sm:text-3xl">
              My Profile
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              View your personal and academic
              information.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboards/student"
              className="
                inline-flex
                h-10
                items-center
                gap-2
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                text-xs
                font-semibold
                text-slate-600
                shadow-sm
                transition
                hover:border-brand-gold/30
                hover:text-brand-gold
              "
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Dashboard
            </Link>

            <Link
              href="/dashboards/student/settings"
              className="
                inline-flex
                h-10
                items-center
                gap-2
                rounded-xl
                border
                border-brand-navy
                bg-brand-navy
                px-4
                text-xs
                font-semibold
                text-white
                shadow-sm
                transition
                hover:bg-brand-dark
              "
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

          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-7 md:flex-row md:items-center">

              {/* Avatar */}

              <div className="relative shrink-0">
                <div
                  className="
                    relative
                    flex
                    h-24
                    w-24
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-3xl
                    border
                    border-white/15
                    bg-gradient-to-br
                    from-brand-gold
                    to-yellow-600
                    text-2xl
                    font-black
                    text-brand-navy
                    shadow-[0_15px_40px_rgba(0,0,0,0.25)]
                    sm:h-28
                    sm:w-28
                    sm:text-3xl
                  "
                >
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
                  className="
                    absolute
                    bottom-1
                    right-1
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-full
                    border-4
                    border-brand-navy
                    bg-emerald-400
                    text-brand-navy
                  "
                  title="Active account"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </span>
              </div>

              {/* Identity */}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-full
                      border
                      border-emerald-400/20
                      bg-emerald-400/10
                      px-2.5
                      py-1
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-emerald-300
                    "
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Active Student
                  </span>

                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] font-semibold text-white/45">
                    {level}
                  </span>
                </div>

                <h2 className="mt-4 break-words text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                  {userName}
                </h2>

                <p className="mt-2 break-all text-sm text-white/45">
                  {userEmail}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2">
                    <GraduationCap className="h-4 w-4 text-brand-gold" />

                    <span className="text-xs font-semibold text-white/75">
                      {matricNumber}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2">
                    <BookOpen className="h-4 w-4 text-brand-gold" />

                    <span className="max-w-[260px] truncate text-xs font-medium text-white/70">
                      {programmeName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Account status */}

              <div className="w-full md:max-w-[230px]">
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gold/10 text-brand-gold">
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

        <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">

          {/* LEFT */}

          <div className="space-y-6">

            {/* Personal information */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-gold">
                      Personal Information
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-brand-navy">
                      Identity & contact
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

              <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
                <InfoRow
                  icon={UserRound}
                  label="Full Name"
                  value={userName}
                />

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

                <InfoRow
                  icon={MapPin}
                  label="Address"
                  value="Not available"
                />
              </div>
            </section>

            {/* Academic information */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-gold">
                      Academic Information
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-brand-navy">
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

              <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
                <InfoRow
                  icon={GraduationCap}
                  label="Matric Number"
                  value={matricNumber}
                  copyable
                />

                <InfoRow
                  icon={BarChartIcon}
                  label="Current Level"
                  value={level}
                />

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

          {/* RIGHT */}

          <aside className="space-y-6">

            {/* Account summary */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-gold">
                    Account
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-brand-navy">
                    Profile summary
                  </h2>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy/5 text-brand-navy">
                  <UserRound className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-6 space-y-3">

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

            <section className="overflow-hidden rounded-2xl bg-brand-navy p-6 text-white shadow-lg shadow-slate-900/10">
              <div className="pointer-events-none absolute" />

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gold/15 text-brand-gold">
                <GraduationCap className="h-5 w-5" />
              </div>

              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-gold">
                Academic Identity
              </p>

              <h3 className="mt-2 text-lg font-bold">
                {programmeName}
              </h3>

              <p className="mt-2 text-xs leading-5 text-white/40">
                {academicSession}
              </p>

              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                <span className="text-[10px] uppercase tracking-wider text-white/35">
                  Level
                </span>

                <span className="text-sm font-bold text-white">
                  {level}
                </span>
              </div>
            </section>

            {/* Settings link */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gold/10 text-brand-gold">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-brand-navy">
                    Manage your account
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Update account preferences and
                    security settings.
                  </p>

                  <Link
                    href="/dashboards/student/settings"
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-brand-navy transition hover:text-brand-gold"
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

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-white">
                <GraduationCap className="h-5 w-5" />
              </div>

              <div>
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
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-brand-gold/30 hover:text-brand-gold"
            >
              Account settings
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </div>

      {/* =================================================
          EDIT INFORMATION NOTICE
      ================================================= */}

      {editOpen && (
        <div
          className="
            fixed
            inset-0
            z-[200]
            flex
            items-center
            justify-center
            bg-black/70
            p-4
            backdrop-blur-md
          "
          role="dialog"
          aria-modal="true"
          onClick={() => setEditOpen(false)}
        >
          <div
            className="
              w-full
              max-w-md
              overflow-hidden
              rounded-3xl
              border
              border-white/10
              bg-brand-dark
              shadow-[0_30px_100px_rgba(0,0,0,0.5)]
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-center justify-between border-b border-white/[0.07] p-5">
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
                onClick={() =>
                  setEditOpen(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl text-white/40 transition hover:bg-white/[0.06] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              <div className="rounded-2xl border border-brand-gold/10 bg-brand-gold/5 p-4">
                <p className="text-sm font-semibold text-white">
                  Profile editing
                </p>

                <p className="mt-2 text-xs leading-5 text-white/45">
                  Your core student information is
                  managed by the institution. Editable
                  fields can be enabled here once the
                  student profile update API is available.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditOpen(false)
                }
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

/* =========================================================
   ICON ALIAS
========================================================= */

function BarChartIcon(
  props: React.ComponentProps<
    typeof GraduationCap
  >,
) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M8 16v-5" />
      <path d="M12 16V8" />
      <path d="M16 16v-3" />
    </svg>
  );
}

