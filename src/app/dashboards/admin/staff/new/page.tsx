"use client";

import { useState } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  createStaff,
  type StaffRole,
} from "@/lib/admin-staff";

const roles: {
  value: StaffRole;
  label: string;
  description: string;
}[] = [
  {
    value: "admin",
    label: "Administrator",
    description:
      "Full institutional and system administration access.",
  },
  {
    value: "registrar",
    label: "Registrar",
    description:
      "Manage academic records, students, courses, and results.",
  },
  {
    value: "finance",
    label: "Finance",
    description:
      "Manage fees, payments, balances, and financial records.",
  },
  {
    value: "lecturer",
    label: "Lecturer",
    description:
      "Manage assigned courses and academic responsibilities.",
  },
];

export default function AddStaffPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "" as StaffRole | "",
    password: "",
  });

  function updateField(
    field: keyof typeof form,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!form.role) {
      toast.error(
        "Please select a staff role.",
      );
      return;
    }

    if (form.password.length < 8) {
      toast.error(
        "Password must contain at least 8 characters.",
      );
      return;
    }

    setSaving(true);

    try {
      const response =
        await createStaff({
          name: form.name.trim(),
          email:
            form.email
              .trim()
              .toLowerCase(),
          password: form.password,
          role: form.role,
        });

      toast.success(
        response.message ||
          "Staff account created successfully.",
      );

      router.push(
        "/dashboards/admin/staff",
      );
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create staff account.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full space-y-6 pb-10">
      {/* Header */}

      <section className="relative overflow-hidden rounded-3xl border border-brand-navy/20 bg-brand-navy shadow-sm">
        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

        <div className="relative p-6 sm:p-8">
          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboards/admin/staff",
              )
            }
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-white/65 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Staff
          </button>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-gold/10 ring-1 ring-brand-gold/20">
              <UserPlus className="h-5 w-5 text-brand-gold" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <BriefcaseBusiness className="h-3.5 w-3.5 text-brand-gold" />

                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-gold">
                  Staff Management
                </p>
              </div>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Add Staff Member
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
                Create an institutional staff account
                and assign the appropriate system role.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Form */}

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-6 py-5">
          <CardTitle className="text-base text-brand-dark">
            Staff Account Information
          </CardTitle>

          <p className="text-xs leading-5 text-slate-500">
            Staff members will use these credentials
            to access their assigned dashboard.
          </p>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8 p-6 sm:p-8">
            {/* Personal information */}

            <section>
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-brand-dark">
                  Personal Information
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Basic information for the staff account.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="text-sm font-medium text-slate-700"
                  >
                    Full Name
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="name"
                    required
                    value={form.name}
                    onChange={(event) =>
                      updateField(
                        "name",
                        event.target.value,
                      )
                    }
                    placeholder="Enter staff member's name"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-slate-700"
                  >
                    Email Address
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="email"
                    required
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateField(
                        "email",
                        event.target.value,
                      )
                    }
                    placeholder="staff@itmt.edu"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10"
                  />
                </div>
              </div>
            </section>

            {/* Role */}

            <section className="border-t border-slate-100 pt-7">
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-brand-dark">
                  System Role
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Select the role that determines the
                  staff member's system responsibilities.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {roles.map((role) => {
                  const selected =
                    form.role === role.value;

                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() =>
                        updateField(
                          "role",
                          role.value,
                        )
                      }
                      className={`group rounded-2xl border p-4 text-left transition-all ${
                        selected
                          ? "border-brand-navy bg-brand-navy/[0.04] ring-2 ring-brand-navy/10"
                          : "border-slate-200 bg-white hover:border-brand-navy/30 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                              selected
                                ? "bg-brand-navy text-white"
                                : "bg-slate-100 text-brand-navy"
                            }`}
                          >
                            <ShieldCheck className="h-4 w-4" />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-brand-dark">
                              {role.label}
                            </p>

                            <p className="mt-0.5 text-[11px] text-slate-500">
                              {role.value}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`mt-1 h-4 w-4 rounded-full border-2 ${
                            selected
                              ? "border-brand-navy bg-brand-navy"
                              : "border-slate-300"
                          }`}
                        >
                          {selected && (
                            <span className="mx-auto mt-[3px] block h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </span>
                      </div>

                      <p className="mt-3 text-xs leading-5 text-slate-500">
                        {role.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Password */}

            <section className="border-t border-slate-100 pt-7">
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-brand-dark">
                  Login Credentials
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Set the initial password for this staff
                  account.
                </p>
              </div>

              <div className="max-w-md space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-700"
                >
                  Temporary Password
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <div className="relative">
                  <input
                    id="password"
                    required
                    minLength={8}
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={form.password}
                    onChange={(event) =>
                      updateField(
                        "password",
                        event.target.value,
                      )
                    }
                    placeholder="At least 8 characters"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 pr-11 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current,
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-brand-navy"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <p className="text-[11px] leading-5 text-slate-400">
                  The staff member should change this
                  password after their first successful
                  sign-in.
                </p>
              </div>
            </section>

            {/* Security information */}

            <div className="rounded-2xl border border-brand-navy/10 bg-brand-navy/[0.03] p-4">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-navy/10">
                  <ShieldCheck className="h-4 w-4 text-brand-navy" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-brand-dark">
                    Role-based access
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-slate-500">
                    The selected role controls which
                    dashboard and institutional functions
                    the staff member can access.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>

          {/* Actions */}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4 sm:flex-row sm:justify-end sm:px-8">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() =>
                router.push(
                  "/dashboards/admin/staff",
                )
              }
              className="h-11 rounded-xl"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={saving}
              className="h-11 min-w-[190px] rounded-xl"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Staff Account
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}