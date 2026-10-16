// "use client";

// import { useEffect, useState } from "react";
// import {
//   AlertCircle,
//   BookOpen,
//   Filter,
//   GraduationCap,
//   RefreshCw,
//   Search,
//   SlidersHorizontal,
//   Sparkles,
//   X,
// } from "lucide-react";

// import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";

// import CoursesSearch from "./courses-search";
// import CourseCard from "./course-card";

// import type { Course } from "@/lib/courses";
// import { getPublicCourses } from "@/lib/courses";

// export default function CoursesOverview() {
//   const [courses, setCourses] = useState<Course[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const [search, setSearch] = useState("");
//   const [level, setLevel] = useState("");

//   useEffect(() => {
//     loadCourses();
//   }, [search, level]);

//   async function loadCourses() {
//     try {
//       setLoading(true);
//       setError(null);

//       const response = await getPublicCourses({
//         search: search || undefined,
//         level: level || undefined,
//       });

//       setCourses(response.courses ?? []);
//     } catch (err) {
//       console.error("Failed to load courses:", err);
//       setError("Unable to load courses");
//     } finally {
//       setLoading(false);
//     }
//   }

//   const hasActiveFilters = Boolean(search || level);
//   const hasCourses = courses.length > 0;

//   function clearFilters() {
//     setSearch("");
//     setLevel("");
//   }

//   return (
//     <section
//       id="course-catalog"
//       className="relative overflow-hidden border-t border-slate-200/70 bg-slate-50/70 py-20 sm:py-24"
//     >
//       {/* Decorative background */}
//       <div className="pointer-events-none absolute inset-0 overflow-hidden">
//         <div className="absolute -right-32 top-20 h-80 w-80 rounded-full bg-brand-blue/5 blur-3xl" />
//         <div className="absolute -left-32 bottom-20 h-80 w-80 rounded-full bg-brand-gold/5 blur-3xl" />

//         <div
//           className="absolute inset-0 opacity-[0.025]"
//           style={{
//             backgroundImage:
//               "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
//             backgroundSize: "40px 40px",
//           }}
//         />
//       </div>

//       <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//         {/* Section heading */}
//         <div className="mx-auto mb-12 max-w-3xl text-center">
//           <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-navy/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-navy shadow-sm">
//             <Sparkles className="h-3.5 w-3.5 text-brand-gold" />
//             Academic course catalogue
//           </div>

//           <h2 className="text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl lg:text-5xl">
//             Explore our{" "}
//             <span className="text-brand-blue">courses</span>
//           </h2>

//           <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
//             Browse courses across ITMT&apos;s academic programmes, levels and
//             semesters. Use the search and filters to quickly find the
//             information you need.
//           </p>
//         </div>

//         {/* Search / filters */}
//         <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
//           <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
//             {/* Search */}
//             <div className="min-w-0 flex-1">
//               <CoursesSearch
//                 onSearchChange={setSearch}
//                 search={search}
//               />
//             </div>

//             {/* Level filter */}
//             <div className="relative lg:w-56">
//               <div className="pointer-events-none absolute inset-y-0 left-4 z-10 flex items-center">
//                 <GraduationCap className="h-4 w-4 text-slate-400" />
//               </div>

//               <select
//                 value={level}
//                 onChange={(e) => setLevel(e.target.value)}
//                 aria-label="Filter courses by level"
//                 className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/70 pl-11 pr-10 text-sm font-medium text-slate-700 outline-none transition-all hover:border-slate-300 focus:border-brand-navy focus:bg-white focus:ring-4 focus:ring-brand-navy/10"
//               >
//                 <option value="">All levels</option>
//                 <option value="ND 1">ND 1</option>
//                 <option value="ND 2">ND 2</option>
//                 <option value="100">100 Level</option>
//                 <option value="200">200 Level</option>
//                 <option value="300">300 Level</option>
//                 <option value="400">400 Level</option>
//                 <option value="500">500 Level</option>
//               </select>

//               <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
//                 <SlidersHorizontal className="h-4 w-4 text-slate-400" />
//               </div>
//             </div>

//             {/* Clear filters */}
//             {hasActiveFilters && (
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={clearFilters}
//                 className="h-12 shrink-0 rounded-xl border-slate-200 px-5 font-semibold text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-brand-navy"
//               >
//                 <X className="mr-2 h-4 w-4" />
//                 Clear
//               </Button>
//             )}
//           </div>

//           {/* Filter summary */}
//           <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
//             <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
//               <Filter className="h-3.5 w-3.5" />
//               {hasActiveFilters ? "Active filters" : "Course directory"}
//             </div>

//             {search && (
//               <span className="rounded-full bg-brand-navy/5 px-3 py-1 text-xs font-semibold text-brand-navy">
//                 Search: {search}
//               </span>
//             )}

