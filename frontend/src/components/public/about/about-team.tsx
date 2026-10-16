
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Search, Users } from "lucide-react";

type Group = "management" | "staff";

interface TeamMember {
  _id: string;
  name: string;
  badge?: string;
  title?: string;
  group: Group;
  imageUrl?: string;
  bio?: string;
  department?: string;
  email?: string;
  phone?: string;
  cvUrl?: string;
  cvFileName?: string;
  order?: number;
}

interface TeamApiResponse {
  success: boolean;
  data: TeamMember[];
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

const tabs: { id: Group; label: string }[] = [
  { id: "management", label: "Management" },
  { id: "staff", label: "Staff" },
];

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

function TeamCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
    >
      <div className="aspect-[4/3] animate-pulse bg-slate-100" />

      <div className="space-y-3 p-4 sm:p-5">
        <div className="h-5 w-3/4 animate-pulse rounded-md bg-slate-100" />
        <div className="h-5 w-24 animate-pulse rounded-full bg-slate-100" />
        <div className="h-4 w-1/2 animate-pulse rounded-md bg-slate-100" />
        <div className="mt-4 h-px w-full bg-slate-100" />
        <div className="flex items-center justify-between">
          <div className="h-4 w-28 animate-pulse rounded-md bg-slate-100" />
          <div className="h-9 w-9 animate-pulse rounded-full bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

function TeamEmptyState({ active }: { active: Group }) {
  const management = active === "management";

  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-5 py-12 text-center sm:py-14">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#1B2847]/[0.06] text-[#1B2847]">
        <Users size={23} />
      </div>

      <h3 className="mt-4 text-lg font-bold text-[#1B2847]">
        {management ? "Our management team" : "Our staff team"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        No published profiles are available in this category yet.
      </p>
    </div>
  );
}

export default function AboutTeam() {
  const [active, setActive] = useState<Group>("management");
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [search, setSearch] = useState("");

  const loadTeam = useCallback(async (signal: AbortSignal) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(TEAM_API_URL, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal,
        cache: "no-store",
      });

      const contentType = response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error(
          "The team API returned an unexpected response. Check that the backend is running and /api/team is registered.",
        );
      }

