import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const protectedRoutes: Record<string, string> = {
  "/dashboards/admin": "admin",
  "/dashboards/registrar": "registrar",
  "/dashboards/finance": "finance",
  "/dashboards/lecturer": "lecturer",
  "/dashboards/student": "student",
};

const dashboardRoutes: Record<string, string> = {
  admin: "/dashboards/admin",
  registrar: "/dashboards/registrar",
  finance: "/dashboards/finance",
  lecturer: "/dashboards/lecturer",
  student: "/dashboards/student",
};

export default withAuth(
  function middleware(request) {
    const pathname = request.nextUrl.pathname;
    const userRole = request.nextauth.token?.role as string | undefined;

    const requiredRole = Object.entries(protectedRoutes).find(([route]) =>
      pathname === route || pathname.startsWith(`${route}/`),
    )?.[1];

    if (requiredRole && userRole !== requiredRole) {
      const redirectUrl = request.nextUrl.clone();

      redirectUrl.pathname = userRole
        ? dashboardRoutes[userRole]
        : "/auth/login";

      redirectUrl.search = "";

      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => Boolean(token),
    },
    pages: {
      signIn: "/auth/login",
    },
  },
);

export const config = {
  matcher: [
    "/dashboards/admin/:path*",
    "/dashboards/registrar/:path*",
    "/dashboards/finance/:path*",
    "/dashboards/lecturer/:path*",
    "/dashboards/student/:path*",
  ],
};