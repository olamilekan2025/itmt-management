import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { apiGet } from "@/lib/api";
import LecturerSidebar from "@/components/dashboard/lecturer/sidebar";
import LecturerHeader from "@/components/dashboard/lecturer/header";
import ResultEntryPanel from "@/components/dashboard/lecturer/result-entry-panel";

interface AssignmentsResponse {
  success: boolean;
  assignments: Array<{
    _id: string;
    course: { _id: string; code: string; title: string; creditUnits: number };
    semester: { _id: string; name: string; order: number };
  }>;
}

export default async function LecturerPage() {
  const session = await getServerSession(authOptions);
  const token = session?.accessToken as string;

  const { assignments } = await apiGet<AssignmentsResponse>(
    "/lecturer-assignments/me",
    token,
  );

  return (
    <div className="flex min-h-screen bg-brand-light">
      <LecturerSidebar />

      <div className="flex flex-1 flex-col">
        <LecturerHeader userName={session?.user?.name || "Lecturer"} />

        <main className="flex-1 p-8">
          <div className="mx-auto max-w-5xl space-y-6">
            <div id="overview" className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-sm text-slate-600">
                {assignments.length} course assignment{assignments.length === 1 ? "" : "s"} this session.
              </p>
            </div>

            {assignments.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
                <p className="text-sm text-slate-600">
                  You have no course assignments yet. Contact the registrar.
                </p>
              </div>
            ) : (
              <div id="scores">
                <ResultEntryPanel accessToken={token} assignments={assignments} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}