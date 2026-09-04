"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getSession } from "next-auth/react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Edit3,
  Loader2,
  MoreHorizontal,
  Plus,
  Power,
  RefreshCw,
  Search,
  ShieldCheck,
  Tag,
  Trash2,
  Users,
  X,
  XCircle,
} from "lucide-react";

import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "@/lib/api";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type FeeCategory = {
  _id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
};

type FeeCategoriesResponse = {
  success: boolean;
  feeCategories: FeeCategory[];
};

type FilterValue = "all" | "active" | "inactive";

type FormState = {
  name: string;
  code: string;
  description: string;
  isActive: boolean;
};

const EMPTY_FORM: FormState = {
  name: "",
  code: "",
  description: "",
  isActive: true,
};

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function formatDate(value: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "FC"
  );
}

function getErrorMessage(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

export default function FeeCategoriesPage() {
  const [categories, setCategories] = useState<FeeCategory[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [editingCategory, setEditingCategory] =
    useState<FeeCategory | null>(null);

  const [deletingCategory, setDeletingCategory] =
    useState<FeeCategory | null>(null);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [statusUpdating, setStatusUpdating] =
    useState<string | null>(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [actionError, setActionError] = useState("");

  /* ------------------------------------------------------------------------ */
  /*                              LOAD CATEGORIES                             */
  /* ------------------------------------------------------------------------ */

  const loadCategories = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const session = await getSession();
        const accessToken = session?.accessToken;

        if (!accessToken) {
          throw new Error(
            "Your session has expired. Please sign in again.",
          );
        }

        const params = new URLSearchParams();

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (filter === "active") {
          params.set("isActive", "true");
        }

        if (filter === "inactive") {
          params.set("isActive", "false");
        }

        const query = params.toString();

        const response =
          await apiGet<FeeCategoriesResponse>(
            `/fee-categories${
              query ? `?${query}` : ""
            }`,
            accessToken,
          );

        setCategories(
          Array.isArray(response.feeCategories)
            ? response.feeCategories
            : [],
        );
      } catch (err) {
        console.error(
          "Load fee categories error:",
          err,
        );

        setError(
          getErrorMessage(err) ||
            "Unable to load fee categories.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filter, search],
  );

  /* ------------------------------------------------------------------------ */
  /*                              INITIAL LOAD                                */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCategories();
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadCategories]);

  /* ------------------------------------------------------------------------ */
  /*                             SUCCESS MESSAGE                              */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!successMessage) return;

    const timer = window.setTimeout(() => {
      setSuccessMessage("");
    }, 4000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [successMessage]);

  /* ------------------------------------------------------------------------ */
  /*                                  STATS                                   */
  /* ------------------------------------------------------------------------ */

  const stats = useMemo(() => {
    const total = categories.length;

    const active = categories.filter(
      (category) => category.isActive,
    ).length;

    const inactive = categories.filter(
      (category) => !category.isActive,
    ).length;

    const inUse = categories.filter(
      (category) => Number(category.usageCount) > 0,
    ).length;

    return {
      total,
      active,
      inactive,
      inUse,
    };
  }, [categories]);

  /* ------------------------------------------------------------------------ */
  /*                               OPEN CREATE                                */
  /* ------------------------------------------------------------------------ */

  function openCreateDialog() {
    setEditingCategory(null);
    setForm(EMPTY_FORM);
    setActionError("");
    setDialogOpen(true);
  }

  /* ------------------------------------------------------------------------ */
  /*                                OPEN EDIT                                 */
  /* ------------------------------------------------------------------------ */

  function openEditDialog(category: FeeCategory) {
    setEditingCategory(category);

    setForm({
      name: category.name,
      code: category.code,
      description: category.description ?? "",
      isActive: category.isActive,
    });

    setActionError("");
    setDialogOpen(true);
  }

  /* ------------------------------------------------------------------------ */
  /*                              CLOSE FORM                                  */
  /* ------------------------------------------------------------------------ */

  function closeFormDialog() {
    if (saving) return;

    setDialogOpen(false);
    setEditingCategory(null);
    setForm(EMPTY_FORM);
    setActionError("");
  }

  /* ------------------------------------------------------------------------ */
  /*                             FORM SUBMIT                                  */
  /* ------------------------------------------------------------------------ */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSaving(true);
    setActionError("");

    try {
      const session = await getSession();
      const accessToken = session?.accessToken;

      if (!accessToken) {
        throw new Error(
          "Your session has expired. Please sign in again.",
        );
      }

      const payload = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        description:
          form.description.trim() || undefined,
        isActive: form.isActive,
      };

      if (!payload.name) {
        setActionError(
          "Please enter a category name.",
        );
        return;
      }

      if (!payload.code) {
        setActionError(
          "Please enter a category code.",
        );
        return;
      }

      if (editingCategory) {
        await apiPatch(
          `/fee-categories/${editingCategory._id}`,
          payload,
          accessToken,
        );

        setSuccessMessage(
          "Fee category updated successfully.",
        );
      } else {
        await apiPost(
          "/fee-categories",
          payload,
          accessToken,
        );

        setSuccessMessage(
          "Fee category created successfully.",
        );
      }

      setDialogOpen(false);
      setEditingCategory(null);
      setForm(EMPTY_FORM);

      await loadCategories(true);
    } catch (err) {
      console.error(
        "Save fee category error:",
        err,
      );

      setActionError(
        getErrorMessage(err) ||
          "Unable to save fee category.",
      );
    } finally {
      setSaving(false);
    }
  }

  /* ------------------------------------------------------------------------ */
  /*                           STATUS CHANGE                                  */
  /* ------------------------------------------------------------------------ */

  async function handleStatusChange(
    category: FeeCategory,
  ) {
    setStatusUpdating(category._id);
    setActionError("");

    try {
      const session = await getSession();
      const accessToken = session?.accessToken;

      if (!accessToken) {
        throw new Error(
          "Your session has expired. Please sign in again.",
        );
      }

      await apiPatch(
        `/fee-categories/${category._id}/status`,
        {
          isActive: !category.isActive,
        },
        accessToken,
      );

      setSuccessMessage(
        category.isActive
          ? `${category.name} has been deactivated.`
          : `${category.name} has been activated.`,
      );

      await loadCategories(true);
    } catch (err) {
      console.error(
        "Update fee category status error:",
        err,
      );

      setActionError(
        getErrorMessage(err) ||
          "Unable to update category status.",
      );
    } finally {
      setStatusUpdating(null);
    }
  }

  /* ------------------------------------------------------------------------ */
  /*                            OPEN DELETE                                   */
  /* ------------------------------------------------------------------------ */

  function openDeleteDialog(category: FeeCategory) {
    setDeletingCategory(category);
    setActionError("");
    setDeleteDialogOpen(true);
  }

  /* ------------------------------------------------------------------------ */
  /*                              DELETE                                      */
  /* ------------------------------------------------------------------------ */

  async function handleDelete() {
    if (!deletingCategory) return;

    setDeleting(true);
    setActionError("");

    try {
      const session = await getSession();
      const accessToken = session?.accessToken;

      if (!accessToken) {
        throw new Error(
          "Your session has expired. Please sign in again.",
        );
      }

      await apiDelete(
        `/fee-categories/${deletingCategory._id}`,
        accessToken,
      );

      setSuccessMessage(
        "Fee category deleted successfully.",
      );

      setDeleteDialogOpen(false);
      setDeletingCategory(null);

      await loadCategories(true);
    } catch (err) {
      console.error(
        "Delete fee category error:",
        err,
      );

      setActionError(
        getErrorMessage(err) ||
          "Unable to delete fee category.",
      );
    } finally {
      setDeleting(false);
    }
  }

  /* ------------------------------------------------------------------------ */
  /*                            CLEAR SEARCH                                  */
  /* ------------------------------------------------------------------------ */

  function clearSearch() {
    setSearch("");
  }

  /* ------------------------------------------------------------------------ */
  /*                                  RENDER                                  */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="min-h-screen space-y-6 pb-10">
      {/* ================================================================== */}
      {/* PREMIUM BRAND HEADER                                               */}
      {/* ================================================================== */}

      <section className="relative overflow-hidden rounded-3xl bg-brand-navy text-white shadow-xl">
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />

          <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-brand-blue/10 blur-3xl" />

          <div className="absolute right-10 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full border border-white/5" />

          <div className="absolute right-16 top-1/2 h-20 w-20 -translate-y-1/2 rounded-full border border-brand-gold/10" />

          <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-brand-navy to-brand-navy/90" />
        </div>

        <div className="relative px-5 py-7 sm:px-7 sm:py-8 lg:px-9 lg:py-9">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            {/* Header content */}
            <div className="max-w-3xl">
              <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                <span>Finance Management</span>

                <span className="text-white/30">
                  /
                </span>

                <span className="text-brand-gold">
                  Fee Categories
                </span>
              </div>

              <div className="flex items-start gap-4">
                <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-brand-gold/20 bg-brand-gold/10 text-brand-gold shadow-lg shadow-black/10 sm:flex">
                  <CircleDollarSign className="h-7 w-7" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                    Fee Categories
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
                    Organize and manage the financial categories
                    used across student fee structures, payments,
                    and institutional billing.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 backdrop-blur-sm">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand-gold" />
                  Finance Control
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 backdrop-blur-sm">
                  <Tag className="h-3.5 w-3.5 text-brand-gold" />
                  Category Management
                </div>
              </div>
            </div>

            {/* Header actions */}
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  void loadCategories(true)
                }
                disabled={refreshing || loading}
                className="h-11 rounded-xl border-white/15 bg-white/5 px-4 text-white hover:bg-white/10 hover:text-white"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${
                    refreshing
                      ? "animate-spin"
                      : ""
                  }`}
                />

                Refresh
              </Button>

              <Button
                type="button"
                onClick={openCreateDialog}
                className="h-11 rounded-xl bg-brand-gold px-5 font-semibold text-brand-navy shadow-lg shadow-black/10 hover:bg-brand-gold/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Category
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* SUCCESS MESSAGE                                                    */}
      {/* ================================================================== */}

      {successMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3.5 text-sm text-emerald-700 shadow-sm dark:text-emerald-400">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
            <CheckCircle2 className="h-4 w-4" />
          </div>

          <div className="flex-1 pt-1">
            <p className="font-semibold">
              {successMessage}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setSuccessMessage("")
            }
            className="rounded-lg p-1.5 transition hover:bg-emerald-500/10"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ================================================================== */}
      {/* ACTION ERROR                                                        */}
      {/* ================================================================== */}

      {actionError && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3.5 text-sm text-red-700 shadow-sm dark:text-red-400">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
            <AlertCircle className="h-4 w-4" />
          </div>

          <div className="flex-1 pt-1">
            <p className="font-semibold">
              {actionError}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActionError("")}
            className="rounded-lg p-1.5 transition hover:bg-red-500/10"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ================================================================== */}
      {/* STATISTICS                                                         */}
      {/* ================================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PremiumStatCard
          title="Total Categories"
          value={stats.total}
          description="All registered categories"
          icon={<Tag className="h-5 w-5" />}
        />

        <PremiumStatCard
          title="Active Categories"
          value={stats.active}
          description="Currently available"
          icon={
            <CheckCircle2 className="h-5 w-5" />
          }
          accent="success"
        />

        <PremiumStatCard
          title="Inactive Categories"
          value={stats.inactive}
          description="Currently disabled"
          icon={<XCircle className="h-5 w-5" />}
          accent="muted"
        />

        <PremiumStatCard
          title="Categories In Use"
          value={stats.inUse}
          description="Linked to fee structures"
          icon={<Users className="h-5 w-5" />}
          accent="gold"
        />
      </div>

      {/* ================================================================== */}
      {/* MANAGEMENT CARD                                                    */}
      {/* ================================================================== */}

      <Card className="overflow-hidden rounded-3xl border-border/60 shadow-sm">
        {/* Toolbar */}
        <CardHeader className="border-b border-border/50 bg-gradient-to-b from-muted/40 to-background px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-brand-gold shadow-sm dark:bg-brand-navy">
                <Tag className="h-5 w-5" />
              </div>

              <div>
                <CardTitle className="text-lg">
                  Category Directory
                </CardTitle>

                <CardDescription className="mt-1">
                  Manage names, codes, descriptions, status and
                  usage.
                </CardDescription>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
              {/* Search */}
              <div className="relative min-w-0 sm:w-80">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search by name or code..."
                  className="h-11 rounded-xl border-border/70 bg-background pl-10 pr-10 shadow-sm"
                />

                {search && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Filter */}
              <Select
                value={filter}
                onValueChange={(value) =>
                  setFilter(
                    value as FilterValue,
                  )
                }
              >
                <SelectTrigger className="h-11 w-full rounded-xl border-border/70 bg-background shadow-sm sm:w-40">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">
                    All categories
                  </SelectItem>

                  <SelectItem value="active">
                    Active only
                  </SelectItem>

                  <SelectItem value="inactive">
                    Inactive only
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* ============================================================ */}
          {/* ERROR                                                         */}
          {/* ============================================================ */}

          {error && !loading && (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400">
                <AlertCircle className="h-8 w-8" />
              </div>

              <h3 className="text-lg font-semibold">
                Unable to load categories
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {error}
              </p>

              <Button
                type="button"
                variant="outline"
                className="mt-6 rounded-xl"
                onClick={() =>
                  void loadCategories(true)
                }
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          )}

          {/* ============================================================ */}
          {/* LOADING                                                       */}
          {/* ============================================================ */}

          {loading && !error && (
            <div className="flex min-h-[360px] items-center justify-center">
              <div className="flex flex-col items-center text-center">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-navy/5 dark:bg-brand-navy/20">
                  <div className="absolute inset-0 animate-pulse rounded-2xl bg-brand-gold/5" />

                  <Loader2 className="relative h-7 w-7 animate-spin text-brand-navy dark:text-brand-gold" />
                </div>

                <p className="mt-5 font-semibold">
                  Loading categories
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Preparing your finance directory...
                </p>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* EMPTY                                                         */}
          {/* ============================================================ */}

          {!loading &&
            !error &&
            categories.length === 0 && (
              <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-navy/5 text-brand-navy dark:bg-brand-navy/20 dark:text-brand-gold">
                  <Tag className="h-8 w-8" />
                </div>

                <h3 className="text-lg font-semibold">
                  {search || filter !== "all"
                    ? "No matching categories"
                    : "No fee categories yet"}
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  {search || filter !== "all"
                    ? "Try changing your search term or status filter."
                    : "Create your first fee category to start organizing student financial structures."}
                </p>

                {!search &&
                  filter === "all" && (
                    <Button
                      type="button"
                      className="mt-6 rounded-xl bg-brand-navy text-white hover:bg-brand-navy/90 dark:bg-brand-gold dark:text-brand-navy dark:hover:bg-brand-gold/90"
                      onClick={
                        openCreateDialog
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Category
                    </Button>
                  )}
              </div>
            )}

          {/* ============================================================ */}
          {/* DATA TABLE                                                    */}
          {/* ============================================================ */}

          {!loading &&
            !error &&
            categories.length > 0 && (
              <>
                {/* Desktop */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50 bg-muted/20 text-left">
                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                          Category
                        </th>

                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                          Code
                        </th>

                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                          Description
                        </th>

                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                          Usage
                        </th>

                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                          Status
                        </th>

                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                          Created
                        </th>

                        <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {categories.map(
                        (category) => (
                          <tr
                            key={category._id}
                            className="group border-b border-border/40 transition-colors hover:bg-muted/20"
                          >
                            {/* Category */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-sm font-bold text-brand-gold shadow-sm">
                                  {getInitials(
                                    category.name,
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate font-semibold">
                                    {category.name}
                                  </p>

                                  <p className="mt-0.5 text-xs text-muted-foreground">
                                    Fee category
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Code */}
                            <td className="px-6 py-4">
                              <span className="inline-flex rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1.5 font-mono text-xs font-semibold tracking-wide">
                                {category.code}
                              </span>
                            </td>

                            {/* Description */}
                            <td className="max-w-xs px-6 py-4">
                              <p
                                className="truncate text-sm text-muted-foreground"
                                title={
                                  category.description ||
                                  undefined
                                }
                              >
                                {category.description ||
                                  "No description"}
                              </p>
                            </td>

                            {/* Usage */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-navy/5 text-brand-navy dark:bg-brand-navy/20 dark:text-brand-gold">
                                  <Users className="h-3.5 w-3.5" />
                                </div>

                                <div>
                                  <p className="text-sm font-semibold">
                                    {Number(
                                      category.usageCount,
                                    ) || 0}
                                  </p>

                                  <p className="text-[11px] text-muted-foreground">
                                    structure
                                    {Number(
                                      category.usageCount,
                                    ) === 1
                                      ? ""
                                      : "s"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-6 py-4">
                              {category.isActive ? (
                                <Badge className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400">
                                  <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                  Active
                                </Badge>
                              ) : (
                                <Badge
                                  variant="secondary"
                                  className="rounded-full px-3 py-1"
                                >
                                  <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                                  Inactive
                                </Badge>
                              )}
                            </td>

                            {/* Created */}
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {formatDate(
                                category.createdAt,
                              )}
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-4 text-right">
                              <CategoryActions
                                category={category}
                                statusUpdating={
                                  statusUpdating
                                }
                                onEdit={
                                  openEditDialog
                                }
                                onStatusChange={
                                  handleStatusChange
                                }
                                onDelete={
                                  openDeleteDialog
                                }
                              />
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile */}
                <div className="divide-y divide-border/40 md:hidden">
                  {categories.map(
                    (category) => (
                      <div
                        key={category._id}
                        className="p-4 transition-colors hover:bg-muted/20"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-sm font-bold text-brand-gold shadow-sm">
                            {getInitials(
                              category.name,
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h3 className="truncate font-semibold">
                                  {category.name}
                                </h3>

                                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                  <span className="rounded-md bg-muted px-2 py-1 font-mono text-[10px] font-semibold">
                                    {
                                      category.code
                                    }
                                  </span>

                                  {category.isActive ? (
                                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                                      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                      Active
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">
                                      Inactive
                                    </span>
                                  )}
                                </div>
                              </div>

                              <CategoryActions
                                category={
                                  category
                                }
                                statusUpdating={
                                  statusUpdating
                                }
                                onEdit={
                                  openEditDialog
                                }
                                onStatusChange={
                                  handleStatusChange
                                }
                                onDelete={
                                  openDeleteDialog
                                }
                              />
                            </div>

                            <p className="mt-3 line-clamp-2 text-sm leading-5 text-muted-foreground">
                              {category.description ||
                                "No description provided."}
                            </p>

                            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5" />

                                <span>
                                  <span className="font-semibold text-foreground">
                                    {Number(
                                      category.usageCount,
                                    ) || 0}
                                  </span>{" "}
                                  structure
                                  {Number(
                                    category.usageCount,
                                  ) === 1
                                    ? ""
                                    : "s"}
                                </span>
                              </span>

                              <span>
                                Created{" "}
                                <span className="font-medium text-foreground">
                                  {formatDate(
                                    category.createdAt,
                                  )}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>

                {/* Footer */}
                <div className="flex flex-col gap-2 border-t border-border/50 bg-muted/10 px-5 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <span>
                    Showing{" "}
                    <span className="font-semibold text-foreground">
                      {categories.length}
                    </span>{" "}
                    categor
                    {categories.length === 1
                      ? "y"
                      : "ies"}
                  </span>

                  {refreshing && (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Updating directory...
                    </span>
                  )}
                </div>
              </>
            )}
        </CardContent>
      </Card>

      {/* ================================================================== */}
      {/* CREATE / EDIT DIALOG                                               */}
      {/* ================================================================== */}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeFormDialog();
          }
        }}
      >
        <DialogContent className="overflow-hidden rounded-3xl border-border/60 p-0 shadow-2xl sm:max-w-lg">
          {/* Dialog Header */}
          <div className="relative overflow-hidden bg-brand-navy px-6 py-6 text-white">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-gold/10 blur-2xl" />

            <div className="relative">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gold/10 text-brand-gold">
                {editingCategory ? (
                  <Edit3 className="h-5 w-5" />
                ) : (
                  <Tag className="h-5 w-5" />
                )}
              </div>

              <DialogTitle className="text-xl text-white">
                {editingCategory
                  ? "Edit Fee Category"
                  : "Create Fee Category"}
              </DialogTitle>

              <DialogDescription className="mt-1.5 text-white/60">
                {editingCategory
                  ? "Update the details and availability of this fee category."
                  : "Create a category for organizing student fee structures."}
              </DialogDescription>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 px-6 py-6"
          >
            {actionError && (
              <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-400">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                <span>{actionError}</span>
              </div>
            )}

            {/* Name */}
            <div className="space-y-2">
              <label
                htmlFor="category-name"
                className="text-sm font-semibold"
              >
                Category Name
              </label>

              <Input
                id="category-name"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="e.g. Tuition Fee"
                disabled={saving}
                maxLength={100}
                className="h-11 rounded-xl"
              />
            </div>

            {/* Code */}
            <div className="space-y-2">
              <label
                htmlFor="category-code"
                className="text-sm font-semibold"
              >
                Category Code
              </label>

              <Input
                id="category-code"
                value={form.code}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    code: event.target.value
                      .toUpperCase()
                      .replace(/\s+/g, "_"),
                  }))
                }
                placeholder="e.g. TUITION"
                disabled={saving}
                maxLength={30}
                className="h-11 rounded-xl font-mono uppercase"
              />

              <p className="text-xs leading-5 text-muted-foreground">
                Use a short unique code such as TUITION,
                ACCEPTANCE or HOSTEL.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="category-description"
                  className="text-sm font-semibold"
                >
                  Description
                  <span className="ml-1 font-normal text-muted-foreground">
                    optional
                  </span>
                </label>

                <span className="text-[11px] text-muted-foreground">
                  {form.description.length}/500
                </span>
              </div>

              <textarea
                id="category-description"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description:
                      event.target.value,
                  }))
                }
                placeholder="Briefly describe what this fee category is used for..."
                disabled={saving}
                maxLength={500}
                rows={4}
                className="flex min-h-24 w-full resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-sm shadow-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Status */}
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-muted/20 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-navy/5 text-brand-navy dark:bg-brand-navy/20 dark:text-brand-gold">
                  <Power className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Active category
                  </p>

                  <p className="mt-0.5 max-w-xs text-xs leading-5 text-muted-foreground">
                    Active categories can be assigned to new
                    fee structures.
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={form.isActive}
                disabled={saving}
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    isActive:
                      !current.isActive,
                  }))
                }
                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                  form.isActive
                    ? "bg-brand-navy dark:bg-brand-gold"
                    : "bg-muted"
                }`}
              >
                <span
                  className={`pointer-events-none block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow-sm transition-transform ${
                    form.isActive
                      ? "translate-x-5"
                      : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Footer */}
            <DialogFooter className="gap-2 border-t border-border/50 pt-5 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={closeFormDialog}
                disabled={saving}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="rounded-xl bg-brand-navy text-white hover:bg-brand-navy/90 dark:bg-brand-gold dark:text-brand-navy dark:hover:bg-brand-gold/90"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingCategory
                      ? "Saving..."
                      : "Creating..."}
                  </>
                ) : (
                  <>
                    {editingCategory ? (
                      <Check className="mr-2 h-4 w-4" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}

                    {editingCategory
                      ? "Save Changes"
                      : "Create Category"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================================================================== */}
      {/* DELETE DIALOG                                                      */}
      {/* ================================================================== */}

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!deleting) {
            setDeleteDialogOpen(open);

            if (!open) {
              setDeletingCategory(null);
              setActionError("");
            }
          }
        }}
      >
        <DialogContent className="overflow-hidden rounded-3xl border-border/60 p-0 shadow-2xl sm:max-w-md">
          <div className="px-6 py-6">
            <DialogHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400">
                <Trash2 className="h-6 w-6" />
              </div>

              <DialogTitle className="text-xl">
                Delete Fee Category
              </DialogTitle>

              <DialogDescription className="mt-2 leading-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-foreground">
                  {deletingCategory?.name}
                </span>
                ? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            {/* In use warning */}
            {deletingCategory &&
              Number(
                deletingCategory.usageCount,
              ) > 0 && (
                <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-400">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                    <div>
                      <p className="font-semibold">
                        Category is currently in use
                      </p>

                      <p className="mt-1 leading-5">
                        This category is linked to{" "}
                        {
                          deletingCategory.usageCount
                        }{" "}
                        fee structure
                        {deletingCategory.usageCount ===
                        1
                          ? ""
                          : "s"}
                        . Remove those references before
                        deleting this category.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {actionError && (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-400">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                <span>{actionError}</span>
              </div>
            )}

            <DialogFooter className="mt-6 gap-2 border-t border-border/50 pt-5 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setDeletingCategory(null);
                  setActionError("");
                }}
                disabled={deleting}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="destructive"
                className="rounded-xl"
                onClick={() =>
                  void handleDelete()
                }
                disabled={
                  deleting ||
                  !deletingCategory ||
                  Number(
                    deletingCategory?.usageCount ??
                      0,
                  ) > 0
                }
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Category
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              PREMIUM STAT CARD                             */
/* -------------------------------------------------------------------------- */

function PremiumStatCard({
  title,
  value,
  description,
  icon,
  accent = "navy",
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  accent?: "navy" | "success" | "muted" | "gold";
}) {
  const accentClasses = {
    navy: "bg-brand-navy/5 text-brand-navy dark:bg-brand-navy/20 dark:text-brand-gold",
    success:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    muted:
      "bg-muted text-muted-foreground",
    gold:
      "bg-brand-gold/10 text-brand-navy dark:text-brand-gold",
  };

  return (
    <Card className="group relative overflow-hidden rounded-2xl border-border/60 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-brand-navy via-brand-gold to-brand-navy opacity-0 transition-opacity group-hover:opacity-100" />

      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {title}
            </p>

            <p className="mt-2 text-3xl font-bold tracking-tight">
              {value}
            </p>

            <p className="mt-1.5 text-xs text-muted-foreground">
              {description}
            </p>
          </div>

          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accentClasses[accent]}`}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*                            CATEGORY ACTIONS                                */
