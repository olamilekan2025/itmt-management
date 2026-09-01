import { apiGet, apiPost, apiPatch } from "./api";

export interface AcademicSession {
  _id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicSessionsResponse {
  success: boolean;
  sessions: AcademicSession[];
  message?: string;
}

export interface AcademicSessionResponse {
  success: boolean;
  session: AcademicSession;
  message: string;
}

export interface AcademicSessionPayload {
  name: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export async function getAcademicSessions(
  accessToken: string,
): Promise<AcademicSessionsResponse> {
  return apiGet<AcademicSessionsResponse>(
    "/academic-sessions",
    accessToken,
  );
}

export async function createAcademicSession(
  data: AcademicSessionPayload,
  accessToken: string,
): Promise<AcademicSessionResponse> {
  return apiPost<AcademicSessionResponse>(
    "/academic-sessions",
    data,
    accessToken,
  );
}

export async function updateAcademicSession(
  id: string,
  data: Partial<AcademicSessionPayload>,
  accessToken: string,
): Promise<AcademicSessionResponse> {
  return apiPatch<AcademicSessionResponse>(
    `/academic-sessions/${id}`,
    data,
    accessToken,
  );
}

export async function activateAcademicSession(
  id: string,
  accessToken: string,
): Promise<AcademicSessionResponse> {
  return apiPatch<AcademicSessionResponse>(
    `/academic-sessions/${id}/activate`,
    {},
    accessToken,
  );
}

