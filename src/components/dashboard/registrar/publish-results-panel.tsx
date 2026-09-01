"use client";

import { useState } from "react";

interface Course {
  _id: string;
  code: string;
}

interface Semester {
  _id: string;
  name: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PublishResultsPanel({
  accessToken,
  courses,
  semesters,
}: {
  accessToken: string;
  courses: Course[];
  semesters: Semester[];
}) {
  const [course, setCourse] = useState("");
  const [semester, setSemester] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!course || !semester) {
      setMessage("Select course and semester.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    const res = await fetch(`${API_URL}/results/publish`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ course, semester }),
    });

    const data = await res.json();

    setMessage(
      res.ok
        ? `Published ${data.modified} of ${data.matched} matching results.`
        : data.message || "Something went wrong.",
    );
    setIsSubmitting(false);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-xl font-semibold text-brand-navy">
        Publish Results
      </h2>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <select
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2"
        >
          <option value="">Course</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>
              {c.code}
            </option>
          ))}
        </select>

        <select
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2"
        >
          <option value="">Semester</option>
          {semesters.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {message && <p className="mt-3 text-sm text-brand-navy">{message}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="mt-4 rounded-md bg-brand-navy px-4 py-2 font-medium text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Publishing..." : "Publish"}
      </button>
    </div>
  );
}