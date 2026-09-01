import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { apiGet } from "@/lib/api";
import RegistrarSidebar from "@/components/dashboard/registrar/sidebar";
import RegistrarHeader from "@/components/dashboard/registrar/header";
import StudentsPanel from "@/components/dashboard/registrar/students-panel";
import LecturerAssignmentPanel from "@/components/dashboard/registrar/lecturer-assignment-panel";
import PublishResultsPanel from "@/components/dashboard/registrar/publish-results-panel";

interface UsersResponse {
  success: boolean;
  users: Array<{
    _id: string;
    name: string;
    email: string;
    role: string;
    programme?: { _id: string; name: string; code: string };
    matricNumber?: string;
  }>;
}

interface ProgrammesResponse {
  success: boolean;
  programmes: Array<{ _id: string; name: string; code: string }>;
}

interface CoursesResponse {
  success: boolean;
  courses: Array<{ _id: string; code: string; title: string }>;
}

interface SemestersResponse {
  success: boolean;
  semesters: Array<{ _id: string; name: string }>;
}

export default async function RegistrarPage() {
  const session = await getServerSession(authOptions);
  const token = session?.accessToken as string;

  const [studentsRes, lecturersRes, programmesRes, coursesRes, semestersRes] =
    await Promise.all([
      apiGet<UsersResponse>("/users?role=student", token),
      apiGet<UsersResponse>("/users?role=lecturer", token),
      apiGet<ProgrammesResponse>("/programmes", token),
      apiGet<CoursesResponse>("/courses", token),
      apiGet<SemestersResponse>("/semesters", token),
    ]);

  return (
    <div className="flex min-h-screen bg-brand-light">
      <RegistrarSidebar />

      <div className="flex flex-1 flex-col">
        <RegistrarHeader userName={session?.user?.name || "Registrar"} />

        <main className="flex-1 p-8">
          <div className="mx-auto max-w-5xl space-y-6">
            <div id="overview" className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-sm text-slate-600">
                {studentsRes.users.length} student{studentsRes.users.length === 1 ? "" : "s"} •{" "}
                {lecturersRes.users.length} lecturer{lecturersRes.users.length === 1 ? "" : "s"}
              </p>
            </div>

            <div id="students">
              <StudentsPanel
                accessToken={token}
                students={studentsRes.users}
                programmes={programmesRes.programmes}
              />
            </div>

            <div id="assign">
              <LecturerAssignmentPanel
                accessToken={token}
                lecturers={lecturersRes.users}
                courses={coursesRes.courses}
                semesters={semestersRes.semesters}
              />
            </div>

            <div id="publish">
              <PublishResultsPanel
                accessToken={token}
                courses={coursesRes.courses}
                semesters={semestersRes.semesters}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}