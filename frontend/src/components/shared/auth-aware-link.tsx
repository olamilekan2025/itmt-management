"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ComponentProps } from "react";

type UserRole =
  | "admin"
  | "registrar"
  | "finance"
  | "lecturer"
  | "student";

const DASHBOARD_ROUTES: Record<UserRole, string> = {
  admin: "/dashboards/admin",
  finance: "/dashboards/finance",
  registrar: "/dashboards/registrar",
  lecturer: "/dashboards/lecturer",
  student: "/dashboards/student",
};

interface AuthAwareLinkProps extends Omit<ComponentProps<typeof Link>, "href"> {
  fallbackHref?: string;
  studentHref?: string;
  forceStudent?: boolean;
  studentLogin?: boolean;
  skipRedirect?: boolean;
}

/**
 * Authentication-aware link component that redirects authenticated users
 * to their appropriate dashboard instead of the login page.
 *
 * Props:
 * - fallbackHref: Where to send unauthenticated users (default: /auth/login)
 * - studentHref: Where to send users who should specifically use student login (default: /auth/student/login)
 * - forceStudent: If true, students are sent to studentHref when authenticated instead of dashboard
 * - studentLogin: If true, only students are redirected to dashboard; other roles go to fallbackHref
 * - skipRedirect: If true, no redirect occurs - just use fallbackHref for everyone
 * - All other props are passed to the underlying Link component
 */
export default function AuthAwareLink({
  fallbackHref = "/auth/login",
  studentHref = "/auth/student/login",
  forceStudent = false,
  studentLogin = false,
  skipRedirect = false,
  children,
  className,
  onClick,
  ...props
}: AuthAwareLinkProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const user = session?.user;
  const role = user?.role?.toLowerCase() as UserRole | undefined;
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  // Determine the correct href based on authentication state
  let href = fallbackHref;

  if (!skipRedirect && isAuthenticated && role) {
    // If user is authenticated and has a valid role
    if (studentLogin) {
      // Student-specific login button: only redirect students to dashboard
      if (role === "student") {
        href = DASHBOARD_ROUTES[role];
      } else {
        // Non-students go to the main login page
        href = fallbackHref;
      }
    } else if (forceStudent && role === "student") {
      // Force student to go to student login page (if needed for re-auth)
      href = studentHref;
    } else if (DASHBOARD_ROUTES[role]) {
      // Redirect to the appropriate dashboard
      href = DASHBOARD_ROUTES[role];
    }
  }

  // Handle click to prevent navigation while loading
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isLoading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <Link
      href={href}
      className={className}
      onClick={handleClick}
      aria-disabled={isLoading}
      {...props}
    >
      {children}
    </Link>
  );
}
