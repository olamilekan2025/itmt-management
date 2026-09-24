"use client";

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  ChevronDown,
  File,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  Search,
  Trash2,
  Upload,
  UserRound,
  X,
} from "lucide-react";

import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { apiDelete, apiGet, apiPostFormData } from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

interface Student {
  _id: string;
  name: string;
  email: string;
  matricNumber?: string;
  programme?: {
    _id: string;
    name: string;
  };
  level?: string;
}

interface AcademicSession {
  _id: string;
  name: string;
  isActive?: boolean;
}

interface Semester {
  _id: string;
  name: string;
  isActive?: boolean;
}

interface StudentDocument {
  _id: string;
  student: Student | string;
  title: string;
  type: DocumentType;
  description?: string;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  fileSize?: number;
  academicSession?: AcademicSession | string;
  semester?: Semester | string;
  issuedAt?: string;
  createdAt: string;
  isAvailable: boolean;
}

type DocumentType =
  | "admission_letter"
  | "registration_slip"
  | "fee_receipt"
  | "result"
  | "transcript"
  | "certificate"
  | "identity"
  | "other";

interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  students?: T[];
  users?: T[];
  sessions?: T[];
  semesters?: T[];
  documents?: T[];
  data?: T[];
}

/* =========================================================
   CONSTANTS
========================================================= */

const DOCUMENT_TYPES: {
  value: DocumentType;
  label: string;
}[] = [
  {
    value: "admission_letter",
    label: "Admission Letter",
  },
  {
    value: "registration_slip",
    label: "Registration Slip",
  },
  {
    value: "fee_receipt",
    label: "Fee Receipt",
  },
  {
    value: "result",
    label: "Result",
  },
  {
    value: "transcript",
    label: "Transcript",
  },
  {
    value: "certificate",
    label: "Certificate",
  },
  {
    value: "identity",
    label: "Identity Document",
  },
  {
    value: "other",
    label: "Other",
  },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
];

/* =========================================================
   HELPERS
========================================================= */

function getDocumentTypeLabel(type: DocumentType) {
  return (
    DOCUMENT_TYPES.find(
      (item) => item.value === type,
    )?.label ?? "Document"
  );
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) {
    return FileImage;
  }

  if (
    mimeType.includes("spreadsheet") ||
    mimeType.includes("excel")
  ) {
    return FileSpreadsheet;
  }

  if (
    mimeType.includes("word") ||
    mimeType.includes("document")
  ) {
    return FileText;
  }

  if (mimeType === "application/pdf") {
    return FileText;
  }

  if (mimeType.includes("zip")) {
    return FileArchive;
  }

  return File;
}

