"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  BookOpen,
  Building2,
  CheckCircle2,
  Edit,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Trash2,
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
  createProgramme,
  updateProgramme,
  archiveProgramme,
  getDepartments,
  getProgrammes,
  type Department,
  type Programme,
  type ProgrammePayload,
} from "@/lib/admin-courses";

/* =========================================================
   FORM TYPES
========================================================= */

type FormState = {
  name: string;
  code: string;
  department: string;
  award: string;
  durationYears: string;
  description: string;
};

const emptyForm: FormState = {
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

export default function ProgrammesPage() {
  const { data: session } = useSession();

  const accessToken =
    session?.accessToken as string | undefined;

  const [programmes, setProgrammes] = useState<
    Programme[]
  >([]);

  const [departments, setDepartments] = useState<
    Department[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] =
    useState("");

  const [dialogOpen, setDialogOpen] = useState(false);

  const [editingProgramme, setEditingProgramme] =
    useState<Programme | null>(null);

  const [form, setForm] =
    useState<FormState>(emptyForm);

  /* =========================================================
     LOAD DATA
  ========================================================= */

  const loadData = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const [
        programmesResponse,
        departmentsResponse,
      ] = await Promise.all([
        getProgrammes(accessToken),
        getDepartments(accessToken),
      ]);

      setProgrammes(
        programmesResponse.programmes ?? [],
      );

      setDepartments(
        departmentsResponse.departments ?? [],
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load programmes.",
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* =========================================================
     FILTERED PROGRAMMES
  ========================================================= */

  const filteredProgrammes = useMemo(() => {
    const value = search.trim().toLowerCase();

    return programmes.filter((programme) => {
      const departmentName = typeof programme.department === 'string' ? '' : programme.department.name;
      const departmentCode = typeof programme.department === 'string' ? '' : programme.department.code;
      const departmentId = typeof programme.department === 'string' ? programme.department : programme.department._id;

      const matchesSearch =
        !value ||
        programme.name
          .toLowerCase()
          .includes(value) ||
        programme.code
          .toLowerCase()
          .includes(value) ||
        departmentName
          .toLowerCase()
          .includes(value) ||
        departmentCode
          .toLowerCase()
          .includes(value) ||
        programme.award
          ?.toLowerCase()
          .includes(value);

      const matchesDepartment =
        !departmentFilter ||
        departmentId === departmentFilter;

      return (
        matchesSearch && matchesDepartment
      );
    });
  }, [
    programmes,
    search,
    departmentFilter,
  ]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const activeProgrammes = programmes.filter(
    (programme) => programme.isActive,
  ).length;

  const archivedProgrammes = programmes.filter(
    (programme) => !programme.isActive,
  ).length;

  /* =========================================================
     CREATE
  ========================================================= */

  function openCreate() {
    setEditingProgramme(null);
    setForm({ ...emptyForm });
    setDialogOpen(true);
  }

  /* =========================================================
     EDIT
  ========================================================= */

  function openEdit(programme: Programme) {
    setEditingProgramme(programme);

    const departmentId = typeof programme.department === 'string' ? programme.department : programme.department._id;

    setForm({
      name: programme.name,
      code: programme.code,
      department: departmentId,
      award: programme.award ?? "",
      durationYears:
        programme.durationYears?.toString() ?? "",
      description: programme.description ?? "",
    });

    setDialogOpen(true);
  }

  /* =========================================================
     FORM UPDATE
  ========================================================= */

  function updateField(
    field: keyof FormState,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  /* =========================================================
     CLOSE DIALOG
  ========================================================= */

  function closeDialog() {
    if (saving) return;

    setDialogOpen(false);
    setEditingProgramme(null);
    setForm({ ...emptyForm });
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

    const name = form.name.trim();
    const code = form.code.trim().toUpperCase();

    if (!form.department) {
      toast.error("Please select a department.");
      return;
    }

    if (name.length < 2) {
      toast.error(
        "Programme name must be at least 2 characters.",
      );
      return;
    }

    if (code.length < 2) {
      toast.error(
        "Programme code must be at least 2 characters.",
      );
      return;
    }

    let durationYears: number | undefined;

    if (form.durationYears.trim()) {
      durationYears = Number(
        form.durationYears,
      );

      if (
        !Number.isInteger(durationYears) ||
        durationYears < 1 ||
        durationYears > 10
      ) {
        toast.error(
          "Duration must be between 1 and 10 years.",
        );
        return;
      }
    }

    setSaving(true);

    try {
      const payload: ProgrammePayload = {
        name,
        code,
        department: form.department,
      };

      if (form.award.trim()) {
        payload.award = form.award.trim();
      }

      if (durationYears !== undefined) {
        payload.durationYears =
          durationYears;
      }

      if (form.description.trim()) {
        payload.description =
          form.description.trim();
      }

      if (editingProgramme) {
        await updateProgramme(
          editingProgramme._id,
          payload,
          accessToken,
        );

        toast.success(
          "Programme updated successfully.",
        );
      } else {
        await createProgramme(
          payload,
          accessToken,
        );

        toast.success(
          "Programme created successfully.",
        );
      }

      closeDialog();
      await loadData();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : editingProgramme
            ? "Unable to update programme."
            : "Unable to create programme.",
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     ARCHIVE
  ========================================================= */

  async function handleArchive(
    programme: Programme,
  ) {
    if (!accessToken) {
      toast.error(
        "Your session has expired. Please sign in again.",
      );
      return;
    }

    const confirmed = window.confirm(
      `Archive "${programme.name}"?\n\nThis programme will no longer appear in active programme lists.`,
    );

    if (!confirmed) return;

    try {
      await archiveProgramme(
        programme._id,
        accessToken,
      );

      toast.success(
        "Programme archived successfully.",
      );

      await loadData();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to archive programme.",
      );
    }
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-full space-y-8 pb-8">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <section className="relative overflow-hidden rounded-2xl border border-brand-navy/20 bg-brand-navy shadow-lg">
        <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-brand-gold/15 blur-3xl" />

        <div className="absolute -bottom-20 -left-12 h-48 w-48 rounded-full bg-white/5 blur-3xl" />

        <div className="absolute right-1/4 top-1/2 h-24 w-24 rounded-full bg-brand-gold/5 blur-2xl" />

        <div className="relative z-10 flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/10 shadow-inner">
                <BookOpen className="h-5 w-5 text-brand-gold" />
              </div>

              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
                Academic Structure
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Programmes
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
              Manage the academic programmes offered by
              your institution and keep programme
              information organized and up to date.
            </p>
          </div>

          <Button
            onClick={openCreate}
            className="h-11 w-full rounded-xl bg-brand-gold px-5 font-semibold text-brand-navy shadow-md transition hover:bg-brand-gold/90 lg:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Programme
          </Button>
        </div>
      </section>

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {/* Total */}
        <Card className="overflow-hidden border-brand-navy/10 bg-brand-navy/[0.03] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                  Total Programmes
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-brand-dark">
                  {programmes.length}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Academic programmes
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy/10">
                <BookOpen className="h-5 w-5 text-brand-navy" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active */}
        <Card className="overflow-hidden border-emerald-100 bg-emerald-50/50 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                  Active
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-600">
                  {activeProgrammes}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Currently available
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Archived */}
        <Card className="overflow-hidden border-slate-200 bg-slate-50/70 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:col-span-2 lg:col-span-1">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                  Archived
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-600">
                  {archivedProgrammes}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  No longer active
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-200">
                <Trash2 className="h-5 w-5 text-slate-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* =====================================================
          PROGRAMME DIRECTORY
      ===================================================== */}

      <Card className="overflow-hidden border-slate-200 shadow-sm">

        <CardHeader className="border-b border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-navy/10">
                  <BookOpen className="h-4 w-4 text-brand-navy" />
                </div>

                <CardTitle className="text-base font-semibold text-brand-dark">
                  Programme Directory
                </CardTitle>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                {filteredProgrammes.length}{" "}
                {filteredProgrammes.length === 1
                  ? "programme"
                  : "programmes"}{" "}
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
                  placeholder="Search programmes..."
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

              {/* Department filter */}
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <select
                  value={departmentFilter}
                  onChange={(event) =>
                    setDepartmentFilter(
                      event.target.value,
                    )
                  }
                  className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-700 shadow-sm outline-none transition focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10 sm:w-52"
                >
                  <option value="">
                    All Departments
                  </option>

                  {departments.map((department) => (
                    <option
                      key={department._id}
                      value={department._id}
                    >
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Refresh */}
              <Button
                variant="outline"
                size="icon"
                onClick={loadData}
                disabled={loading}
                aria-label="Refresh programmes"
                className="h-10 w-10 shrink-0 rounded-xl bg-white shadow-sm"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    loading
                      ? "animate-spin"
                      : ""
                  }`}
                />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">

          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (
            <div className="space-y-3 p-5 sm:p-6">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="flex animate-pulse items-center gap-4 rounded-xl border border-slate-100 p-4"
                >
                  <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-100" />

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-4 w-48 max-w-full rounded bg-slate-100" />
                    <div className="h-3 w-72 max-w-full rounded bg-slate-100" />
                  </div>

                  <div className="hidden h-8 w-24 rounded-lg bg-slate-100 sm:block" />
                  <div className="hidden h-8 w-20 rounded-lg bg-slate-100 sm:block" />
                </div>
              ))}
            </div>

          ) : filteredProgrammes.length === 0 ? (

            /* =================================================
               EMPTY STATE
            ================================================= */

            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-navy/5 ring-8 ring-brand-navy/[0.02]">
                <BookOpen className="h-7 w-7 text-brand-navy/50" />
              </div>

              <h3 className="mt-5 text-base font-semibold text-slate-800">
                {search || departmentFilter
                  ? "No programmes found"
                  : "No programmes yet"}
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                {search || departmentFilter
                  ? "Try adjusting your search or department filter to find the programme you are looking for."
                  : "Create your first academic programme to begin building your institution's academic structure."}
              </p>

              {search || departmentFilter ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setDepartmentFilter("");
                  }}
                  className="mt-5 rounded-xl"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              ) : (
                <Button
                  onClick={openCreate}
                  className="mt-5 rounded-xl"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Programme
                </Button>
              )}
            </div>

          ) : (

            <>
              {/* =============================================
                  DESKTOP TABLE
              ============================================= */}

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[1050px]">

                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">

                      <th className="px-6 py-4">
                        Programme
                      </th>

                      <th className="px-6 py-4">
                        Code
                      </th>

                      <th className="px-6 py-4">
                        Department
                      </th>

                      <th className="px-6 py-4">
                        Award
                      </th>

                      <th className="px-6 py-4">
                        Duration
                      </th>

                      <th className="px-6 py-4 text-right">
                        Actions
                      </th>

                    </tr>
                  </thead>

                  <tbody>
                    {filteredProgrammes.map(
                      (programme) => (
                        <tr
                          key={programme._id}
                          className="group border-b border-slate-100 last:border-0 transition-colors hover:bg-brand-navy/[0.025]"
                        >

                          {/* Programme */}
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/5 transition-colors group-hover:bg-brand-navy/10">
                                <BookOpen className="h-4 w-4 text-brand-navy" />
                              </div>

                              <div className="min-w-0">
                                <p className="font-semibold text-slate-800">
                                  {programme.name}
                                </p>

                                {programme.description ? (
                                  <p className="mt-1 max-w-sm truncate text-xs text-slate-500">
                                    {programme.description}
                                  </p>
                                ) : (
                                  <p className="mt-1 text-xs text-slate-400">
                                    No description provided
                                  </p>
                                )}
                              </div>

                            </div>
                          </td>

                          {/* Code */}
                          <td className="px-6 py-5">
                            <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs font-semibold tracking-wide text-slate-700">
                              {programme.code}
                            </span>
                          </td>

                          {/* Department */}
                          <td className="px-6 py-5">
                            <div>
                              <p className="text-sm font-semibold text-slate-700">
                                {typeof programme.department === 'string' ? '—' : programme.department.name}
                              </p>

                              <p className="mt-0.5 text-xs font-medium text-brand-navy">
                                {typeof programme.department === 'string' ? '—' : programme.department.code}
                              </p>
                            </div>
                          </td>

                          {/* Award */}
                          <td className="px-6 py-5">
                            <span className="text-sm text-slate-600">
                              {programme.award ?? "—"}
                            </span>
                          </td>

                          {/* Duration */}
                          <td className="px-6 py-5">
                            {programme.durationYears ? (
                              <span className="text-sm font-medium text-slate-700">
                                {programme.durationYears}{" "}
                                {programme.durationYears ===
                                1
                                  ? "year"
                                  : "years"}
                              </span>
                            ) : (
                              <span className="text-sm text-slate-400">
                                —
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-5">
                            <div className="flex justify-end gap-2">

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  openEdit(
                                    programme,
                                  )
                                }
                                className="rounded-lg bg-white"
                              >
                                <Edit className="mr-1.5 h-3.5 w-3.5" />
                                Edit
                              </Button>

                              {programme.isActive && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleArchive(
                                      programme,
                                    )
                                  }
                                  className="rounded-lg bg-white text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                >
                                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
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

              {/* =============================================
                  MOBILE CARDS
              ============================================= */}

              <div className="space-y-3 p-4 md:hidden">
                {filteredProgrammes.map(
                  (programme) => (
                    <div
                      key={programme._id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div className="flex min-w-0 items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/5">
                            <BookOpen className="h-4 w-4 text-brand-navy" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-800">
                              {programme.name}
                            </p>

                            <span className="mt-1 inline-flex rounded-md bg-brand-navy/5 px-2 py-0.5 font-mono text-[10px] font-semibold text-brand-navy">
                              {programme.code}
                            </span>
                          </div>

                        </div>

                        {programme.isActive ? (
                          <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            Archived
                          </span>
                        )}

                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Department
                          </p>

                          <p className="mt-1 truncate text-xs font-medium text-slate-700">
                            {typeof programme.department === 'string' ? '—' : programme.department.name}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Award
                          </p>

                          <p className="mt-1 truncate text-xs font-medium text-slate-700">
                            {programme.award ?? "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Duration
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-700">
                            {programme.durationYears
                              ? `${programme.durationYears} ${
                                  programme.durationYears ===
                                  1
                                    ? "year"
                                    : "years"
                                }`
                              : "—"}
                          </p>
                        </div>

                      </div>

                      {programme.description && (
                        <div className="mt-4 border-t border-slate-100 pt-3">
                          <div className="flex items-center gap-1.5">
                            <FileText className="h-3 w-3 text-slate-400" />

                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              Description
                            </p>
                          </div>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {programme.description}
                          </p>
                        </div>
                      )}

                      <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            openEdit(programme)
                          }
                          className="flex-1 rounded-lg"
                        >
                          <Edit className="mr-1.5 h-3.5 w-3.5" />
                          Edit
                        </Button>

                        {programme.isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleArchive(
                                programme,
                              )
                            }
                            className="rounded-lg text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
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

      {/* =====================================================
          CREATE / EDIT DIALOG
      ===================================================== */}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (saving) return;

          if (open) {
            setDialogOpen(true);
          } else {
            closeDialog();
          }
        }}
      >
        <DialogContent className="overflow-hidden rounded-2xl border-slate-200 p-0 shadow-2xl sm:max-w-2xl">

          {/* Header */}
          <DialogHeader className="border-b border-slate-100 bg-slate-50/80 px-6 py-5">
            <div className="flex items-start gap-3">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy/10">
                {editingProgramme ? (
                  <Edit className="h-5 w-5 text-brand-navy" />
                ) : (
                  <BookOpen className="h-5 w-5 text-brand-navy" />
                )}
              </div>

              <div>
                <DialogTitle className="text-lg font-semibold text-brand-dark">
                  {editingProgramme
                    ? "Edit Programme"
                    : "Create Programme"}
                </DialogTitle>

                <DialogDescription className="mt-1 text-xs leading-5 text-slate-500">
                  {editingProgramme
                    ? "Update the academic programme information below."
                    : "Add a new academic programme to your institution."}
                </DialogDescription>
              </div>

            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit}>

            <div className="space-y-5 px-6 py-6">

              {/* Name + Code */}
              <div className="grid gap-4 sm:grid-cols-2">

                <div className="space-y-2">
                  <label
                    htmlFor="programme-name"
                    className="text-sm font-medium text-slate-700"
                  >
                    Programme Name
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="programme-name"
                    required
                    value={form.name}
                    onChange={(event) =>
                      updateField(
                        "name",
                        event.target.value,
                      )
                    }
                    placeholder="e.g. Computer Science"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="programme-code"
                    className="text-sm font-medium text-slate-700"
                  >
                    Programme Code
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="programme-code"
                    required
                    value={form.code}
                    onChange={(event) =>
                      updateField(
                        "code",
                        event.target.value.toUpperCase(),
                      )
                    }
                    placeholder="e.g. COM"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm uppercase outline-none transition placeholder:normal-case placeholder:text-slate-400 focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10"
                  />

                  <p className="text-[11px] text-slate-400">
                    Use a short unique code.
                  </p>
                </div>

              </div>

              {/* Department + Award */}
              <div className="grid gap-4 sm:grid-cols-2">

                <div className="space-y-2">
                  <label
                    htmlFor="programme-department"
                    className="text-sm font-medium text-slate-700"
                  >
                    Department
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <select
                    id="programme-department"
                    required
                    value={form.department}
                    onChange={(event) =>
                      updateField(
                        "department",
                        event.target.value,
                      )
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10"
                  >
                    <option value="">
                      Select department
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
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="programme-award"
                    className="text-sm font-medium text-slate-700"
                  >
                    Award
                  </label>

                  <input
                    id="programme-award"
                    value={form.award}
                    onChange={(event) =>
                      updateField(
                        "award",
                        event.target.value,
                      )
                    }
                    placeholder="e.g. National Diploma"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10"
                  />
                </div>

              </div>

              {/* Duration */}
              <div className="space-y-2">

                <label
                  htmlFor="programme-duration"
                  className="text-sm font-medium text-slate-700"
                >
                  Duration
                </label>

                <div className="relative">
                  <input
                    id="programme-duration"
                    type="number"
                    min={1}
                    max={10}
                    value={form.durationYears}
                    onChange={(event) =>
                      updateField(
                        "durationYears",
                        event.target.value,
                      )
                    }
                    placeholder="e.g. 2"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 pr-16 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10"
                  />

                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                    years
                  </span>
                </div>

              </div>

              {/* Description */}
              <div className="space-y-2">

                <label
                  htmlFor="programme-description"
                  className="flex items-center gap-2 text-sm font-medium text-slate-700"
                >
                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                  Description
                </label>

                <textarea
                  id="programme-description"
                  value={form.description}
                  onChange={(event) =>
                    updateField(
                      "description",
                      event.target.value,
                    )
                  }
                  placeholder="Briefly describe the programme..."
                  rows={4}
                  maxLength={500}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-brand-navy focus:ring-4 focus:ring-brand-navy/10"
                />

                <div className="flex justify-end">
                  <span className="text-[11px] text-slate-400">
                    {form.description.length}/500
                  </span>
                </div>

              </div>

            </div>

            {/* Footer */}
            <DialogFooter className="border-t border-slate-100 bg-slate-50/70 px-6 py-4">

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
                className="min-w-[145px] rounded-xl"
              >
                {saving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    {editingProgramme
                      ? "Saving..."
                      : "Creating..."}
                  </>
                ) : editingProgramme ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Programme
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