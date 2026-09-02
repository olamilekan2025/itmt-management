"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  KeyRound,
  Loader2,
  Mail,
  User,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { createExistingStudent } from "@/lib/admin-students";
import { getProgrammes } from "@/lib/admin-courses";
import { getAcademicSessions } from "@/lib/admin-academic-sessions";

type Programme = {
  _id: string;
  name: string;
};

type AcademicSession = {
  _id: string;
  name: string;
  isActive?: boolean;
};

export default function AddExistingStudentPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const accessToken =
    typeof session?.accessToken === "string"
      ? session.accessToken
      : undefined;

  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [sessions, setSessions] = useState<AcademicSession[]>([]);

  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    matricNumber: "",
    programme: "",
    academicSession: "",
    level: "",
    password: "",
  });

  /* =========================================================
     LOAD FORM DATA
  ========================================================= */

  useEffect(() => {
    if (!accessToken) {
      setLoadingData(false);
      return;
    }

    const token = accessToken;

    async function loadData() {
      try {
        setLoadingData(true);

        const [programmesResponse, sessionsResponse] =
          await Promise.all([
            getProgrammes(token),
            getAcademicSessions(token),
          ]);

        setProgrammes(programmesResponse.programmes ?? []);

        const availableSessions =
          sessionsResponse.sessions ?? [];

        setSessions(availableSessions);

        const activeSession = availableSessions.find(
          (item) => item.isActive,
        );

        if (activeSession) {
          setForm((current) => ({
            ...current,
            academicSession: activeSession._id,
          }));
        }
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load student form data.",
        );
      } finally {
        setLoadingData(false);
      }
    }

    loadData();
  }, [accessToken]);

  /* =========================================================
     UPDATE FORM
  ========================================================= */

  function updateField(
    field: keyof typeof form,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  /* =========================================================
     SUBMIT
  ========================================================= */

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!accessToken) {
      toast.error(
        "Your session has expired. Please sign in again.",
      );
      return;
    }

    setSaving(true);

    try {
      const response = await createExistingStudent(
        {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          matricNumber:
            form.matricNumber.trim().toUpperCase(),
          programme: form.programme,
          academicSession: form.academicSession,
          level: form.level.trim(),
          password: form.password,
        },
        accessToken,
      );

      toast.success(
        response.message ||
          "Student account created successfully.",
      );

      router.push("/dashboards/admin/students");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create student account.",
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loadingData) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy/10">
            <Loader2 className="h-6 w-6 animate-spin text-brand-navy" />
          </div>

          <p className="text-sm font-medium text-slate-500">
            Preparing student registration...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full space-y-6 pb-12">

      {/* =====================================================
          PREMIUM HEADER
      ====================================================== */}

      <section className="relative overflow-hidden rounded-3xl border border-brand-navy/20 bg-brand-navy shadow-xl">

        {/* Decorative elements */}

        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-gold/15 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

        <div className="relative p-6 sm:p-8">

          {/* Back */}

          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboards/admin/students",
              )
            }
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Students
          </button>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

            {/* Icon */}

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-brand-gold/20 bg-brand-gold/10 shadow-inner">
              <UserPlus className="h-7 w-7 text-brand-gold" />
            </div>

            {/* Content */}

            <div className="max-w-2xl">

              <div className="mb-2 flex items-center gap-2">

                <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />

                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-gold">
                  Student Management
                </span>

              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Add Existing Student
              </h1>

              <p className="mt-2 text-sm leading-6 text-white/65 sm:text-[15px]">
                Create a secure student portal account for
                an existing student while preserving their
                official institutional information.
              </p>

            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          FORM
      ====================================================== */}

      <Card className="overflow-hidden rounded-3xl border-slate-200 shadow-sm">

        <form onSubmit={handleSubmit}>

          {/* =================================================
              PERSONAL INFORMATION
          ================================================== */}

          <section>

            <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-6 py-5 sm:px-8">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy/10">
                  <User className="h-5 w-5 text-brand-navy" />
                </div>

                <div>
                  <CardTitle className="text-base text-brand-dark">
                    Personal Information
                  </CardTitle>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Basic information belonging to the
                    student.
                  </p>
                </div>

              </div>

            </CardHeader>

            <CardContent className="p-6 sm:p-8">

              <div className="grid gap-5 sm:grid-cols-2">

                {/* Full Name */}

                <FormField
                  label="Full Name"
                  required
                  icon={<User className="h-4 w-4" />}
                >
                  <input
                    required
                    value={form.name}
                    onChange={(event) =>
                      updateField(
                        "name",
                        event.target.value,
                      )
                    }
                    placeholder="Enter student's full name"
                    className="form-input"
                  />
                </FormField>

                {/* Email */}

                <FormField
                  label="Email Address"
                  required
                  icon={<Mail className="h-4 w-4" />}
                >
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateField(
                        "email",
                        event.target.value,
                      )
                    }
                    placeholder="student@example.com"
                    className="form-input"
                  />
                </FormField>

              </div>

            </CardContent>

          </section>

          {/* =================================================
              ACADEMIC INFORMATION
          ================================================== */}

          <section className="border-t border-slate-100">

            <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-6 py-5 sm:px-8">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gold/10">
                  <GraduationCap className="h-5 w-5 text-brand-gold" />
                </div>

                <div>
                  <CardTitle className="text-base text-brand-dark">
                    Academic Information
                  </CardTitle>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Assign the student's existing academic
                    details.
                  </p>
                </div>

              </div>

            </CardHeader>

            <CardContent className="p-6 sm:p-8">

              <div className="grid gap-5 sm:grid-cols-2">

                {/* Matric Number */}

                <FormField
                  label="Matric Number"
                  required
                  icon={
                    <GraduationCap className="h-4 w-4" />
                  }
                  description="Enter the official matriculation number."
                >
                  <input
                    required
                    value={form.matricNumber}
                    onChange={(event) =>
                      updateField(
                        "matricNumber",
                        event.target.value,
                      )
                    }
                    placeholder="e.g. ITMT/2023/001"
                    className="form-input uppercase"
                  />
                </FormField>

                {/* Programme */}

                <FormField
                  label="Programme"
                  required
                  icon={
                    <BookOpen className="h-4 w-4" />
                  }
                >
                  <select
                    required
                    value={form.programme}
                    onChange={(event) =>
                      updateField(
                        "programme",
                        event.target.value,
                      )
                    }
                    className="form-input"
                  >
                    <option value="">
                      Select programme
                    </option>

                    {programmes.map((programme) => (
                      <option
                        key={programme._id}
                        value={programme._id}
                      >
                        {programme.name}
                      </option>
                    ))}
                  </select>
                </FormField>

                {/* Academic Session */}

                <FormField
                  label="Academic Session"
                  required
                  icon={
                    <GraduationCap className="h-4 w-4" />
                  }
                >
                  <select
                    required
                    value={form.academicSession}
                    onChange={(event) =>
                      updateField(
                        "academicSession",
                        event.target.value,
                      )
                    }
                    className="form-input"
                  >
                    <option value="">
                      Select academic session
                    </option>

                    {sessions.map((academicSession) => (
                      <option
                        key={academicSession._id}
                        value={academicSession._id}
                      >
                        {academicSession.name}
                        {academicSession.isActive
                          ? " — Active"
                          : ""}
                      </option>
                    ))}
                  </select>
                </FormField>

                {/* Level */}

                <FormField
                  label="Level"
                  required
                  icon={
                    <GraduationCap className="h-4 w-4" />
                  }
                >
                  <select
                    required
                    value={form.level}
                    onChange={(event) =>
                      updateField(
                        "level",
                        event.target.value,
                      )
                    }
                    className="form-input"
                  >
                    <option value="">
                      Select level
                    </option>

                    <option value="ND 1">
                      ND 1
                    </option>

                    <option value="ND 2">
                      ND 2
                    </option>

                    <option value="HND 1">
                      HND 1
                    </option>

                    <option value="HND 2">
                      HND 2
                    </option>
                  </select>
                </FormField>

              </div>

            </CardContent>

          </section>

          {/* =================================================
              LOGIN INFORMATION
          ================================================== */}

          <section className="border-t border-slate-100">

            <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-6 py-5 sm:px-8">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy/10">
                  <KeyRound className="h-5 w-5 text-brand-navy" />
                </div>

                <div>
                  <CardTitle className="text-base text-brand-dark">
                    Student Login
                  </CardTitle>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Configure the credentials the student
                    will use to access the portal.
                  </p>
                </div>

              </div>

            </CardHeader>

            <CardContent className="p-6 sm:p-8">

              <div className="max-w-xl">

                <FormField
                  label="Temporary Password"
                  required
                  icon={
                    <KeyRound className="h-4 w-4" />
                  }
                  description="The student will sign in with their matric number and this password."
                >
                  <input
                    required
                    type="password"
                    minLength={8}
                    value={form.password}
                    onChange={(event) =>
                      updateField(
                        "password",
                        event.target.value,
                      )
                    }
                    placeholder="Enter at least 8 characters"
                    className="form-input"
                  />
                </FormField>

              </div>

              {/* Security notice */}

              <div className="mt-6 rounded-2xl border border-brand-navy/10 bg-brand-navy/[0.035] p-4">

                <div className="flex gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-navy/10">
                    <CheckCircle2 className="h-4 w-4 text-brand-navy" />
                  </div>

                  <div>

                    <p className="text-sm font-semibold text-brand-dark">
                      Account ready for portal access
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      The account will be created as an
                      active student account. The existing
                      matriculation number will be preserved
                      and used as the student's login identity.
                    </p>

                  </div>

                </div>

              </div>

            </CardContent>

          </section>

          {/* =================================================
              ACTION FOOTER
          ================================================== */}

          <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/70 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">

            <div className="flex items-center gap-2 text-xs text-slate-500">

              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              Required information must be completed.

            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  router.push(
                    "/dashboards/admin/students",
                  )
                }
                disabled={saving}
                className="h-11 rounded-xl border-slate-200 bg-white px-5"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={saving}
                className="h-11 min-w-[210px] rounded-xl bg-brand-navy px-6 font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-brand-navy/95 hover:shadow-md"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Student Account
                  </>
                )}
              </Button>

            </div>

          </div>

        </form>

      </Card>

      {/* =====================================================
          FOOTNOTE
      ====================================================== */}

      <p className="text-center text-xs text-slate-400">
        Existing student accounts are created by authorized
        administrators only.
      </p>

      {/* =====================================================
          FORM STYLES
      ====================================================== */}

      <style jsx global>{`
        .form-input {
          height: 2.75rem;
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgb(226 232 240);
          background: white;
          padding: 0 0.875rem;
          font-size: 0.875rem;
          color: rgb(15 23 42);
          outline: none;
          transition:
            border-color 150ms ease,
            box-shadow 150ms ease,
            background-color 150ms ease;
        }

        .form-input::placeholder {
          color: rgb(148 163 184);
        }

        .form-input:hover {
          border-color: rgb(203 213 225);
        }

        .form-input:focus {
          border-color: var(--brand-navy, #0f172a);
          box-shadow:
            0 0 0 4px rgb(15 23 42 / 0.08);
        }

        .form-input:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        select.form-input {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

/* =========================================================
   FORM FIELD
========================================================= */

function FormField({
  label,
  required,
  icon,
  description,
  children,
}: {
  label: string;
  required?: boolean;
  icon?: React.ReactNode;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">

      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">

        {icon && (
          <span className="text-slate-400">
            {icon}
          </span>
        )}

        {label}

        {required && (
          <span className="text-red-500">
            *
          </span>
        )}

      </label>

      {children}

      {description && (
        <p className="text-[11px] leading-5 text-slate-400">
          {description}
        </p>
      )}

    </div>
  );
}
