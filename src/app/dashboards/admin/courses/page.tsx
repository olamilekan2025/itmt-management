import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import {
  getAdminCourses,
  getDepartments,
  getProgrammes,
  getSemesters,
} from "@/lib/admin-courses";

import CoursesPage from "@/components/dashboard/admin/courses/courses-page";

export default async function AdminCoursesPage() {
  const session = await getServerSession(authOptions);

  const token = session?.accessToken as string | undefined;

  // Prevent API calls when there is no authenticated session.
  if (!token) {
    redirect("/login");
  }

  const [
    coursesRes,
    departmentsRes,
    programmesRes,
    semestersRes,
  ] = await Promise.all([
    getAdminCourses(token),
    getDepartments(token),
    getProgrammes(token),
    getSemesters(token),
  ]);

  return (
    <CoursesPage
      initialCourses={coursesRes.courses ?? []}
      departments={departmentsRes.departments ?? []}
      programmes={programmesRes.programmes ?? []}
      semesters={semestersRes.semesters ?? []}
      accessToken={token}
    />
  );
}
