"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Briefcase,
  Building2,
  Download,
  FileText,
  Mail,
  Phone,
  Users,
} from "lucide-react";

type TeamGroup = "management" | "staff";

interface TeamMember {
  _id: string;
  name: string;
  badge?: string;
  title?: string;
  group: TeamGroup;
  imageUrl?: string;
  bio?: string;
  department?: string;
  email?: string;
  phone?: string;
  cvUrl?: string;
  cvFileName?: string;
}

interface TeamApiResponse {
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

const API_BASE_URL = API_ROOT.endsWith("/api") ? API_ROOT : `${API_ROOT}/api`;

const TEAM_API_URL = `${API_BASE_URL}/team`;

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

async function readTeamResponse(response: Response): Promise<TeamApiResponse> {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    const body = await response.text().catch(() => "");

    if (!response.ok) {
      throw new Error(
        `Unable to load the team profile (HTTP ${response.status}). Check the API URL and server.`,
      );
    }

    throw new Error(
      body.includes("<!DOCTYPE") || body.includes("<html")
        ? "The team API returned an HTML page instead of JSON. Check your backend URL."
        : "The team API returned an unexpected response.",
    );
  }

  return (await response.json()) as TeamApiResponse;
}

function isTeamMember(value: unknown): value is TeamMember {
  if (!value || typeof value !== "object") return false;

  const item = value as Partial<TeamMember>;

  return (
    typeof item._id === "string" &&
    typeof item.name === "string" &&
    (item.group === "management" || item.group === "staff")
  );
}

