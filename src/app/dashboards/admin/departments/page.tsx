"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  Building2,
  CheckCircle2,
  Edit,
  FileText,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  archiveDepartment,
  createDepartment,
  getDepartments,
  updateDepartment,
  type Department,
} from "@/lib/admin-departments";

export default function DepartmentsPage() {
  const { data: session } = useSession();

  const accessToken =
    session?.accessToken as string | undefined;

  const [departments, setDepartments] = useState<Department[]>(
    [],
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);

  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
  });

  async function loadDepartments() {
    if (!accessToken) return;

    setLoading(true);

    try {
      const response = await getDepartments(accessToken);

      setDepartments(response.departments ?? []);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load departments.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDepartments();
  }, [accessToken]);

  const filteredDepartments = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return departments;

    return departments.filter((department) => {
      return (
        department.name.toLowerCase().includes(value) ||
        department.code.toLowerCase().includes(value) ||
        department.description
          ?.toLowerCase()
          .includes(value)
      );
    });
  }, [departments, search]);

  const activeCount = departments.filter(
    (department) => department.isActive,
  ).length;

  const archivedCount = departments.filter(
    (department) => !department.isActive,
  ).length;

  function openCreate() {
    setEditing(null);

    setForm({
      name: "",
      code: "",
      description: "",
    });

    setDialogOpen(true);
  }

  function openEdit(department: Department) {
    setEditing(department);

    setForm({
      name: department.name,
      code: department.code,
      description: department.description ?? "",
    });

    setDialogOpen(true);
  }

  function closeDialog() {
    if (saving) return;

    setDialogOpen(false);
    setEditing(null);

    setForm({
      name: "",
      code: "",
      description: "",
    });
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!accessToken) return;

    const name = form.name.trim();
    const code = form.code.trim().toUpperCase();
    const description = form.description.trim();

    if (name.length < 2) {
      toast.error(
        "Department name must be at least 2 characters.",
      );
      return;
    }

    if (code.length < 2) {
      toast.error(
        "Department code must be at least 2 characters.",
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name,
        code,
        ...(description ? { description } : {}),
      };

      if (editing) {
        await updateDepartment(
          editing._id,
          payload,
          accessToken,
        );

        toast.success(
          "Department updated successfully.",
        );
      } else {
        await createDepartment(
          payload,
          accessToken,
        );

        toast.success(
          "Department created successfully.",
        );
      }

      closeDialog();

      await loadDepartments();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : editing
            ? "Unable to update department."
            : "Unable to create department.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive(
    department: Department,
  ) {
    if (!accessToken) return;

    const confirmed = window.confirm(
      `Archive "${department.name}"?\n\nThis department will no longer appear in active department lists.`,
    );

    if (!confirmed) return;

    try {
      await archiveDepartment(
        department._id,
        accessToken,
      );

      toast.success(
        "Department archived successfully.",
      );

      await loadDepartments();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to archive department.",
      );
    }
  }

  return (
    <div className="min-h-full space-y-8 pb-8">
      {/* ========================================================= */}
      {/* PAGE HEADER */}
      {/* ========================================================= */}

  <section className="relative overflow-hidden rounded-2xl border border-brand-navy/20 bg-brand-navy shadow-lg">
  {/* Decorative background elements */}
  <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-brand-gold/15 blur-3xl" />

  <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

  <div className="relative z-10 flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
    <div>
      {/* Section Label */}
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
          <Building2 className="h-5 w-5 text-brand-gold" />
        </div>

        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold">
          Academic Structure
        </span>
      </div>

      {/* Main Heading */}
      <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Departments
      </h1>

      {/* Description */}
      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
        Create and manage the academic departments that make up your
        institution. Keep your academic structure organized and up to date.
      </p>
    </div>

    {/* Action */}
    <Button
      onClick={openCreate}
      className="h-11 w-full rounded-xl bg-brand-gold px-5 font-semibold text-brand-dark shadow-md transition-all duration-200 hover:bg-brand-gold/90 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-brand-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy lg:w-auto"
    >
      <Plus className="mr-2 h-4 w-4" />
      Add Department
    </Button>
  </div>
</section>


      {/* ========================================================= */}
      {/* STATISTICS */}
      {/* ========================================================= */}

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
  {/* Card 1: Total Departments */}
  <Card className="relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl">
    <div className="absolute inset-0 -z-10 overflow-hidden rounded-xl opacity-50">
      <div className="absolute -top-10 -left-10 h-28 w-28 rounded-full bg-brand-navy/5 blur-xl" />
      <div className="absolute -bottom-10 -right-10 h-24 w-24 rounded-full bg-brand-navy/3 blur-xl" />
    </div>
    <CardContent className="relative z-10 p-0"> {/* Ensure content is above background */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-grow"> {/* Allow text to take available space */}
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500"> {/* Increased tracking */}
            Total Departments
          </p>
          <p className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900"> {/* Larger, bolder font */}
            {departments.length}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Academic departments
          </p>
        </div>
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-navy/10 to-brand-navy/20 shadow-inner">
          <Building2 className="h-7 w-7 text-brand-navy" /> {/* Larger icon, better background */}
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Card 2: Active */}
  <Card className="relative overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50 p-6 shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl">
    <div className="absolute inset-0 -z-10 overflow-hidden rounded-xl opacity-50">
      <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-emerald-400/10 blur-xl" />
      <div className="absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-emerald-500/5 blur-xl" />
    </div>
    <CardContent className="relative z-10 p-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-grow">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Active
          </p>
          <p className="mt-2 text-4xl font-extrabold tracking-tight text-emerald-600"> {/* Kept primary color */}
            {activeCount}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Currently available
          </p>
        </div>
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 shadow-inner">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" /> {/* Larger icon, better background */}
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Card 3: Archived */}
  <Card className="relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl">
    <div className="absolute inset-0 -z-10 overflow-hidden rounded-xl opacity-50">
      <div className="absolute -top-10 -left-10 h-28 w-28 rounded-full bg-gray-400/5 blur-xl" />
      <div className="absolute -bottom-10 -right-10 h-24 w-24 rounded-full bg-gray-300/3 blur-xl" />
    </div>
    <CardContent className="relative z-10 p-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-grow">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Archived
          </p>
          <p className="mt-2 text-4xl font-extrabold tracking-tight text-gray-700"> {/* Slightly softer text for archived */}
            {archivedCount}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            No longer active
          </p>
        </div>
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 shadow-inner">
          <Archive className="h-7 w-7 text-slate-500" /> {/* Larger icon, better background */}
        </div>
      </div>
    </CardContent>
  </Card>