//             {level && (
//               <span className="rounded-full bg-brand-blue/5 px-3 py-1 text-xs font-semibold text-brand-blue">
//                 Level: {level}
//               </span>
//             )}

//             {!loading && !error && (
//               <span className="ml-auto text-xs font-medium text-slate-400">
//                 {courses.length} {courses.length === 1 ? "course" : "courses"}
//               </span>
//             )}
//           </div>
//         </div>

//         {/* Loading */}
//         {loading && (
//           <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
//             {Array.from({ length: 6 }).map((_, index) => (
//               <Card
//                 key={index}
//                 className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm"
//               >
//                 <CardHeader className="space-y-4 p-6">
//                   <div className="flex items-center justify-between">
//                     <div className="h-7 w-20 animate-pulse rounded-full bg-slate-200" />
//                     <div className="h-7 w-16 animate-pulse rounded-full bg-slate-100" />
//                   </div>

//                   <div className="space-y-2">
//                     <div className="h-6 w-4/5 animate-pulse rounded-md bg-slate-200" />
//                     <div className="h-4 w-2/3 animate-pulse rounded-md bg-slate-100" />
//                   </div>
//                 </CardHeader>

//                 <CardContent className="space-y-4 px-6 pb-6">
//                   <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
//                   <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />

//                   <div className="flex gap-2 pt-2">
//                     <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-100" />
//                     <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-100" />
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         )}

//         {/* Error */}
//         {!loading && error && (
//           <Card className="overflow-hidden rounded-2xl border-red-200 bg-white shadow-sm">
//             <CardContent className="flex flex-col items-center px-6 py-16 text-center">
//               <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-100 bg-red-50">
//                 <AlertCircle className="h-7 w-7 text-red-500" />
//               </div>

//               <h3 className="text-xl font-bold text-brand-navy">
//                 Unable to load courses
//               </h3>

//               <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
//                 We couldn&apos;t retrieve the course catalogue at the moment.
//                 Please check your connection and try again.
//               </p>

//               <Button
//                 onClick={loadCourses}
//                 className="mt-7 rounded-xl bg-brand-navy px-6 font-semibold text-white shadow-sm transition-all hover:bg-brand-navy/90 hover:shadow-md"
//               >
//                 <RefreshCw className="mr-2 h-4 w-4" />
//                 Try again
//               </Button>
//             </CardContent>
//           </Card>
//         )}

//         {/* No courses configured */}
//         {!loading && !error && !hasCourses && !hasActiveFilters && (
//           <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
//             <CardContent className="flex flex-col items-center px-6 py-20 text-center">
//               <div className="relative mb-7">
//                 <div className="absolute inset-0 rounded-2xl bg-brand-blue/10 blur-xl" />

//                 <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-brand-blue/10 bg-brand-blue/5">
//                   <BookOpen className="h-9 w-9 text-brand-navy" />
//                 </div>
//               </div>

//               <h3 className="text-xl font-bold text-brand-navy">
//                 Course catalogue is being prepared
//               </h3>

//               <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
//                 Course information will appear here as academic programmes,
//                 semesters and courses are configured by the institution.
//               </p>
//             </CardContent>
//           </Card>
//         )}

//         {/* No search results */}
//         {!loading && !error && !hasCourses && hasActiveFilters && (
//           <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
//             <CardContent className="flex flex-col items-center px-6 py-20 text-center">
//               <div className="mb-7 flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
//                 <Search className="h-8 w-8 text-slate-400" />
//               </div>

//               <h3 className="text-xl font-bold text-brand-navy">
//                 No matching courses
//               </h3>

//               <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
//                 We couldn&apos;t find any courses matching your current search
//                 or level filter. Try broadening your criteria.
//               </p>

//               <Button
//                 onClick={clearFilters}
//                 variant="outline"
//                 className="mt-7 rounded-xl border-slate-200 px-6 font-semibold text-brand-navy hover:bg-slate-50"
//               >
//                 Clear filters
//               </Button>
//             </CardContent>
//           </Card>
//         )}

//         {/* Course grid */}
//         {!loading && !error && hasCourses && (
//           <>
//             <div className="mb-5 flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-semibold text-brand-navy">
//                   Available courses
//                 </p>
//                 <p className="mt-1 text-xs text-slate-500">
//                   Browse the academic offerings below.
//                 </p>
//               </div>

//               <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 shadow-sm sm:flex">
//                 <BookOpen className="h-3.5 w-3.5" />
//                 {courses.length} {courses.length === 1 ? "course" : "courses"}
//               </div>
//             </div>

//             <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
//               {courses.map((course) => (
//                 <CourseCard
//                   key={course._id}
//                   course={course}
//                 />
//               ))}
//             </div>
//           </>
//         )}
//       </div>
//     </section>
//   );
// }