export default function TeamMemberProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [member, setMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMember = useCallback(
    async (signal: AbortSignal) => {
      setLoading(true);
      setError("");
      setMember(null);

      try {
        if (!id || typeof id !== "string") {
          throw new Error("A valid team member ID is required.");
        }

        const response = await fetch(TEAM_API_URL, {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
          signal,
        });

        const result = await readTeamResponse(response);

        if (!response.ok || result.success === false) {
          throw new Error(
            result.message ||
              result.error ||
              `Unable to load team members (HTTP ${response.status}).`,
          );
        }

        // The backend may return either:
        // { success: true, data: [...] }
        // { success: true, members: [...] }
        const teamMembers = Array.isArray(result.data)
          ? result.data
          : result.members;

        if (!Array.isArray(teamMembers)) {
          throw new Error(
            "The team API response is missing its data array. Expected { success: true, data: [...] }.",
          );
        }

        const selectedMember = teamMembers
          .filter(isTeamMember)
          .find((item) => item._id === id);

        if (!selectedMember) {
          throw new Error(
            "This team member could not be found or is no longer published.",
          );
        }

        if (!signal.aborted) {
          setMember(selectedMember);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        if (!signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load this profile. Please try again.",
          );
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    },
    [id],
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadMember(controller.signal);
    return () => controller.abort();
  }, [loadMember]);

  const groupLabel =
    member?.group === "management"
      ? "Management"
      : member?.group === "staff"
        ? "Staff"
        : "";

  const email = member?.email?.trim();
  const phone = member?.phone?.trim();
  const department = member?.department?.trim();
  const position = member?.title?.trim();
  const badge = member?.badge?.trim();
  const cvUrl = member?.cvUrl?.trim();

  const hasDetails = Boolean(position || department);
  const hasContact = Boolean(email || phone);

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-slate-800">
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
        {/* Breadcrumb */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 sm:mb-8">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-sm"
          >
            <Link
              href="/about"
              className="font-medium text-slate-500 transition-colors hover:text-brand-navy"
            >
              About Us
            </Link>
            <span aria-hidden="true" className="text-slate-300">
              /
            </span>
            <span className="font-semibold text-brand-navy">
              {loading ? "Team Profile" : groupLabel || "Team Profile"}
            </span>
          </nav>

          <Link
            href="/about"
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-brand-navy shadow-sm transition-all hover:border-brand-gold/60 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            Back to team
          </Link>
        </div>

        {loading ? (
          <div
            aria-label="Loading team member profile"
            aria-busy="true"
            className="space-y-6"
          >
            <div className="grid gap-8 rounded-3xl bg-brand-navy/90 p-6 sm:p-8 lg:grid-cols-[340px_1fr] lg:gap-12 lg:p-10">
              <div className="aspect-[4/4.6] animate-pulse rounded-2xl bg-white/10" />
              <div className="space-y-5 self-center">
                <div className="h-6 w-40 animate-pulse rounded-full bg-white/10" />
                <div className="h-14 w-3/4 animate-pulse rounded-lg bg-white/10" />
                <div className="h-6 w-1/3 animate-pulse rounded bg-white/10" />
                <div className="h-12 w-56 animate-pulse rounded-lg bg-white/10" />
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-12">
              <div className="h-56 animate-pulse rounded-2xl bg-slate-200/70 lg:col-span-8" />
              <div className="h-56 animate-pulse rounded-2xl bg-slate-200/70 lg:col-span-4" />
            </div>
          </div>
        ) : error || !member ? (
          <div
            role="alert"
            className="mx-auto max-w-xl rounded-3xl border border-slate-200 border-t-[3px] border-t-brand-gold bg-white px-6 py-14 text-center shadow-[0_20px_50px_-28px_rgba(15,23,42,0.25)] sm:px-10"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy/[0.06] text-brand-navy">
              <Users size={26} strokeWidth={1.7} aria-hidden="true" />
            </div>

            <h1 className="mt-5 text-2xl font-bold tracking-[-0.02em] text-brand-navy">
              Profile unavailable
            </h1>

            <p className="mx-auto mt-3 max-w-md break-words text-sm leading-7 text-slate-600">
              {error || "This profile could not be found."}
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  const controller = new AbortController();
                  void loadMember(controller.signal);
                }}
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-brand-navy transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
              >
                Try again
              </button>

              <Link
                href="/about"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-navy px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
              >
                <ArrowLeft size={15} aria-hidden="true" />
                Return to About Us
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6 lg:space-y-8">
            {/* Hero */}
            <header className="relative isolate overflow-hidden rounded-3xl bg-brand-navy p-6 shadow-[0_40px_90px_-40px_rgba(15,23,42,0.6)] sm:p-8 lg:p-10">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10"
              >
                <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/[0.07]" />
                <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full border border-brand-gold/20" />
                <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-brand-gold/[0.14] blur-3xl" />
                <div className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-brand-blue/[0.35] blur-3xl" />
                <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
              </div>

              <div className="grid items-center gap-8 lg:grid-cols-[340px_1fr] lg:gap-14">
                {/* Portrait */}
                <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
                  <div
                    aria-hidden="true"
                    className="absolute -bottom-3 -right-3 h-full w-full rounded-2xl border border-brand-gold/40"
                  />
                  <div className="relative aspect-[4/4.6] overflow-hidden rounded-2xl bg-brand-blue ring-1 ring-white/15">
                    {member.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={member.imageUrl}
                        alt={`Portrait of ${member.name}`}
                        className="h-full w-full object-cover object-center"
                        decoding="async"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-blue to-brand-navy">
                        <span className="text-7xl font-bold tracking-tight text-brand-gold sm:text-8xl">
                          {getInitials(member.name)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Identity */}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-brand-gold/40 bg-brand-gold/10 px-3.5 py-1.5 text-sm font-semibold text-brand-gold">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
                      {groupLabel}
                    </span>

                    {badge && (
                      <span className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-sm font-medium text-white/85">
                        {badge}
                      </span>
                    )}
                  </div>

                  <h1 className="mt-5 break-words text-4xl font-bold leading-[1.05] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                    {member.name}
                  </h1>

                  {position && (
                    <p className="mt-3 break-words text-lg font-medium text-brand-gold sm:text-xl">
                      {position}
                    </p>
                  )}

                  {department && (
                    <p className="mt-3 flex items-center gap-2.5 text-base text-slate-300">
                      <Building2
                        size={18}
                        aria-hidden="true"
                        className="shrink-0 text-brand-gold"
                      />
                      <span className="break-words">{department}</span>
                    </p>
                  )}

                  {(email || cvUrl) && (
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      {email && (
                        <a
                          href={`mailto:${email}`}
                          className="group inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-brand-gold px-6 text-sm font-semibold text-brand-navy shadow-[0_12px_30px_-12px_rgba(200,169,81,0.7)] transition-all hover:-translate-y-0.5 hover:bg-[#D6B965] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy"
                        >
                          <Mail size={16} aria-hidden="true" />
                          Send an email
                        </a>
                      )}

                      {cvUrl && (
                        <a
                          href={cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/[0.06] px-6 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy"
                        >
                          <Download size={16} aria-hidden="true" />
                          View CV
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Body */}
            <div className="grid items-start gap-6 lg:grid-cols-12 lg:gap-8">
              {/* Biography */}
              <section className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-[0_2px_4px_rgba(15,23,42,0.03),0_16px_36px_-18px_rgba(15,23,42,0.15)] sm:p-9 lg:col-span-8">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="h-7 w-1 rounded-full bg-brand-gold"
                  />
                  <h2 className="text-2xl font-bold tracking-[-0.025em] text-brand-navy">
                    Biography
                  </h2>
                </div>

                {member.bio?.trim() ? (
                  <p className="mt-6 whitespace-pre-line break-words text-base leading-8 text-slate-600 sm:text-[17px] sm:leading-9">
                    {member.bio}
                  </p>
                ) : (
                  <p className="mt-6 text-base leading-8 text-slate-500">
                    A biography has not been added to this profile yet.
                  </p>
                )}
              </section>

              {/* Side column */}
              <aside className="space-y-6 lg:col-span-4">
                {hasDetails && (
                  <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_4px_rgba(15,23,42,0.03),0_14px_32px_-18px_rgba(15,23,42,0.14)]">
                    <h2 className="text-base font-bold text-brand-navy">
                      At a glance
                    </h2>

                    <dl className="mt-5 space-y-5">
                      {position && (
                        <div className="flex items-start gap-3.5">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/[0.06] text-brand-navy">
                            <Briefcase size={18} aria-hidden="true" />
                          </span>
                          <div className="min-w-0">
                            <dt className="text-xs font-medium text-slate-500">
                              Position
                            </dt>
                            <dd className="mt-0.5 break-words text-[15px] font-semibold text-brand-navy">
                              {position}
                            </dd>
                          </div>
                        </div>
                      )}

                      {department && (
                        <div className="flex items-start gap-3.5">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/[0.06] text-brand-navy">
                            <Building2 size={18} aria-hidden="true" />
                          </span>
                          <div className="min-w-0">
                            <dt className="text-xs font-medium text-slate-500">
                              Department
                            </dt>
                            <dd className="mt-0.5 break-words text-[15px] font-semibold text-brand-navy">
                              {department}
                            </dd>
                          </div>
                        </div>
                      )}
                    </dl>
                  </section>
                )}

                {hasContact && (
                  <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_2px_4px_rgba(15,23,42,0.03),0_14px_32px_-18px_rgba(15,23,42,0.14)]">
                    <div className="px-6 pb-2 pt-6">
                      <h2 className="text-base font-bold text-brand-navy">
                        Contact
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Get in touch with this team member.
                      </p>
                    </div>

                    <div className="divide-y divide-slate-100 px-6 pb-2">
                      {email && (
                        <a
                          href={`mailto:${email}`}
                          className="group flex min-w-0 items-center gap-3.5 py-4"
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/[0.06] text-brand-navy transition-colors group-hover:bg-brand-navy group-hover:text-brand-gold">
                            <Mail size={18} aria-hidden="true" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-xs font-medium text-slate-500">
                              Email
                            </span>
                            <span className="mt-0.5 block break-all text-sm font-semibold text-brand-navy">
                              {email}
                            </span>
                          </span>
                          <ArrowUpRight
                            size={16}
                            aria-hidden="true"
                            className="shrink-0 text-slate-300 transition-colors group-hover:text-brand-gold"
                          />
                        </a>
                      )}

                      {phone && (
                        <a
                          href={`tel:${phone.replace(/[^\d+*#,;]/g, "")}`}
                          className="group flex min-w-0 items-center gap-3.5 py-4"
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-navy/[0.06] text-brand-navy transition-colors group-hover:bg-brand-navy group-hover:text-brand-gold">
                            <Phone size={18} aria-hidden="true" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-xs font-medium text-slate-500">
                              Phone
                            </span>
                            <span className="mt-0.5 block break-words text-sm font-semibold text-brand-navy">
                              {phone}
                            </span>
                          </span>
                          <ArrowUpRight
                            size={16}
                            aria-hidden="true"
                            className="shrink-0 text-slate-300 transition-colors group-hover:text-brand-gold"
                          />
                        </a>
                      )}
                    </div>
                  </section>
                )}

                {cvUrl && (
                  <section className="rounded-3xl border border-slate-200/80 border-l-[3px] border-l-brand-gold bg-white p-6 shadow-[0_2px_4px_rgba(15,23,42,0.03),0_14px_32px_-18px_rgba(15,23,42,0.14)]">
                    <div className="flex items-start gap-3.5">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-gold/15 text-[#8A6D1F]">
                        <FileText size={20} aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <h2 className="text-base font-bold text-brand-navy">
                          Curriculum Vitae
                        </h2>
                        <p className="mt-1 break-all text-sm text-slate-500">
                          {member.cvFileName || "Professional résumé"}
                        </p>
                      </div>
                    </div>

                    <a
                      href={cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-navy text-sm font-semibold text-white transition-colors hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
                    >
                      <Download size={16} aria-hidden="true" />
                      View CV
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </a>
                  </section>
                )}
              </aside>
            </div>

            {/* Footer link */}
            <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-6">
              <Link
                href="/about"
                className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-brand-navy transition-colors hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
              >
                <ArrowLeft size={16} aria-hidden="true" />
                Return to team directory
              </Link>

              <span className="text-sm text-slate-400">ITMT Academy</span>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}