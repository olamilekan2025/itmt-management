"use client";

import { useEffect, useState } from "react";

interface Props {
  accessToken: string;
  programmeId?: string;
}

interface Semester {
  _id: string;
  name: string;
  order: number;
}

interface Course {
  _id: string;
  code: string;
  title: string;
  creditUnits: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RegistrationPanel({ accessToken, programmeId }: Props) {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/semesters`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => res.json())
      .then((data) => setSemesters(data.semesters || []));
  }, [accessToken]);

  useEffect(() => {
    if (!selectedSemester || !programmeId) {
      setCourses([]);
      return;
    }

    fetch(
      `${API_URL}/courses?programme=${programmeId}&semester=${selectedSemester}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )
      .then((res) => res.json())
      .then((data) => setCourses(data.courses || []));
  }, [selectedSemester, programmeId, accessToken]);

  function toggleCourse(id: string) {
    setSelectedCourses((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }

  async function handleSubmit() {
    if (!selectedSemester || selectedCourses.length === 0) return;

    setIsSubmitting(true);
    setMessage("");

    const res = await fetch(`${API_URL}/registrations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        semester: selectedSemester,
        courses: selectedCourses,
      }),
    });

    const data = await res.json();

    setMessage(data.message || (res.ok ? "Registered." : "Something went wrong."));
    setIsSubmitting(false);

    if (res.ok) {
      setSelectedCourses([]);
    }
  }

  if (!programmeId) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm text-slate-600">
          You have no programme assigned yet. Contact the registrar to register for courses.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-xl font-semibold text-brand-navy">
        Register for Courses
      </h2>

      <label className="mt-4 block text-sm font-medium">Semester</label>
      <select
        value={selectedSemester}
        onChange={(e) => setSelectedSemester(e.target.value)}
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
      >
        <option value="">Select a semester</option>
        {semesters.map((s) => (
          <option key={s._id} value={s._id}>
            {s.name}
          </option>
        ))}
      </select>

      {courses.length > 0 && (
        <div className="mt-4 space-y-2">
          {courses.map((c) => (
            <label key={c._id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedCourses.includes(c._id)}
                onChange={() => toggleCourse(c._id)}
              />
              {c.code} — {c.title} ({c.creditUnits} units)
            </label>
          ))}
        </div>
      )}

      {message && (
        <p className="mt-3 text-sm text-brand-navy">{message}</p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting || selectedCourses.length === 0}
        className="mt-4 rounded-md bg-brand-navy px-4 py-2 font-medium text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Registering..." : "Register selected courses"}
      </button>
    </div>
  );
}