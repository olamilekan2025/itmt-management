
import { DefaultSession } from "next-auth";

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
  interface User {
    id: string;
    role: UserRole;
    accessToken: string;
    matricNumber?: string;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
      matricNumber?: string;
    } & DefaultSession["user"];

    /**
     * Backend Express JWT.
     *
     * This is the token returned by:
     *
     * POST /auth/login
     * POST /auth/student/login
     * POST /auth/oauth-login
     */
    accessToken: string;
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

