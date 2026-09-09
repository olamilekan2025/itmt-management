"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  Filter,
  GraduationCap,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import CoursesSearch from "./courses-search";
import CourseCard from "./course-card";

import type { Course } from "@/lib/courses";
import { getPublicCourses } from "@/lib/courses";

export default function CoursesOverview() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");

  useEffect(() => {
    loadCourses();
  }, [search, level]);

  async function loadCourses() {
    try {
      setLoading(true);
      setError(null);

      const response = await getPublicCourses({
        search: search || undefined,
        level: level || undefined,
      });

      setCourses(response.courses ?? []);
    } catch (err) {
      console.error("Failed to load courses:", err);
      setError("Unable to load courses");
    } finally {
      setLoading(false);
    }
  }

  const hasActiveFilters = Boolean(search || level);
  const hasCourses = courses.length > 0;

  function clearFilters() {
    setSearch("");
    setLevel("");
  }

  return (
    <section
      id="course-catalog"
      className="relative overflow-hidden border-t border-slate-200/70 bg-slate-50/70 py-20 sm:py-24"
    >
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 top-20 h-80 w-80 rounded-full bg-brand-blue/5 blur-3xl" />
        <div className="absolute -left-32 bottom-20 h-80 w-80 rounded-full bg-brand-gold/5 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-navy/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-navy shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-brand-gold" />
            Academic course catalogue
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl lg:text-5xl">
            Explore our{" "}
            <span className="text-brand-blue">courses</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Browse courses across ITMT&apos;s academic programmes, levels and
            semesters. Use the search and filters to quickly find the
            information you need.
          </p>
        </div>

        {/* Search / filters */}
        <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="min-w-0 flex-1">
              <CoursesSearch
                onSearchChange={setSearch}
                search={search}
              />
            </div>

            {/* Level filter */}
            <div className="relative lg:w-56">
              <div className="pointer-events-none absolute inset-y-0 left-4 z-10 flex items-center">
                <GraduationCap className="h-4 w-4 text-slate-400" />
              </div>

              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                aria-label="Filter courses by level"
                className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/70 pl-11 pr-10 text-sm font-medium text-slate-700 outline-none transition-all hover:border-slate-300 focus:border-brand-navy focus:bg-white focus:ring-4 focus:ring-brand-navy/10"
              >
                <option value="">All levels</option>
                <option value="ND 1">ND 1</option>
                <option value="ND 2">ND 2</option>
                <option value="100">100 Level</option>
                <option value="200">200 Level</option>
                <option value="300">300 Level</option>
                <option value="400">400 Level</option>
                <option value="500">500 Level</option>
              </select>

              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                <SlidersHorizontal className="h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <Button
                type="button"
                variant="outline"
                onClick={clearFilters}
                className="h-12 shrink-0 rounded-xl border-slate-200 px-5 font-semibold text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-brand-navy"
              >
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          {/* Filter summary */}
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Filter className="h-3.5 w-3.5" />
              {hasActiveFilters ? "Active filters" : "Course directory"}
            </div>

            {search && (
              <span className="rounded-full bg-brand-navy/5 px-3 py-1 text-xs font-semibold text-brand-navy">
                Search: {search}
              </span>
            )}

            {level && (
              <span className="rounded-full bg-brand-blue/5 px-3 py-1 text-xs font-semibold text-brand-blue">
                Level: {level}
              </span>
            )}

            {!loading && !error && (
              <span className="ml-auto text-xs font-medium text-slate-400">
                {courses.length} {courses.length === 1 ? "course" : "courses"}
              </span>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card
                key={index}
                className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm"
              >
                <CardHeader className="space-y-4 p-6">
                  <div className="flex items-center justify-between">
                    <div className="h-7 w-20 animate-pulse rounded-full bg-slate-200" />
                    <div className="h-7 w-16 animate-pulse rounded-full bg-slate-100" />
                  </div>

                  <div className="space-y-2">
                    <div className="h-6 w-4/5 animate-pulse rounded-md bg-slate-200" />
                    <div className="h-4 w-2/3 animate-pulse rounded-md bg-slate-100" />
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 px-6 pb-6">
                  <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />

                  <div className="flex gap-2 pt-2">
                    <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-100" />
                    <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-100" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <Card className="overflow-hidden rounded-2xl border-red-200 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center px-6 py-16 text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-100 bg-red-50">
                <AlertCircle className="h-7 w-7 text-red-500" />
              </div>

              <h3 className="text-xl font-bold text-brand-navy">
                Unable to load courses
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                We couldn&apos;t retrieve the course catalogue at the moment.
                Please check your connection and try again.
              </p>

              <Button
                onClick={loadCourses}
                className="mt-7 rounded-xl bg-brand-navy px-6 font-semibold text-white shadow-sm transition-all hover:bg-brand-navy/90 hover:shadow-md"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* No courses configured */}
        {!loading && !error && !hasCourses && !hasActiveFilters && (
          <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center px-6 py-20 text-center">
              <div className="relative mb-7">
                <div className="absolute inset-0 rounded-2xl bg-brand-blue/10 blur-xl" />

                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-brand-blue/10 bg-brand-blue/5">
                  <BookOpen className="h-9 w-9 text-brand-navy" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-brand-navy">
                Course catalogue is being prepared
              </h3>

              <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
                Course information will appear here as academic programmes,
                semesters and courses are configured by the institution.
              </p>
            </CardContent>
          </Card>
        )}

        {/* No search results */}
        {!loading && !error && !hasCourses && hasActiveFilters && (
          <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center px-6 py-20 text-center">
              <div className="mb-7 flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
                <Search className="h-8 w-8 text-slate-400" />
              </div>

              <h3 className="text-xl font-bold text-brand-navy">
                No matching courses
              </h3>

              <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
                We couldn&apos;t find any courses matching your current search
                or level filter. Try broadening your criteria.
              </p>

              <Button
                onClick={clearFilters}
                variant="outline"
                className="mt-7 rounded-xl border-slate-200 px-6 font-semibold text-brand-navy hover:bg-slate-50"
              >
                Clear filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Course grid */}
        {!loading && !error && hasCourses && (
          <>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-brand-navy">
                  Available courses
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Browse the academic offerings below.
                </p>
              </div>

              <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 shadow-sm sm:flex">
                <BookOpen className="h-3.5 w-3.5" />
                {courses.length} {courses.length === 1 ? "course" : "courses"}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

