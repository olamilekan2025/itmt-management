import { apiGet } from "./api";

export interface AuditLog {
  _id: string;
  actor?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  actorName?: string;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  module: string;
  description: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  status: "success" | "failed";
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogsResponse {
  success: boolean;
  data: {
    items: AuditLog[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
  message?: string;
}

export interface AuditLogResponse {
  success: boolean;
  data: AuditLog;
  message?: string;
}

export async function getAuditLogs(
  accessToken: string,
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    action?: string;
    module?: string;
    role?: string;
    status?: string;
    from?: string;
    to?: string;
  },
): Promise<AuditLogsResponse> {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.action) queryParams.append("action", params.action);
  if (params?.module) queryParams.append("module", params.module);
  if (params?.role) queryParams.append("role", params.role);
  if (params?.status) queryParams.append("status", params.status);
  if (params?.from) queryParams.append("from", params.from);
  if (params?.to) queryParams.append("to", params.to);

  const queryString = queryParams.toString();
  const url = `/audit-logs${queryString ? `?${queryString}` : ""}`;
  
  return apiGet<AuditLogsResponse>(url, accessToken);
}

export async function getAuditLogById(
  id: string,
  accessToken: string,
): Promise<AuditLogResponse> {
  return apiGet<AuditLogResponse>(`/audit-logs/${id}`, accessToken);
}
