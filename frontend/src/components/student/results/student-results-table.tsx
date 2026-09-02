"use client";

import { getGradeColor } from "@/lib/result-utils";

interface CourseResult {
  _id: string;
  course: {
    code: string;
    title: string;
    creditUnits: number;
  };
  semester: {
    name: string;
    order: number;
  };
  score: number;
  grade: string;
}

interface StudentResultsTableProps {
  results: CourseResult[];
}

export default function StudentResultsTable({ results }: StudentResultsTableProps) {
  if (results.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
            <th className="pb-3 px-1">Code</th>
            <th className="pb-3 px-1">Title</th>
            <th className="pb-3 px-1 text-right">Credit Units</th>
            <th className="pb-3 px-1 text-right">Score</th>
            <th className="pb-3 px-1 text-center">Grade</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {results.map((result) => (
            <tr
              key={result._id}
              className="hover:bg-slate-50 transition-colors"
            >
              <td className="py-3 px-1 font-semibold text-brand-navy">
                {result.course.code}
              </td>
              <td className="py-3 px-1">
                <div className="flex flex-col">
                  <span className="text-slate-900">{result.course.title}</span>
                  <span className="text-xs text-slate-500">
                    {result.semester.name}
                  </span>
                </div>
              </td>
              <td className="py-3 px-1 text-right text-slate-600">
                {result.course.creditUnits}
              </td>
              <td className="py-3 px-1 text-right font-medium text-slate-900">
                {result.score}
              </td>
              <td className="py-3 px-1 text-center">
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-lg font-semibold text-sm ${getGradeColor(result.grade)}`}
                >
                  {result.grade}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
