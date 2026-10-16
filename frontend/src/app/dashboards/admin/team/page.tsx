
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  BadgeCheck,
  Check,
  ChevronDown,
  CircleAlert,
  Download,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  Filter,
  ImagePlus,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";

type TeamGroup = "management" | "staff";
type StatusFilter = "all" | "published" | "draft";

interface TeamMember {
  _id: string;
  name: string;
  badge: string;
  title: string;
  group: TeamGroup;
  imageUrl?: string;
  imagePublicId?: string;
  bio?: string;
  department?: string;
  email?: string;
  phone?: string;
  cvUrl?: string;
  cvFileName?: string;
  order: number;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface TeamForm {
  name: string;
  badge: string;
  title: string;
  group: TeamGroup;
  order: string;
  isPublished: boolean;
  bio: string;
  department: string;
  email: string;
  phone: string;
}


interface ApiResponse {
  success?: boolean;
  data?: TeamMember[];
  members?: TeamMember[];
  member?: TeamMember;
  message?: string;
  error?: string;
}


const API_ROOT = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const API_BASE_URL = API_ROOT.endsWith("/api")
  ? API_ROOT
  : `${API_ROOT}/api`;

const TEAM_API_URL = `${API_BASE_URL}/team`;
const MAX_IMAGE_SIZE = 4 * 1024 * 1024;
const MAX_CV_SIZE = 5 * 1024 * 1024;

const EMPTY_FORM: TeamForm = {
  name: "",
  badge: "",
  title: "",
  group: "management",
  order: "0",
  isPublished: false,
  bio: "",
  department: "",
  email: "",
  phone: "",
};

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#C8A951] focus:ring-4 focus:ring-[#C8A951]/10";

function errorMessage(data: unknown, fallback: string) {
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (typeof record.message === "string" && record.message.trim()) {
      return record.message;
    }
    if (typeof record.error === "string" && record.error.trim()) {
      return record.error;
    }
  }
  return fallback;
}

async function readResponse(response: Response): Promise<ApiResponse> {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    const body = await response.text().catch(() => "");
    if (!response.ok) {
      throw new Error(
        `Request failed (${response.status}). Check the backend URL and team API route.`,
      );
    }
    throw new Error(
      body.includes("<!DOCTYPE")
        ? "The API returned an HTML page instead of JSON. Check the backend route."
        : "The server returned an unexpected response.",
    );
  }

  const data = (await response.json()) as ApiResponse;

  if (!response.ok || data.success === false) {
    throw new Error(
      errorMessage(data, `Request failed (${response.status}).`),
    );
  }

  return data;
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

