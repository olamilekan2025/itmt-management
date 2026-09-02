"use client";

interface CourseResult {
  course: {
    creditUnits: number;
  };
  score: number;
  grade: string;
}

interface StudentResultsSummaryProps {
  results: CourseResult[];
}

export default function StudentResultsSummary({ results }: StudentResultsSummaryProps) {
  if (results.length === 0) {
    return null;
  }

  const totalCredits = results.reduce((sum, r) => sum + r.course.creditUnits, 0);
  const averageScore = results.length > 0
    ? (results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(1)
    : "N/A";
  const highestScore = Math.max(...results.map((result) => result.score));

  const stats = [
    {
      label: "Courses Completed",
      value: results.length.toString(),
      accent: "text-brand-navy",
    },
    {
      label: "Total Credit Units",
      value: totalCredits.toString(),
      accent: "text-brand-gold",
    },
    {
      label: "Average Score",
      value: `${averageScore}%`,
      accent: "text-brand-blue",
    },
    {
      label: "Highest Score",
      value: `${highestScore}%`,
      accent: "text-brand-navy",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {stat.label}
          </p>
          <p className={`mt-2 text-2xl font-bold ${stat.accent}`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
