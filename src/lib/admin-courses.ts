import {
  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
} from "./api";

/* =========================================================
   COMMON TYPES
========================================================= */

export type EntityStatus = "active" | "archived";

export type CourseStatus = "" | EntityStatus;

/* =========================================================
   DEPARTMENT
========================================================= */

export interface Department {
  _id: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentsResponse {
  success: boolean;
  departments: Department[];
}

/* =========================================================
   PROGRAMME
========================================================= */

/**
 * Department returned when a programme is populated.
 */
export interface ProgrammeDepartment {
  _id: string;
  name: string;
  code: string;
}

/**
 * Programme returned by the admin API.
 *
 * The department reference is expected to be populated
 * by the backend.
 */
export interface Programme {
  _id: string;
  name: string;
  code: string;

  department: ProgrammeDepartment;

  award?: string;
  durationYears?: number;
  description?: string;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

/**
 * Payload used when creating/updating a programme.
 *
 * The backend receives the department ID.
 */
export interface ProgrammePayload {
  name: string;
  code: string;
  department: string;
  award?: string;
  durationYears?: number;
  description?: string;
}

export interface ProgrammeResponse {
  success: boolean;
  programme: Programme;
  message?: string;
}

export interface ProgrammesResponse {
  success: boolean;
  programmes: Programme[];
}

/* =========================================================
   ACADEMIC SESSION
========================================================= */

export interface AcademicSession {
  _id: string;
  name: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicSessionsResponse {
  success: boolean;
  sessions: AcademicSession[];
}

export interface AcademicSessionResponse {
  success: boolean;
  session: AcademicSession;
  message?: string;
}

/* =========================================================
   SEMESTER
========================================================= */

/**
 * Academic session returned when a semester is populated.
 */
export interface SemesterSession {
  _id: string;
  name: string;
  isActive: boolean;
}

/**
 * Semester returned by the admin API.
 *
 * The session reference is expected to be populated.
 */
export interface Semester {
  _id: string;
  name: string;
  order: number;

  startDate?: string;
  endDate?: string;

  isActive: boolean;

  session: SemesterSession;

  createdAt: string;
  updatedAt: string;
}

/**
 * Payload used when creating a semester.
 *
 * The backend receives the session ID.
 */
export interface SemesterPayload {
  session: string;
  name: string;
  order: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface SemesterResponse {
  success: boolean;
  semester: Semester;
  message?: string;
}

export interface SemestersResponse {
  success: boolean;
  semesters: Semester[];
}

/* =========================================================
   COURSE
========================================================= */

/**
 * Course returned by the admin API.
 *
 * Programme and semester are expected to be populated
 * by the backend.
 */
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

/**
 * Payload used when creating/updating a course.
 *
 * Programme and semester are submitted as IDs.
 */
export interface CoursePayload {
  code: string;
  title: string;
  programme: string;
  semester: string;
  level: string;
  creditUnits: number;
  category?: string;
  description?: string;
}

export interface CoursesResponse {
  success: boolean;
  courses: Course[];
}

export interface CourseResponse {
  success: boolean;
  course: Course;
  message?: string;
}

/* =========================================================
   STUDENT
========================================================= */

export interface StudentProgramme {
  _id: string;
  name: string;
  code: string;
}

export interface Student {
  _id: string;

  name: string;
  email: string;

  role: "student";

  matricNumber?: string;

  /**
   * Student programme may be populated or absent.
   */
  programme?: StudentProgramme;

  level?: string;