function formatDate(value?: string) {
  if (!value) return "Recently added";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently added";
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function isValidImage(file: File) {
  return ["image/jpeg", "image/png", "image/webp"].includes(file.type);
}

function isValidCv(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return ["pdf", "doc", "docx"].includes(extension || "");
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  note,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-500 sm:text-sm">
            {label}
          </p>
          <p className="mt-3 text-2xl font-bold tracking-tight text-[#1B2847] sm:text-3xl">
            {value}
          </p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B2847]/[0.06] text-[#1B2847]">
          {icon}
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-400">{note}</p>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
        >
          <div className="h-48 animate-pulse bg-slate-100" />
          <div className="space-y-3 p-5">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
            <div className="h-5 w-3/4 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminTeamPage() {
  const { data: session, status: sessionStatus } = useSession();
  const accessToken = (
    session as { accessToken?: string } | null
  )?.accessToken;

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState<"all" | TeamGroup>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [form, setForm] = useState<TeamForm>(EMPTY_FORM);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedCv, setSelectedCv] = useState<File | null>(null);
  const [removeExistingCv, setRemoveExistingCv] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [busyMemberId, setBusyMemberId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<TeamMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const requestHeaders = useCallback((): HeadersInit => ({
    Accept: "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  }), [accessToken]);

  
const loadMembers = useCallback(
  async (showToast = false) => {
    if (!accessToken) {
      setMembers([]);
      setIsLoading(false);
      setLoadError("Please sign in again to manage team members.");
      return;
    }

    setIsLoading(true);
    setLoadError("");

    try {
      const response = await fetch(`${TEAM_API_URL}/admin`, {
        method: "GET",
        headers: requestHeaders(),
        cache: "no-store",
      });

      const result = await readResponse(response);

      // Support both common API response formats:
      // { success: true, data: [...] }
      // { success: true, members: [...] }
      const teamMembers = Array.isArray(result.data)
        ? result.data
        : result.members;

      if (!Array.isArray(teamMembers)) {
        throw new Error(
          "The server returned an invalid team response. Expected a data or members array.",
        );
      }

      const validMembers = teamMembers.filter(
        (member): member is TeamMember =>
          Boolean(
            member &&
              typeof member._id === "string" &&
              typeof member.name === "string" &&
              (member.group === "management" ||
                member.group === "staff"),
          ),
      );

      setMembers(validMembers);

      if (showToast) {
        toast.success(
          `Loaded ${validMembers.length} team ${
            validMembers.length === 1 ? "member" : "members"
          }.`,
        );
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load team members. Please try again.";

      setLoadError(message);

      if (showToast) {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  },
  [accessToken, requestHeaders],
);


  useEffect(() => {
    if (sessionStatus === "authenticated" && accessToken) {
      void loadMembers();
    } else if (sessionStatus === "unauthenticated") {
      setIsLoading(false);
      setLoadError("Your session has expired. Please sign in again.");
    }
  }, [sessionStatus, accessToken, loadMembers, retryCount]);

  useEffect(() => {
    if (!selectedImage) {
      setPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(selectedImage);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedImage]);

  const publishedCount = members.filter((member) => member.isPublished).length;
  const draftCount = members.length - publishedCount;
  const managementCount = members.filter(
    (member) => member.group === "management",
  ).length;
  const staffCount = members.filter((member) => member.group === "staff").length;

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...members]
      .filter((member) => {
        const searchable = [
          member.name,
          member.title,
          member.badge,
          member.department,
          member.email,
        ];
        const matchesSearch =
          !query || searchable.some((value) => value?.toLowerCase().includes(query));
        const matchesGroup =
          groupFilter === "all" || member.group === groupFilter;
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "published" && member.isPublished) ||
          (statusFilter === "draft" && !member.isPublished);

        return matchesSearch && matchesGroup && matchesStatus;
      })
      .sort(
        (a, b) =>
          a.group.localeCompare(b.group) ||
          (a.order ?? 0) - (b.order ?? 0) ||
          a.name.localeCompare(b.name),
      );
  }, [members, search, groupFilter, statusFilter]);

  function updateForm<K extends keyof TeamForm>(field: K, value: TeamForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function openCreateEditor() {
    setEditingMember(null);
    setForm({ ...EMPTY_FORM });
    setSelectedImage(null);
    setSelectedCv(null);
    setRemoveExistingCv(false);
    setEditorOpen(true);
  }

  function openEditEditor(member: TeamMember) {
    setEditingMember(member);
    setForm({
      name: member.name || "",
      badge: member.badge || "",
      title: member.title || "",
      group: member.group,
      order: String(member.order ?? 0),
      isPublished: member.isPublished,
      bio: member.bio || "",
      department: member.department || "",
      email: member.email || "",
      phone: member.phone || "",
    });
    setSelectedImage(null);
    setSelectedCv(null);
    setRemoveExistingCv(false);
    setEditorOpen(true);
  }

  function closeEditor() {
    if (isSaving) return;
    setEditorOpen(false);
    setEditingMember(null);
    setForm({ ...EMPTY_FORM });
    setSelectedImage(null);
    setSelectedCv(null);
    setRemoveExistingCv(false);
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!isValidImage(file)) {
      toast.error("Choose a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("The portrait must be 4 MB or smaller.");
      return;
    }
    setSelectedImage(file);
  }

  function handleCvChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!isValidCv(file)) {
      toast.error("Choose a PDF, DOC or DOCX CV.");
      return;
    }
    if (file.size > MAX_CV_SIZE) {
      toast.error("The CV must be 5 MB or smaller.");
      return;
    }

    setSelectedCv(file);
    setRemoveExistingCv(false);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!accessToken) {
      toast.error("Your session has expired. Please sign in again.");
      return;
    }

    if (!form.name.trim() || !form.badge.trim() || !form.title.trim()) {
      toast.error("Complete the name, badge and professional title fields.");
      return;
    }

    if (!editingMember && !selectedImage) {
      toast.error("Upload a portrait for this team member.");
      return;
    }

    const order = Number(form.order);
    if (!Number.isInteger(order) || order < 0 || !Number.isFinite(order)) {
      toast.error("Display order must be a whole number of zero or greater.");
      return;
    }

    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      toast.error("Enter a valid email address.");
      return;
    }

    const payload = new FormData();
    payload.append("name", form.name.trim());
    payload.append("badge", form.badge.trim());
    payload.append("title", form.title.trim());
    payload.append("group", form.group);
    payload.append("order", String(order));
    payload.append("isPublished", String(form.isPublished));
    payload.append("bio", form.bio.trim());
    payload.append("department", form.department.trim());
    payload.append("email", form.email.trim());
    payload.append("phone", form.phone.trim());

    if (selectedImage) payload.append("image", selectedImage);
    if (selectedCv) payload.append("cv", selectedCv);
    if (removeExistingCv) payload.append("removeCv", "true");

    setIsSaving(true);

    try {
      const url = editingMember
        ? `${TEAM_API_URL}/${editingMember._id}`
        : TEAM_API_URL;

      const response = await fetch(url, {
        method: editingMember ? "PATCH" : "POST",
        headers: requestHeaders(),
        body: payload,
      });

      await readResponse(response);
      toast.success(
        editingMember
          ? "Team member updated successfully."
          : "Team member created successfully.",
      );

      setEditorOpen(false);
      setEditingMember(null);
      setForm({ ...EMPTY_FORM });
      setSelectedImage(null);
      setSelectedCv(null);
      setRemoveExistingCv(false);
      await loadMembers();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save this profile.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function updateMember(member: TeamMember, fields: Record<string, string>) {
    if (!accessToken) {
      toast.error("Your session has expired. Please sign in again.");
      return;
    }

    const payload = new FormData();
    Object.entries(fields).forEach(([key, value]) => payload.append(key, value));

    const response = await fetch(`${TEAM_API_URL}/${member._id}`, {
      method: "PATCH",
      headers: requestHeaders(),
      body: payload,
    });

    await readResponse(response);
  }

  async function togglePublished(member: TeamMember) {
    setBusyMemberId(member._id);
    try {
      await updateMember(member, {
        isPublished: String(!member.isPublished),
      });
      setMembers((current) =>
        current.map((item) =>
          item._id === member._id
            ? { ...item, isPublished: !member.isPublished }
            : item,
        ),
      );
      toast.success(
        member.isPublished ? "Profile moved to drafts." : "Profile published.",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update status.");
    } finally {
      setBusyMemberId(null);
    }
  }

  async function moveMember(member: TeamMember, direction: -1 | 1) {
    const groupMembers = members
      .filter((item) => item.group === member.group)
      .sort(
        (a, b) =>
          (a.order ?? 0) - (b.order ?? 0) ||
          a.name.localeCompare(b.name),
      );

    const index = groupMembers.findIndex((item) => item._id === member._id);
    const target = groupMembers[index + direction];
    if (!target) return;

    setBusyMemberId(member._id);

    try {
      const firstOrder = member.order ?? 0;
      const secondOrder = target.order ?? 0;
      const temporaryOrder =
        Math.max(0, ...members.map((item) => item.order ?? 0)) + 1;

      await updateMember(member, { order: String(temporaryOrder) });
      await updateMember(target, { order: String(firstOrder) });
      await updateMember(member, { order: String(secondOrder) });

      await loadMembers();
      toast.success("Display order updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to reorder members.");
      await loadMembers();
    } finally {
      setBusyMemberId(null);
    }
  }

  async function handleDelete() {
    if (!pendingDelete || !accessToken) {
      toast.error("Your session has expired. Please sign in again.");
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`${TEAM_API_URL}/${pendingDelete._id}`, {
        method: "DELETE",
        headers: requestHeaders(),
      });
      await readResponse(response);

      setMembers((current) =>
        current.filter((item) => item._id !== pendingDelete._id),
      );
      setPendingDelete(null);
      toast.success("Team member deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete member.");
    } finally {
      setIsDeleting(false);
    }
  }

  if (sessionStatus === "loading") {
    return (
      <main className="min-h-screen bg-[#F6F7FB] p-5 sm:p-8">
        <div className="mx-auto max-w-[1500px] space-y-6">
          <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-24 animate-pulse rounded-2xl bg-slate-200" />
          <SkeletonGrid />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F7FB] text-slate-900">
      <div className="mx-auto max-w-[1600px] space-y-7 px-4 py-6 sm:px-6 sm:py-8 lg:px-9">
        <section className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1B2847] text-[#D8BD6A]">
              <Users size={23} />
            </div>
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.19em] text-[#9B7C2D]">
                Website content · Administration
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-[#1B2847] sm:text-3xl">
                Team Management
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                Manage team profiles, biographies, contact information, CVs and public visibility.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreateEditor}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#1B2847] px-5 text-sm font-semibold text-white transition hover:bg-[#26385F] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1B2847]/15"
          >
            <Plus size={18} /> Add team member
          </button>
        </section>

        <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <StatCard icon={<Users size={19} />} label="Total members" value={members.length} note="All team profiles" />
          <StatCard icon={<Eye size={19} />} label="Published" value={publishedCount} note="Visible to visitors" />
          <StatCard icon={<EyeOff size={19} />} label="Drafts" value={draftCount} note="Hidden from visitors" />
          <StatCard icon={<ShieldCheck size={19} />} label="Management" value={managementCount} note={`${staffCount} staff ${staffCount === 1 ? "member" : "members"}`} />
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
          <div className="border-b border-slate-100 p-4 sm:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="font-bold text-[#1B2847]">Team directory</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {filteredMembers.length} {filteredMembers.length === 1 ? "profile" : "profiles"} shown
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:flex">
                <div className="relative sm:col-span-2 xl:w-64">
                  <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search names, roles, departments..."
                    aria-label="Search team members"
                    className={`${inputClass} pl-10`}
                  />
                </div>

                <div className="relative">
                  <Filter size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={groupFilter}
                    onChange={(event) => setGroupFilter(event.target.value as "all" | TeamGroup)}
                    aria-label="Filter by category"
                    className={`${inputClass} appearance-none pl-9 pr-9`}
                  >
                    <option value="all">All categories</option>
                    <option value="management">Management</option>
                    <option value="staff">Staff</option>
                  </select>
                  <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>

                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                    aria-label="Filter by publication status"
                    className={`${inputClass} appearance-none px-3 pr-9`}
                  >
                    <option value="all">All statuses</option>
                    <option value="published">Published</option>
                    <option value="draft">Drafts</option>
                  </select>
                  <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {isLoading ? (
              <SkeletonGrid />
            ) : loadError ? (
              <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50/40 px-5 py-14 text-center">
                <CircleAlert className="mx-auto text-rose-600" size={25} />
                <h3 className="mt-4 font-semibold text-[#1B2847]">Could not load team members</h3>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">{loadError}</p>
                <button
                  type="button"
                  onClick={() => setRetryCount((count) => count + 1)}
                  className="mt-5 rounded-xl bg-[#1B2847] px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Try again
                </button>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-14 text-center">
                <Users className="mx-auto text-[#1B2847]" size={28} />
                <h3 className="mt-4 font-semibold text-[#1B2847]">
                  {members.length ? "No matching team members" : "Build your team directory"}
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {members.length
                    ? "Try another search term or clear your filters."
                    : "Add your first member to begin building your public team page."}
                </p>
                {members.length === 0 ? (
                  <button type="button" onClick={openCreateEditor} className="mt-5 rounded-xl bg-[#1B2847] px-4 py-2.5 text-sm font-semibold text-white">
                    <Plus className="mr-1 inline" size={15} /> Add first member
                  </button>
                ) : (
                  <button type="button" onClick={() => { setSearch(""); setGroupFilter("all"); setStatusFilter("all"); }} className="mt-5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold">
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
                {filteredMembers.map((member) => {
                  const sameGroup = filteredMembers.filter((item) => item.group === member.group);
                  const position = sameGroup.findIndex((item) => item._id === member._id);

                  return (
                    <article key={member._id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-[0_12px_32px_rgba(15,23,42,0.07)]">
                      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-[#E9EDF4] to-[#E7E0CD]">
                        {member.imageUrl ? (
                          <img src={member.imageUrl} alt={member.name} loading="lazy" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-4xl font-bold text-[#1B2847]">{initials(member.name)}</div>
                        )}
                        <span className={`absolute left-3 top-3 rounded-full border px-3 py-1.5 text-[11px] font-bold ${member.isPublished ? "border-emerald-200 bg-white text-emerald-700" : "border-amber-200 bg-white text-amber-700"}`}>
                          {member.isPublished ? "Published" : "Draft"}
                        </span>
                        <span className="absolute right-3 top-3 rounded-full bg-[#1B2847]/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white">
                          {member.group}
                        </span>
                        <span className="absolute bottom-3 left-3 rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-slate-600">
                          Display order: {member.order ?? 0}
                        </span>
                      </div>

                      <div className="p-5">
                        <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-[#C8A951]/10 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#87691F]">
                          <BadgeCheck size={13} /> <span className="truncate">{member.badge}</span>
                        </span>
                        <h3 className="mt-3 break-words text-lg font-bold text-[#1B2847]">{member.name}</h3>
                        <p className="mt-1 break-words text-sm text-slate-500">{member.title}</p>

                        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                          {member.department && <span className="inline-flex items-center gap-1"><MapPin size={13} />{member.department}</span>}
                          {member.email && <span className="inline-flex items-center gap-1"><Mail size={13} />{member.email}</span>}
                          {member.cvUrl && <span className="inline-flex items-center gap-1 text-emerald-700"><FileText size={13} />CV attached</span>}
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
                          <span>Added {formatDate(member.createdAt)}</span>
                          {member.cvUrl && (
                            <a href={member.cvUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-[#1B2847] hover:text-[#9B7C2D]">
                              <Download size={13} /> View CV
                            </a>
                          )}
                        </div>

                        <div className="mt-4 grid grid-cols-[1fr_1fr_auto] gap-2">
                          <button type="button" onClick={() => openEditEditor(member)} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:border-[#C8A951] hover:bg-amber-50/40">
                            <Edit3 size={14} /> Edit
                          </button>
                          <button
                            type="button"
                            disabled={busyMemberId === member._id}
                            onClick={() => void togglePublished(member)}
                            className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-semibold disabled:opacity-60 ${member.isPublished ? "border border-slate-200 text-slate-600 hover:bg-slate-50" : "bg-[#1B2847] text-white hover:bg-[#26385F]"}`}
                          >
                            {busyMemberId === member._id ? <LoaderCircle size={14} className="animate-spin" /> : member.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                            {member.isPublished ? "Unpublish" : "Publish"}
                          </button>
                          <button type="button" onClick={() => setPendingDelete(member)} aria-label={`Delete ${member.name}`} className="flex min-h-10 w-10 items-center justify-center rounded-xl border border-rose-100 text-rose-600 hover:bg-rose-50">
                            <Trash2 size={15} />
                          </button>
                        </div>

                        <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                          <span className="text-[11px] font-medium text-slate-500">Reorder in category</span>
                          <div className="flex gap-1">
                            <button type="button" aria-label={`Move ${member.name} up`} disabled={position === 0 || busyMemberId === member._id} onClick={() => void moveMember(member, -1)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white disabled:opacity-30"><ArrowUp size={13} /></button>
                            <button type="button" aria-label={`Move ${member.name} down`} disabled={position === sameGroup.length - 1 || busyMemberId === member._id} onClick={() => void moveMember(member, 1)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white disabled:opacity-30"><ArrowDown size={13} /></button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <p className="px-1 text-xs leading-5 text-slate-400">
          Only published profiles appear on the public team page. Profile fields and uploaded CVs must be supported by the backend to be saved and displayed.
        </p>
      </div>

      {editorOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-[#101827]/60 p-0 backdrop-blur-sm sm:items-center sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeEditor();
          }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="team-editor-title" className="flex max-h-[95dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-7">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1B2847] text-[#D8BD6A]">
                  {editingMember ? <Edit3 size={20} /> : <Plus size={21} />}
                </div>
                <div>
                  <h2 id="team-editor-title" className="text-lg font-bold text-[#1B2847] sm:text-xl">
                    {editingMember ? "Edit team member" : "Add team member"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">Manage the public profile details below.</p>
                </div>
              </div>
              <button type="button" onClick={closeEditor} disabled={isSaving} aria-label="Close editor" className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 disabled:opacity-50">
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
                <div className="grid gap-6 md:grid-cols-[200px_1fr]">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Profile portrait</label>
                    <label className="group relative flex aspect-[4/5] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50 hover:border-[#C8A951]">
                      {previewUrl || editingMember?.imageUrl ? (
                        <img src={previewUrl || editingMember?.imageUrl || ""} alt="Portrait preview" className="absolute inset-0 h-full w-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center px-4 text-center">
                          <ImagePlus size={26} className="mb-3 text-[#1B2847]" />
                          <span className="text-sm font-semibold">Upload portrait</span>
                          <span className="mt-1 text-xs text-slate-400">JPG, PNG or WebP · Max 4 MB</span>
                        </div>
                      )}
                      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="sr-only" />
                      <span className="absolute inset-x-2 bottom-2 rounded-xl bg-[#1B2847]/95 px-3 py-2.5 text-center text-xs font-semibold text-white">
                        {previewUrl || editingMember?.imageUrl ? "Change portrait" : "Choose image"}
                      </span>
                    </label>
                    {selectedImage && <p className="mt-2 break-all text-xs text-slate-500">{selectedImage.name}</p>}
                    {!editingMember && <p className="mt-2 text-xs leading-5 text-slate-400">A portrait is required for new profiles.</p>}
                  </div>

                  <div className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Full name" required>
                        <input required maxLength={120} value={form.name} onChange={(event) => updateForm("name", event.target.value)} placeholder="e.g. Dr. Adeola Williams" className={inputClass} />
                      </Field>
                      <Field label="Professional title" required>
                        <input required maxLength={120} value={form.title} onChange={(event) => updateForm("title", event.target.value)} placeholder="e.g. Director of Academic Affairs" className={inputClass} />
                      </Field>
                    </div>

                    <Field label="Badge / designation" required>
                      <input required maxLength={80} value={form.badge} onChange={(event) => updateForm("badge", event.target.value)} placeholder="e.g. Academic Leadership" className={inputClass} />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Team category" required>
                        <select value={form.group} onChange={(event) => updateForm("group", event.target.value as TeamGroup)} className={inputClass}>
                          <option value="management">Management</option>
                          <option value="staff">Staff</option>
                        </select>
                      </Field>
                      <Field label="Display order" required>
                        <input type="number" min="0" step="1" required value={form.order} onChange={(event) => updateForm("order", event.target.value)} className={inputClass} />
                      </Field>
                    </div>

                    <Field label="Biography / profile description">
                      <textarea
                        rows={5}
                        maxLength={5000}
                        value={form.bio}
                        onChange={(event) => updateForm("bio", event.target.value)}
                        placeholder="Write the biography exactly as you want it displayed on the public profile..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#C8A951] focus:ring-4 focus:ring-[#C8A951]/10"
                      />
                      <p className="mt-1.5 text-xs text-slate-400">Only the description you enter here will appear on the profile.</p>
                    </Field>

                    <Field label="Department">
                      <input maxLength={160} value={form.department} onChange={(event) => updateForm("department", event.target.value)} placeholder="e.g. Academic Affairs" className={inputClass} />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Public email">
                        <input type="email" maxLength={160} value={form.email} onChange={(event) => updateForm("email", event.target.value)} placeholder="name@example.com" className={inputClass} />
                      </Field>
                      <Field label="Public phone">
                        <input type="tel" maxLength={40} value={form.phone} onChange={(event) => updateForm("phone", event.target.value)} placeholder="+234..." className={inputClass} />
                      </Field>
                    </div>

                    <Field label="CV / résumé">
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-4 sm:p-5">
                        {editingMember?.cvUrl && !removeExistingCv && !selectedCv && (
                          <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-center gap-3">
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1B2847]/[0.06] text-[#1B2847]"><FileText size={19} /></span>
                              <div className="min-w-0">
                                <p className="break-all text-sm font-semibold text-[#1B2847]">{editingMember.cvFileName || "Current CV"}</p>
                                <a href={editingMember.cvUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#8A6B20] hover:underline">
                                  <Download size={13} /> View current file
                                </a>
                              </div>
                            </div>
                            <button type="button" onClick={() => setRemoveExistingCv(true)} className="shrink-0 rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50">
                              Remove CV
                            </button>
                          </div>
                        )}

                        {removeExistingCv && (
                          <div className="mb-3 flex items-center justify-between gap-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
                            <span>The existing CV will be removed when you save.</span>
                            <button type="button" onClick={() => setRemoveExistingCv(false)} className="shrink-0 font-semibold underline">Undo</button>
                          </div>
                        )}

                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-5 text-center transition hover:border-[#C8A951]">
                          <FileText size={24} className="text-[#1B2847]" />
                          <span className="mt-2 text-sm font-semibold text-[#1B2847]">
                            {selectedCv ? "Choose a different CV" : "Upload CV"}
                          </span>
                          <span className="mt-1 text-xs leading-5 text-slate-500">PDF, DOC or DOCX · Maximum 5 MB</span>
                          <input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleCvChange} className="sr-only" />
                        </label>

                        {selectedCv && (
                          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                            <div className="min-w-0">
                              <p className="break-all text-sm font-semibold text-emerald-800">{selectedCv.name}</p>
                              <p className="mt-1 text-xs text-emerald-700">{(selectedCv.size / (1024 * 1024)).toFixed(2)} MB</p>
                            </div>
                            <button type="button" onClick={() => setSelectedCv(null)} aria-label="Remove selected CV" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-emerald-700 hover:bg-emerald-100"><X size={16} /></button>
                          </div>
                        )}
                      </div>
                    </Field>

                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-[#C8A951]/60 hover:bg-amber-50/20">
                      <input type="checkbox" checked={form.isPublished} onChange={(event) => updateForm("isPublished", event.target.checked)} className="mt-0.5 h-4 w-4 accent-[#1B2847]" />
                      <span>
                        <span className="block text-sm font-semibold text-[#1B2847]">Publish on website</span>
                        <span className="mt-1 block text-xs leading-5 text-slate-500">
                          {form.isPublished ? "This profile will be visible to website visitors." : "Save as a draft. Visitors will not see this profile."}
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
                <button type="button" onClick={closeEditor} disabled={isSaving} className="min-h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#1B2847] px-6 text-sm font-semibold text-white hover:bg-[#26385F] disabled:opacity-60">
                  {isSaving ? <LoaderCircle size={17} className="animate-spin" /> : <Check size={17} />}
                  {isSaving ? "Saving..." : editingMember ? "Save changes" : "Create team member"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {pendingDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#101827]/60 p-4 backdrop-blur-sm">
          <section role="alertdialog" aria-modal="true" aria-labelledby="delete-team-title" className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-7">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600"><Trash2 size={22} /></div>
            <h2 id="delete-team-title" className="mt-5 text-xl font-bold text-[#1B2847]">Delete team member?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Permanently remove <strong className="text-slate-800">{pendingDelete.name}</strong> from the team directory. This action cannot be undone.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" disabled={isDeleting} onClick={() => setPendingDelete(null)} className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
              <button type="button" disabled={isDeleting} onClick={() => void handleDelete()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60">
                {isDeleting ? <LoaderCircle size={16} className="animate-spin" /> : <Trash2 size={16} />}
                {isDeleting ? "Deleting..." : "Delete member"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
