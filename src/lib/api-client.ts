"use client";

import { getSession } from "next-auth/react";

import {
  apiGet,
  apiPatch,
} from "@/lib/api";

/**
 * =========================================================
 * STUDENT TYPE
 * =========================================================
 */

export type Student = {
  _id: string;

  id?: string;

  name: string;

  email: string;

  role: "student";

  matricNumber?: string;

  level?: string;

  isActive: boolean;

  isEmailVerified?: boolean;

  programme?: {
    _id: string;
    name: string;
    code: string;
  } | null;

  academicSession?: {
    _id: string;
    name: string;
  } | null;

  createdAt?: string;

  updatedAt?: string;
};

/**
 * =========================================================
 * GET ACCESS TOKEN
 * =========================================================
 *
 * The access token is stored on the NextAuth session itself:
 *
 * session.accessToken
 *
 * NOT:
 *
 * session.user.accessToken
 *
 * =========================================================
 */

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

/**
 * =========================================================
 * GET STUDENT
 * =========================================================
 *
 * GET /api/users/:id
 * =========================================================
 */

export async function getStudent(
  id: string,
): Promise<Student> {
  if (!id) {
    throw new Error(
      "Student ID is required",
    );
  }

  const accessToken =
    await getAccessToken();

  const response =
    await apiGet<{
      success: boolean;
      user: Student;
    }>(
      `/users/${id}`,
      accessToken,
    );

  if (
    !response.success ||
    !response.user
  ) {
    throw new Error(
      "Unable to retrieve student",
    );
  }

  return response.user;
}

/**
 * =========================================================
 * ACTIVATE STUDENT
 * =========================================================
 *
 * PATCH /api/users/:id/activate
 * =========================================================
 */

export async function activateStudent(
  id: string,
) {
  if (!id) {
    throw new Error(
      "Student ID is required",
    );
  }

  const accessToken =
    await getAccessToken();

  return apiPatch<{
    success: boolean;
    message: string;
    user: Student;
  }>(
    `/users/${id}/activate`,
    {},
    accessToken,
  );
}

/**
 * =========================================================
 * DEACTIVATE STUDENT
 * =========================================================
 *
 * PATCH /api/users/:id/deactivate
 * =========================================================
 */

export async function deactivateStudent(
  id: string,
) {
  if (!id) {
    throw new Error(
      "Student ID is required",
    );
  }

  const accessToken =
    await getAccessToken();

  return apiPatch<{
    success: boolean;
    message: string;
    user: Student;
  }>(
    `/users/${id}/deactivate`,
    {},
    accessToken,
  );
}

/**
 * =========================================================
 * ASSIGN / UPDATE PROGRAMME
 * =========================================================
 *
 * PATCH /api/users/:id/programme
 * =========================================================
 */

export async function assignStudentProgramme(
  id: string,
  data: {
    programme: string;
    level?: string;
    matricNumber?: string;
  },
) {
  if (!id) {
    throw new Error(
      "Student ID is required",
    );
  }

  const accessToken =
    await getAccessToken();

  return apiPatch<{
    success: boolean;
    message: string;
    user: Student;
  }>(
    `/users/${id}/programme`,
    data,
    accessToken,
  );
}