function formatFileSize(size?: number) {
  if (!size) return "Unknown size";

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(date?: string) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name?: string) {
  if (!name) return "ST";

  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/* =========================================================
   SKELETON COMPONENTS
========================================================= */

function Skeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`}
    />
  );
}

function HeaderSkeleton() {
  return (
    <div className="rounded-[2rem] bg-brand-navy p-6 shadow-xl sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-4">
          <Skeleton className="h-10 w-48 bg-white/10" />
          <Skeleton className="h-8 w-72 bg-white/10" />
          <Skeleton className="h-4 w-[28rem] max-w-full bg-white/10" />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-20 w-28 bg-white/10"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function DocumentListSkeleton() {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col gap-4 px-5 py-5 sm:px-7 lg:flex-row lg:items-center"
        >
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />

            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-56 max-w-full" />
              <Skeleton className="h-3 w-40 max-w-full" />

              <div className="flex gap-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          </div>

          <div className="flex gap-2 lg:shrink-0">
            <Skeleton className="h-10 w-20 rounded-xl" />
            <Skeleton className="h-10 w-24 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

function StudentResultsSkeleton() {
  return (
    <div className="space-y-1 p-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-xl px-3 py-3"
        >
          <Skeleton className="h-10 w-10 rounded-full" />

          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-36" />
            <Skeleton className="h-3 w-48 max-w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function AdminDocumentsPage() {
  const { data: session, status: sessionStatus } =
    useSession();

  const token =
    session?.accessToken as string | undefined;

  /* =======================================================
     STATE
  ======================================================= */

  const [students, setStudents] = useState<Student[]>(
    [],
  );

  const [sessions, setSessions] = useState<
    AcademicSession[]
  >([]);

  const [semesters, setSemesters] = useState<Semester[]>(
    [],
  );

  const [documents, setDocuments] = useState<
    StudentDocument[]
  >([]);

  const [studentSearch, setStudentSearch] =
    useState("");

  const [documentSearch, setDocumentSearch] =
    useState("");

  const [selectedStudent, setSelectedStudent] =
    useState<Student | null>(null);

  const [selectedType, setSelectedType] =
    useState<DocumentType>("admission_letter");

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");

  const [selectedSession, setSelectedSession] =
    useState("");

  const [selectedSemester, setSelectedSemester] =
    useState("");

  const [issuedAt, setIssuedAt] = useState("");

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [loadingStudents, setLoadingStudents] =
    useState(false);

  const [loadingDocuments, setLoadingDocuments] =
    useState(false);

  const [loadingMeta, setLoadingMeta] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [showStudentResults, setShowStudentResults] =
    useState(false);

  /* =======================================================
     LOAD STUDENTS
  ======================================================= */

  const loadStudents = useCallback(async () => {
    if (!token) return;

    try {
      setLoadingStudents(true);

      const response =
        await apiGet<ApiResponse<Student>>(
          "/api/users?role=student",
          token,
        );

      const list =
        response?.users ??
        response?.students ??
        response?.data ??
        [];

      setStudents(list);
    } catch (err) {
      console.error(err);

      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to load students.",
      );
    } finally {
      setLoadingStudents(false);
    }
  }, [token]);

  /* =======================================================
     LOAD ACADEMIC DATA
  ======================================================= */

  const loadMeta = useCallback(async () => {
    if (!token) return;

    try {
      setLoadingMeta(true);

      const [
        sessionResponse,
        semesterResponse,
      ] = await Promise.all([
        apiGet<ApiResponse<AcademicSession>>(
          "/api/academic-sessions",
          token,
        ),
        apiGet<ApiResponse<Semester>>(
          "/api/semesters",
          token,
        ),
      ]);

      const sessionList =
        sessionResponse?.sessions ??
        sessionResponse?.data ??
        [];

      const semesterList =
        semesterResponse?.semesters ??
        semesterResponse?.data ??
        [];

      setSessions(sessionList);
      setSemesters(semesterList);

      const activeSession =
        sessionList.find(
          (item) => item.isActive,
        ) ?? sessionList[0];

      const activeSemester =
        semesterList.find(
          (item) => item.isActive,
        ) ?? semesterList[0];

      if (activeSession) {
        setSelectedSession(activeSession._id);
      }

      if (activeSemester) {
        setSelectedSemester(activeSemester._id);
      }
    } catch (err) {
      console.error(err);

      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to load academic information.",
      );
    } finally {
      setLoadingMeta(false);
    }
  }, [token]);

  /* =======================================================
     LOAD DOCUMENTS
  ======================================================= */

  const loadDocuments = useCallback(async () => {
    if (!token) return;

    try {
      setLoadingDocuments(true);

      const response =
        await apiGet<{
          success?: boolean;
          documents?: StudentDocument[];
          data?: StudentDocument[];
        }>("/api/documents", token);

      const list =
        response?.documents ??
        response?.data ??
        [];

      setDocuments(list);
    } catch (err) {
      console.warn(
        "Admin document list endpoint unavailable:",
        err,
      );
    } finally {
      setLoadingDocuments(false);
    }
  }, [token]);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    if (
      sessionStatus !== "authenticated" ||
      !token
    ) {
      return;
    }

    void loadStudents();
    void loadMeta();
    void loadDocuments();
  }, [
    sessionStatus,
    token,
    loadStudents,
    loadMeta,
    loadDocuments,
  ]);

  /* =======================================================
     FILTER STUDENTS
  ======================================================= */

  const filteredStudents = useMemo(() => {
    const query =
      studentSearch.trim().toLowerCase();

    if (!query) {
      return students.slice(0, 10);
    }

    return students
      .filter((student) => {
        const name =
          student.name?.toLowerCase() ?? "";

        const email =
          student.email?.toLowerCase() ?? "";

        const matric =
          student.matricNumber?.toLowerCase() ?? "";

        return (
          name.includes(query) ||
          email.includes(query) ||
          matric.includes(query)
        );
      })
      .slice(0, 10);
  }, [students, studentSearch]);

  /* =======================================================
     FILTER DOCUMENTS
  ======================================================= */

  const filteredDocuments = useMemo(() => {
    const query =
      documentSearch.trim().toLowerCase();

    if (!query) {
      return documents;
    }

    return documents.filter((document) => {
      const title =
        document.title?.toLowerCase() ?? "";

      const fileName =
        document.fileName?.toLowerCase() ?? "";

      const type =
        getDocumentTypeLabel(
          document.type,
        ).toLowerCase();

      const student =
        typeof document.student === "object"
          ? document.student
          : null;

      const studentName =
        student?.name?.toLowerCase() ?? "";

      const matric =
        student?.matricNumber?.toLowerCase() ?? "";

      return (
        title.includes(query) ||
        fileName.includes(query) ||
        type.includes(query) ||
        studentName.includes(query) ||
        matric.includes(query)
      );
    });
  }, [documents, documentSearch]);

  /* =======================================================
     FILE SELECT
  ======================================================= */

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0] ?? null;

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      event.target.value = "";

      toast.error(
        "File is too large. Maximum allowed size is 10 MB.",
      );

      return;
    }

    if (
      !ALLOWED_FILE_TYPES.includes(file.type)
    ) {
      setSelectedFile(null);
      event.target.value = "";

      toast.error(
        "Unsupported file type. Please select a PDF, image, Word, Excel, or text document.",
      );

      return;
    }

    setSelectedFile(file);

    toast.success("Document selected", {
      description: `${file.name} is ready to upload.`,
    });

    if (!title.trim()) {
      const cleanedName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[_-]+/g, " ")
        .trim();

      if (cleanedName) {
        setTitle(cleanedName);
      }
    }
  }

  /* =======================================================
     SELECT STUDENT
  ======================================================= */

  function handleSelectStudent(
    student: Student,
  ) {
    setSelectedStudent(student);
    setStudentSearch(student.name);
    setShowStudentResults(false);

    toast.success("Student selected", {
      description: `${student.name} is ready for document upload.`,
    });
  }

  /* =======================================================
     RESET FORM
  ======================================================= */

  function resetForm() {
    setSelectedStudent(null);
    setStudentSearch("");
    setSelectedType("admission_letter");
    setTitle("");
    setDescription("");
    setIssuedAt("");
    setSelectedFile(null);

    const activeSession =
      sessions.find(
        (item) => item.isActive,
      ) ?? sessions[0];

    const activeSemester =
      semesters.find(
        (item) => item.isActive,
      ) ?? semesters[0];

    setSelectedSession(
      activeSession?._id ?? "",
    );

    setSelectedSemester(
      activeSemester?._id ?? "",
    );

    const input =
      document.getElementById(
        "document-file",
      ) as HTMLInputElement | null;

    if (input) {
      input.value = "";
    }
  }

  /* =======================================================
     UPLOAD
  ======================================================= */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!token) {
      toast.error(
        "Your session has expired. Please log in again.",
      );
      return;
    }

    if (!selectedStudent) {
      toast.error(
        "Please select a student.",
      );
      return;
    }

    if (!title.trim()) {
      toast.error(
        "Please enter a document title.",
      );
      return;
    }

    if (!selectedFile) {
      toast.error(
        "Please select a document file.",
      );
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append(
        "student",
        selectedStudent._id,
      );

      formData.append(
        "title",
        title.trim(),
      );

      formData.append(
        "type",
        selectedType,
      );

      if (description.trim()) {
        formData.append(
          "description",
          description.trim(),
        );
      }

      if (selectedSession) {
        formData.append(
          "academicSession",
          selectedSession,
        );
      }

      if (selectedSemester) {
        formData.append(
          "semester",
          selectedSemester,
        );
      }

      if (issuedAt) {
        formData.append(
          "issuedAt",
          issuedAt,
        );
      }

      formData.append(
        "file",
        selectedFile,
      );

      await apiPostFormData(
        "/api/documents",
        formData,
        token,
      );

      toast.success(
        "Document uploaded successfully",
        {
          description: `${title.trim()} has been added to ${selectedStudent.name}'s records.`,
          icon: (
            <CheckCircle2 className="h-4 w-4" />
          ),
        },
      );

      resetForm();

      await loadDocuments();
    } catch (err) {
      console.error(err);

      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to upload document.",
      );
    } finally {
      setUploading(false);
    }
  }

  /* =======================================================
     DELETE DOCUMENT
  ======================================================= */

  async function handleDelete(
    documentId: string,
    documentTitle: string,
  ) {
    if (!token) return;

    const confirmed =
      window.confirm(
        `Are you sure you want to permanently delete "${documentTitle}"?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(documentId);

      await apiDelete(
        `/api/documents/${documentId}`,
        token,
      );

      setDocuments((current) =>
        current.filter(
          (item) =>
            item._id !== documentId,
        ),
      );

      toast.success(
        "Document deleted successfully.",
      );
    } catch (err) {
      console.error(err);

      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to delete document.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  /* =======================================================
     SESSION LOADING
  ======================================================= */

  if (sessionStatus === "loading") {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1600px] space-y-6">
          <HeaderSkeleton />

          <section className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
              <Skeleton className="h-6 w-64" />
              <Skeleton className="mt-2 h-4 w-80 max-w-full" />
            </div>

            <div className="space-y-6 p-5 sm:p-7">
              <Skeleton className="h-14 w-full rounded-2xl" />

              <div className="grid gap-5 lg:grid-cols-2">
                <Skeleton className="h-14 rounded-2xl" />
                <Skeleton className="h-14 rounded-2xl" />
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <Skeleton className="h-14 rounded-2xl" />
                <Skeleton className="h-14 rounded-2xl" />
                <Skeleton className="h-14 rounded-2xl" />
              </div>

              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-36 rounded-3xl" />
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
              <Skeleton className="h-6 w-52" />
              <Skeleton className="mt-2 h-4 w-72 max-w-full" />
            </div>

            <DocumentListSkeleton />
          </section>
        </div>
      </main>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(27,40,71,0.05),_transparent_32%),#f8fafc] px-0 py-6 sm:px-0 lg:px-0">
      <div className="mx-auto max-w-[1600px] space-y-6">

        {/* =================================================
            HEADER
        ================================================= */}

        <section className="relative overflow-hidden rounded-[2rem] bg-brand-navy p-6 text-white shadow-[0_20px_60px_-20px_rgba(27,40,71,0.45)] sm:p-8">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-gold/20 bg-brand-gold/10 shadow-inner">
                  <FileText className="h-5 w-5 text-brand-gold" />
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-gold">
                    Student Records
                  </p>

                  <p className="mt-0.5 text-xs text-white/45">
                    Academic document administration
                  </p>
                </div>
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Document Management
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
                Securely upload, organize and manage official
                student documents across the academic record.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 backdrop-blur-sm">
                <p className="text-[11px] font-medium uppercase tracking-wider text-white/45">
                  Students
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {students.length}
                </p>

                <p className="mt-1 text-[11px] text-white/35">
                  Registered
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 backdrop-blur-sm">
                <p className="text-[11px] font-medium uppercase tracking-wider text-white/45">
                  Documents
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {documents.length}
                </p>

                <p className="mt-1 text-[11px] text-white/35">
                  Uploaded
                </p>
              </div>

              <div className="col-span-2 rounded-2xl border border-brand-gold/20 bg-brand-gold/10 px-5 py-4 sm:col-span-1">
                <p className="text-[11px] font-medium uppercase tracking-wider text-brand-gold/65">
                  Maximum
                </p>

                <p className="mt-1 text-2xl font-bold text-brand-gold">
                  10 MB
                </p>

                <p className="mt-1 text-[11px] text-brand-gold/45">
                  Per document
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            UPLOAD CARD
        ================================================= */}

        <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_12px_40px_-24px_rgba(15,23,42,0.3)]">
          <div className="border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/70 px-5 py-5 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-navy/[0.06]">
                <Upload className="h-5 w-5 text-brand-navy" />
              </div>

              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900">
                  Upload Student Document
                </h2>

                <p className="mt-0.5 text-sm text-slate-500">
                  Add an official document to a student&apos;s
                  academic records.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-7 p-5 sm:p-7"
          >
            {/* STUDENT */}

            <div className="relative">
              <label
                htmlFor="student-search"
                className="mb-2.5 block text-sm font-semibold text-slate-700"
              >
                Student
              </label>

              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  id="student-search"
                  type="text"
                  value={studentSearch}
                  onChange={(event) => {
                    setStudentSearch(
                      event.target.value,
                    );

                    setSelectedStudent(null);
                    setShowStudentResults(true);
                  }}
                  onFocus={() =>
                    setShowStudentResults(true)
                  }
                  placeholder="Search by name, matric number or email..."
                  autoComplete="off"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-3.5 pl-12 pr-4 text-sm text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-gold focus:bg-white focus:ring-4 focus:ring-brand-gold/10"
                />
              </div>

              {selectedStudent && (
                <div className="mt-3 flex items-center gap-3 rounded-2xl border border-brand-gold/25 bg-gradient-to-r from-brand-gold/[0.08] to-transparent p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-white shadow-sm">
                    {getInitials(
                      selectedStudent.name,
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">
                      {selectedStudent.name}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {selectedStudent.matricNumber ??
                        "No matric number"}
                      {" • "}
                      {selectedStudent.email}
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label="Remove selected student"
                    onClick={() => {
                      setSelectedStudent(null);
                      setStudentSearch("");
                    }}
                    className="rounded-xl p-2 text-slate-400 transition hover:bg-white hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {showStudentResults &&
                !selectedStudent &&
                studentSearch.trim() && (
                  <div className="absolute inset-x-0 z-40 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_-15px_rgba(15,23,42,0.25)]">
                    {loadingStudents ? (
                      <StudentResultsSkeleton />
                    ) : filteredStudents.length > 0 ? (
                      <div className="max-h-72 overflow-y-auto p-2">
                        {filteredStudents.map(
                          (student) => (
                            <button
                              key={student._id}
                              type="button"
                              onClick={() =>
                                handleSelectStudent(
                                  student,
                                )
                              }
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50"
                            >
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-navy/[0.07]">
                                <UserRound className="h-5 w-5 text-brand-navy" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-slate-900">
                                  {student.name}
                                </p>

                                <p className="truncate text-xs text-slate-500">
                                  {student.matricNumber ??
                                    "No matric number"}
                                  {" • "}
                                  {student.email}
                                </p>
                              </div>
                            </button>
                          ),
                        )}
                      </div>
                    ) : (
                      <div className="px-4 py-10 text-center">
                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
                          <UserRound className="h-5 w-5 text-slate-400" />
                        </div>

                        <p className="mt-3 text-sm font-semibold text-slate-700">
                          No students found
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Try another name, email or matric number.
                        </p>
                      </div>
                    )}
                  </div>
                )}
            </div>

            {/* TYPE + TITLE */}

            <div className="grid gap-5 lg:grid-cols-2">
              <div>
                <label
                  htmlFor="document-type"
                  className="mb-2.5 block text-sm font-semibold text-slate-700"
                >
                  Document Type
                </label>

                <div className="relative">
                  <select
                    id="document-type"
                    value={selectedType}
                    onChange={(event) =>
                      setSelectedType(
                        event.target.value as DocumentType,
                      )
                    }
                    className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 pr-11 text-sm outline-none transition-all hover:border-slate-300 focus:border-brand-gold focus:bg-white focus:ring-4 focus:ring-brand-gold/10"
                  >
                    {DOCUMENT_TYPES.map(
                      (item) => (
                        <option
                          key={item.value}
                          value={item.value}
                        >
                          {item.label}
                        </option>
                      ),
                    )}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div>
                <label
                  htmlFor="document-title"
                  className="mb-2.5 block text-sm font-semibold text-slate-700"
                >
                  Document Title
                </label>

                <input
                  id="document-title"
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="e.g. 2026/2027 Admission Letter"
                  maxLength={200}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-gold focus:bg-white focus:ring-4 focus:ring-brand-gold/10"
                />
              </div>
            </div>

            {/* SESSION + SEMESTER + DATE */}

            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label
                  htmlFor="academic-session"
                  className="mb-2.5 block text-sm font-semibold text-slate-700"
                >
                  Academic Session
                </label>

                <div className="relative">
                  <select
                    id="academic-session"
                    value={selectedSession}
                    onChange={(event) =>
                      setSelectedSession(
                        event.target.value,
                      )
                    }
                    disabled={loadingMeta}
                    className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 pr-11 text-sm outline-none transition-all hover:border-slate-300 focus:border-brand-gold focus:bg-white focus:ring-4 focus:ring-brand-gold/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">
                      Select session
                    </option>

                    {sessions.map(
                      (item) => (
                        <option
                          key={item._id}
                          value={item._id}
                        >
                          {item.name}
                          {item.isActive
                            ? " • Active"
                            : ""}
                        </option>
                      ),
                    )}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div>
                <label
                  htmlFor="semester"
                  className="mb-2.5 block text-sm font-semibold text-slate-700"
                >
                  Semester
                </label>

                <div className="relative">
                  <select
                    id="semester"
                    value={selectedSemester}
                    onChange={(event) =>
                      setSelectedSemester(
                        event.target.value,
                      )
                    }
                    disabled={loadingMeta}
                    className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 pr-11 text-sm outline-none transition-all hover:border-slate-300 focus:border-brand-gold focus:bg-white focus:ring-4 focus:ring-brand-gold/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">
                      Select semester
                    </option>

                    {semesters.map(
                      (item) => (
                        <option
                          key={item._id}
                          value={item._id}
                        >
                          {item.name}
                          {item.isActive
                            ? " • Active"
                            : ""}
                        </option>
                      ),
                    )}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div>
                <label
                  htmlFor="issued-at"
                  className="mb-2.5 block text-sm font-semibold text-slate-700"
                >
                  Issued Date
                </label>

                <input
                  id="issued-at"
                  type="date"
                  value={issuedAt}
                  onChange={(event) =>
                    setIssuedAt(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-sm outline-none transition-all hover:border-slate-300 focus:border-brand-gold focus:bg-white focus:ring-4 focus:ring-brand-gold/10"
                />
              </div>
            </div>

            {/* DESCRIPTION */}

            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Description
                </label>

                <span className="text-xs text-slate-400">
                  {description.length}/1000
                </span>
              </div>

              <textarea
                id="description"
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value,
                  )
                }
                rows={4}
                maxLength={1000}
                placeholder="Optional description about this document..."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-gold focus:bg-white focus:ring-4 focus:ring-brand-gold/10"
              />
            </div>

            {/* FILE */}

            <div>
              <label
                htmlFor="document-file"
                className="mb-2.5 block text-sm font-semibold text-slate-700"
              >
                Document File
              </label>

              <label
                htmlFor="document-file"
                className={`group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[1.75rem] border-2 border-dashed px-6 py-10 text-center transition-all ${
                  selectedFile
                    ? "border-brand-gold/50 bg-brand-gold/[0.04]"
                    : "border-slate-200 bg-slate-50/70 hover:border-brand-gold/60 hover:bg-brand-gold/[0.04]"
                }`}
              >
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-all ${
                    selectedFile
                      ? "bg-brand-gold/15"
                      : "bg-brand-navy/[0.06] group-hover:bg-brand-gold/15"
                  }`}
                >
                  {selectedFile ? (
                    <CheckCircle2 className="h-7 w-7 text-brand-gold" />
                  ) : (
                    <Upload className="h-7 w-7 text-brand-navy group-hover:text-brand-gold" />
                  )}
                </div>

                <p className="mt-4 max-w-xl truncate px-4 text-sm font-semibold text-slate-800">
                  {selectedFile
                    ? selectedFile.name
                    : "Choose a document to upload"}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  PDF, images, Word, Excel or text
                  {" • "}
                  Maximum 10 MB
                </p>

                {selectedFile && (
                  <div className="mt-3 rounded-full bg-brand-gold/10 px-3 py-1 text-xs font-semibold text-brand-navy">
                    {formatFileSize(
                      selectedFile.size,
                    )}
                  </div>
                )}

                <input
                  id="document-file"
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx,.txt"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {/* ACTIONS */}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={resetForm}
                disabled={uploading}
                className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Clear
              </button>

              <button
                type="submit"
                disabled={
                  uploading ||
                  !selectedStudent ||
                  !selectedFile ||
                  !title.trim()
                }
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-navy px-7 py-3 text-sm font-bold text-white shadow-lg shadow-brand-navy/15 transition-all hover:-translate-y-0.5 hover:bg-brand-navy/95 hover:shadow-xl disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Uploading document...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
                    Upload Document
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* =================================================
            DOCUMENT LIST
        ================================================= */}

        <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_12px_40px_-24px_rgba(15,23,42,0.3)]">
          <div className="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/70 px-5 py-5 sm:px-7 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-slate-900">
                  Uploaded Documents
                </h2>

                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                  {documents.length}
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Review documents already added to student records.
              </p>
            </div>

            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={documentSearch}
                onChange={(event) =>
                  setDocumentSearch(
                    event.target.value,
                  )
                }
                placeholder="Search documents..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-gold focus:bg-white focus:ring-4 focus:ring-brand-gold/10"
              />
            </div>
          </div>

          {loadingDocuments ? (
            <DocumentListSkeleton />
          ) : filteredDocuments.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <FileText className="h-7 w-7 text-slate-400" />
              </div>

              <h3 className="mt-5 font-semibold text-slate-800">
                No documents found
              </h3>

              <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
                {documentSearch
                  ? "Try changing your search to find another document."
                  : "Uploaded student documents will appear here."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredDocuments.map(
                (document) => {
                  const FileIcon =
                    getFileIcon(
                      document.mimeType,
                    );

                  const student =
                    typeof document.student ===
                    "object"
                      ? document.student
                      : null;

                  return (
                    <div
                      key={document._id}
                      className="group flex flex-col gap-4 px-5 py-5 transition-all hover:bg-slate-50/70 sm:px-7 lg:flex-row lg:items-center"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-navy/[0.06] transition-all group-hover:bg-brand-gold/10">
                          <FileIcon className="h-6 w-6 text-brand-navy" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">
                            {document.title}
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-500">
                            {student?.name ??
                              "Student"}
                            {" • "}
                            {student?.matricNumber ??
                              "No matric"}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <span className="rounded-full bg-brand-gold/10 px-2.5 py-1 text-[11px] font-semibold text-brand-navy">
                              {getDocumentTypeLabel(
                                document.type,
                              )}
                            </span>

                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-500">
                              {formatFileSize(
                                document.fileSize,
                              )}
                            </span>

                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-500">
                              {formatDate(
                                document.createdAt,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 lg:shrink-0">
                        <a
                          href={document.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-brand-gold hover:text-brand-navy hover:shadow-md"
                        >
                          View
                        </a>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              document._id,
                              document.title,
                            )
                          }
                          disabled={
                            deletingId ===
                            document._id
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition-all hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId ===
                          document._id ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}

                          {deletingId ===
                          document._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </section>
      </div>

      {/* CLICK OUTSIDE */}

      {showStudentResults && (
        <button
          type="button"
          aria-label="Close student search"
          className="fixed inset-0 z-30 cursor-default"
          onClick={() =>
            setShowStudentResults(false)
          }
        />
      )}
    </main>
  );
}

