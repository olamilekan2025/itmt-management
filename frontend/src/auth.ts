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
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not defined. Add it to frontend/.env.local and restart Next.js.",
    );
  }

  return API_URL.replace(/\/+$/, "");
}

/* ============================================================
   NEXTAUTH OPTIONS
============================================================ */

export const authOptions: NextAuthOptions = {
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
       --------------------------------------------------------
       Student:
       matricNumber + password

       Staff:
       email + password + OTP
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

            const response = await fetch(
              `${apiUrl}/api/auth/student/login`,
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

            const normalizedOtp = otp?.trim();

            console.log(
              "NextAuth: authenticating staff:",
              normalizedEmail,
            );

            console.log(
              "NextAuth: OTP supplied:",
              normalizedOtp ? "YES" : "NO",
            );

            const response = await fetch(
              `${apiUrl}/api/auth/login`,
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

          /* ==================================================
             NO LOGIN IDENTITY
          ================================================== */

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
      clientId: process.env.GOOGLE_CLIENT_ID || "",
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

       Google/Facebook authentication first happens with
       NextAuth's provider.

       After that, we exchange the provider identity with
       the ITMT backend.

       The backend returns:
       - user
       - role
       - JWT token
    ======================================================== */

    async signIn({ user, account }) {
      /* ------------------------------------------------------
         Credentials authentication is already completed inside
         authorize().
      ------------------------------------------------------ */

      if (account?.provider === "credentials") {
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

        const email = user.email
          .trim()
          .toLowerCase();

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

        const response = await fetch(
          `${apiUrl}/api/auth/oauth-login`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              email,

              name:
                user.name ||
                email,

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

        /* ----------------------------------------------------
           Backend rejected OAuth login
        ---------------------------------------------------- */

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

        /* ----------------------------------------------------
           Validate backend response
        ---------------------------------------------------- */

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

        /* ----------------------------------------------------
           Validate role
        ---------------------------------------------------- */

        if (!isValidRole(data.user.role)) {
          console.error(
            "OAuth backend returned invalid role:",
            data.user.role,
          );

          return false;
        }

        /* ==================================================
           STORE BACKEND DATA ON NEXTAUTH USER

           The JWT callback will transfer these values into
           the NextAuth JWT.
        ================================================== */

        user.id = String(data.user.id);

        user.role = data.user.role;

        user.accessToken = String(data.token);

        if (data.user.matricNumber) {
          user.matricNumber = String(
            data.user.matricNumber,
          );
        }

        /* ----------------------------------------------------
           Make sure the backend name/email are reflected.
        ---------------------------------------------------- */

        if (data.user.name) {
          user.name = String(data.user.name);
        }

        if (data.user.email) {
          user.email = String(data.user.email);
        }

        console.log(
          "NextAuth OAuth backend exchange successful:",
          {
            provider: account.provider,
            userId: user.id,
            role: user.role,
            hasAccessToken: Boolean(
              user.accessToken,
            ),
          },
        );

        return true;
      } catch (error) {
        console.error(
          "OAuth backend exchange error:",
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
        },
      );

      /* ======================================================
         CREDENTIALS LOGIN
      ====================================================== */

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

        return token;
      }

      /* ======================================================
         GOOGLE / FACEBOOK LOGIN

         signIn() has already exchanged the provider identity
         with the backend.

         We only transfer the backend information here.
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
          token.id = String(user.id);

          token.role =
            user.role as UserRole;

          token.accessToken =
            String(user.accessToken);

          if (user.matricNumber) {
            token.matricNumber =
              String(user.matricNumber);
          }
        } else {
          console.error(
            "OAuth JWT could not be populated:",
            {
              hasUserId: Boolean(user.id),
              hasRole: Boolean(user.role),
              hasAccessToken: Boolean(
                user.accessToken,
              ),
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
          hasAccessToken: Boolean(
            token.accessToken,
          ),
        },
      );

      /* ------------------------------------------------------
         User ID
      ------------------------------------------------------ */

      session.user.id = String(
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
        /*
         * Do not allow an invalid role to reach the dashboard.
         *
         * Student is used only as a type-safe fallback.
         * A properly authenticated backend user should always
         * have a valid role.
         */

        session.user.role =
          "student";
      }

      /* ------------------------------------------------------
         Matric Number
      ------------------------------------------------------ */

      if (token.matricNumber) {
        session.user.matricNumber =
          String(
            token.matricNumber,
          );
      } else {
        delete session.user.matricNumber;
      }

      /* ------------------------------------------------------
         Backend JWT
      ------------------------------------------------------ */

      if (token.accessToken) {
        session.accessToken =
          String(
            token.accessToken,
          );
      }

      return session;
    },

    /* ========================================================
       REDIRECT CALLBACK

       OAuth provider:
       Google/Facebook
            ↓
       NextAuth callback
            ↓
       Backend OAuth exchange
            ↓
       /auth/oauth-success
            ↓
       Role dashboard
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

      /* ------------------------------------------------------
         Allow OAuth success page.
      ------------------------------------------------------ */

      if (
        url.startsWith(
          `${baseUrl}/auth/oauth-success`,
        )
      ) {
        return url;
      }

      /* ------------------------------------------------------
         Allow internal relative URLs.
      ------------------------------------------------------ */

      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      /* ------------------------------------------------------
         Allow URLs belonging to this application only.
      ------------------------------------------------------ */

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

      /* ------------------------------------------------------
         Safe default.
      ------------------------------------------------------ */

      return `${baseUrl}/auth/oauth-success`;
    },
  },

  /* ==========================================================
     AUTH PAGES
  ========================================================== */

  pages: {
    signIn: "/auth/login",
  },

  /* ==========================================================
     DEBUG
  ========================================================== */

  debug:
    process.env.NODE_ENV === "development",

  /* ==========================================================
     SECRET
  ========================================================== */

  secret:
    process.env.NEXTAUTH_SECRET,
};

