"use client";

import { Button } from "@/components/ui/button";
import { Search, RefreshCw, X } from "lucide-react";

import type {
  Programme,
  Semester,
  CourseStatus,
} from "@/lib/admin-courses";

interface CoursesToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;

  level: string;
  onLevelChange: (value: string) => void;

  status: CourseStatus;
  onStatusChange: (value: CourseStatus) => void;

  programme: string;
  onProgrammeChange: (value: string) => void;

  semester: string;
  onSemesterChange: (value: string) => void;

  programmes: Programme[];
  semesters: Semester[];

  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onRefresh: () => void;
}

export default function CoursesToolbar({
  search,
  onSearchChange,
  level,
  onLevelChange,
  status,
  onStatusChange,
  programme,
  onProgrammeChange,
  semester,
  onSemesterChange,
  programmes,
  semesters,
  hasActiveFilters,
  onClearFilters,
  onRefresh,
}: CoursesToolbarProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-wrap gap-3">
        {/* Search */}
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search courses..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-10 text-sm outline-none placeholder:text-slate-400 focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/20"
          />

          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Level Filter */}
        <select
          value={level}
          onChange={(e) => onLevelChange(e.target.value)}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/20"
        >
          <option value="">All Levels</option>
          <option value="100">100 Level</option>
          <option value="200">200 Level</option>
          <option value="300">300 Level</option>
          <option value="400">400 Level</option>
          <option value="500">500 Level</option>
        </select>

        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) =>
            onStatusChange(
              e.target.value as CourseStatus
            )
          }
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/20"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>

        {/* Programme Filter */}
        <select
          value={programme}
          onChange={(e) =>
            onProgrammeChange(e.target.value)
          }
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/20"
        >
          <option value="">All Programmes</option>

          {programmes.map((prog) => (
            <option key={prog._id} value={prog._id}>
              {prog.name}
            </option>
          ))}
        </select>

        {/* Semester Filter */}
      {/* Semester Filter */}
<select
  value={semester}
  onChange={(e) => onSemesterChange(e.target.value)}
  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/20"
>
  <option value="">All Semesters</option>

  {[...semesters]
    .sort((a, b) => a.order - b.order)
    .map((sem) => (
      <option key={sem._id} value={sem._id}>
        {sem.name}
      </option>
    ))}
</select>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {hasActiveFilters && (
          <Button
            onClick={onClearFilters}
            variant="outline"
            size="sm"
          >
            <X className="mr-2 h-4 w-4" />
            Clear filters
          </Button>
        )}

        <Button
          onClick={onRefresh}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
    </div>
  );
}