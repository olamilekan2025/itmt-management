import { apiGet, apiPost } from "@/lib/api";

export interface AdminStudent {
  _id: string;
  name: string;
  email: string;
  matricNumber: string;
  role: "student";
  isActive: boolean;
  programme?: {
    _id: string;
    name: string;
  };
  academicSession?: {
    _id: string;
    name: string;
  };
  level?: string;
}

export interface CreateExistingStudentPayload {
  name: string;
  email: string;
  matricNumber: string;
  programme: string;
  academicSession: string;
  level: string;
  password: string;
}

export async function createExistingStudent(
  payload: CreateExistingStudentPayload,
  accessToken: string,
) {
  return apiPost<{
    success: boolean;
    message: string;
    student: AdminStudent;
  }>(
    "/students/existing",
    payload,
    accessToken,
  );
}