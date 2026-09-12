"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Archive,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Edit3,
  FolderTree,
  GraduationCap,
  Layers3,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import { getSession } from "next-auth/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "";

/* =========================================================
   TYPES
========================================================= */

interface Department {
  _id: string;
  name: string;
  code: string;
  isActive: boolean;
}

interface ProgrammeDepartment {
  _id: string;
  name: string;
  code: string;
}

interface Programme {
  _id: string;
  name: string;
  code: string;
  department: string | ProgrammeDepartment;
  award?: string;
  durationYears?: number;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ProgrammeForm {
  name: string;
  code: string;
  department: string;
  award: string;
  durationYears: string;
  description: string;
}

const EMPTY_FORM: ProgrammeForm = {
  name: "",
  code: "",
  department: "",
  award: "",
  durationYears: "",
  description: "",
};

/* =========================================================
   PAGE
========================================================= */

export default function RegistrarProgrammesPage() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgramme, setEditingProgramme] =
    useState<Programme | null>(null);

  const [form, setForm] = useState<ProgrammeForm>(EMPTY_FORM);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [archivingId, setArchivingId] = useState<string | null>(null);

  const [programmeToArchive, setProgrammeToArchive] =
    useState<Programme | null>(null);

  /* =========================================================
     AUTH
  ========================================================= */

  const getToken = async () => {
    const session = await getSession();

    return session?.accessToken
      ? String(session.accessToken)
      : null;
  };

  /* =========================================================
     FETCH DATA
  ========================================================= */

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
          programmesResponse,
          departmentsResponse,
        ] = await Promise.all([
          fetch(`${API_URL}/api/programmes`, {
            headers,
            cache: "no-store",
          }),

          fetch(`${API_URL}/api/departments`, {
            headers,
            cache: "no-store",
          }),
        ]);

        const programmesData =
          await programmesResponse.json().catch(() => null);

        const departmentsData =
          await departmentsResponse.json().catch(() => null);

        if (!programmesResponse.ok) {
          throw new Error(
            programmesData?.message ||
              "Failed to load programmes.",
          );
        }

        if (!departmentsResponse.ok) {
          throw new Error(
            departmentsData?.message ||
              "Failed to load departments.",
          );
        }

        setProgrammes(
          Array.isArray(programmesData?.programmes)
            ? programmesData.programmes
            : [],
        );

        setDepartments(
          Array.isArray(departmentsData?.departments)
            ? departmentsData.departments
            : [],
        );
      } catch (error) {
        console.error("FETCH PROGRAMMES ERROR:", error);

        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load programmes.",
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

  /* =========================================================
     FILTERING
  ========================================================= */

  const filteredProgrammes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return programmes.filter((programme) => {
      const department =
        typeof programme.department === "string"
          ? null
          : programme.department;

      const matchesDepartment =
        departmentFilter === "all" ||
        department?._id === departmentFilter;

      if (!matchesDepartment) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        programme.name.toLowerCase().includes(query) ||
        programme.code.toLowerCase().includes(query) ||
        programme.award?.toLowerCase().includes(query) ||
        department?.name.toLowerCase().includes(query) ||
        department?.code.toLowerCase().includes(query)
      );
    });
  }, [
    programmes,
    search,
    departmentFilter,
  ]);

  /* =========================================================
     SUMMARY
  ========================================================= */

  const totalProgrammes = programmes.length;

  const programmesWithAward = programmes.filter(
    (programme) => Boolean(programme.award?.trim()),
  ).length;

  const programmesWithDuration = programmes.filter(
    (programme) =>
      typeof programme.durationYears === "number",
  ).length;

  /* =========================================================
     MODAL
  ========================================================= */

  const openCreateModal = () => {
    setEditingProgramme(null);

    setForm({
      ...EMPTY_FORM,
      department:
        departmentFilter !== "all"
          ? departmentFilter
          : "",
    });

    setIsModalOpen(true);
  };

  const openEditModal = (programme: Programme) => {
    const departmentId =
      typeof programme.department === "string"
        ? programme.department
        : programme.department?._id;

    setEditingProgramme(programme);

    setForm({
      name: programme.name || "",
      code: programme.code || "",
      department: departmentId || "",
      award: programme.award || "",
      durationYears:
        typeof programme.durationYears === "number"
          ? String(programme.durationYears)
          : "",
      description: programme.description || "",
    });

    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;

    setIsModalOpen(false);
    setEditingProgramme(null);
    setForm(EMPTY_FORM);
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const name = form.name.trim();
    const code = form.code.trim().toUpperCase();
    const department = form.department;
    const award = form.award.trim();
    const description = form.description.trim();

    if (name.length < 2) {
      toast.error(
        "Programme name must contain at least 2 characters.",
      );
      return;
    }

    if (code.length < 2 || code.length > 15) {
      toast.error(
        "Programme code must contain 2–15 characters.",
      );
      return;
    }

    if (!department) {
      toast.error("Please select a department.");
      return;
    }

    let durationYears: number | undefined;

    if (form.durationYears.trim()) {
      const parsedDuration = Number(
        form.durationYears,
      );

      if (
        !Number.isInteger(parsedDuration) ||
        parsedDuration < 1 ||
        parsedDuration > 10
      ) {
        toast.error(
          "Duration must be a whole number between 1 and 10 years.",
        );
        return;
      }

      durationYears = parsedDuration;
    }

    try {
      setIsSubmitting(true);

      const token = await getToken();

      if (!token) {
        throw new Error(
          "Your session has expired. Please sign in again.",
        );
      }

      const payload: Record<string, unknown> = {
        name,
        code,
        department,
      };

      if (award) {
        payload.award = award;
      }

      if (typeof durationYears === "number") {
        payload.durationYears = durationYears;
      }

      if (description) {
        payload.description = description;
      }

      const url = editingProgramme
        ? `${API_URL}/api/programmes/${editingProgramme._id}`
        : `${API_URL}/api/programmes`;

      const response = await fetch(url, {
        method: editingProgramme
          ? "PATCH"
          : "POST",

        headers: {
          "Content-Type": "application/json",
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
            "Unable to save programme.",
        );
      }

      toast.success(
        editingProgramme
          ? "Programme updated successfully."
          : "Programme created successfully.",
      );

      closeModal();

      await fetchData(true);
    } catch (error) {
      console.error(
        "SAVE PROGRAMME ERROR:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save programme.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================================================
     ARCHIVE
  ========================================================= */

  const requestArchive = (programme: Programme) => {
    setProgrammeToArchive(programme);
  };

  const handleArchive = async () => {
    if (!programmeToArchive) return;

    const programme = programmeToArchive;

    try {
      setArchivingId(programme._id);

      const token = await getToken();

      if (!token) {
        throw new Error(
          "Your session has expired. Please sign in again.",
        );
      }

      const response = await fetch(
        `${API_URL}/api/programmes/${programme._id}`,
        {
          method: "DELETE",
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
            "Unable to archive programme.",
        );
      }

      toast.success(
        "Programme archived successfully.",
      );

      setProgrammeToArchive(null);

      await fetchData(true);
    } catch (error) {
      console.error(
        "ARCHIVE PROGRAMME ERROR:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to archive programme.",
      );
    } finally {
      setArchivingId(null);
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen py-4 sm:py-6 lg:py-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* =====================================================
            PREMIUM HEADER
        ===================================================== */}

        <section className="relative overflow-hidden rounded-[28px] bg-brand-navy text-white shadow-xl shadow-brand-navy/15">
          {/* Decorative glow */}
          <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-brand-gold/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-brand-blue/10 blur-3xl" />

          <div className="pointer-events-none absolute right-1/4 top-1/2 h-24 w-24 rounded-full border border-white/5" />

          <div className="relative p-6 sm:p-8 lg:p-9">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

              {/* Header content */}
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-gold/25 bg-brand-gold/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-gold">
                  <BookOpen className="h-3.5 w-3.5" />
                  Academic Structure
                </div>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Programmes
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-white/70 sm:text-base">
                  Manage academic programmes, department
                  assignments, awards and programme duration
                  from one central academic workspace.
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80">
                    <GraduationCap className="h-3.5 w-3.5 text-brand-gold" />
                    Registrar Workspace
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80">
                    <Layers3 className="h-3.5 w-3.5 text-brand-gold" />
                    {totalProgrammes}{" "}
                    {totalProgrammes === 1
                      ? "Programme"
                      : "Programmes"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:flex-col xl:flex-row">
                <Button
                  variant="outline"
                  onClick={() => fetchData(true)}
                  disabled={isRefreshing}
                  className="h-11 border-white/15 bg-white/10 px-5 text-white backdrop-blur-sm hover:bg-white/15 hover:text-white"
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
                  disabled={departments.length === 0}
                  className="h-11 bg-brand-gold px-5 font-semibold text-brand-navy shadow-lg shadow-brand-gold/20 hover:bg-brand-gold/90"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Programme
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            SUMMARY CARDS
        ===================================================== */}

        <div className="grid gap-4 sm:grid-cols-3">

          <SummaryCard
            icon={BookOpen}
            label="Total Programmes"
            value={totalProgrammes}
            description="Academic programmes"
            accent="navy"
          />

          <SummaryCard
            icon={FolderTree}
            label="With Award"
            value={programmesWithAward}
            description="Programmes with award details"
            accent="gold"
          />

          <SummaryCard
            icon={CheckCircle2}
            label="With Duration"
            value={programmesWithDuration}
            description="Programmes with duration"
            accent="green"
          />

        </div>

        {/* =====================================================
            MAIN DIRECTORY
        ===================================================== */}

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">

          {/* Toolbar */}
          <div className="border-b border-slate-100 bg-white p-5 sm:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-navy">
                    <BookOpen className="h-4.5 w-4.5 text-white" />
                  </div>

                  <div>
                    <h2 className="font-semibold text-brand-navy">
                      Programme Directory
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {filteredProgrammes.length} programme
                      {filteredProgrammes.length === 1
                        ? ""
                        : "s"} displayed
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 sm:flex-row xl:max-w-2xl">

                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search programmes, codes or departments..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-brand-gold focus:bg-white focus:ring-4 focus:ring-brand-gold/10"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      aria-label="Clear search"
                      className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Department filter */}
                <div className="relative sm:w-64">
                  <select
                    value={departmentFilter}
                    onChange={(event) =>
                      setDepartmentFilter(
                        event.target.value,
                      )
                    }
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 pr-10 text-sm text-slate-700 outline-none transition-all focus:border-brand-gold focus:bg-white focus:ring-4 focus:ring-brand-gold/10"
                  >
                    <option value="all">
                      All Departments
                    </option>

                    {departments.map(
                      (department) => (
                        <option
                          key={department._id}
                          value={department._id}
                        >
                          {department.name}
                        </option>
                      ),
                    )}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* No departments warning */}
          {!isLoading &&
            departments.length === 0 && (
              <div className="border-b border-amber-100 bg-amber-50 px-5 py-4 sm:px-6">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                    <AlertTriangle className="h-4 w-4 text-amber-700" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-amber-900">
                      Department required
                    </p>

                    <p className="mt-0.5 text-xs leading-5 text-amber-800">
                      You need to create at least one
                      department before creating a
                      programme.
                    </p>
                  </div>
                </div>
              </div>
            )}

          {/* Loading */}
          {isLoading ? (
            <div className="flex min-h-[420px] items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy/5">
                  <Loader2 className="h-7 w-7 animate-spin text-brand-gold" />
                </div>

                <div className="text-center">
                  <p className="text-sm font-semibold text-brand-navy">
                    Loading programmes
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Preparing your academic directory...
                  </p>
                </div>
              </div>
            </div>
          ) : filteredProgrammes.length === 0 ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">

              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-navy/5">
                <BookOpen className="h-8 w-8 text-brand-navy/50" />
              </div>

              <h3 className="text-lg font-semibold text-brand-navy">
                {search ||
                departmentFilter !== "all"
                  ? "No programmes found"
                  : "No programmes yet"}
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                {search ||
                departmentFilter !== "all"
                  ? "Try changing your search term or selecting another department."
                  : "Create your first academic programme to start building the institution's programme directory."}
              </p>

              {!search &&
                departmentFilter === "all" &&
                departments.length > 0 && (
                  <Button
                    onClick={openCreateModal}
                    className="mt-6 bg-brand-navy px-5 text-white shadow-sm hover:bg-brand-navy/90"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Programme
                  </Button>
                )}
            </div>
          ) : (
            <>
              {/* =================================================
                  DESKTOP TABLE
              ================================================= */}

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">

                  <thead>
                    <tr className="bg-brand-navy text-left">
                      <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
                        Programme
                      </th>

                      <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
                        Code
                      </th>

                      <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
                        Department
                      </th>

                      <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
                        Award
                      </th>

                      <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
                        Duration
                      </th>

                      <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredProgrammes.map(
                      (programme) => {
                        const department =
                          typeof programme.department ===
                          "string"
                            ? null
                            : programme.department;

                        return (
                          <tr
                            key={programme._id}
                            className="group transition-all hover:bg-brand-navy/[0.025]"
                          >
                            {/* Programme */}
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3.5">

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand-navy/10 bg-brand-navy/5 transition group-hover:bg-brand-navy group-hover:text-white">
                                  <BookOpen className="h-5 w-5 text-brand-navy group-hover:text-white" />
                                </div>

                                <div className="min-w-0">
                                  <p className="font-semibold text-brand-navy">
                                    {programme.name}
                                  </p>

                                  {programme.description && (
                                    <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                                      {programme.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Code */}
                            <td className="px-6 py-5">
                              <span className="inline-flex rounded-lg border border-brand-gold/20 bg-brand-gold/10 px-2.5 py-1 font-mono text-xs font-bold tracking-wide text-brand-navy">
                                {programme.code}
                              </span>
                            </td>

                            {/* Department */}
                            <td className="px-6 py-5">
                              {department ? (
                                <div>
                                  <p className="text-sm font-semibold text-slate-700">
                                    {department.name}
                                  </p>

                                  <span className="mt-1 inline-flex rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-500">
                                    {department.code}
                                  </span>
                                </div>
                              ) : (
                                <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-400">
                                  Unknown department
                                </span>
                              )}
                            </td>

                            {/* Award */}
                            <td className="px-6 py-5">
                              {programme.award ? (
                                <span className="text-sm font-medium text-slate-600">
                                  {programme.award}
                                </span>
                              ) : (
                                <span className="text-sm text-slate-400">
                                  —
                                </span>
                              )}
                            </td>

                            {/* Duration */}
                            <td className="px-6 py-5">
                              {programme.durationYears ? (
                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                  <Layers3 className="h-3.5 w-3.5 text-brand-navy" />

                                  {programme.durationYears}{" "}
                                  year
                                  {programme.durationYears ===
                                  1
                                    ? ""
                                    : "s"}
                                </span>
                              ) : (
                                <span className="text-sm text-slate-400">
                                  —
                                </span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="px-6 py-5">
                              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Active
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-5">
                              <div className="flex justify-end gap-2">

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    openEditModal(
                                      programme,
                                    )
                                  }
                                  className="h-9 border-slate-200 bg-white px-3 text-slate-600 transition-all hover:border-brand-navy/20 hover:bg-brand-navy hover:text-white"
                                >
                                  <Edit3 className="mr-1.5 h-3.5 w-3.5" />
                                  Edit
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    requestArchive(
                                      programme,
                                    )
                                  }
                                  disabled={
                                    archivingId ===
                                    programme._id
                                  }
                                  className="h-9 border-red-100 bg-white px-3 text-red-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                                >
                                  {archivingId ===
                                  programme._id ? (
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
              ================================================= */}

              <div className="divide-y divide-slate-100 md:hidden">
                {filteredProgrammes.map(
                  (programme) => {
                    const department =
                      typeof programme.department ===
                      "string"
                        ? null
                        : programme.department;

                    return (
                      <div
                        key={programme._id}
                        className="p-5 transition hover:bg-slate-50/70 sm:p-6"
                      >
                        <div className="flex gap-3.5">

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy">
                            <BookOpen className="h-5 w-5 text-white" />
                          </div>

                          <div className="min-w-0 flex-1">

                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h3 className="truncate font-semibold text-brand-navy">
                                  {programme.name}
                                </h3>

                                <span className="mt-1.5 inline-flex rounded-lg bg-brand-gold/10 px-2 py-1 font-mono text-[10px] font-bold tracking-wide text-brand-navy">
                                  {programme.code}
                                </span>
                              </div>

                              <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Active
                              </span>
                            </div>

                            {programme.description && (
                              <p className="mt-3 text-xs leading-5 text-slate-500">
                                {programme.description}
                              </p>
                            )}

                            {department && (
                              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                                <div className="flex items-center gap-2">
                                  <FolderTree className="h-4 w-4 text-brand-navy" />

                                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                                    Department
                                  </p>
                                </div>

                                <p className="mt-1.5 text-sm font-semibold text-slate-700">
                                  {department.name}
                                </p>

                                <span className="mt-1 inline-flex font-mono text-[10px] font-semibold text-slate-400">
                                  {department.code}
                                </span>
                              </div>
                            )}

                            <div className="mt-4 grid grid-cols-2 gap-3">

                              <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                  Award
                                </p>

                                <p className="mt-1.5 text-sm font-medium text-slate-600">
                                  {programme.award || "—"}
                                </p>
                              </div>

                              <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                  Duration
                                </p>

                                <p className="mt-1.5 text-sm font-medium text-slate-600">
                                  {programme.durationYears
                                    ? `${programme.durationYears} year${
                                        programme.durationYears ===
                                        1
                                          ? ""
                                          : "s"
                                      }`
                                    : "—"}
                                </p>
                              </div>

                            </div>

                            <div className="mt-4 flex justify-end gap-2">

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  openEditModal(
                                    programme,
                                  )
                                }
                                className="h-9 border-slate-200 px-3"
                              >
                                <Edit3 className="mr-1.5 h-3.5 w-3.5" />
                                Edit
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  requestArchive(
                                    programme,
                                  )
                                }
                                disabled={
                                  archivingId ===
                                  programme._id
                                }
                                className="h-9 border-red-100 px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
                              >
                                {archivingId ===
                                programme._id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Archive className="h-3.5 w-3.5" />
                                )}
                              </Button>

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

        {/* =====================================================
            CREATE / EDIT MODAL
        ===================================================== */}

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/60 p-4 backdrop-blur-md">

            <div className="max-h-[92vh] w-full max-w-xl overflow-hidden rounded-[28px] border border-white/20 bg-white shadow-2xl">

              {/* Modal Header */}
              <div className="relative overflow-hidden bg-brand-navy px-6 py-6 text-white">
                <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-brand-gold/10 blur-2xl" />

                <div className="relative flex items-center justify-between gap-4">

                  <div className="flex items-center gap-3.5">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gold text-brand-navy shadow-lg">
                      {editingProgramme ? (
                        <Edit3 className="h-5 w-5" />
                      ) : (
                        <BookOpen className="h-5 w-5" />
                      )}
                    </div>

                    <div>
                      <h2 className="font-semibold text-white">
                        {editingProgramme
                          ? "Edit Programme"
                          : "Create Programme"}
                      </h2>

                      <p className="mt-1 text-xs text-white/60">
                        {editingProgramme
                          ? "Update the programme information below."
                          : "Add a new academic programme to the directory."}
                      </p>
                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isSubmitting}
                    aria-label="Close modal"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                  </button>

                </div>
              </div>

              {/* Form */}
              <div className="max-h-[calc(92vh-105px)] overflow-y-auto">
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5 p-6"
                >

                  {/* Programme Name */}
                  <div>
                    <label
                      htmlFor="programme-name"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Programme Name
                    </label>

                    <input
                      id="programme-name"
                      value={form.name}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      placeholder="e.g. Computer Science"
                      disabled={isSubmitting}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 disabled:bg-slate-50"
                    />
                  </div>

                  {/* Code + Duration */}
                  <div className="grid gap-5 sm:grid-cols-2">

                    <div>
                      <label
                        htmlFor="programme-code"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Programme Code
                      </label>

                      <input
                        id="programme-code"
                        value={form.code}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            code: event.target.value.toUpperCase(),
                          }))
                        }
                        placeholder="e.g. CSC"
                        maxLength={15}
                        disabled={isSubmitting}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 font-mono text-sm uppercase text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 disabled:bg-slate-50"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="programme-duration"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Duration
                        <span className="ml-1 font-normal text-slate-400">
                          (years)
                        </span>
                      </label>

                      <input
                        id="programme-duration"
                        type="number"
                        min={1}
                        max={10}
                        step={1}
                        value={form.durationYears}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            durationYears:
                              event.target.value,
                          }))
                        }
                        placeholder="e.g. 2"
                        disabled={isSubmitting}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 disabled:bg-slate-50"
                      />
                    </div>

                  </div>

                  {/* Department */}
                  <div>
                    <label
                      htmlFor="programme-department"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Department
                    </label>

                    <div className="relative">
                      <select
                        id="programme-department"
                        value={form.department}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            department:
                              event.target.value,
                          }))
                        }
                        disabled={
                          isSubmitting ||
                          departments.length === 0
                        }
                        className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 pr-10 text-sm text-slate-700 outline-none transition-all focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 disabled:bg-slate-50"
                      >
                        <option value="">
                          Select a department
                        </option>

                        {departments.map(
                          (department) => (
                            <option
                              key={department._id}
                              value={department._id}
                            >
                              {department.name} (
                              {department.code})
                            </option>
                          ),
                        )}
                      </select>

                      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  {/* Award */}
                  <div>
                    <label
                      htmlFor="programme-award"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Award
                      <span className="ml-1 font-normal text-slate-400">
                        (optional)
                      </span>
                    </label>

                    <input
                      id="programme-award"
                      value={form.award}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          award: event.target.value,
                        }))
                      }
                      placeholder="e.g. National Diploma"
                      maxLength={100}
                      disabled={isSubmitting}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 disabled:bg-slate-50"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      htmlFor="programme-description"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Description
                      <span className="ml-1 font-normal text-slate-400">
                        (optional)
                      </span>
                    </label>

                    <textarea
                      id="programme-description"
                      value={form.description}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          description:
                            event.target.value,
                        }))
                      }
                      placeholder="Brief description of the programme..."
                      maxLength={500}
                      rows={4}
                      disabled={isSubmitting}
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 disabled:bg-slate-50"
                    />

                    <div className="mt-1.5 flex justify-end">
                      <span className="text-[11px] font-medium text-slate-400">
                        {form.description.length}/500
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeModal}
                      disabled={isSubmitting}
                      className="h-11 border-slate-200 px-5"
                    >
                      Cancel
                    </Button>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-11 bg-brand-navy px-5 font-semibold text-white shadow-lg shadow-brand-navy/10 hover:bg-brand-navy/90"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          {editingProgramme
                            ? "Save Changes"
                            : "Create Programme"}
                        </>
                      )}
                    </Button>

                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            ARCHIVE CONFIRMATION
        ===================================================== */}

        {programmeToArchive && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-brand-navy/60 p-4 backdrop-blur-md">
            <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-white/20 bg-white shadow-2xl">

              <div className="p-6 sm:p-7">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
                  <Archive className="h-6 w-6 text-red-600" />
                </div>

                <h2 className="mt-5 text-lg font-bold text-brand-navy">
                  Archive Programme?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  You are about to archive{" "}
                  <span className="font-semibold text-slate-700">
                    {programmeToArchive.name}
                  </span>
                  . It will no longer appear in the
                  active programme directory.
                </p>

                <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 p-3.5">
                  <div className="flex gap-2.5">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

                    <p className="text-xs leading-5 text-amber-800">
                      Archiving does not permanently delete
                      the programme from the system.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setProgrammeToArchive(null)
                    }
                    disabled={
                      archivingId ===
                      programmeToArchive._id
                    }
                    className="h-11 border-slate-200 px-5"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    onClick={handleArchive}
                    disabled={
                      archivingId ===
                      programmeToArchive._id
                    }
                    className="h-11 bg-red-600 px-5 font-semibold text-white shadow-lg shadow-red-600/10 hover:bg-red-700"
                  >
                    {archivingId ===
                    programmeToArchive._id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Archiving...
                      </>
                    ) : (
                      <>
                        <Archive className="mr-2 h-4 w-4" />
                        Archive Programme
                      </>
                    )}
                  </Button>

                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
  accent,
}: {
  icon: typeof BookOpen;
  label: string;
  value: number;
  description: string;
  accent: "navy" | "gold" | "green";
}) {
  const accentClasses = {
    navy: {
      bar: "bg-brand-navy",
      icon: "bg-brand-navy text-white",
    },
    gold: {
      bar: "bg-brand-gold",
      icon: "bg-brand-gold/15 text-brand-navy",
    },
    green: {
      bar: "bg-emerald-500",
      icon: "bg-emerald-50 text-emerald-700",
    },
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div
        className={`absolute inset-x-0 top-0 h-1 ${accentClasses[accent].bar}`}
      />

      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${accentClasses[accent].icon}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <span className="text-3xl font-bold tracking-tight text-brand-navy">
          {value}
        </span>
      </div>

      <div className="mt-5">
        <p className="text-sm font-semibold text-slate-700">
          {label}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}