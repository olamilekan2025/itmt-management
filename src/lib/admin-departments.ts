
import { apiGet, apiPost, apiPatch, apiDelete } from "./api";

export interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentsResponse {
  success: boolean;
  departments: Department[];
  message?: string;
}

export interface DepartmentResponse {
  success: boolean;
  department: Department;
  message: string;
}

export interface DepartmentPayload {
  name: string;
  code: string;
  description?: string;
}

export async function getDepartments(
  accessToken: string,
): Promise<DepartmentsResponse> {
  return apiGet<DepartmentsResponse>("/departments", accessToken);
}

export async function createDepartment(
  data: DepartmentPayload,
  accessToken: string,
): Promise<DepartmentResponse> {
  return apiPost<DepartmentResponse>(
    "/departments",
    data,
    accessToken,
  );
}

export async function updateDepartment(
  id: string,
  data: Partial<DepartmentPayload>,
  accessToken: string,
): Promise<DepartmentResponse> {
  return apiPatch<DepartmentResponse>(
    `/departments/${id}`,
    data,
    accessToken,
  );
}

export async function archiveDepartment(
  id: string,
  accessToken: string,
): Promise<DepartmentResponse> {
  return apiDelete<DepartmentResponse>(
    `/departments/${id}`,
    accessToken,
  );
}
