import type { DefaultSession } from "next-auth";

import "next-auth";
import "next-auth/jwt";

/**
 * =========================================================
 * USER ROLES
 * =========================================================
 */

export type UserRole =
  | "admin"
  | "registrar"
  | "finance"
  | "lecturer"
  | "student";

/**
 * =========================================================
 * NEXT-AUTH TYPES
 * =========================================================
 */

declare module "next-auth" {
  /**
   * User returned by the authentication provider.
   */
  interface User {
    id: string;

    role: UserRole;

    accessToken: string;

    matricNumber?: string;
  }

  /**
   * Session available on the frontend.
   *
   * The backend JWT is intentionally exposed in both places:
   *
   * session.user.accessToken
   * session.accessToken
   *
   * This keeps compatibility with different parts
   * of the ITMT Management System.
   */
  interface Session {
    user: {
      id: string;

      role: UserRole;

      /**
       * Backend Express JWT.
       *
       * Optional because a session may temporarily exist
       * without an access token.
       */
      accessToken?: string;

      matricNumber?: string;
    } & DefaultSession["user"];

    /**
     * Backend Express JWT at session root.
     */
    accessToken?: string;
  }
}

/**
 * =========================================================
 * NEXT-AUTH JWT TYPES
 * =========================================================
 */

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;

    role?: UserRole;

    accessToken?: string;

    matricNumber?: string;
  }
}