import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { apiGet } from "@/lib/api";
import StudentSidebar from "@/components/dashboard/student/sidebar";
import StudentHeader from "@/components/dashboard/student/header";
import RegistrationPanel from "@/components/dashboard/student/registration-panel";
import FeesPanel from "@/components/dashboard/student/fees-panel";
import StudentResultsPanel from "@/components/student/results/student-results-panel";

interface MeResponse {
  success: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    programme?: { _id: string; name: string; code: string };
    matricNumber?: string;
  };
}

interface RegistrationsResponse {
  success: boolean;
  registrations: Array<{
    _id: string;
    course: { _id: string; code: string; title: string; creditUnits: number };
    semester: { _id: string; name: string; order: number };
  }>;
}

interface StudentResult {
  _id: string;
  course: { code: string; title: string; creditUnits: number };
  semester: { _id: string; name: string; order: number };
  score: number;
  grade: string;
}

interface ResultsResponse {
  success: boolean;
  results: StudentResult[];
}

export default async function StudentPage() {
  const session = await getServerSession(authOptions);
  const token = session?.accessToken as string;

  const [meRes, regRes, resultsRes] = await Promise.all([
    apiGet<MeResponse>("/users/me", token),
    apiGet<RegistrationsResponse>("/registrations/me", token),
    apiGet<ResultsResponse>("/results/me", token),
  ]);

  const profile = meRes.user;
  const registrations = regRes.registrations;
  const results = resultsRes.results;

  return (
    <div className="flex min-h-screen bg-brand-light">
      <StudentSidebar />

      <div className="flex flex-1 flex-col">
        <StudentHeader userName={profile.name} />

        <main className="flex-1 p-8">
          <div className="mx-auto max-w-5xl space-y-6">
            <div id="overview" className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand-gold" />
                <p className="text-sm font-semibold text-brand-navy">Profile</p>
              </div>

              <p className="mt-2 text-sm text-slate-600">
                {profile.programme?.name || "No programme assigned"}
                {profile.matricNumber ? ` • ${profile.matricNumber}` : ""}
              </p>
            </div>

            <div id="courses" className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-brand-navy">Registered Courses</h2>

              {registrations.length === 0 ? (
                <p className="mt-3 text-sm text-slate-600">
                  You have no active course registrations.
                </p>
              ) : (
                <table className="mt-4 w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="pb-2">Code</th>
                      <th className="pb-2">Title</th>
                      <th className="pb-2">Units</th>
                      <th className="pb-2">Semester</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((r) => (
                      <tr key={r._id} className="border-b border-slate-100">
                        <td className="py-2 font-medium text-brand-navy">{r.course.code}</td>
                        <td className="py-2">{r.course.title}</td>
                        <td className="py-2">{r.course.creditUnits}</td>
                        <td className="py-2">{r.semester.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <StudentResultsPanel results={results} />

            <div id="fees">
              <FeesPanel accessToken={token} />
            </div>

            <div id="register">
              <RegistrationPanel accessToken={token} programmeId={profile.programme?._id} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}