"use client";

import { ChevronDown } from "lucide-react";

interface Semester {
  _id: string;
  name: string;
  order: number;
}

interface StudentResultsFilterProps {
  results: Array<{
    semester: Semester;
  }>;
  selectedSemester: string | null;
  onSemesterChange: (semesterId: string | null) => void;
}

export default function StudentResultsFilter({
  results,
  selectedSemester,
  onSemesterChange,
}: StudentResultsFilterProps) {
  const semesters = Array.from(
    new Map(results.map((result) => [result.semester._id, result.semester])).values(),
  ).sort((a, b) => (a.order || 0) - (b.order || 0));

  if (semesters.length <= 1) {
    return null;
  }

  return (
    <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:items-end">
      <div className="flex-1">
        <label htmlFor="semester-select" className="block text-sm font-medium text-slate-700 mb-2">
          Filter by Semester
        </label>
        <div className="relative">
          <select
            id="semester-select"
            value={selectedSemester || "all"}
            onChange={(e) => onSemesterChange(e.target.value === "all" ? null : e.target.value)}
            className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 pr-10 focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/20 outline-none transition-colors"
          >
            <option value="all">All Semesters</option>
            {semesters.map((sem) => (
              <option key={sem._id} value={sem._id}>
                {sem.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
