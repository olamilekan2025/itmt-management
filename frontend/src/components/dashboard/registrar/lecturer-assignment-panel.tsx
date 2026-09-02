"use client";

import { useState } from "react";

interface Lecturer {
  _id: string;
  name: string;
}

interface Course {
  _id: string;
  code: string;
  title: string;
}

interface Semester {
  _id: string;
  name: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LecturerAssignmentPanel({
  accessToken,
  lecturers,
  courses,
  semesters,
}: {
  accessToken: string;
  lecturers: Lecturer[];
  courses: Course[];
  semesters: Semester[];
}) {
  const [lecturer, setLecturer] = useState("");
  const [course, setCourse] = useState("");
  const [semester, setSemester] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!lecturer || !course || !semester) {
      setMessage("Select lecturer, course, and semester.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    const res = await fetch(`${API_URL}/lecturer-assignments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ lecturer, course, semester }),
    });

    const data = await res.json();

    setMessage(data.message || (res.ok ? "Assigned." : "Something went wrong."));
    setIsSubmitting(false);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-xl font-semibold text-brand-navy">
        Assign Lecturer to Course
      </h2>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <select
          value={lecturer}
          onChange={(e) => setLecturer(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2"
        >
          <option value="">Lecturer</option>
          {lecturers.map((l) => (
            <option key={l._id} value={l._id}>
              {l.name}
            </option>
          ))}
        </select>

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
        {isSubmitting ? "Assigning..." : "Assign"}
      </button>
    </div>
  );
}