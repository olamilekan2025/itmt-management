"use client";

import { useEffect, useState } from "react";
import { BookOpen, AlertCircle, RefreshCw } from "lucide-react";
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
      setCourses(response.courses);
    } catch (err) {
      setError("Unable to load courses");
      console.error("Failed to load courses:", err);
    } finally {
      setLoading(false);
    }
  }

  const hasActiveFilters = search || level;
  const hasCourses = courses.length > 0;

  return (
    <section id="course-catalog" className="border-t border-slate-100 bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 space-y-4">
          <h2 className="text-3xl font-bold text-brand-navy sm:text-4xl">
            Course catalogue
          </h2>
          <p className="text-lg text-slate-600">
            Explore courses according to the academic structure configured by your
            institution.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4 lg:flex lg:items-center lg:gap-4 lg:space-y-0">
          <div className="flex-1">
            <CoursesSearch onSearchChange={setSearch} search={search} />
          </div>
          
          <div className="lg:w-48">
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              aria-label="Filter by level"
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/20"
            >
              <option value="">All Levels</option>
              <option value="100">100 Level</option>
              <option value="200">200 Level</option>
              <option value="300">300 Level</option>
              <option value="400">400 Level</option>
              <option value="500">500 Level</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="space-y-3">
                  <div className="flex h-6 w-20 rounded-full bg-slate-200" />
                  <div className="h-5 w-3/4 rounded bg-slate-200" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="h-4 w-full rounded bg-slate-200" />
                  <div className="h-4 w-2/3 rounded bg-slate-200" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-brand-navy">
                  Unable to load courses
                </h3>
                <p className="text-slate-600">
                  We couldn't retrieve course information right now. Please try
                  again.
                </p>
              </div>
              <Button onClick={loadCourses} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty State - No Courses */}
        {!loading && !error && !hasCourses && !hasActiveFilters && (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-light">
                <BookOpen className="h-8 w-8 text-brand-navy" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-brand-navy">
                  No courses available
                </h3>
                <p className="text-slate-600">
                  Course information will appear here as programmes and courses are
                  configured.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State - No Results */}
        {!loading && !error && !hasCourses && hasActiveFilters && (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-light">
                <BookOpen className="h-8 w-8 text-brand-navy" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-brand-navy">
                  No courses found
                </h3>
                <p className="text-slate-600">
                  Try adjusting your search or filters.
                </p>
              </div>
              <Button
                onClick={() => {
                  setSearch("");
                  setLevel("");
                }}
                variant="outline"
              >
                Clear filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Course Grid */}
        {!loading && !error && hasCourses && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
