"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CardContent } from "@/components/ui/card";

import type {
  Course,
  Programme,
  Semester,
  Department,
} from "@/lib/admin-courses";

import {
  createCourse,
  updateCourse,
} from "@/lib/admin-courses";

interface CourseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  course: Course | null;
  departments: Department[];
  programmes: Programme[];
  semesters: Semester[];
  accessToken: string;
  onSuccess: () => void;
}

/*
 * Course references can come from MongoDB either as:
 *
 *   "programmeId"
 *
 * or as a populated Programme object:
 *
 *   { _id, name, code, ... }
 *
 * These helpers safely narrow the union type.
 */
function isProgramme(
  value: string | Programme,
): value is Programme {
  return typeof value !== "string";
}

function isSemester(
  value: string | Semester,
): value is Semester {
  return typeof value !== "string";
}

function getReferenceId(
  value: string | { _id: string },
): string {
  return typeof value === "string"
    ? value
    : value._id;
}

export default function CourseFormDialog({
  open,
  onOpenChange,
  mode,
  course,
  programmes,
  semesters,
  accessToken,
  onSuccess,
}: CourseFormDialogProps) {
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    programme: "",
    semester: "",
    level: "",
    creditUnits: 3,
    category: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  // Searchable programme state
  const [programmeSearch, setProgrammeSearch] =
    useState("");

  const [programmeOpen, setProgrammeOpen] =
    useState(false);

  // Searchable semester state
  const [semesterSearch, setSemesterSearch] =
    useState("");

  const [semesterOpen, setSemesterOpen] =
    useState(false);

  /*
   * Populate form when editing a course.
   *
   * IMPORTANT:
   * course.programme and course.semester may be either
   * an ID string or a populated object.
   */
  useEffect(() => {
    if (mode === "edit" && course) {
      const programmeId = getReferenceId(
        course.programme,
      );

      const semesterId = getReferenceId(
        course.semester,
      );

      setFormData({
        code: course.code,
        title: course.title,
        programme: programmeId,
        semester: semesterId,
        level: course.level,
        creditUnits: course.creditUnits,
        category: course.category || "",
        description: course.description || "",
      });

      /*
       * Only access name/code when the backend returned
       * a populated Programme object.
       */
      if (isProgramme(course.programme)) {
        setProgrammeSearch(
          `${course.programme.name} (${course.programme.code})`,
        );
      } else {
        /*
         * If the backend returned only an ID, try to find
         * the matching programme from the loaded list.
         */
        const matchingProgramme =
          programmes.find(
            (programme) =>
              programme._id === programmeId,
          );

        setProgrammeSearch(
          matchingProgramme
            ? `${matchingProgramme.name} (${matchingProgramme.code})`
            : "",
        );
      }

      /*
       * Only access semester.name when populated.
       * Otherwise resolve it from the semesters list.
       */
      if (isSemester(course.semester)) {
        setSemesterSearch(course.semester.name);
      } else {
        const matchingSemester =
          semesters.find(
            (semester) =>
              semester._id === semesterId,
          );

        setSemesterSearch(
          matchingSemester?.name ?? "",
        );
      }
    } else {
      setFormData({
        code: "",
        title: "",
        programme: "",
        semester: "",
        level: "",
        creditUnits: 3,
        category: "",
        description: "",
      });

      setProgrammeSearch("");
      setSemesterSearch("");
    }

    setProgrammeOpen(false);
    setSemesterOpen(false);
  }, [
    mode,
    course,
    open,
    programmes,
    semesters,
  ]);

  /*
   * Search programmes.
   */
  const filteredProgrammes = useMemo(() => {
    const search = programmeSearch
      .trim()
      .toLowerCase();

    if (!search) {
      return programmes;
    }

    return programmes.filter((programme) => {
      return (
        programme.name
          .toLowerCase()
          .includes(search) ||
        programme.code
          .toLowerCase()
          .includes(search)
      );
    });
  }, [programmes, programmeSearch]);

  /*
   * Always display Semester 1 → Semester 6.
   *
   * We use the semesters returned from the backend
   * and sort them according to their order.
   */
  const sortedSemesters = useMemo(() => {
    return [...semesters]
      .sort((a, b) => a.order - b.order)
      .filter(
        (semester) =>
          semester.order >= 1 &&
          semester.order <= 6,
      );
  }, [semesters]);

  /*
   * Search semesters.
   */
  const filteredSemesters = useMemo(() => {
    const search = semesterSearch
      .trim()
      .toLowerCase();

    if (!search) {
      return sortedSemesters;
    }

    return sortedSemesters.filter((semester) =>
      semester.name
        .toLowerCase()
        .includes(search),
    );
  }, [sortedSemesters, semesterSearch]);

  /*
   * Select programme.
   */
  function handleProgrammeSelect(
    programme: Programme,
  ) {
    setFormData((prev) => ({
      ...prev,
      programme: programme._id,
    }));

    setProgrammeSearch(
      `${programme.name} (${programme.code})`,
    );

    setProgrammeOpen(false);
  }

  /*
   * Select semester.
   */
  function handleSemesterSelect(
    semester: Semester,
  ) {
    setFormData((prev) => ({
      ...prev,
      semester: semester._id,
    }));

    setSemesterSearch(semester.name);
    setSemesterOpen(false);
  }

  /*
   * Submit course.
   */
  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    /*
     * Make sure a real programme was selected.
     */
    if (!formData.programme) {
      toast.error(
        "Please select a valid programme.",
      );

      setProgrammeOpen(true);
      return;
    }

    /*
     * Make sure a real semester was selected.
     */
    if (!formData.semester) {
      toast.error(
        "Please select a valid semester.",
      );

      setSemesterOpen(true);
      return;
    }

    setLoading(true);

    try {
      if (mode === "create") {
        await createCourse(
          formData,
          accessToken,
        );

        toast.success(
          "Course created successfully.",
        );
      } else if (course) {
        await updateCourse(
          course._id,
          formData,
          accessToken,
        );

        toast.success(
          "Course updated successfully.",
        );
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : `Failed to ${mode} course. Please try again.`,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? "Create Course"
              : "Edit Course"}
          </DialogTitle>

          <DialogDescription>
            {mode === "create"
              ? "Add a new course to the academic catalogue."
              : "Update the course information."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 py-4">
            {/* Course Code + Credit Units */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Course Code *
                </label>

                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="e.g., CSC 101"
                  required
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Credit Units *
                </label>

                <input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.creditUnits}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      creditUnits:
                        parseInt(
                          e.target.value,
                          10,
                        ) || 1,
                    })
                  }
                  required
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/20"
                />
              </div>
            </div>

            {/* Course Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Course Title *
              </label>

              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    title: e.target.value,
                  })
                }
                placeholder="e.g., Introduction to Computer Science"
                required
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/20"
              />
            </div>

            {/* Programme + Semester */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* PROGRAMME SEARCH */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Programme *
                </label>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    value={programmeSearch}
                    onChange={(e) => {
                      setProgrammeSearch(
                        e.target.value,
                      );

                      setProgrammeOpen(true);

                      /*
                       * Clear the selected ID when
                       * the admin changes the text.
                       */
                      setFormData((prev) => ({
                        ...prev,
                        programme: "",
                      }));
                    }}
                    onFocus={() =>
                      setProgrammeOpen(true)
                    }
                    placeholder="Search programme..."
                    required
                    autoComplete="off"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-10 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/20"
                  />

                  <ChevronDown
                    className={`absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-transform ${
                      programmeOpen
                        ? "rotate-180"
                        : ""
                    }`}
                  />

                  {programmeOpen && (
                    <div className="absolute left-0 right-0 top-12 z-50 max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                      {filteredProgrammes.length >
                      0 ? (
                        filteredProgrammes.map(
                          (programme) => (
                            <button
                              key={programme._id}
                              type="button"
                              onClick={() =>
                                handleProgrammeSelect(
                                  programme,
                                )
                              }
                              className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm transition-colors hover:bg-brand-light"
                            >
                              <div>
                                <p className="font-medium text-slate-800">
                                  {programme.name}
                                </p>

                                <p className="text-xs text-slate-500">
                                  {programme.code}
                                </p>
                              </div>

                              {formData.programme ===
                                programme._id && (
                                <Check className="h-4 w-4 text-brand-navy" />
                              )}
                            </button>
                          ),
                        )
                      ) : (
                        <div className="px-3 py-6 text-center text-sm text-slate-500">
                          No programme found.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* SEMESTER SEARCH */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Semester *
                </label>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    value={semesterSearch}
                    onChange={(e) => {
                      setSemesterSearch(
                        e.target.value,
                      );

                      setSemesterOpen(true);

                      setFormData((prev) => ({
                        ...prev,
                        semester: "",
                      }));
                    }}
                    onFocus={() =>
                      setSemesterOpen(true)
                    }
                    placeholder="Search semester..."
                    required
                    autoComplete="off"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-10 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/20"
                  />

                  <ChevronDown
                    className={`absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-transform ${
                      semesterOpen
                        ? "rotate-180"
                        : ""
                    }`}
                  />

                  {semesterOpen && (
                    <div className="absolute left-0 right-0 top-12 z-50 max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                      {filteredSemesters.length >
                      0 ? (
                        filteredSemesters.map(
                          (semester) => (
                            <button
                              key={semester._id}
                              type="button"
                              onClick={() =>
                                handleSemesterSelect(
                                  semester,
                                )
                              }
                              className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm transition-colors hover:bg-brand-light"
                            >
                              <div>
                                <p className="font-medium text-slate-800">
                                  {semester.name}
                                </p>

                                <p className="text-xs text-slate-500">
                                  Semester{" "}
                                  {semester.order}
                                </p>
                              </div>

                              {formData.semester ===
                                semester._id && (
                                <Check className="h-4 w-4 text-brand-navy" />
                              )}
                            </button>
                          ),
                        )
                      ) : (
                        <div className="px-3 py-6 text-center text-sm text-slate-500">
                          No semester found.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Academic Level */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Academic Level *
              </label>

              <select
                value={formData.level}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    level: e.target.value,
                  })
                }
                required
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/20"
              >
                <option value="">
                  Select level
                </option>

                <option value="100">
                  100 Level
                </option>

                <option value="200">
                  200 Level
                </option>

                <option value="300">
                  300 Level
                </option>

                <option value="400">
                  400 Level
                </option>

                <option value="500">
                  500 Level
                </option>
              </select>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Category
              </label>

              <input
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value,
                  })
                }
                placeholder="e.g., Core, Elective"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/20"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Description
              </label>

              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                placeholder="Course description..."
                rows={3}
                className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/20"
              />
            </div>
          </CardContent>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                onOpenChange(false)
              }
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : mode === "create"
                  ? "Create Course"
                  : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

