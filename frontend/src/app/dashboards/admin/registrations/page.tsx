import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";

import { getRegistrations } from "@/lib/admin-registrations";

import {
  getAdminCourses,
  getSemesters,
} from "@/lib/admin-courses";

import RegistrationsPage from "@/components/dashboard/admin/registrations/registrations-page";

export default async function AdminRegistrationsPage() {
  const session = await getServerSession(authOptions);

  const token = session?.accessToken as string;

  const [
    registrationsRes,
    coursesRes,
    semestersRes,
  ] = await Promise.all([
    getRegistrations(token),
    getAdminCourses(token),
    getSemesters(token),
  ]);

  return (
    <RegistrationsPage
      initialRegistrations={
        registrationsRes.registrations ?? []
      }
      courses={coursesRes.courses ?? []}
      semesters={semestersRes.semesters ?? []}
      accessToken={token}
    />
  );
}