"use client";

import { useState } from "react";
import { BookOpen, AlertCircle, RefreshCw } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import CoursesHeader from "./courses-header";
import CoursesStats from "./courses-stats";
import CoursesToolbar from "./courses-toolbar";
import CoursesTable from "./courses-table";
import CourseFormDialog from "./course-form-dialog";
import CourseViewDialog from "./course-view-dialog";
import CourseArchiveDialog from "./course-archive-dialog";

import {
  getAdminCourses,
  type Course,
  type Programme,
  type Semester,
  type Department,
  type CourseStatus,
} from "@/lib/admin-courses";

interface CoursesPageProps {
  initialCourses: Course[];
  departments: Department[];
  programmes: Programme[];
  semesters: Semester[];
  accessToken: string;
}

export default function CoursesPage({
  initialCourses,
  departments,
  programmes,
  semesters,
  accessToken,
}: CoursesPageProps) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
const [status, setStatus] = useState<CourseStatus>("");
  const [programme, setProgramme] = useState("");
  const [semester, setSemester] = useState("");

  // Dialog states
  const [createFormOpen, setCreateFormOpen] = useState(false);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] =
    useState(false);

  const [selectedCourse, setSelectedCourse] =
    useState<Course | null>(null);

  const hasActiveFilters = Boolean(
    search ||
      level ||
      status ||
      programme ||
      semester
  );

  const hasCourses = courses.length > 0;

  const activeCount = courses.filter(
    (course) => course.isActive
  ).length;

  const archivedCount = courses.filter(
    (course) => !course.isActive
  ).length;

  /**
   * Refresh courses from the backend.
   *
   * This replaces the previous placeholder implementation.
   */
  async function refreshCourses() {
    try {
      setLoading(true);
      setError(null);

      const response = await getAdminCourses(
        accessToken,
        {
          search: search || undefined,
          programme: programme || undefined,
          semester: semester || undefined,
          level: level || undefined,
          status: status || undefined,
        }
      );

      setCourses(response.courses);
    } catch (err) {
      console.error("Failed to refresh courses:", err);

      setError("Unable to load courses");
    } finally {
      setLoading(false);
    }
  }

  function handleCreate() {
    setSelectedCourse(null);
    setCreateFormOpen(true);
  }

  function handleEdit(course: Course) {
    setSelectedCourse(course);
    setEditFormOpen(true);
  }

  function handleView(course: Course) {
    setSelectedCourse(course);
    setViewDialogOpen(true);
  }

  function handleArchive(course: Course) {
    setSelectedCourse(course);
    setArchiveDialogOpen(true);
  }

  function clearFilters() {
    setSearch("");
    setLevel("");
    setStatus("");
    setProgramme("");
    setSemester("");
  }

  return (
    <div className="space-y-8">
      <CoursesHeader onCreate={handleCreate} />

      <CoursesStats
        total={courses.length}
        active={activeCount}
        archived={archivedCount}
      />

      <CoursesToolbar
        search={search}
        onSearchChange={setSearch}
        level={level}
        onLevelChange={setLevel}
        status={status}
        onStatusChange={setStatus}
        programme={programme}
        onProgrammeChange={setProgramme}
        semester={semester}
        onSemesterChange={setSemester}
        programmes={programmes}
        semesters={semesters}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        onRefresh={refreshCourses}
      />

      {/* Loading */}
      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-slate-500">
              <RefreshCw className="h-5 w-5 animate-spin" />

              <span>Loading courses...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && !loading && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive" />

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-brand-navy">
                Unable to load courses
              </h3>

              <p className="text-slate-600">
                We couldn't retrieve course information right
                now. Please try again.
              </p>
            </div>

            <Button
              onClick={refreshCourses}
              variant="outline"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!loading &&
        !error &&
        !hasCourses &&
        !hasActiveFilters && (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-light">
                <BookOpen className="h-8 w-8 text-brand-navy" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-brand-navy">
                  No courses yet
                </h3>

                <p className="text-slate-600">
                  Create your first course to begin building
                  the institution's academic catalogue.
                </p>
              </div>

              <Button onClick={handleCreate}>
                Add Course
              </Button>
            </CardContent>
          </Card>
        )}

      {/* No search results */}
      {!loading &&
        !error &&
        !hasCourses &&
        hasActiveFilters && (
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
                onClick={clearFilters}
                variant="outline"
              >
                Clear filters
              </Button>
            </CardContent>
          </Card>
        )}

      {/* Course table */}
      {!loading && !error && hasCourses && (
        <CoursesTable
          courses={courses}
          onEdit={handleEdit}
          onView={handleView}
          onArchive={handleArchive}
        />
      )}

      {/* CREATE COURSE */}
      <CourseFormDialog
        open={createFormOpen}
        onOpenChange={setCreateFormOpen}
        mode="create"
        course={null}
        departments={departments}
        programmes={programmes}
        semesters={semesters}
        accessToken={accessToken}
        onSuccess={refreshCourses}
      />

      {/* EDIT COURSE */}
      <CourseFormDialog
        open={editFormOpen}
        onOpenChange={setEditFormOpen}
        mode="edit"
        course={selectedCourse}
        departments={departments}
        programmes={programmes}
        semesters={semesters}
        accessToken={accessToken}
        onSuccess={refreshCourses}
      />

      {/* VIEW COURSE */}
      <CourseViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        course={selectedCourse}
      />

      {/* ARCHIVE COURSE */}
      <CourseArchiveDialog
        open={archiveDialogOpen}
        onOpenChange={setArchiveDialogOpen}
        course={selectedCourse}
        accessToken={accessToken}
        onSuccess={refreshCourses}
      />
    </div>
  );
}
