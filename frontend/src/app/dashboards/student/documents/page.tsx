"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  ArrowDownToLine,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileArchive,
  FileCheck2,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileType2,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";

import { useSession } from "next-auth/react";

import Link from "next/link";

import { apiGet } from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

type DocumentType =
  | "admission_letter"
  | "registration_slip"
  | "fee_receipt"
  | "result"
  | "transcript"
  | "certificate"
  | "identity"
  | "other";

interface AcademicSession {
  _id: string;
  name?: string;
  startDate?: string;
  endDate?: string;
}

interface Semester {
  _id: string;
  name?: string;
  code?: string;
}

interface UploadedBy {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
}

interface StudentDocument {
  _id: string;
  title: string;
  type: DocumentType;
  description?: string;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  fileSize?: number;
  academicSession?: AcademicSession;
  semester?: Semester;
  issuedAt?: string;
  uploadedBy?: UploadedBy;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DocumentsResponse {
  success: boolean;
  documents?: StudentDocument[];
  count?: number;
  message?: string;
}

/* =========================================================
   LABELS
========================================================= */

const documentTypeLabels: Record<
  DocumentType,
  string
> = {
  admission_letter: "Admission Letter",
  registration_slip: "Registration Slip",
  fee_receipt: "Fee Receipt",
  result: "Result",
  transcript: "Transcript",
  certificate: "Certificate",
  identity: "Identity Document",
  other: "Other Document",
};

/* =========================================================
   HELPERS
========================================================= */

function formatDate(
  value?: string,
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-NG",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}

function formatFileSize(
  bytes?: number,
): string {
  if (!bytes || bytes <= 0) {
    return "Unknown size";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileExtension(
  fileName: string,
): string {
  const parts = fileName.split(".");

  if (parts.length < 2) {
    return "FILE";
  }

  return (
    parts[parts.length - 1] ?? "FILE"
  ).toUpperCase();
}

function getDocumentIcon(
  document: StudentDocument,
) {
  const mime = document.mimeType.toLowerCase();

  if (mime.includes("pdf")) {
    return FileText;
  }

  if (mime.startsWith("image/")) {
    return FileImage;
  }

  if (
    mime.includes("spreadsheet") ||
    mime.includes("excel")
  ) {
    return FileSpreadsheet;
  }

  if (
    mime.includes("word") ||
    mime.includes("document")
  ) {
    return FileType2;
  }

  return FileArchive;
}

function getDocumentIconBackground(
  type: DocumentType,
) {
  switch (type) {
    case "admission_letter":
      return "bg-blue-50 text-blue-600";

    case "registration_slip":
      return "bg-indigo-50 text-indigo-600";

    case "fee_receipt":
      return "bg-emerald-50 text-emerald-600";

    case "result":
      return "bg-violet-50 text-violet-600";

    case "transcript":
      return "bg-amber-50 text-amber-600";

    case "certificate":
      return "bg-teal-50 text-teal-600";

    case "identity":
      return "bg-rose-50 text-rose-600";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

/* =========================================================
   PAGE
========================================================= */

export default function StudentDocumentsPage() {
  const { data: session, status } =
    useSession();

  const [documents, setDocuments] =
    useState<StudentDocument[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [selectedType, setSelectedType] =
    useState<"all" | DocumentType>("all");

  const [selectedDocument, setSelectedDocument] =
    useState<StudentDocument | null>(null);

  /* =======================================================
     LOAD DOCUMENTS
  ======================================================= */

  const loadDocuments = useCallback(
    async (showRefresh = false) => {
      if (!session) {
        return;
      }

      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const token =
          session.accessToken as string;

        const response =
          (await apiGet(
            "/documents/my",
            token,
          )) as DocumentsResponse;

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Failed to load documents.",
          );
        }

        setDocuments(
          Array.isArray(response.documents)
            ? response.documents
            : [],
        );
      } catch (err) {
        console.error(
          "Load student documents error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your documents.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [session],
  );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    if (status === "authenticated") {
      loadDocuments();
    }
  }, [
    status,
    loadDocuments,
  ]);

  /* =======================================================
     FILTER DOCUMENTS
  ======================================================= */

  const filteredDocuments =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return documents.filter(
        (document) => {
          const matchesSearch =
            !query ||
            document.title
              .toLowerCase()
              .includes(query) ||
            document.fileName
              .toLowerCase()
              .includes(query) ||
            documentTypeLabels[
              document.type
            ]
              .toLowerCase()
              .includes(query);

          const matchesType =
            selectedType === "all" ||
            document.type === selectedType;

          return (
            matchesSearch &&
            matchesType
          );
        },
      );
    }, [
      documents,
      search,
      selectedType,
    ]);

  /* =======================================================
     COUNTS
  ======================================================= */

  const documentCount =
    documents.length;

  const filteredCount =
    filteredDocuments.length;

  const availableTypes =
    useMemo(() => {
      return Array.from(
        new Set(
          documents.map(
            (document) => document.type,
          ),
        ),
      );
    }, [documents]);

  /* =======================================================
     LOADING STATE
  ======================================================= */

  if (
    status === "loading" ||
    loading
  ) {
    return (
      <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-8">
            <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" />
            <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-slate-200" />
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({
              length: 3,
            }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({
              length: 6,
            }).map((_, index) => (
              <div
                key={index}
                className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[1600px] px-0 py-5 sm:px-0 sm:py-7 lg:px-0 lg:py-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <section className="mb-7 overflow-hidden rounded-3xl bg-brand-navy shadow-sm">
          <div className="relative px-5 py-7 sm:px-7 lg:px-9 lg:py-8">

            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-brand-gold/10 blur-3xl" />

            <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />

            <div className="relative">
              <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-white/65">
                <Link
                  href="/dashboards/student"
                  className="transition hover:text-white"
                >
                  Student Portal
                </Link>

                <ChevronRight
                  size={15}
                />

                <span className="text-white">
                  My Documents
                </span>
              </div>

              <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-gold/25 bg-brand-gold/10 px-3 py-1.5 text-xs font-semibold text-brand-gold">
                    <ShieldCheck
                      size={14}
                    />

                    Official Student Records
                  </div>

                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                    My Documents
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
                    Access your official academic
                    documents, receipts, results,
                    certificates, and other student
                    records.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    loadDocuments(true)
                  }
                  disabled={refreshing}
                  className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw
                    size={16}
                    className={
                      refreshing
                        ? "animate-spin"
                        : ""
                    }
                  />

                  {refreshing
                    ? "Refreshing..."
                    : "Refresh"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                Unable to load documents
              </p>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                loadDocuments(true)
              }
              className="shrink-0 rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-200"
            >
              Retry
            </button>
          </div>
        )}

        {/* =================================================
            STAT CARDS
        ================================================= */}

        <section className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Documents
                </p>

                <p className="mt-2 text-3xl font-bold text-brand-navy">
                  {documentCount}
                </p>
              </div>

              <div className="rounded-xl bg-brand-navy/5 p-3 text-brand-navy">
                <FileCheck2
                  size={23}
                />
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Official records available
              to you
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Document Types
                </p>

                <p className="mt-2 text-3xl font-bold text-brand-navy">
                  {availableTypes.length}
                </p>
              </div>

              <div className="rounded-xl bg-brand-gold/10 p-3 text-brand-gold">
                <FileArchive
                  size={23}
                />
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Different categories of
              records
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Showing
                </p>

                <p className="mt-2 text-3xl font-bold text-brand-navy">
                  {filteredCount}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <CheckCircle2
                  size={23}
                />
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Matching your current filter
            </p>
          </div>
        </section>

        {/* =================================================
            FILTER BAR
        ================================================= */}

        <section className="mb-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search documents..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-gold focus:bg-white focus:ring-4 focus:ring-brand-gold/10"
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 lg:max-w-[650px]">
              <button
                type="button"
                onClick={() =>
                  setSelectedType("all")
                }
                className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  selectedType === "all"
                    ? "bg-brand-navy text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All
              </button>

              {availableTypes.map(
                (type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      setSelectedType(
                        type,
                      )
                    }
                    className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                      selectedType === type
                        ? "bg-brand-navy text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {
                      documentTypeLabels[
                        type
                      ]
                    }
                  </button>
                ),
              )}
            </div>
          </div>
        </section>

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {!error &&
          documents.length === 0 && (
            <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-navy/5 text-brand-navy">
                <FileText
                  size={30}
                />
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-800">
                No documents available
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Your official academic documents
                will appear here when they are
                uploaded by the appropriate
                school administrator.
              </p>
            </section>
          )}

        {/* =================================================
            NO SEARCH RESULTS
        ================================================= */}

        {!loading &&
          documents.length > 0 &&
          filteredDocuments.length === 0 && (
            <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <Search
                  size={28}
                />
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-800">
                No matching documents
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Try changing your search term
                or selecting another document
                category.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedType("all");
                }}
                className="mt-5 rounded-xl bg-brand-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-navy/90"
              >
                Clear Filters
              </button>
            </section>
          )}

        {/* =================================================
            DOCUMENT GRID
        ================================================= */}

        {filteredDocuments.length > 0 && (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredDocuments.map(
              (document) => {
                const Icon =
                  getDocumentIcon(
                    document,
                  );

                const iconStyle =
                  getDocumentIconBackground(
                    document.type,
                  );

                return (
                  <article
                    key={document._id}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
                  >
                    {/* Top */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconStyle}`}
                        >
                          <Icon
                            size={23}
                          />
                        </div>

                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                          Available
                        </span>
                      </div>

                      <div className="mt-5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-brand-gold">
                          {
                            documentTypeLabels[
                              document.type
                            ]
                          }
                        </p>

                        <h2 className="mt-1.5 line-clamp-2 min-h-[3.5rem] text-lg font-bold leading-7 text-slate-800">
                          {document.title}
                        </h2>

                        {document.description && (
                          <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-500">
                            {
                              document.description
                            }
                          </p>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                        <div className="flex items-center gap-2.5 text-sm">
                          <FileText
                            size={15}
                            className="shrink-0 text-slate-400"
                          />

                          <span className="truncate text-slate-600">
                            {
                              document.fileName
                            }
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-4 text-xs text-slate-400">
                          <span>
                            {getFileExtension(
                              document.fileName,
                            )}{" "}
                            •{" "}
                            {formatFileSize(
                              document.fileSize,
                            )}
                          </span>

                          <span className="flex items-center gap-1">
                            <Clock3
                              size={13}
                            />

                            {formatDate(
                              document.createdAt,
                            )}
                          </span>
                        </div>

                        {document.academicSession && (
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <BookOpen
                              size={14}
                              className="text-slate-400"
                            />

                            <span>
                              {
                                document
                                  .academicSession
                                  .name
                              }
                            </span>

                            {document.semester?.name && (
                              <>
                                <span className="text-slate-300">
                                  •
                                </span>

                                <span>
                                  {
                                    document
                                      .semester
                                      .name
                                  }
                                </span>
                              </>
                            )}
                          </div>
                        )}

                        {document.issuedAt && (
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <CalendarDays
                              size={14}
                              className="text-slate-400"
                            />

                            <span>
                              Issued{" "}
                              {formatDate(
                                document.issuedAt,
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 border-t border-slate-100 bg-slate-50/70 p-4">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedDocument(
                            document,
                          )
                        }
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-brand-navy hover:text-brand-navy"
                      >
                        View Details
                      </button>

                      <a
                        href={
                          document.fileUrl
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-navy px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-navy/90"
                      >
                        <ArrowDownToLine
                          size={16}
                        />

                        <span className="hidden sm:inline">
                          Open
                        </span>
                      </a>
                    </div>
                  </article>
                );
              },
            )}
          </section>
        )}
      </div>

      {/* ===================================================
          DOCUMENT DETAILS MODAL
      =================================================== */}

      {selectedDocument && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedDocument(null);
            }
          }}
        >
          <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-gold">
                  Document Details
                </p>

                <h2 className="mt-1 text-lg font-bold text-slate-800">
                  {
                    selectedDocument.title
                  }
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedDocument(null)
                }
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-5 sm:p-6">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon =
                      getDocumentIcon(
                        selectedDocument,
                      );

                    return (
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${getDocumentIconBackground(
                          selectedDocument.type,
                        )}`}
                      >
                        <Icon
                          size={21}
                        />
                      </div>
                    );
                  })()}

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {
                        selectedDocument.fileName
                      }
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {getFileExtension(
                        selectedDocument.fileName,
                      )}{" "}
                      •{" "}
                      {formatFileSize(
                        selectedDocument.fileSize,
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Document Type
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {
                      documentTypeLabels[
                        selectedDocument.type
                      ]
                    }
                  </p>
                </div>

                {selectedDocument.description && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Description
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {
                        selectedDocument.description
                      }
                    </p>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Uploaded
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {formatDate(
                        selectedDocument.createdAt,
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Issued
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {formatDate(
                        selectedDocument.issuedAt,
                      )}
                    </p>
                  </div>
                </div>

                {selectedDocument.academicSession && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Academic Session
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {
                        selectedDocument
                          .academicSession
                          .name
                      }

                      {selectedDocument.semester?.name &&
                        ` • ${selectedDocument.semester.name}`}
                    </p>
                  </div>
                )}

                {selectedDocument.uploadedBy && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Uploaded By
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {
                        selectedDocument
                          .uploadedBy
                          .name
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 border-t border-slate-100 bg-slate-50/70 p-4 sm:p-5">
              <button
                type="button"
                onClick={() =>
                  setSelectedDocument(null)
                }
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Close
              </button>

              <a
                href={
                  selectedDocument.fileUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-navy px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-navy/90"
              >
                <ArrowDownToLine
                  size={17}
                />

                Open Document
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}