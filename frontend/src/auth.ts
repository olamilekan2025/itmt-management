import type { NextAuthOptions } from "next-auth";

import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";

import { z } from "zod";

import type { UserRole } from "./types/next-auth";

/* ============================================================
   LOGIN VALIDATION
============================================================ */

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
    .regex(/^\d{6}$/, "OTP must be a 6-digit code")
    .optional(),
});

/* ============================================================
   VALID ROLES
============================================================ */

const VALID_ROLES: UserRole[] = [
  "admin",
  "registrar",
  "finance",
  "lecturer",
  "student",
];

function isValidRole(role: unknown): role is UserRole {
  return (
    typeof role === "string" &&
    VALID_ROLES.includes(role as UserRole)
  );
}

/* ============================================================
   API URL
============================================================ */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getApiUrl(): string {
  const rawApiUrl = API_URL?.trim();

  if (!rawApiUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not defined. Add it to frontend/.env.local and restart Next.js.",
    );
  }

  let apiUrl = rawApiUrl.replace(/\/+$/, "");

  if (!/\/api$/i.test(apiUrl)) {
    apiUrl = `${apiUrl}/api`;
  }

  return apiUrl;
}

/* ============================================================
   NEXTAUTH CONFIGURATION VALIDATION
============================================================ */

if (!process.env.NEXTAUTH_SECRET) {
  console.error(
    "WARNING: NEXTAUTH_SECRET is not defined in environment variables.",
    "Add NEXTAUTH_SECRET to frontend/.env.local and restart Next.js.",
    "Generate a secure secret with: openssl rand -base64 32",
  );
}

if (!process.env.NEXTAUTH_URL) {
  console.error(
    "WARNING: NEXTAUTH_URL is not defined in environment variables.",
    "Add NEXTAUTH_URL=http://localhost:3000 to frontend/.env.local and restart Next.js.",
  );
}

