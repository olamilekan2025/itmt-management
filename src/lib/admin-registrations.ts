import { apiGet } from "@/lib/api";

export interface RegistrationStudent {
  _id: string;
  name: string;
  email: string;
  matricNumber?: string;
}

export interface RegistrationCourse {
  _id: string;
  code: string;
  title: string;
  creditUnits: number;
}

export interface RegistrationSemester {
  _id: string;
  name: string;
  order: number;
}

export interface Registration {
  _id: string;
  student: RegistrationStudent;
  course: RegistrationCourse;
  semester: RegistrationSemester;
  programme?: {
    _id: string;
    name: string;
    code?: string;
  };
  status: "registered" | "dropped";
  createdAt: string;
  updatedAt: string;
}

export interface GetRegistrationsResponse {
  success: boolean;
  registrations: Registration[];
}

export interface RegistrationFilters {
  course?: string;
  semester?: string;
}

export async function getRegistrations(
  accessToken: string,
  filters?: RegistrationFilters,
): Promise<GetRegistrationsResponse> {
  const params = new URLSearchParams();

  if (filters?.course) {
    params.set("course", filters.course);
  }

  if (filters?.semester) {
    params.set("semester", filters.semester);
  }

  const query = params.toString();

  return apiGet<GetRegistrationsResponse>(
    `/registrations${query ? `?${query}` : ""}`,
    accessToken,
  );
}