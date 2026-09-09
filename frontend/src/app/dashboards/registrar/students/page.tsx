import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { apiGet } from "@/lib/api";
import RegistrarStudentsClient from "./registrar-students-client";

interface Programme {
  _id: string;
  name: string;
  code: string;
}

interface AcademicSession {
  _id: string;
  name: string;
}

interface Student {
  _id: string;
  name: string;
  email: string;
  role: "student";
  programme?: Programme | string | null;
  academicSession?: AcademicSession | string | null;
  matricNumber?: string;
  level?: string;
  isActive: boolean;
  isSuspended: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StudentsResponse {
  success: boolean;
  users?: Student[];
  students?: Student[];
  message?: string;
}

export default async function RegistrarStudentsPage() {
  const session = await getServerSession(authOptions);
  const token = session?.accessToken as string;

  let students: Student[] = [];
  let error = "";

  try {
    const data = await apiGet<StudentsResponse>("/users?role=student", token);
    students = data.users ?? data.students ?? [];
  } catch (err) {
    console.error("Failed to load students:", err);
    error = "Failed to load students";
  }

  return <RegistrarStudentsClient initialStudents={students} accessToken={token} initialError={error} />;
}
