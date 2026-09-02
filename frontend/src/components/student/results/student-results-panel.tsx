"use client";

import { useState } from "react";

import StudentResultsEmpty from "@/components/student/results/student-results-empty";
import StudentResultsFilter from "@/components/student/results/student-results-filter";
import StudentResultsHeader from "@/components/student/results/student-results-header";
import StudentResultsSummary from "@/components/student/results/student-results-summary";
import StudentResultsTable from "@/components/student/results/student-results-table";

interface StudentResult {
  _id: string;
  course: { code: string; title: string; creditUnits: number };
  semester: { _id: string; name: string; order: number };
  score: number;
  grade: string;
}

interface StudentResultsPanelProps {
  results: StudentResult[];
}

export default function StudentResultsPanel({ results }: StudentResultsPanelProps) {
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const filteredResults = selectedSemester
    ? results.filter((result) => result.semester._id === selectedSemester)
    : results;

  return (
    <div id="results" className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <StudentResultsHeader />

      {results.length === 0 ? (
        <div className="mt-8">
          <StudentResultsEmpty />
        </div>
      ) : (
        <>
          <div className="mt-6">
            <StudentResultsFilter
              results={results}
              selectedSemester={selectedSemester}
              onSemesterChange={setSelectedSemester}
            />
          </div>
          <StudentResultsSummary results={filteredResults} />
          {filteredResults.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-600">
              No results available for the selected semester.
            </p>
          ) : (
            <StudentResultsTable results={filteredResults} />
          )}
        </>
      )}
    </div>
  );
}
