import type { NextAuthOptions } from "next-auth";

import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";

import { z } from "zod";

import type { UserRole } from "./types/next-auth";

/**
 * =========================================================
 * LOGIN VALIDATION
 * =========================================================
 */

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .optional(),

  password: z
    .string()
    .min(1, "Password is required"),

  matricNumber: z
    .string()
    .trim()
    .optional(),

  otp: z
    .string()
    .trim()
    .optional(),
});

/**
 * =========================================================
 * API URL
 * =========================================================
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getApiUrl(): string {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not defined. Add it to frontend/.env.local and restart Next.js.",
    );
  }

  return API_URL.replace(/\/+$/, "");
}

/**
 * =========================================================
 * NEXT-AUTH OPTIONS
 * =========================================================
 */

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  /**
   * =======================================================
   * PROVIDERS
   * =======================================================
   */

  providers: [
    /**
     * =====================================================
     * CREDENTIALS
     * =====================================================
     *
     * Supports:
     *
     * Student:
     * matricNumber + password
     *
     * Staff:
     * email + password + optional OTP
     */

    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },

        matricNumber: {
          label: "Matric Number",
          type: "text",
        },

        password: {
          label: "Password",
          type: "password",
        },

        otp: {
          label: "OTP",
          type: "text",
        },
      },

      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const {
          email,
          matricNumber,
          password,
          otp,
        } = parsed.data;

        try {
          const apiUrl = getApiUrl();

          /**
           * =================================================
           * STUDENT LOGIN
           * =================================================
           */

          if (matricNumber) {
            const normalizedMatricNumber =
              matricNumber.trim().toUpperCase();

            const response = await fetch(
              `${apiUrl}/auth/student/login`,
              {
                method: "POST",

                headers: {
                  "Content-Type": "application/json",
                },

                body: JSON.stringify({
                  matricNumber: normalizedMatricNumber,
                  password,
                }),

                cache: "no-store",
              },
            );

            if (!response.ok) {
              return null;
            }

            const data = await response.json();

            if (
              !data?.user?.id ||
              !data?.user?.role ||
              !data?.token
            ) {
              console.error(
                "Invalid student login response:",
                data,
              );

              return null;
            }

            return {
              id: String(data.user.id),

              name:
                data.user.name ||
                normalizedMatricNumber,

              email:
                data.user.email || null,

              role: data.user.role as UserRole,

              matricNumber:
                data.user.matricNumber ||
                normalizedMatricNumber,

              accessToken: String(data.token),
            };
          }

          /**
           * =================================================
           * ADMIN / STAFF LOGIN
           * =================================================
           */

          if (email) {
            const normalizedEmail =
              email.trim().toLowerCase();

            const response = await fetch(
              `${apiUrl}/auth/login`,
              {
                method: "POST",

                headers: {
                  "Content-Type": "application/json",
                },

                body: JSON.stringify({
                  email: normalizedEmail,
                  password,
                  ...(otp ? { otp } : {}),
                }),

                cache: "no-store",
              },
            );

            if (!response.ok) {
              return null;
            }

            const data = await response.json();

            if (
              !data?.user?.id ||
              !data?.user?.role ||
              !data?.token
            ) {
              console.error(
                "Invalid staff login response:",
                data,
              );

              return null;
            }

            return {
              id: String(data.user.id),

              name:
                data.user.name ||
                normalizedEmail,

              email:
                data.user.email ||
                normalizedEmail,

              role: data.user.role as UserRole,

              accessToken: String(data.token),
            };
          }

          return null;
        } catch (error) {
          console.error(
            "Authentication API error:",
            error,
          );

          return null;
        }
      },
    }),

    /**
     * =====================================================
     * GOOGLE
     * =====================================================
     */

    GoogleProvider({
      clientId:
        process.env.GOOGLE_CLIENT_ID || "",

      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET || "",
    }),

    /**
     * =====================================================
     * FACEBOOK
     * =====================================================
     */

    FacebookProvider({
      clientId:
        process.env.FACEBOOK_CLIENT_ID || "",

      clientSecret:
        process.env.FACEBOOK_CLIENT_SECRET || "",
    }),
  ],

  /**
   * =========================================================
   * CALLBACKS
   * =========================================================
   */

  callbacks: {
    /**
     * =======================================================
     * JWT CALLBACK
     * =======================================================
     */

    async jwt({
      token,
      user,
      account,
    }) {
      /**
       * Credentials login
       */

      if (
        user &&
        account?.provider === "credentials"
      ) {
        token.id = user.id;

        token.role =
          user.role as UserRole;

        token.accessToken =
          user.accessToken;

        if (user.matricNumber) {
          token.matricNumber =
            user.matricNumber;
        }
      }

      /**
       * =====================================================
       * GOOGLE / FACEBOOK
       * =====================================================
       */

      if (
        user &&
        (
          account?.provider === "google" ||
          account?.provider === "facebook"
        )
      ) {
        try {
          const apiUrl = getApiUrl();

          const response = await fetch(
            `${apiUrl}/auth/oauth-login`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                email: user.email,
                name: user.name,
                provider:
                  account.provider,
              }),

              cache: "no-store",
            },
          );

          if (!response.ok) {
            console.error(
              "OAuth backend login failed:",
              response.status,
            );

            return token;
          }

          const data =
            await response.json();

          if (
            !data?.user?.id ||
            !data?.user?.role ||
            !data?.token
          ) {
            console.error(
              "Invalid OAuth backend response:",
              data,
            );

            return token;
          }

          token.id =
            String(data.user.id);

          token.role =
            data.user.role as UserRole;

          token.accessToken =
            String(data.token);

          if (data.user.matricNumber) {
            token.matricNumber =
              String(
                data.user.matricNumber,
              );
          }
        } catch (error) {
          console.error(
            "OAuth login exchange error:",
            error,
          );
        }
      }

      return token;
    },

    /**
     * =======================================================
     * SESSION CALLBACK
     * =======================================================
     *
     * Backend JWT becomes:
     *
     * session.accessToken
     */

    async session({
      session,
      token,
    }) {
      session.user.id =
        String(
          token.id ||
            token.sub ||
            "",
        );

      session.user.role =
        token.role as UserRole;

      if (token.matricNumber) {
        session.user.matricNumber =
          String(
            token.matricNumber,
          );
      } else {
        delete session.user
          .matricNumber;
      }

      /**
       * Backend JWT
       */

      if (token.accessToken) {
        session.accessToken =
          String(
            token.accessToken,
          );
      }

      return session;
    },
  },

  /**
   * =========================================================
   * CUSTOM AUTH PAGE
   * =========================================================
   */

  pages: {
    signIn: "/auth/login",
  },
};