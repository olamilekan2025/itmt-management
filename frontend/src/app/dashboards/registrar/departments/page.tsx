"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Archive,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Edit3,
  Layers3,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";

import { getSession } from "next-auth/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "";

interface DepartmentHead {
  _id?: string;
  name?: string;
  email?: string;
}

interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  headOfDepartment?: DepartmentHead | string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface Programme {
  _id: string;
  name: string;
  code: string;
  department:
    | string
    | {
        _id: string;
        name: string;
        code: string;
      };
  isActive: boolean;
}

interface DepartmentForm {
  name: string;
  code: string;
  description: string;
}

const EMPTY_FORM: DepartmentForm = {
  name: "",
  code: "",
  description: "",
};

export default function RegistrarDepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] =
    useState<Department | null>(null);

  const [form, setForm] =
    useState<DepartmentForm>(EMPTY_FORM);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [archivingId, setArchivingId] =
    useState<string | null>(null);

  const getToken = async () => {
    const session = await getSession();

    return session?.accessToken
      ? String(session.accessToken)
      : null;
  };

  const fetchData = useCallback(
    async (showRefreshLoader = false) => {
      try {
        if (showRefreshLoader) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const token = await getToken();

        if (!token) {
          throw new Error(
            "Your session has expired. Please sign in again.",
          );
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [
          departmentsResponse,
          programmesResponse,
        ] = await Promise.all([
          fetch(`${API_URL}/api/departments`, {
            headers,
            cache: "no-store",
          }),

          fetch(`${API_URL}/api/programmes`, {
            headers,
            cache: "no-store",
          }),
        ]);

        const departmentsData =
          await departmentsResponse
            .json()
            .catch(() => null);

        const programmesData =
          await programmesResponse
            .json()
            .catch(() => null);

        if (!departmentsResponse.ok) {
          throw new Error(
            departmentsData?.message ||
              "Failed to load departments.",
          );
        }

        if (!programmesResponse.ok) {
          throw new Error(
            programmesData?.message ||
              "Failed to load programmes.",
          );
        }

        setDepartments(
          Array.isArray(
            departmentsData?.departments,
          )
            ? departmentsData.departments
            : [],
        );

        setProgrammes(
          Array.isArray(
            programmesData?.programmes,
          )
            ? programmesData.programmes
            : [],
        );
      } catch (error) {
        console.error(
          "FETCH DEPARTMENTS ERROR:",
          error,
        );

        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load departments.",
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const programmeCountByDepartment = useMemo(() => {
    const counts: Record<string, number> = {};

    for (const programme of programmes) {
      const departmentId =
        typeof programme.department === "string"
          ? programme.department
          : programme.department?._id;

      if (!departmentId) continue;

      counts[departmentId] =
        (counts[departmentId] || 0) + 1;
    }

    return counts;
  }, [programmes]);

  const filteredDepartments = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return departments;
    }

    return departments.filter((department) => {
      return (
        department.name
          .toLowerCase()
          .includes(query) ||
        department.code
          .toLowerCase()
          .includes(query) ||
        department.description
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [departments, search]);

  const totalDepartments = departments.length;

  const activeDepartments = departments.filter(
    (department) => department.isActive,
  ).length;

  const totalProgrammes = programmes.length;

  const departmentsWithProgrammes =
    departments.filter(
      (department) =>
        (programmeCountByDepartment[
          department._id
        ] || 0) > 0,
    ).length;

  const openCreateModal = () => {
    setEditingDepartment(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEditModal = (
    department: Department,
  ) => {
    setEditingDepartment(department);

    setForm({
      name: department.name || "",
      code: department.code || "",
      description:
        department.description || "",
    });

    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;

    setIsModalOpen(false);
    setEditingDepartment(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const name = form.name.trim();

    const code = form.code
      .trim()
      .toUpperCase();

    const description =
      form.description.trim();

    if (name.length < 2) {
      toast.error(
        "Department name must contain at least 2 characters.",
      );
      return;
    }

    if (code.length < 2 || code.length > 10) {
      toast.error(
        "Department code must contain 2–10 characters.",
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const token = await getToken();

      if (!token) {
        throw new Error(
          "Your session has expired. Please sign in again.",
        );
      }

      const payload = {
        name,
        code,
        ...(description
          ? { description }
          : {}),
      };

      const url = editingDepartment
        ? `${API_URL}/api/departments/${editingDepartment._id}`
        : `${API_URL}/api/departments`;

      const response = await fetch(url, {
        method: editingDepartment
          ? "PATCH"
          : "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(payload),
      });

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to save department.",
        );
      }

      toast.success(
        editingDepartment
          ? "Department updated successfully."
          : "Department created successfully.",
      );

      closeModal();

      await fetchData(true);
    } catch (error) {
      console.error(
        "SAVE DEPARTMENT ERROR:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save department.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async (
    department: Department,
  ) => {
    const count =
      programmeCountByDepartment[
        department._id
      ] || 0;

    const confirmation = window.confirm(
      count > 0
        ? `${department.name} has ${count} programme${
            count === 1 ? "" : "s"
          }. Are you sure you want to archive this department?`
        : `Are you sure you want to archive ${department.name}?`,
    );

    if (!confirmation) return;

    try {
      setArchivingId(department._id);

      const token = await getToken();

      if (!token) {
        throw new Error(
          "Your session has expired. Please sign in again.",
        );
      }

      const response = await fetch(
        `${API_URL}/api/departments/${department._id}/archive`,
        {
          method: "PATCH",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to archive department.",
        );
      }

      toast.success(
        "Department archived successfully.",
      );

      await fetchData(true);
    } catch (error) {
      console.error(
        "ARCHIVE DEPARTMENT ERROR:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to archive department.",
      );
    } finally {
      setArchivingId(null);
    }
  };

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* =====================================================
            PREMIUM HEADER
        ====================================================== */}
        <section className="relative overflow-hidden rounded-3xl bg-brand-navy shadow-xl">
          {/* Decorative background */}
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-brand-blue/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-gold">
                <Building2 className="h-3.5 w-3.5" />
                Academic Structure
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Departments
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-white/65 sm:text-base">
                Organise and manage ITMT academic
                departments, their programmes, and
                academic structure from one central
                workspace.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                onClick={() =>
                  fetchData(true)
                }
                disabled={isRefreshing}
                className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${
                    isRefreshing
                      ? "animate-spin"
                      : ""
                  }`}
                />

                Refresh
              </Button>

              <Button
                onClick={openCreateModal}
                className="bg-brand-gold text-brand-navy shadow-lg shadow-black/10 hover:bg-brand-gold/90"
              >
                <Plus className="mr-2 h-4 w-4" />

                Add Department
              </Button>
            </div>
          </div>
        </section>

        {/* =====================================================
            SUMMARY CARDS
        ====================================================== */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={Building2}
            label="Total Departments"
            value={totalDepartments}
            description="Academic units"
          />

          <SummaryCard
            icon={CheckCircle2}
            label="Active Departments"
            value={activeDepartments}
            description="Currently available"
            accent
          />

          <SummaryCard
            icon={Layers3}
            label="Total Programmes"
            value={totalProgrammes}
            description="Across all departments"
          />

          <SummaryCard
            icon={Users}
            label="Departments With Programmes"
            value={departmentsWithProgrammes}
            description="Configured academic units"
          />
        </section>

        {/* =====================================================
            DIRECTORY
        ====================================================== */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {/* Toolbar */}
          <div className="border-b border-slate-100 bg-white p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-navy">
                    <Building2 className="h-4 w-4 text-brand-gold" />
                  </div>

                  <div>
                    <h2 className="font-semibold text-brand-navy">
                      Department Directory
                    </h2>

                    <p className="text-xs text-slate-500">
                      {filteredDepartments.length}{" "}
                      department
                      {filteredDepartments.length ===
                      1
                        ? ""
                        : "s"}{" "}
                      displayed
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative w-full lg:max-w-sm">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Search departments..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand-gold focus:bg-white focus:ring-4 focus:ring-brand-gold/10"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch("")
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Loading */}
          {isLoading ? (
            <div className="flex min-h-[420px] items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy/5">
                  <Loader2 className="h-7 w-7 animate-spin text-brand-gold" />
                </div>

                <div className="text-center">
                  <p className="font-medium text-brand-navy">
                    Loading departments
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Please wait while we retrieve
                    the academic structure.
                  </p>
                </div>
              </div>
            </div>
          ) : filteredDepartments.length ===
            0 ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-navy/5">
                <Building2 className="h-8 w-8 text-brand-navy/40" />
              </div>

              <h3 className="text-lg font-semibold text-brand-navy">
                {search
                  ? "No departments found"
                  : "No departments yet"}
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                {search
                  ? "Try changing your search term or clearing the current filter."
                  : "Create your first academic department to begin building the institution's academic structure."}
              </p>

              {!search && (
                <Button
                  onClick={openCreateModal}
                  className="mt-6 bg-brand-navy text-white hover:bg-brand-navy/90"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Department
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* =================================================
                  DESKTOP TABLE
              ================================================== */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 text-left">
                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                        Department
                      </th>

                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                        Code
                      </th>

                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                        Programmes
                      </th>

                      <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredDepartments.map(
                      (department) => {
                        const programmeCount =
                          programmeCountByDepartment[
                            department._id
                          ] || 0;

                        return (
                          <tr
                            key={
                              department._id
                            }
                            className="group transition-colors hover:bg-slate-50/70"
                          >
                            {/* Department */}
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3.5">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy shadow-sm">
                                  <Building2 className="h-5 w-5 text-brand-gold" />
                                </div>

                                <div className="min-w-0">
                                  <p className="font-semibold text-brand-navy">
                                    {
                                      department.name
                                    }
                                  </p>

                                  {department.description && (
                                    <p className="mt-1 max-w-md truncate text-xs text-slate-500">
                                      {
                                        department.description
                                      }
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Code */}
                            <td className="px-6 py-5">
                              <span className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs font-bold tracking-wide text-brand-navy">
                                {
                                  department.code
                                }
                              </span>
                            </td>

                            {/* Programmes */}
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-brand-navy">
                                  {
                                    programmeCount
                                  }
                                </span>

                                <span className="text-xs text-slate-500">
                                  programme
                                  {programmeCount ===
                                  1
                                    ? ""
                                    : "s"}
                                </span>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-6 py-5">
                              <StatusBadge
                                isActive={
                                  department.isActive
                                }
                              />
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-5">
                              <div className="flex justify-end gap-2 opacity-90 transition group-hover:opacity-100">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    openEditModal(
                                      department,
                                    )
                                  }
                                  className="h-9 rounded-lg border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:border-brand-navy/20 hover:bg-brand-navy/5 hover:text-brand-navy"
                                >
                                  <Edit3 className="mr-1.5 h-3.5 w-3.5" />
                                  Edit
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleArchive(
                                      department,
                                    )
                                  }
                                  disabled={
                                    archivingId ===
                                    department._id
                                  }
                                  className="h-9 rounded-lg border-red-200 bg-white px-3 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700"
                                >
                                  {archivingId ===
                                  department._id ? (
                                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Archive className="mr-1.5 h-3.5 w-3.5" />
                                  )}

                                  Archive
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      },
                    )}
                  </tbody>
                </table>
              </div>

              {/* =================================================
                  MOBILE CARDS
              ================================================== */}
              <div className="divide-y divide-slate-100 md:hidden">
                {filteredDepartments.map(
                  (department) => {
                    const programmeCount =
                      programmeCountByDepartment[
                        department._id
                      ] || 0;

                    return (
                      <div
                        key={
                          department._id
                        }
                        className="p-5"
                      >
                        <div className="flex gap-3.5">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy shadow-sm">
                            <Building2 className="h-5 w-5 text-brand-gold" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h3 className="font-semibold text-brand-navy">
                                  {
                                    department.name
                                  }
                                </h3>

                                <span className="mt-1.5 inline-flex rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-[11px] font-bold text-slate-600">
                                  {
                                    department.code
                                  }
                                </span>
                              </div>

                              <StatusBadge
                                isActive={
                                  department.isActive
                                }
                                compact
                              />
                            </div>

                            {department.description && (
                              <p className="mt-3 text-sm leading-6 text-slate-500">
                                {
                                  department.description
                                }
                              </p>
                            )}

                            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                              <div className="flex items-center gap-2">
                                <Layers3 className="h-4 w-4 text-brand-gold" />

                                <p className="text-sm text-slate-500">
                                  <span className="font-bold text-brand-navy">
                                    {
                                      programmeCount
                                    }
                                  </span>{" "}
                                  programme
                                  {programmeCount ===
                                  1
                                    ? ""
                                    : "s"}
                                </p>
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    openEditModal(
                                      department,
                                    )
                                  }
                                  className="h-9 rounded-lg"
                                >
                                  <Edit3 className="mr-1.5 h-3.5 w-3.5" />
                                  Edit
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleArchive(
                                      department,
                                    )
                                  }
                                  disabled={
                                    archivingId ===
                                    department._id
                                  }
                                  className="h-9 rounded-lg border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                >
                                  {archivingId ===
                                  department._id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Archive className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </>
          )}
        </section>
      </div>

      {/* =========================================================
          CREATE / EDIT MODAL
      ========================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="relative overflow-hidden bg-brand-navy px-6 py-6">
              <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-brand-gold/10 blur-2xl" />

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <Building2 className="h-5 w-5 text-brand-gold" />
                  </div>

                  <h2 className="text-lg font-bold text-white">
                    {editingDepartment
                      ? "Edit Department"
                      : "Create Department"}
                  </h2>

                  <p className="mt-1 text-sm text-white/60">
                    {editingDepartment
                      ? "Update the department information below."
                      : "Add a new academic department to ITMT."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/60 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              <FormField
                label="Department Name"
                required
              >
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="e.g. Department of Transport Management"
                  disabled={isSubmitting}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 disabled:bg-slate-50"
                />
              </FormField>

              <FormField
                label="Department Code"
                required
              >
                <input
                  value={form.code}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      code: event.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="e.g. DTM"
                  maxLength={10}
                  disabled={isSubmitting}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 font-mono text-sm uppercase text-slate-700 outline-none transition placeholder:font-sans placeholder:text-slate-400 focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 disabled:bg-slate-50"
                />
              </FormField>

              <FormField
                label="Description"
                optional
              >
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description:
                        event.target.value,
                    }))
                  }
                  placeholder="Brief description of the department..."
                  maxLength={500}
                  rows={4}
                  disabled={isSubmitting}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 disabled:bg-slate-50"
                />

                <p className="mt-1.5 text-right text-[11px] text-slate-400">
                  {form.description.length}
                  /500
                </p>
              </FormField>

              {/* Footer */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="rounded-xl border-slate-200"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-brand-navy text-white shadow-sm hover:bg-brand-navy/90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingDepartment
                        ? "Save Changes"
                        : "Create Department"}

                      <ArrowUpRight className="ml-1.5 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* =============================================================
   SUMMARY CARD
============================================================= */

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
  accent = false,
}: {
  icon: typeof Building2;
  label: string;
  value: number;
  description: string;
  accent?: boolean;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={`absolute right-0 top-0 h-20 w-20 rounded-full blur-2xl ${
          accent
            ? "bg-brand-gold/10"
            : "bg-brand-navy/5"
        }`}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            accent
              ? "bg-brand-gold/10"
              : "bg-brand-navy/5"
          }`}
        >
          <Icon
            className={`h-5 w-5 ${
              accent
                ? "text-brand-gold"
                : "text-brand-navy"
            }`}
          />
        </div>

        <span className="text-2xl font-bold tracking-tight text-brand-navy">
          {value}
        </span>
      </div>

      <div className="relative mt-5">
        <p className="text-sm font-semibold text-brand-navy">
          {label}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

/* =============================================================
   STATUS BADGE
============================================================= */

function StatusBadge({
  isActive,
  compact = false,
}: {
  isActive: boolean;
  compact?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${
        compact
          ? "px-2 py-1 text-[10px]"
          : "px-2.5 py-1.5 text-[11px]"
      } ${
        isActive
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      <span
        className={`rounded-full ${
          compact ? "h-1.5 w-1.5" : "h-1.5 w-1.5"
        } ${
          isActive
            ? "bg-emerald-500"
            : "bg-slate-400"
        }`}
      />

      {isActive ? "Active" : "Archived"}
    </span>
  );
}

/* =============================================================
   FORM FIELD
============================================================= */

function FormField({
  label,
  required,
  optional,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}{" "}
        {required && (
          <span className="text-brand-gold">
            *
          </span>
        )}
        {optional && (
          <span className="font-normal text-slate-400">
            {" "}
            (optional)
          </span>
        )}
      </label>

      {children}
    </div>
  );
}