import { apiGet, apiPost, apiPatch } from "@/lib/api";

export interface Lecturer {
  _id: string;
  name: string;
  email: string;
}

export interface AssignmentCourse {
  _id: string;
  code: string;
  title: string;
  creditUnits: number;
  level?: string;
}

export interface AssignmentSemester {
  _id: string;
  name: string;
  order: number;
}

export interface LecturerAssignment {
  _id: string;
  lecturer: Lecturer;
  course: AssignmentCourse;
  semester: AssignmentSemester;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetLecturerAssignmentsResponse {
  success: boolean;
  assignments: LecturerAssignment[];
}

export interface CreateLecturerAssignmentPayload {
  lecturer: string;
  course: string;
  semester: string;
}

export interface CreateLecturerAssignmentResponse {
  success: boolean;
  message: string;
  assignment: LecturerAssignment;
}

export interface RemoveLecturerAssignmentResponse {
  success: boolean;
  message: string;
}

export async function getLecturerAssignments(
  accessToken: string,
): Promise<GetLecturerAssignmentsResponse> {
  return apiGet<GetLecturerAssignmentsResponse>(
    "/lecturer-assignments",
    accessToken,
  );
}

export async function createLecturerAssignment(
  payload: CreateLecturerAssignmentPayload,
  accessToken: string,
): Promise<CreateLecturerAssignmentResponse> {
  return apiPost<CreateLecturerAssignmentResponse>(
    "/lecturer-assignments",
    payload,
    accessToken,
  );
}

export async function removeLecturerAssignment(
  id: string,
  accessToken: string,
): Promise<RemoveLecturerAssignmentResponse> {
  return apiPatch<RemoveLecturerAssignmentResponse>(
    `/lecturer-assignments/${id}/remove`,
    {},
    accessToken,
  );
}