</section>


      {/* ========================================================= */}
      {/* DIRECTORY */}
      {/* ========================================================= */}

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardHeader className="border-b border-brand-navy/10 bg-brand-navy/[0.03] px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-brand-dark">
                Department Directory
              </CardTitle>

              <p className="mt-1 text-xs text-slate-500">
                {filteredDepartments.length}{" "}
                {filteredDepartments.length === 1
                  ? "department"
                  : "departments"}{" "}
                displayed
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              {/* Search */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search departments..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10 sm:w-64"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={loadDepartments}
                disabled={loading}
                aria-label="Refresh departments"
                className="h-10 w-10 rounded-xl bg-white shadow-sm"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""
                    }`}
                />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-4 p-6">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="flex animate-pulse items-center gap-4 rounded-xl border border-slate-100 p-4"
                >
                  <div className="h-11 w-11 rounded-xl bg-slate-100" />

                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 rounded bg-slate-100" />
                    <div className="h-3 w-72 rounded bg-slate-100" />
                  </div>

                  <div className="h-8 w-20 rounded-full bg-slate-100" />
                </div>
              ))}
            </div>
          ) : filteredDepartments.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-navy/5">
                <Building2 className="h-7 w-7 text-brand-navy/50" />
              </div>

              <h3 className="mt-5 text-base font-semibold text-slate-800">
                {search
                  ? "No departments found"
                  : "No departments yet"}
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                {search
                  ? "Try adjusting your search to find the department you're looking for."
                  : "Create your first academic department to begin building your institution's academic structure."}
              </p>

              {search ? (
                <Button
                  variant="outline"
                  onClick={() => setSearch("")}
                  className="mt-5 rounded-xl"
                >
                  Clear Search
                </Button>
              ) : (
                <Button
                  onClick={openCreate}
                  className="mt-5 rounded-xl"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Department
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      <th className="px-6 py-4">
                        Department
                      </th>

                      <th className="px-6 py-4">
                        Code
                      </th>

                      <th className="px-6 py-4">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredDepartments.map(
                      (department) => (
                        <tr
                          key={department._id}
                          className="group border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50/70"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/5 transition-colors group-hover:bg-brand-navy/10">
                                <Building2 className="h-4 w-4 text-brand-navy" />
                              </div>

                              <div className="min-w-0">
                                <p className="font-semibold text-slate-800">
                                  {department.name}
                                </p>

                                {department.description ? (
                                  <p className="mt-1 max-w-md truncate text-xs text-slate-500">
                                    {
                                      department.description
                                    }
                                  </p>
                                ) : (
                                  <p className="mt-1 text-xs text-slate-400">
                                    No description provided
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs font-semibold tracking-wide text-slate-700">
                              {department.code}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            {department.isActive ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                Archived
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  openEdit(
                                    department,
                                  )
                                }
                                className="rounded-lg bg-white"
                              >
                                <Edit className="mr-1.5 h-3.5 w-3.5" />
                                Edit
                              </Button>

                              {department.isActive && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleArchive(
                                      department,
                                    )
                                  }
                                  className="rounded-lg bg-white text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                >
                                  <Archive className="mr-1.5 h-3.5 w-3.5" />
                                  Archive
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="space-y-3 p-4 md:hidden">
                {filteredDepartments.map(
                  (department) => (
                    <div
                      key={department._id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/5">
                            <Building2 className="h-4 w-4 text-brand-navy" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-800">
                              {department.name}
                            </p>

                            <span className="mt-1 inline-flex rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-600">
                              {department.code}
                            </span>
                          </div>
                        </div>

                        {department.isActive ? (
                          <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                            Active
                          </span>
                        ) : (
                          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">
                            Archived
                          </span>
                        )}
                      </div>

                      {department.description && (
                        <p className="mt-4 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-500">
                          {department.description}
                        </p>
                      )}

                      <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            openEdit(department)
                          }
                          className="flex-1 rounded-lg"
                        >
                          <Edit className="mr-1.5 h-3.5 w-3.5" />
                          Edit
                        </Button>

                        {department.isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleArchive(
                                department,
                              )
                            }
                            className="rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <Archive className="mr-1.5 h-3.5 w-3.5" />
                            Archive
                          </Button>
                        )}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* CREATE / EDIT DIALOG */}
      {/* ========================================================= */}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!saving) {
            if (open) {
              setDialogOpen(true);
            } else {
              closeDialog();
            }
          }
        }}
      >
        <DialogContent className="overflow-hidden rounded-2xl border-slate-200 p-0 shadow-2xl sm:max-w-lg">
          <DialogHeader className="border-b border-slate-100 bg-slate-50/70 px-6 py-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/10">
                {editing ? (
                  <Edit className="h-5 w-5 text-brand-navy" />
                ) : (
                  <Building2 className="h-5 w-5 text-brand-navy" />
                )}
              </div>

              <div>
                <DialogTitle className="text-lg font-semibold text-brand-dark">
                  {editing
                    ? "Edit Department"
                    : "Create Department"}
                </DialogTitle>

                <DialogDescription className="mt-1 text-xs leading-5 text-slate-500">
                  {editing
                    ? "Update the department information below."
                    : "Add a new academic department to your institution."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-5 px-6 py-6">
              {/* Name */}
              <div className="space-y-2">
                <label
                  htmlFor="department-name"
                  className="text-sm font-medium text-slate-700"
                >
                  Department Name
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  id="department-name"
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="e.g. Computer Science"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10"
                />
              </div>

              {/* Code */}
              <div className="space-y-2">
                <label
                  htmlFor="department-code"
                  className="text-sm font-medium text-slate-700"
                >
                  Department Code
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  id="department-code"
                  required
                  value={form.code}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      code: event.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="e.g. CSC"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm uppercase outline-none transition placeholder:normal-case placeholder:text-slate-400 focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10"
                />

                <p className="text-[11px] text-slate-400">
                  Use a short unique code for this
                  department.
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label
                  htmlFor="department-description"
                  className="flex items-center gap-2 text-sm font-medium text-slate-700"
                >
                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                  Description
                </label>

                <textarea
                  id="department-description"
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description:
                        event.target.value,
                    }))
                  }
                  rows={4}
                  maxLength={500}
                  placeholder="Briefly describe this department..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10"
                />

                <div className="flex justify-end">
                  <span className="text-[11px] text-slate-400">
                    {form.description.length}/500
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="border-t border-slate-100 bg-slate-50/50 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
                disabled={saving}
                className="rounded-xl"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={saving}
                className="min-w-[130px] rounded-xl"
              >
                {saving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editing ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Department
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

