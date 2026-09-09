"use client";

import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  GraduationCap,
  Layers3,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import type { Course } from "@/lib/courses";

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <Card
      className="
        group relative overflow-hidden
        rounded-2xl
        border-slate-200/80
        bg-white
        shadow-sm
        transition-all duration-300
        hover:-translate-y-1
        hover:border-brand-navy/20
        hover:shadow-xl hover:shadow-slate-900/5
      "
    >
      {/* Top accent */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-navy via-brand-blue to-brand-gold opacity-80" />

      <CardContent className="p-0">
        {/* Header */}
        <div className="border-b border-slate-100 p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            {/* Course code */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy text-white shadow-sm">
                <BookOpen className="h-4.5 w-4.5" />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Course code
                </p>

                <p className="mt-0.5 text-sm font-bold tracking-wide text-brand-navy">
                  {course.code}
                </p>
              </div>
            </div>

            {/* Credit units */}
            <Badge
              variant="outline"
              className="
                shrink-0 rounded-full
                border-brand-gold/30
                bg-brand-gold/5
                px-3 py-1.5
                text-[11px] font-bold
                text-brand-navy
              "
            >
              {course.creditUnits}{" "}
              {course.creditUnits === 1 ? "Credit" : "Credits"}
            </Badge>
          </div>

          {/* Course title */}
          <h3
            className="
              line-clamp-2
              min-h-[3.5rem]
              text-xl font-bold
              leading-7 tracking-tight
              text-brand-navy
              transition-colors duration-300
              group-hover:text-brand-blue
            "
          >
            {course.title}
          </h3>

          {/* Category */}
          {course.category && (
            <div className="mt-4">
              <Badge
                className="
                  rounded-full
                  border border-brand-blue/10
                  bg-brand-blue/5
                  px-3 py-1
                  text-[11px] font-semibold
                  text-brand-blue
                  hover:bg-brand-blue/10
                "
              >
                {course.category}
              </Badge>
            </div>
          )}
        </div>

        {/* Academic details */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Programme */}
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-brand-navy">
                <GraduationCap className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Programme
                </p>

                <p className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-slate-700">
                  {course.programme.name}
                </p>

                {course.programme.code && (
                  <p className="mt-0.5 text-xs font-medium text-slate-400">
                    {course.programme.code}
                  </p>
                )}
              </div>
            </div>

            {/* Level + semester */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                <div className="flex items-center gap-2">
                  <Layers3 className="h-3.5 w-3.5 text-brand-blue" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Level
                  </span>
                </div>

                <p className="mt-2 text-sm font-bold text-brand-navy">
                  {course.level}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5 text-brand-gold" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Semester
                  </span>
                </div>

                <p className="mt-2 line-clamp-1 text-sm font-bold text-brand-navy">
                  {course.semester.name}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {course.description && (
            <div className="mt-5 border-t border-slate-100 pt-5">
              <p className="line-clamp-2 text-sm leading-6 text-slate-500">
                {course.description}
              </p>
            </div>
          )}

          {/* Bottom indicator */}
          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-xs font-semibold text-slate-400">
              Academic course
            </span>

            <div className="flex items-center gap-1 text-xs font-bold text-brand-navy transition-all duration-300 group-hover:gap-2 group-hover:text-brand-blue">
              View details
              <ChevronRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

