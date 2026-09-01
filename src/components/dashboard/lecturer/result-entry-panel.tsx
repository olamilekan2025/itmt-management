"use client";

import { useEffect, useState } from "react";

interface Assignment {
  _id: string;
  course: { _id: string; code: string; title: string; creditUnits: number };
  semester: { _id: string; name: string; order: number };
}

interface RosterEntry {
  registrationId: string;
  student: { _id: string; name: string; email: string; matricNumber?: string };
}

interface ExistingResult {
  student: { _id: string };
  score: number;
  grade: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ResultEntryPanel({
  accessToken,
  assignments,
}: {
  accessToken: string;
  assignments: Assignment[];
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const selected = assignments[selectedIndex];

  useEffect(() => {
    if (!selected) return;

    setIsLoading(true);
    setMessage("");

    const courseId = selected.course._id;
    const semesterId = selected.semester._id;

    Promise.all([
      fetch(
        `${API_URL}/registrations/roster?course=${courseId}&semester=${semesterId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      ).then((r) => r.json()),
      fetch(
        `${API_URL}/results/course?course=${courseId}&semester=${semesterId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      ).then((r) => r.json()),
    ]).then(([rosterData, resultsData]) => {
      const rosterList: RosterEntry[] = rosterData.roster || [];
      const existing: ExistingResult[] = resultsData.results || [];

      const prefilled: Record<string, string> = {};
      existing.forEach((r) => {
        prefilled[r.student._id] = String(r.score);
      });

      setRoster(rosterList);
      setScores(prefilled);
      setIsLoading(false);
    });
  }, [selected, accessToken]);

  function updateScore(studentId: string, value: string) {
    setScores((prev) => ({ ...prev, [studentId]: value }));
  }

  async function handleSubmit() {
    const payloadScores = roster
      .map((r) => ({ student: r.student._id, score: scores[r.student._id] }))
      .filter((s) => s.score !== undefined && s.score !== "")
      .map((s) => ({ student: s.student, score: Number(s.score) }));

    if (payloadScores.length === 0) {
      setMessage("Enter at least one score before submitting.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    const res = await fetch(`${API_URL}/results`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        course: selected.course._id,
        semester: selected.semester._id,
        scores: payloadScores,
      }),
    });

    const data = await res.json();

    setMessage(data.message || (res.ok ? "Scores submitted." : "Something went wrong."));
    setIsSubmitting(false);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-xl font-semibold text-brand-navy">Enter Scores</h2>

      <label className="mt-4 block text-sm font-medium">Course</label>
      <select
        value={selectedIndex}
        onChange={(e) => setSelectedIndex(Number(e.target.value))}
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
      >
        {assignments.map((a, i) => (
          <option key={a._id} value={i}>
            {a.course.code} — {a.course.title} ({a.semester.name})
          </option>
        ))}
      </select>

      {isLoading && <p className="mt-4 text-sm text-slate-500">Loading roster...</p>}

      {!isLoading && roster.length === 0 && (
        <p className="mt-4 text-sm text-slate-600">
          No students registered for this course yet.
        </p>
      )}

      {!isLoading && roster.length > 0 && (
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="pb-2">Student</th>
              <th className="pb-2">Matric No.</th>
              <th className="pb-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((r) => (
              <tr key={r.registrationId} className="border-b border-slate-100">
                <td className="py-2">{r.student.name}</td>
                <td className="py-2">{r.student.matricNumber || "—"}</td>
                <td className="py-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={scores[r.student._id] || ""}
                    onChange={(e) => updateScore(r.student._id, e.target.value)}
                    className="w-20 rounded-md border border-slate-300 px-2 py-1"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {message && <p className="mt-3 text-sm text-brand-navy">{message}</p>}

      {roster.length > 0 && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="mt-4 rounded-md bg-brand-navy px-4 py-2 font-medium text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Submitting..." : "Submit scores"}
        </button>
      )}
    </div>
  );
}