      const result = (await response.json()) as TeamApiResponse;

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message ||
            result.error ||
            `Unable to load team members (HTTP ${response.status}).`,
        );
      }

      if (!Array.isArray(result.data)) {
        throw new Error("The server returned an invalid team response.");
      }

      setTeam(
        result.data.filter(
          (member) =>
            member &&
            typeof member._id === "string" &&
            typeof member.name === "string" &&
            (member.group === "management" || member.group === "staff"),
        ),
      );
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;

      console.error("[AboutTeam] Failed to load team:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load our team right now.",
      );
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void loadTeam(controller.signal);

    return () => controller.abort();
  }, [loadTeam, retryCount]);

  const managementCount = team.filter(
    (member) => member.group === "management",
  ).length;

  const staffCount = team.filter(
    (member) => member.group === "staff",
  ).length;

  const members = useMemo(() => {
    const query = search.trim().toLowerCase();

    return team
      .filter((member) => member.group === active)
      .filter((member) => {
        if (!query) return true;

        return [
          member.name,
          member.title,
          member.badge,
          member.department,
        ].some((value) => value?.toLowerCase().includes(query));
      })
      .sort(
        (a, b) =>
          (a.order ?? 0) - (b.order ?? 0) ||
          a.name.localeCompare(b.name),
      );
  }, [team, active, search]);

  return (
    <section
      aria-labelledby="team-heading"
      className="relative overflow-hidden bg-white py-14 sm:py-16 lg:py-20"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C8A951]/50 to-transparent" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Section heading */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#C8A951]/30 bg-[#C8A951]/[0.08] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#1B2847] sm:text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C8A951]" />
            The people behind ITMT
          </span>

          <h2
            id="team-heading"
            className="mt-4 text-3xl font-bold tracking-[-0.04em] text-[#1B2847] sm:text-4xl lg:text-[2.75rem]"
          >
            Meet Our Team
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
            Get to know the people whose profiles have been published by ITMT
            Academy.
          </p>
        </div>

        {/* Category tabs */}
        <div
          role="tablist"
          aria-label="Team groups"
          className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-1 rounded-xl border border-slate-200/80 bg-slate-50 p-1"
        >
          {tabs.map((tab) => {
            const selected = active === tab.id;
            const count =
              tab.id === "management" ? managementCount : staffCount;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`team-tab-${tab.id}`}
                aria-selected={selected}
                aria-controls="team-panel"
                onClick={() => setActive(tab.id)}
                className={`flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A951] focus-visible:ring-offset-2 ${
                  selected
                    ? "bg-[#1B2847] text-white shadow-sm"
                    : "text-slate-600 hover:bg-white hover:text-[#1B2847]"
                }`}
              >
                {tab.label}

                {!loading && !error && (
                  <span
                    className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      selected
                        ? "bg-white/15 text-[#D8BD6A]"
                        : "bg-slate-200/70 text-slate-600"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Team content */}
        <div
          role="tabpanel"
          id="team-panel"
          aria-labelledby={`team-tab-${active}`}
          className="mx-auto mt-6 max-w-6xl outline-none"
        >
          {!loading && !error && team.length > 0 && (
            <div className="relative mx-auto mb-5 max-w-sm">
              <Search
                size={16}
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search team members"
                placeholder="Search by name, role or department..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#C8A951] focus:ring-4 focus:ring-[#C8A951]/10"
              />
            </div>
          )}

          {loading ? (
            <div
              aria-label="Loading team members"
              aria-busy="true"
              className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
            >
              {Array.from({ length: 3 }).map((_, index) => (
                <TeamCardSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <div
              className="rounded-2xl border border-red-200 bg-red-50 px-5 py-9 text-center"
              role="alert"
            >
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-700">
                <span className="text-xl font-bold">!</span>
              </div>

              <p className="mt-3 font-semibold text-red-800">
                We couldn&apos;t load the team.
              </p>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-red-700">
                {error}
              </p>

              <button
                type="button"
                onClick={() => setRetryCount((count) => count + 1)}
                className="mt-4 inline-flex min-h-10 items-center justify-center rounded-xl bg-[#1B2847] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#26385F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A951] focus-visible:ring-offset-2"
              >
                Try again
              </button>
            </div>
          ) : members.length === 0 ? (
            <TeamEmptyState active={active} />
          ) : (
            <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {members.map((member) => (
                <Link
                  key={member._id}
                  href={`/team/${encodeURIComponent(member._id)}`}
                  aria-label={`View profile of ${member.name}`}
                  className="group block min-w-0 overflow-hidden self-start rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_4px_rgba(15,23,42,0.03),0_12px_28px_-18px_rgba(15,23,42,0.18)] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[#C8A951]/60 hover:shadow-[0_18px_36px_-20px_rgba(15,23,42,0.24)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A951] focus-visible:ring-offset-4"
                >
                  {/* Compact portrait */}
                  <div className="relative aspect-[4/3] h-60 w-full overflow-hidden bg-slate-100">
                    {member.imageUrl ? (
                      <img
                        src={member.imageUrl}
                        alt={`Portrait of ${member.name}`}
                        loading="lazy"
                        decoding="async"
                        className="h-60 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1B2847] to-[#3B527E]">
                        <span className="text-4xl font-bold tracking-wide text-[#D8BD6A] sm:text-5xl">
                          {initials(member.name)}
                        </span>
                      </div>
                    )}

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#1B2847]/30 to-transparent" />

                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-[#1B2847]/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white shadow-sm backdrop-blur-md sm:text-[10px]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#D8BD6A]" />
                      {member.group === "management" ? "Management" : "Staff"}
                    </span>
                  </div>

                  {/* Compact card content */}
                  <div className="p-4 sm:p-5 h-50">
                    <h3 className="line-clamp-2 break-words text-sl font-bold leading-snug tracking-[-0.02em] text-[#1B2847] transition-colors group-hover:text-[#3B527E]">
                      {member.name}
                    </h3>

                    {member.badge?.trim() && (
                      <span className="mt-2.5 inline-flex max-w-full items-center gap-1.5 rounded-full bg-[#1B2847] px-2.5 py-1 text-[11px] font-semibold text-white">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#D8BD6A]" />
                        <span className="break-words">{member.badge}</span>
                      </span>
                    )}

                    {member.title?.trim() && (
                      <p className="mt-2 line-clamp-2 break-words text-sm leading-5 text-slate-600">
                        {member.title}
                      </p>
                    )}

                    {member.department?.trim() && (
                      <p className="mt-1.5 line-clamp-1 break-words text-xs font-medium text-slate-500">
                        {member.department}
                      </p>
                    )}

                    <div className="mt-4 h-px w-full bg-gradient-to-r from-[#C8A951]/50 via-slate-200 to-transparent" />

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-[#1B2847]">
                        View full profile
                      </span>

                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-[#1B2847] transition-colors group-hover:border-[#C8A951] group-hover:bg-[#C8A951]">
                        <ArrowRight size={17} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