"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  GraduationCap,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import CoursesSearch from "./courses-search";
import CourseCard from "./course-card";

import type { Course } from "@/lib/courses";
import { getPublicCourses } from "@/lib/courses";

const INITIAL_COURSE_LIMIT = 3;

const levels = [
  { value: "ND 1", label: "ND 1" },
  { value: "ND 2", label: "ND 2" },
  { value: "100", label: "100 Level" },
  { value: "200", label: "200 Level" },
  { value: "300", label: "300 Level" },
  { value: "400", label: "400 Level" },
  { value: "500", label: "500 Level" },
];

export default function CoursesOverview() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [showAllCourses, setShowAllCourses] = useState(false);

  // Prevent stale requests from overwriting newer results.
  const requestId = useRef(0);

  const loadCourses = useCallback(async () => {
    const current = ++requestId.current;

    try {
      setLoading(true);
      setError(null);

      const response = await getPublicCourses({
        search: search.trim() || undefined,
        level: level || undefined,
      });

      if (current !== requestId.current) return;

      setCourses(response.courses ?? []);
    } catch (err) {
      if (current !== requestId.current) return;

      console.error("Failed to load courses:", err);
      setError("Unable to load courses");
      setCourses([]);
    } finally {
      if (current === requestId.current) {
        setLoading(false);
      }
    }
  }, [search, level]);

  useEffect(() => {
    void loadCourses();

    return () => {
      // Invalidate an in-flight request when dependencies change or
      // the component unmounts.
      requestId.current += 1;
    };
  }, [loadCourses]);

  const hasActiveFilters = Boolean(search.trim() || level);
  const hasCourses = courses.length > 0;

  const countLabel = `${courses.length} ${
    courses.length === 1 ? "course" : "courses"
  }`;

  // Show all matching results when a filter is active.
  // Otherwise, limit the initial catalogue to three cards.
  const visibleCourses =
    hasActiveFilters || showAllCourses
      ? courses
      : courses.slice(0, INITIAL_COURSE_LIMIT);

  const hasMoreCourses =
    !hasActiveFilters && courses.length > INITIAL_COURSE_LIMIT;

  function handleSearchChange(value: string) {
    setSearch(value);
    setShowAllCourses(false);
  }

  function handleLevelChange(value: string) {
    setLevel(value);
    setShowAllCourses(false);
  }

  function clearFilters() {
    setSearch("");
    setLevel("");
    setShowAllCourses(false);
  }

  return (
    <section
      id="course-catalog"
      aria-labelledby="course-catalog-heading"
      className="relative isolate overflow-hidden bg-[#FAFAFA] py-20 sm:py-24 lg:py-15"
    >
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-20 -z-10 h-96 w-96 rounded-full bg-brand-gold/[0.08] blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 bottom-10 -z-10 h-96 w-96 rounded-full bg-brand-blue/[0.05] blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Section heading */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-[#FBFAF6] px-4 py-2">
            <BookOpen
              size={15}
              className="text-brand-navy"
              aria-hidden="true"
            />
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-navy sm:text-[11px]">
              Academic catalogue
            </span>
          </div>

          <h2
            id="course-catalog-heading"
            className="text-3xl font-bold leading-[1.15] tracking-[-0.04em] text-brand-navy sm:text-4xl lg:text-5xl"
          >
            Explore our{" "}
            <span className="text-brand-gold">courses.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
            Discover courses across ITMT&apos;s academic programmes, levels,
            and semesters. Search the catalogue or filter by academic level
            to find the information you need.
          </p>
        </div>

        {/* Search and filter toolbar */}
        <div className="mx-auto mt-10 max-w-5xl rounded-2xl border border-slate-200/80 bg-[#FAFAFA] p-3 shadow-[0_14px_32px_-20px_rgba(15,23,42,0.2)] sm:mt-12 sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="min-w-0 flex-1">
              <CoursesSearch
                onSearchChange={handleSearchChange}
                search={search}
              />
            </div>

            <div className="relative lg:w-56">
              <GraduationCap
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400"
              />

              <select
                value={level}
                onChange={(event) =>
                  handleLevelChange(event.target.value)
                }
                aria-label="Filter courses by level"
                className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-11 pr-10 text-sm font-medium text-brand-navy outline-none transition-colors hover:border-slate-300 focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/15"
              >
                <option value="">All levels</option>

                {levels.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="none"
                className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              >
                <path
                  d="M5 7.5l5 5 5-5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
              >
                <X size={16} aria-hidden="true" />
                Clear filters
              </button>
            )}
          </div>

          {/* Active filters and result count */}
          {(hasActiveFilters || (!loading && !error)) && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-200/80 px-1 pt-3">
              {search.trim() && (
                <span className="max-w-full truncate rounded-full bg-brand-navy px-3 py-1 text-xs font-semibold text-white">
                  Search: {search.trim()}
                </span>
              )}

              {level && (
                <span className="rounded-full bg-brand-gold/15 px-3 py-1 text-xs font-semibold text-[#8A6D1F]">
                  Level: {level}
                </span>
              )}

              {!loading && !error && (
                <span
                  className="ml-auto text-sm font-medium text-slate-500"
                  aria-live="polite"
                >
                  {countLabel}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Catalogue content */}
        <div className="mx-auto mt-10 max-w-6xl sm:mt-12">
          {/* Loading skeletons */}
          {loading && (
            <div
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7"
              aria-label="Loading courses"
              aria-busy="true"
            >
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200/70 border-t-[3px] border-t-brand-gold/40 bg-white p-6 shadow-sm sm:p-7"
                >
                  <div className="flex items-start justify-between">
                    <div className="h-12 w-12 animate-pulse rounded-xl bg-slate-100 sm:h-14 sm:w-14" />
                    <div className="h-7 w-20 animate-pulse rounded-full bg-slate-100" />
                  </div>

                  <div className="mt-6 h-3 w-24 animate-pulse rounded bg-slate-100" />
                  <div className="mt-3 h-6 w-4/5 animate-pulse rounded bg-slate-100" />

                  <div className="mt-5 space-y-2">
                    <div className="h-3.5 w-full animate-pulse rounded bg-slate-100" />
                    <div className="h-3.5 w-5/6 animate-pulse rounded bg-slate-100" />
                  </div>

                  <div className="mt-7 grid grid-cols-2 gap-3">
                    <div className="h-14 animate-pulse rounded-xl bg-slate-100" />
                    <div className="h-14 animate-pulse rounded-xl bg-slate-100" />
                  </div>

                  <div className="mt-6 h-10 animate-pulse rounded-xl bg-slate-100" />
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div
              role="alert"
              className="mx-auto max-w-xl rounded-3xl border border-slate-200 border-t-[3px] border-t-red-400 bg-white px-6 py-14 text-center shadow-[0_20px_50px_-28px_rgba(15,23,42,0.25)]"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <AlertCircle size={26} aria-hidden="true" />
              </div>

              <h3 className="mt-5 text-xl font-bold text-brand-navy">
                Unable to load courses
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                We couldn&apos;t retrieve the course catalogue at the moment.
                Please check your connection and try again.
              </p>

              <button
                type="button"
                onClick={() => void loadCourses()}
                className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-navy px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
              >
                <RefreshCw size={15} aria-hidden="true" />
                Try again
              </button>
            </div>
          )}

          {/* No courses configured */}
          {!loading && !error && !hasCourses && !hasActiveFilters && (
            <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 border-t-[3px] border-t-brand-gold bg-white px-6 py-16 text-center shadow-[0_20px_50px_-28px_rgba(15,23,42,0.25)]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-navy/[0.06] text-brand-navy">
                <BookOpen size={28} aria-hidden="true" />
              </div>

              <h3 className="mt-5 text-xl font-bold text-brand-navy">
                Course catalogue is being prepared
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                Course information will appear here as academic programmes,
                semesters, and courses are configured by the institution.
              </p>
            </div>
          )}

          {/* No matching courses */}
          {!loading && !error && !hasCourses && hasActiveFilters && (
            <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-[0_20px_50px_-28px_rgba(15,23,42,0.25)]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <Search size={26} aria-hidden="true" />
              </div>

              <h3 className="mt-5 text-xl font-bold text-brand-navy">
                No matching courses
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                We couldn&apos;t find any courses matching your current search
                or level filter. Try broadening your criteria.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-7 inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-6 text-sm font-semibold text-brand-navy transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
              >
                Clear filters
              </button>
            </div>
          )}

          {/* Course grid */}
          {!loading && !error && hasCourses && (
            <>
              <div
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7"
                aria-live="polite"
              >
                {visibleCourses.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>

              {/* View all / show fewer */}
              {hasMoreCourses && (
                <div className="mt-10 flex flex-col items-center text-center sm:mt-12">
                  <p className="mb-4 text-sm text-slate-500">
                    {showAllCourses
                      ? `Showing all ${courses.length} courses`
                      : `Showing 3 of ${courses.length} courses`}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setShowAllCourses((current) => !current)
                    }
                    aria-expanded={showAllCourses}
                    aria-controls="course-catalog-results"
                    className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-brand-navy px-7 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(27,40,71,0.5)] transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:bg-brand-blue hover:shadow-[0_12px_26px_-8px_rgba(27,40,71,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
                  >
                    {showAllCourses ? "Show fewer courses" : "View all courses"}

                    <ArrowRight
                      size={17}
                      aria-hidden="true"
                      className={`transition-transform duration-200 ${
                        showAllCourses
                          ? "-rotate-90"
                          : "group-hover:translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
