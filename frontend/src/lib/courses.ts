import { publicApiGet } from "./api";

/* =========================================================
   TYPES
========================================================= */

export interface Programme {
  _id: string;
  name: string;
  code: string;
}

export interface Semester {
  _id: string;
  name: string;
  order: number;
}

export interface Course {
  _id: string;
  code: string;
  title: string;
  programme: Programme;
  semester: Semester;
  level: string;
  creditUnits: number;
  category?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CoursesResponse {
  success: boolean;
  courses: Course[];
}

/* =========================================================
   GET PUBLIC COURSES
========================================================= */

export async function getPublicCourses(params?: {
  search?: string;
  programme?: string;
  semester?: string;
  level?: string;
}): Promise<CoursesResponse> {
  const queryParams = new URLSearchParams();

  if (params?.search) {
    queryParams.append("search", params.search);
  }

  if (params?.programme) {
    queryParams.append("programme", params.programme);
  }

  if (params?.semester) {
    queryParams.append("semester", params.semester);
  }

  if (params?.level) {
    queryParams.append("level", params.level);
  }

  const queryString = queryParams.toString();

  /*
   * The API helper does NOT add /api.
   *
   * Therefore this must contain the complete
   * backend API route.
   */

  const path = `/api/courses/public${
    queryString ? `?${queryString}` : ""
  }`;

  return publicApiGet<CoursesResponse>(path);
}

