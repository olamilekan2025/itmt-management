const API_URL = process.env.NEXT_PUBLIC_API_URL;

/* =========================================================
   API ERROR
========================================================= */

export class ApiError extends Error {
  status: number;
  path: string;
  data?: unknown;

  constructor(
    message: string,
    status: number,
    path: string,
    data?: unknown,
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.path = path;
    this.data = data;

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/* =========================================================
   API URL
========================================================= */

function getApiUrl(): string {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not defined. Add it to frontend/.env.local and restart the Next.js server.",
    );
  }

  return API_URL.replace(/\/+$/, "");
}

/* =========================================================
   NORMALIZE PATH
========================================================= */

function normalizePath(path: string): string {
  const normalized = path.trim();

  if (!normalized) {
    return "/";
  }

  return normalized.startsWith("/")
    ? normalized
    : `/${normalized}`;
}

/* =========================================================
   NORMALIZE API PATH
   ---------------------------------------------------------
   Backend routes are mounted under /api.

   Examples:
   /users              -> /api/users
   /users?role=student -> /api/users?role=student
   /courses            -> /api/courses
   /api/users          -> /api/users
   ========================================================= */

function normalizeApiPath(path: string): string {
  const normalizedPath = normalizePath(path);

  // Already contains /api
  if (
    normalizedPath === "/api" ||
    normalizedPath.startsWith("/api/")
  ) {
    return normalizedPath;
  }

  // Add /api to normal backend routes
  if (normalizedPath === "/") {
    return "/api/";
  }

  return `/api${normalizedPath}`;
}

/* =========================================================
   FETCH HELPER
========================================================= */

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 15000);

  const normalizedPath = normalizePath(path);
  const apiPath = normalizeApiPath(path);
  const url = `${getApiUrl()}${apiPath}`;

  try {
    console.log(
      "[ITMT API]",
      options.method ?? "GET",
      url,
    );

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      cache: "no-store",
    });

    let data: unknown = null;

    const contentType =
      response.headers.get("content-type") ?? "";

    /* =====================================================
       PARSE RESPONSE
    ===================================================== */

    if (contentType.includes("application/json")) {
      try {
        data = await response.json();
      } catch {
        data = null;
      }
    } else {
      try {
        const text = await response.text();

        if (text) {
          data = {
            message: text,
          };
        }
      } catch {
        data = null;
      }
    }

    /* =====================================================
       ERROR RESPONSE
    ===================================================== */

    if (!response.ok) {
      let message =
        `Request failed with status ${response.status}`;

      if (
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof data.message === "string"
      ) {
        message = data.message;
      }

      throw new ApiError(
        message,
        response.status,
        normalizedPath,
        data,
      );
    }

    /* =====================================================
       SUCCESS RESPONSE
    ===================================================== */

    return data as T;
  } catch (error) {
    /* =====================================================
       REQUEST TIMEOUT
    ===================================================== */

    if (
      error instanceof DOMException &&
      error.name === "AbortError"
    ) {
      throw new ApiError(
        `Request to ${normalizedPath} timed out. Please check that the backend server is running.`,
        408,
        normalizedPath,
      );
    }

    /* =====================================================
       NETWORK ERROR
    ===================================================== */

    if (error instanceof TypeError) {
      throw new ApiError(
        "Unable to connect to the backend server. Please check that the API server is running.",
        0,
        normalizedPath,
        error,
      );
    }

    /* =====================================================
       API ERROR / OTHER ERROR
    ===================================================== */

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

/* =========================================================
   GET
========================================================= */

export async function apiGet<T>(
  path: string,
  accessToken?: string,
): Promise<T> {
  const headers: HeadersInit = {};

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return apiFetch<T>(path, {
    method: "GET",
    headers,
  });
}

/* =========================================================
   POST
========================================================= */

export async function apiPost<T>(
  path: string,
  data: unknown,
  accessToken?: string,
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return apiFetch<T>(path, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
}

/* =========================================================
   PATCH
========================================================= */

export async function apiPatch<T>(
  path: string,
  data: unknown,
  accessToken?: string,
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return apiFetch<T>(path, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });
}

/* =========================================================
   PUT
========================================================= */

export async function apiPut<T>(
  path: string,
  data: unknown,
  accessToken?: string,
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return apiFetch<T>(path, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });
}

/* =========================================================
   DELETE
========================================================= */

export async function apiDelete<T>(
  path: string,
  accessToken?: string,
): Promise<T> {
  const headers: HeadersInit = {};

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return apiFetch<T>(path, {
    method: "DELETE",
    headers,
  });
}

/* =========================================================
   PUBLIC GET
========================================================= */

export async function publicApiGet<T>(
  path: string,
): Promise<T> {
  return apiFetch<T>(path, {
    method: "GET",
  });
}