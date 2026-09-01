"use client";

import { getSession } from "next-auth/react";

import {
  apiGet,
  apiPatch,
  apiPost,
} from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

export type StaffRole =
  | "admin"
  | "registrar"
  | "finance"
  | "lecturer";

export type Staff = {
  _id: string;
  id?: string;

  name: string;
  email: string;

  role: StaffRole;

  isActive: boolean;
  isEmailVerified?: boolean;

  createdAt?: string;
  updatedAt?: string;
};

export type CreateStaffData = {
  name: string;
  email: string;
  password: string;
  role: StaffRole;
};

export type StaffResponse = {
  success: boolean;
  user?: Staff;
  message?: string;
};

export type StaffListResponse = {
  success: boolean;
  users?: Staff[];
  message?: string;
};

/* =========================================================
   ACCESS TOKEN
========================================================= */

async function getAccessToken(): Promise<string> {
  const session = await getSession();

  const accessToken = session?.accessToken;

  if (
    typeof accessToken !== "string" ||
    !accessToken
  ) {
    throw new Error(
      "You are not authenticated. Please sign in again.",
    );
  }

  return accessToken;
}

/* =========================================================
   GET STAFF
========================================================= */

/**
 * GET /api/users/staff
 *
 * Admin only.
 *
 * Returns all staff accounts:
 * - admin
 * - registrar
 * - finance
 * - lecturer
 *
 * Includes both active and inactive staff.
 */

export async function getStaff(): Promise<Staff[]> {
  const accessToken =
    await getAccessToken();

  const response =
    await apiGet<StaffListResponse>(
      "/users/staff",
      accessToken,
    );

  if (!response.success) {
    throw new Error(
      response.message ||
        "Unable to load staff.",
    );
  }

  return response.users ?? [];
}

/* =========================================================
   GET STAFF BY ID
========================================================= */

export async function getStaffById(
  id: string,
): Promise<Staff> {
  if (!id) {
    throw new Error(
      "Staff ID is required.",
    );
  }

  const accessToken =
    await getAccessToken();

  const response =
    await apiGet<StaffResponse>(
      `/users/${id}`,
      accessToken,
    );

  if (
    !response.success ||
    !response.user
  ) {
    throw new Error(
      response.message ||
        "Unable to retrieve staff member.",
    );
  }

  return response.user;
}

/* =========================================================
   CREATE STAFF
========================================================= */

/**
 * POST /api/users/staff
 */

export async function createStaff(
  data: CreateStaffData,
): Promise<StaffResponse> {
  const accessToken =
    await getAccessToken();

  const response =
    await apiPost<StaffResponse>(
      "/users/staff",
      data,
      accessToken,
    );

  if (!response.success) {
    throw new Error(
      response.message ||
        "Unable to create staff account.",
    );
  }

  return response;
}

/* =========================================================
   ACTIVATE STAFF
========================================================= */

export async function activateStaff(
  id: string,
): Promise<StaffResponse> {
  if (!id) {
    throw new Error(
      "Staff ID is required.",
    );
  }

  const accessToken =
    await getAccessToken();

  const response =
    await apiPatch<StaffResponse>(
      `/users/${id}/activate`,
      {},
      accessToken,
    );

  if (!response.success) {
    throw new Error(
      response.message ||
        "Unable to activate staff account.",
    );
  }

  return response;
}

/* =========================================================
   DEACTIVATE STAFF
========================================================= */

export async function deactivateStaff(
  id: string,
): Promise<StaffResponse> {
  if (!id) {
    throw new Error(
      "Staff ID is required.",
    );
  }

  const accessToken =
    await getAccessToken();

  const response =
    await apiPatch<StaffResponse>(
      `/users/${id}/deactivate`,
      {},
      accessToken,
    );

  if (!response.success) {
    throw new Error(
      response.message ||
        "Unable to deactivate staff account.",
    );
  }

  return response;
}

/* =========================================================
   UPDATE STAFF
========================================================= */

export async function updateStaff(
  id: string,
  data: Partial<{
    name: string;
    email: string;
    role: StaffRole;
  }>,
): Promise<StaffResponse> {
  if (!id) {
    throw new Error(
      "Staff ID is required.",
    );
  }

  const accessToken =
    await getAccessToken();

  const response =
    await apiPatch<StaffResponse>(
      `/users/${id}`,
      data,
      accessToken,
    );

  if (!response.success) {
    throw new Error(
      response.message ||
        "Unable to update staff account.",
    );
  }

  return response;
}