/* -------------------------------------------------------------------------- */

function CategoryActions({
  category,
  statusUpdating,
  onEdit,
  onStatusChange,
  onDelete,
}: {
  category: FeeCategory;
  statusUpdating: string | null;
  onEdit: (category: FeeCategory) => void;
  onStatusChange: (category: FeeCategory) => void;
  onDelete: (category: FeeCategory) => void;
}) {
  const updating =
    statusUpdating === category._id;

  return (
    <DropdownMenu>
      {/* 
        Your current DropdownMenuTrigger does not support
        Radix's `asChild`, so intentionally do not use it.
      */}
      <DropdownMenuTrigger>
        <MoreHorizontal className="h-4 w-4" />

        <span className="sr-only">
          Open actions
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-52 rounded-xl border-border/60 p-1.5 shadow-xl"
      >
        <DropdownMenuItem
          onClick={() => onEdit(category)}
          className="cursor-pointer gap-2 rounded-lg px-3 py-2.5"
        >
          <Edit3 className="h-4 w-4" />

          <div className="flex flex-col">
            <span className="font-medium">
              Edit category
            </span>

            <span className="text-[10px] text-muted-foreground">
              Update category details
            </span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          disabled={updating}
          onClick={() =>
            onStatusChange(category)
          }
          className="cursor-pointer gap-2 rounded-lg px-3 py-2.5"
        >
          {updating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Power className="h-4 w-4" />
          )}

          <div className="flex flex-col">
            <span className="font-medium">
              {category.isActive
                ? "Deactivate"
                : "Activate"}
            </span>

            <span className="text-[10px] text-muted-foreground">
              {category.isActive
                ? "Disable this category"
                : "Make this category available"}
            </span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => onDelete(category)}
          disabled={
            Number(category.usageCount) > 0
          }
          className="cursor-pointer gap-2 rounded-lg px-3 py-2.5 text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
        >
          <Trash2 className="h-4 w-4" />

          <div className="flex flex-col">
            <span className="font-medium">
              Delete category
            </span>

            <span className="text-[10px] text-red-600/60 dark:text-red-400/60">
              {Number(category.usageCount) > 0
                ? "Category is currently in use"
                : "Permanently remove category"}
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}