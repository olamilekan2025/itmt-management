import {
  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
} from "./api";

/* =========================================================
   TYPES
========================================================= */

export type AnnouncementAudience =
  | "everyone"
  | "students"
  | "lecturers"
  | "staff";

export type AnnouncementStatus =
  | "draft"
  | "published"
  | "archived";

/* =========================================================
   CREATED BY
========================================================= */

export interface AnnouncementCreator {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

/* =========================================================
   ANNOUNCEMENT
========================================================= */

export interface Announcement {
  _id: string;

  title: string;
  content: string;

  audience: AnnouncementAudience;
  status: AnnouncementStatus;

  createdBy:
    | AnnouncementCreator
    | string;

  publishedAt?: string;

  createdAt: string;
  updatedAt: string;
}

/* =========================================================
   PAYLOADS
========================================================= */

export interface CreateAnnouncementPayload {
  title: string;
  content: string;
  audience: AnnouncementAudience;
  status: AnnouncementStatus;
}

export type UpdateAnnouncementPayload =
  Partial<CreateAnnouncementPayload>;

/* =========================================================
   RESPONSES
========================================================= */

export interface AnnouncementsResponse {
  success: boolean;
  announcements: Announcement[];
}

export interface AnnouncementResponse {
  success: boolean;
  announcement: Announcement;
  message?: string;
}

export interface AnnouncementActionResponse {
  success: boolean;
  message: string;
}

/* =========================================================
   FILTERS
========================================================= */

export interface AnnouncementFilters {
  search?: string;
  audience?: AnnouncementAudience;
  status?: AnnouncementStatus;
}

/* =========================================================
   GET ALL ANNOUNCEMENTS
========================================================= */

export async function getAdminAnnouncements(
  accessToken: string,
  filters?: AnnouncementFilters,
): Promise<AnnouncementsResponse> {
  const queryParams =
    new URLSearchParams();

  if (filters?.search) {
    queryParams.append(
      "search",
      filters.search,
    );
  }

  if (filters?.audience) {
    queryParams.append(
      "audience",
      filters.audience,
    );
  }

  if (filters?.status) {
    queryParams.append(
      "status",
      filters.status,
    );
  }

  const queryString =
    queryParams.toString();

  const path = `/announcements${
    queryString
      ? `?${queryString}`
      : ""
  }`;

  return apiGet<AnnouncementsResponse>(
    path,
    accessToken,
  );
}

/* =========================================================
   GET SINGLE ANNOUNCEMENT
========================================================= */

export async function getAnnouncementById(
  id: string,
  accessToken: string,
): Promise<AnnouncementResponse> {
  return apiGet<AnnouncementResponse>(
    `/announcements/${id}`,
    accessToken,
  );
}

/* =========================================================
   CREATE ANNOUNCEMENT
========================================================= */

export async function createAnnouncement(
  data: CreateAnnouncementPayload,
  accessToken: string,
): Promise<AnnouncementResponse> {
  return apiPost<AnnouncementResponse>(
    "/announcements",
    data,
    accessToken,
  );
}

/* =========================================================
   UPDATE ANNOUNCEMENT
========================================================= */

export async function updateAnnouncement(
  id: string,
  data: UpdateAnnouncementPayload,
  accessToken: string,
): Promise<AnnouncementResponse> {
  return apiPatch<AnnouncementResponse>(
    `/announcements/${id}`,
    data,
    accessToken,
  );
}

/* =========================================================
   PUBLISH ANNOUNCEMENT
========================================================= */

export async function publishAnnouncement(
  id: string,
  accessToken: string,
): Promise<AnnouncementResponse> {
  return apiPatch<AnnouncementResponse>(
    `/announcements/${id}/publish`,
    {},
    accessToken,
  );
}

/* =========================================================
   ARCHIVE ANNOUNCEMENT
========================================================= */

export async function archiveAnnouncement(
  id: string,
  accessToken: string,
): Promise<AnnouncementResponse> {
  return apiPatch<AnnouncementResponse>(
    `/announcements/${id}/archive`,
    {},
    accessToken,
  );
}

/* =========================================================
   DELETE ANNOUNCEMENT
========================================================= */

export async function deleteAnnouncement(
  id: string,
  accessToken: string,
): Promise<AnnouncementActionResponse> {
  return apiDelete<AnnouncementActionResponse>(
    `/announcements/${id}`,
    accessToken,
  );
}