  isActive: boolean;
  isEmailVerified: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface StudentsResponse {
  success: boolean;
  students: Student[];
}

export interface StudentResponse {
  success: boolean;
  student: Student;
  message?: string;
}

export interface CreateExistingStudentPayload {
  name: string;
  email: string;
  password: string;
  matricNumber: string;
  programme: string;
  level: string;
}

export interface AssignProgrammePayload {
  programme: string;
  level?: string;
  matricNumber?: string;
}

/* =========================================================
   COMMON API RESPONSE
========================================================= */

export interface ApiMessageResponse {
  success: boolean;
  message: string;
}

/* =========================================================
   COURSES API
========================================================= */

/**
 * Get courses for the admin dashboard.
 *
 * Supported filters:
 * - search
 * - programme
 * - semester
 * - level
 * - status
 */
export async function getAdminCourses(
  accessToken: string,
  params?: {
    search?: string;
    programme?: string;
    semester?: string;
    level?: string;
    status?: CourseStatus;
  },
): Promise<CoursesResponse> {
  const queryParams = new URLSearchParams();

  if (params?.search?.trim()) {
    queryParams.set(
      "search",
      params.search.trim(),
    );
  }

  if (params?.programme) {
    queryParams.set(
      "programme",
      params.programme,
    );
  }

  if (params?.semester) {
    queryParams.set(
      "semester",
      params.semester,
    );
  }

  if (params?.level) {
    queryParams.set(
      "level",
      params.level,
    );
  }

  if (
    params?.status === "active" ||
    params?.status === "archived"
  ) {
    queryParams.set(
      "status",
      params.status,
    );
  }

  const queryString =
    queryParams.toString();

  const path = queryString
    ? `/courses?${queryString}`
    : "/courses";

  return apiGet<CoursesResponse>(
    path,
    accessToken,
  );
}

/**
 * Get one course by ID.
 */
export async function getCourseById(
  id: string,
  accessToken: string,
): Promise<CourseResponse> {
  return apiGet<CourseResponse>(
    `/courses/${id}`,
    accessToken,
  );
}

/**
 * Create a new course.
 */
export async function createCourse(
  data: CoursePayload,
  accessToken: string,
): Promise<CourseResponse> {
  return apiPost<CourseResponse>(
    "/courses",
    data,
    accessToken,
  );
}

/**
 * Update an existing course.
 */
export async function updateCourse(
  id: string,
  data: Partial<CoursePayload>,
  accessToken: string,
): Promise<CourseResponse> {
  return apiPatch<CourseResponse>(
    `/courses/${id}`,
    data,
    accessToken,
  );
}

/**
 * Archive a course.
 *
 * Backend uses DELETE as the archive operation.
 */
export async function archiveCourse(
  id: string,
  accessToken: string,
): Promise<ApiMessageResponse> {
  return apiDelete<ApiMessageResponse>(
    `/courses/${id}`,
    accessToken,
  );
}

/* =========================================================
   DEPARTMENTS API
========================================================= */

/**
 * Get all departments.
 */
export async function getDepartments(
  accessToken: string,
): Promise<DepartmentsResponse> {
  return apiGet<DepartmentsResponse>(
    "/departments",
    accessToken,
  );
}

/* =========================================================
   PROGRAMMES API
========================================================= */

/**
 * Get all programmes.
 *
 * Optionally filter by department.
 */
export async function getProgrammes(
  accessToken: string,
  departmentId?: string,
): Promise<ProgrammesResponse> {
  const queryParams = new URLSearchParams();

  if (departmentId) {
    queryParams.set(
      "department",
      departmentId,
    );
  }

  const queryString =
    queryParams.toString();

  const path = queryString
    ? `/programmes?${queryString}`
    : "/programmes";

  return apiGet<ProgrammesResponse>(
    path,
    accessToken,
  );
}

/**
 * Create a programme.
 */
export async function createProgramme(
  data: ProgrammePayload,
  accessToken: string,
): Promise<ProgrammeResponse> {
  return apiPost<ProgrammeResponse>(
    "/programmes",
    data,
    accessToken,
  );
}

/**
 * Update a programme.
 */
export async function updateProgramme(
  id: string,
  data: Partial<ProgrammePayload>,
  accessToken: string,
): Promise<ProgrammeResponse> {
  return apiPatch<ProgrammeResponse>(
    `/programmes/${id}`,
    data,
    accessToken,
  );
}

/**
 * Archive a programme.
 */
export async function archiveProgramme(
  id: string,
  accessToken: string,
): Promise<ApiMessageResponse> {
  return apiDelete<ApiMessageResponse>(
    `/programmes/${id}`,
    accessToken,
  );
}

/* =========================================================
   ACADEMIC SESSIONS API
========================================================= */

/**
 * Get all academic sessions.
 */
export async function getAcademicSessions(
  accessToken: string,
): Promise<AcademicSessionsResponse> {
  return apiGet<AcademicSessionsResponse>(
    "/academic-sessions",
    accessToken,
  );
}

/* =========================================================
   SEMESTERS API
========================================================= */

/**
 * Get semesters.
 *
 * Optionally filter by academic session.
 */
export async function getSemesters(
  accessToken: string,
  sessionId?: string,
): Promise<SemestersResponse> {
  const queryParams = new URLSearchParams();

  if (sessionId) {
    queryParams.set(
      "session",
      sessionId,
    );
  }

  const queryString =
    queryParams.toString();

  const path = queryString
    ? `/semesters?${queryString}`
    : "/semesters";

  return apiGet<SemestersResponse>(
    path,
    accessToken,
  );
}

/**
 * Create a semester.
 */
export async function createSemester(
  data: SemesterPayload,
  accessToken: string,
): Promise<SemesterResponse> {
  return apiPost<SemesterResponse>(
    "/semesters",
    data,
    accessToken,
  );
}

/**
 * Activate a semester.
 */
export async function activateSemester(
  id: string,
  accessToken: string,
): Promise<SemesterResponse> {
  return apiPatch<SemesterResponse>(
    `/semesters/${id}/activate`,
    {},
    accessToken,
  );
}

/* =========================================================
   STUDENTS API
========================================================= */

/**
 * Get all students.
 */
export async function getAdminStudents(
  accessToken: string,
): Promise<StudentsResponse> {
  return apiGet<StudentsResponse>(
    "/users?role=student",
    accessToken,
  );
}

/**
 * Get one student by ID.
 */
export async function getStudentById(
  id: string,
  accessToken: string,
): Promise<StudentResponse> {
  return apiGet<StudentResponse>(
    `/users/${id}`,
    accessToken,
  );
}

/**
 * Assign or update a student's programme.
 */
export async function assignStudentProgramme(
  id: string,
  data: AssignProgrammePayload,
  accessToken: string,
): Promise<StudentResponse> {
  return apiPatch<StudentResponse>(
    `/users/${id}/programme`,
    data,
    accessToken,
  );
}

/**
 * Create an existing student who already
 * has a matriculation number.
 */
export async function createExistingStudent(
  data: CreateExistingStudentPayload,
  accessToken: string,
): Promise<StudentResponse> {
  return apiPost<StudentResponse>(
    "/users/students/existing",
    data,
    accessToken,
  );
}

