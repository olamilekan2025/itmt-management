
"use client";

import { getSession, signOut } from "next-auth/react";

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL?.trim();

function getLogoutUrl(): string | null {
  if (!RAW_API_URL) {
    return null;
  }

  const baseUrl = RAW_API_URL.replace(/\/+$/, "");

  // Supports both:
  // https://itmt-management-api.onrender.com
  // https://itmt-management-api.onrender.com/api
  const apiBaseUrl = /\/api$/i.test(baseUrl)
    ? baseUrl
    : `${baseUrl}/api`;

  return `${apiBaseUrl}/auth/logout`;
}

/**
 * Logs the user out of the backend and NextAuth.
 *
 * Use this helper in the public navbar and all role dashboards.
 */
export async function logoutUser(
  callbackUrl = "/",
): Promise<void> {
  try {
    const session = await getSession();
    const accessToken = session?.accessToken;
    const logoutUrl = getLogoutUrl();

    if (accessToken && logoutUrl) {
      const response = await fetch(logoutUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        console.error(
          `Backend logout failed with status ${response.status}.`,
        );
      }
    } else if (!accessToken) {
      console.warn(
        "No backend access token was found in the session.",
      );
    } else {
      console.error(
        "NEXT_PUBLIC_API_URL is not configured.",
      );
    }
  } catch (error) {
    // Still clear the local session if the backend is unavailable.
    console.error("Backend logout request failed:", error);
  } finally {
    // Always attempt to clear the NextAuth session.
    await signOut({
      callbackUrl,
      redirect: true,
    });
  }
}
