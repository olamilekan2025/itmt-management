"use client";

import { BookOpen } from "lucide-react";

export default function StudentResultsEmpty() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-12">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <BookOpen className="h-8 w-8 text-slate-400" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-slate-900">
          No academic results available
        </h3>
        <p className="text-sm text-slate-600 max-w-sm">
          Your academic results will appear here once they have been published by your institution.
        </p>
      </div>
    </div>
  );
}