/* ============================================================
   NEXTAUTH OPTIONS
============================================================ */

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  /* ==========================================================
     SESSION
  ========================================================== */

  session: {
    strategy: "jwt",
  },

  /* ==========================================================
     PROVIDERS
  ========================================================== */

  providers: [
    /* ========================================================
       CREDENTIALS LOGIN
    ======================================================== */

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
        /* ------------------------------------------------------
           Validate credentials
        ------------------------------------------------------ */

        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          console.error(
            "NextAuth credentials validation failed:",
            parsed.error.flatten(),
          );

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

          /* ==================================================
             STUDENT LOGIN

             Matric Number + Password
          ================================================== */

          if (matricNumber) {
            const normalizedMatricNumber =
              matricNumber.trim().toUpperCase();

            console.log(
              "NextAuth: authenticating student:",
              normalizedMatricNumber,
            );

            /*
             * IMPORTANT:
             *
             * apiUrl already contains /api
             *
             * http://localhost:5000/api
             *
             * Therefore DO NOT add another /api here.
             */

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

            console.log(
              "NextAuth student login status:",
              response.status,
            );

            const data = await response
              .json()
              .catch(() => null);

            if (!response.ok) {
              console.error(
                "Student login failed:",
                {
                  status: response.status,
                  data,
                },
              );

              return null;
            }

            console.log(
              "NEXTAUTH STUDENT LOGIN RESPONSE:",
              {
                success: data?.success,
                userId: data?.user?.id,
                role: data?.user?.role,
                hasAccessToken: Boolean(data?.token),
              },
            );

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

            if (!isValidRole(data.user.role)) {
              console.error(
                "Invalid student role:",
                data.user.role,
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

              role: data.user.role,

              matricNumber:
                data.user.matricNumber ||
                normalizedMatricNumber,

              accessToken: String(data.token),
            };
          }

          /* ==================================================
             STAFF / ADMIN LOGIN

             Email + Password + OTP
          ================================================== */

          if (email) {
            const normalizedEmail =
              email.trim().toLowerCase();

            const normalizedOtp =
              otp?.trim();

            console.log(
              "NextAuth: authenticating staff:",
              normalizedEmail,
            );

            console.log(
              "NextAuth: OTP supplied:",
              normalizedOtp ? "YES" : "NO",
            );

            /*
             * IMPORTANT:
             *
             * apiUrl already ends with /api.
             *
             * Correct:
             * http://localhost:5000/api/auth/login
             *
             * Wrong:
             * http://localhost:5000/api/api/auth/login
             */

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

                  ...(normalizedOtp
                    ? {
                        otp: normalizedOtp,
                      }
                    : {}),
                }),

                cache: "no-store",
              },
            );

            console.log(
              "NextAuth staff login status:",
              response.status,
            );

            const data = await response
              .json()
              .catch(() => null);

            if (!response.ok) {
              console.error(
                "Staff login failed:",
                {
                  status: response.status,
                  data,
                },
              );

              return null;
            }

            console.log(
              "NEXTAUTH STAFF LOGIN RESPONSE:",
              {
                success: data?.success,
                userId: data?.user?.id,
                role: data?.user?.role,
                email: data?.user?.email,
                hasAccessToken: Boolean(data?.token),
              },
            );

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

            if (!isValidRole(data.user.role)) {
              console.error(
                "Invalid staff role:",
                data.user.role,
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

              role: data.user.role,

              accessToken: String(data.token),
            };
          }

          console.error(
            "NextAuth: no email or matric number supplied.",
          );

          return null;
        } catch (error) {
          console.error(
            "NextAuth authentication API error:",
            error,
          );

          return null;
        }
      },
    }),

    /* ========================================================
       GOOGLE
    ======================================================== */

    GoogleProvider({
      clientId:
        process.env.GOOGLE_CLIENT_ID || "",

      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET || "",

      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),

    /* ========================================================
       FACEBOOK
    ======================================================== */

    FacebookProvider({
      clientId:
        process.env.FACEBOOK_CLIENT_ID || "",

      clientSecret:
        process.env.FACEBOOK_CLIENT_SECRET || "",
    }),
  ],

  /* ==========================================================
     CALLBACKS
  ========================================================== */

  callbacks: {
    /* ========================================================
       SIGN-IN CALLBACK
    ======================================================== */

    async signIn({
      user,
      account,
    }) {
      /* ------------------------------------------------------
         Credentials authentication has already been completed
         inside authorize().
      ------------------------------------------------------ */

      if (account?.provider === "credentials") {
        console.log("Credentials provider - allowing sign-in");
        return true;
      }

      /* ------------------------------------------------------
         Only process Google and Facebook here.
      ------------------------------------------------------ */

      if (
        account?.provider !== "google" &&
        account?.provider !== "facebook"
      ) {
        return true;
      }

      /* ------------------------------------------------------
         OAuth provider must return an email.
      ------------------------------------------------------ */

      if (!user.email) {
        console.error(
          "OAuth login rejected: provider did not return an email.",
        );

        return false;
      }

      try {
        const apiUrl = getApiUrl();

        const email =
          user.email.trim().toLowerCase();

        console.log(
          "NextAuth OAuth sign-in:",
          {
            provider: account.provider,
            email,
          },
        );

        /* ==================================================
           EXCHANGE OAUTH IDENTITY WITH ITMT BACKEND
        ================================================== */

        /*
         * IMPORTANT:
         *
         * Correct:
         * /api/auth/oauth-login
         *
         * because apiUrl already contains /api.
         */

        const response = await fetch(
          `${apiUrl}/auth/oauth-login`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              email,
              name: user.name || email,
              provider: account.provider,
            }),

            cache: "no-store",
          },
        );

        const data = await response
          .json()
          .catch(() => null);

        console.log(
          "NextAuth OAuth backend status:",
          response.status,
        );

        if (!response.ok) {
          console.error(
            "OAuth backend login failed:",
            {
              status: response.status,
              data,
            },
          );

          return false;
        }

        if (
          !data?.user?.id ||
          !data?.user?.role ||
          !data?.token
        ) {
          console.error(
            "Invalid OAuth backend response:",
            data,
          );

          return false;
        }

        if (!isValidRole(data.user.role)) {
          console.error(
            "OAuth backend returned invalid role:",
            data.user.role,
          );

          return false;
        }

        /* ==================================================
           STORE BACKEND DATA ON NEXTAUTH USER
        ================================================== */

        user.id = String(data.user.id);

        user.role = data.user.role;

        user.accessToken = String(data.token);

        if (data.user.matricNumber) {
          user.matricNumber =
            String(data.user.matricNumber);
        }

        if (data.user.name) {
          user.name =
            String(data.user.name);
        }

        if (data.user.email) {
          user.email =
            String(data.user.email);
        }

        console.log(
          "NextAuth OAuth backend exchange successful:",
          {
            provider: account.provider,
            userId: user.id,
            role: user.role,
            hasAccessToken:
              Boolean(user.accessToken),
          },
        );

        return true;
      } catch (error) {
        console.error(
          "NextAuth OAuth backend exchange error:",
          error,
        );

        return false;
      }
    },

    /* ========================================================
       JWT CALLBACK
    ======================================================== */

    async jwt({
      token,
      user,
      account,
    }) {
      console.log(
        "NEXTAUTH JWT CALLBACK:",
        {
          provider: account?.provider,

          userId: user?.id,

          role: user?.role,

          hasUserAccessToken:
            Boolean(user?.accessToken),

          hasTokenAccessToken:
            Boolean(token.accessToken),
        },
      );

      /* ======================================================
         INITIAL CREDENTIALS LOGIN
      ====================================================== */

      if (
        user &&
        account?.provider === "credentials"
      ) {
        token.id = String(user.id);

        token.role =
          user.role as UserRole;

        token.accessToken =
          String(user.accessToken);

        if (user.matricNumber) {
          token.matricNumber =
            String(user.matricNumber);
        }

        console.log(
          "NEXTAUTH CREDENTIALS JWT STORED:",
          {
            userId: token.id,

            role: token.role,

            hasAccessToken:
              Boolean(token.accessToken),

            hasMatricNumber:
              Boolean(token.matricNumber),
          },
        );

        return token;
      }

      /* ======================================================
         INITIAL GOOGLE / FACEBOOK LOGIN
      ====================================================== */

      if (
        user &&
        (
          account?.provider === "google" ||
          account?.provider === "facebook"
        )
      ) {
        if (
          user.id &&
          user.role &&
          user.accessToken
        ) {
          token.id =
            String(user.id);

          token.role =
            user.role as UserRole;

          token.accessToken =
            String(user.accessToken);

          if (user.matricNumber) {
            token.matricNumber =
              String(user.matricNumber);
          }

          console.log(
            "NEXTAUTH OAUTH JWT STORED:",
            {
              userId: token.id,

              role: token.role,

              hasAccessToken:
                Boolean(token.accessToken),

              hasMatricNumber:
                Boolean(token.matricNumber),
            },
          );
        } else {
          console.error(
            "OAuth JWT could not be populated:",
            {
              hasUserId: Boolean(user.id),

              hasRole: Boolean(user.role),

              hasAccessToken:
                Boolean(user.accessToken),
            },
          );
        }
      }

      return token;
    },

    /* ========================================================
       SESSION CALLBACK
    ======================================================== */

    async session({
      session,
      token,
    }) {
      console.log(
        "NEXTAUTH SESSION CALLBACK:",
        {
          tokenId: token.id,

          role: token.role,

          hasAccessToken:
            Boolean(token.accessToken),
        },
      );

      /* ------------------------------------------------------
         User ID
      ------------------------------------------------------ */

      session.user.id =
        String(
          token.id ||
            token.sub ||
            "",
        );

      /* ------------------------------------------------------
         Role
      ------------------------------------------------------ */

      if (isValidRole(token.role)) {
        session.user.role =
          token.role;
      } else {
        session.user.role =
          "student";
      }

      /* ------------------------------------------------------
         Matric Number
      ------------------------------------------------------ */

      if (token.matricNumber) {
        session.user.matricNumber =
          String(token.matricNumber);
      } else {
        delete session.user.matricNumber;
      }

      /* ------------------------------------------------------
         Backend JWT
      ------------------------------------------------------ */

      if (token.accessToken) {
        const accessToken =
          String(token.accessToken);

        session.user.accessToken =
          accessToken;

        session.accessToken =
          accessToken;
      } else {
        delete session.user.accessToken;

        delete session.accessToken;
      }

      console.log(
        "NEXTAUTH SESSION READY:",
        {
          userId:
            session.user.id,

          role:
            session.user.role,

          hasUserAccessToken:
            Boolean(
              session.user.accessToken,
            ),

          hasSessionAccessToken:
            Boolean(
              session.accessToken,
            ),

          hasMatricNumber:
            Boolean(
              session.user.matricNumber,
            ),
        },
      );

      return session;
    },

    /* ========================================================
       REDIRECT CALLBACK
    ======================================================== */

    async redirect({
      url,
      baseUrl,
    }) {
      console.log(
        "NEXTAUTH REDIRECT CALLBACK:",
        {
          url,
          baseUrl,
        },
      );

      // If URL contains error, return to login page without error
      if (url.includes("error=")) {
        return `${baseUrl}/auth/login`;
      }

      // Allow OAuth success URL
      if (
        url.startsWith(
          `${baseUrl}/auth/oauth-success`,
        )
      ) {
        return url;
      }

      // Handle relative URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      try {
        const targetUrl =
          new URL(url);

        const applicationUrl =
          new URL(baseUrl);

        if (
          targetUrl.origin ===
          applicationUrl.origin
        ) {
          return url;
        }
      } catch {
        console.error(
          "NextAuth redirect received invalid URL:",
          url,
        );
      }

      return `${baseUrl}/auth/login`;
    },
  },

  /* ==========================================================
     AUTH PAGES
  ========================================================== */

  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },

  /* ==========================================================
     DEBUG
  ========================================================== */

  debug:
    process.env.NODE_ENV ===
    "development",
};