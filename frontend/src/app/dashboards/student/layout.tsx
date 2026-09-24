"use client";

import {
  Bell,
  Menu,
  Search,
  UserRound,
  X,
} from "lucide-react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  useSession,
} from "next-auth/react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import StudentSidebar from "@/components/dashboard/student/student-sidebar";

/* =========================================================
   TYPES
========================================================= */

interface StudentLayoutProps {
  children: React.ReactNode;
}

/* =========================================================
   LAYOUT
========================================================= */

export default function StudentLayout({
  children,
}: StudentLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const {
    data: session,
    status,
  } = useSession();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  /* =======================================================
     USER INFORMATION
  ======================================================= */

  const userName =
    session?.user?.name?.trim() || "Student";

  const userEmail =
    session?.user?.email?.trim() ||
    "student@itmt.edu.ng";

  const initials = useMemo(() => {
    const parts = userName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);

    const value = parts
      .map((part) => part.charAt(0).toUpperCase())
      .join("");

    return value || "ST";
  }, [userName]);

  /* =======================================================
     PAGE TITLE
  ======================================================= */

  const pageTitle = useMemo(() => {
    if (pathname === "/dashboards/student") {
      return "Dashboard";
    }

    if (
      pathname.startsWith(
        "/dashboards/student/courses",
      )
    ) {
      return "My Courses";
    }

    if (
      pathname.startsWith(
        "/dashboards/student/registration",
      )
    ) {
      return "Course Registration";
    }

    if (
      pathname.startsWith(
        "/dashboards/student/results",
      )
    ) {
      return "Results";
    }

    if (
      pathname.startsWith(
        "/dashboards/student/academic-progress",
      ) ||
      pathname.startsWith(
        "/dashboards/student/progress",
      )
    ) {
      return "Academic Progress";
    }

    if (
      pathname.startsWith(
        "/dashboards/student/transcript",
      )
    ) {
      return "Transcript";
    }

    if (
      pathname.startsWith(
        "/dashboards/student/attendance",
      )
    ) {
      return "My Attendance";
    }

    if (
      pathname.startsWith(
        "/dashboards/student/finance",
      )
    ) {
      return "School Fees";
    }

    if (
      pathname.startsWith(
        "/dashboards/student/payments",
      )
    ) {
      return "Payment History";
    }

    if (
      pathname.startsWith(
        "/dashboards/student/outstanding",
      )
    ) {
      return "Outstanding Fees";
    }

    if (
      pathname.startsWith(
        "/dashboards/student/announcements",
      )
    ) {
      return "Announcements";
    }

    if (
      pathname.startsWith(
        "/dashboards/student/notifications",
      )
    ) {
      return "Notifications";
    }

    if (
      pathname.startsWith(
        "/dashboards/student/documents",
      )
    ) {
      return "My Documents";
    }

    if (
      pathname.startsWith(
        "/dashboards/student/profile",
      )
    ) {
      return "My Profile";
    }

    if (
      pathname.startsWith(
        "/dashboards/student/settings",
      )
    ) {
      return "Settings";
    }

    return "Student Portal";
  }, [pathname]);

  /* =======================================================
     MOBILE SIDEBAR
  ======================================================= */

  const closeMobileSidebar = () => {
    setMobileOpen(false);
  };

  /*
   * Close mobile sidebar automatically when the route changes.
   */
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  /*
   * Close mobile sidebar with Escape.
   */
  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [mobileOpen]);

  /*
   * Prevent background scrolling while the mobile
   * sidebar is open.
   */
  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  /* =======================================================
     AUTH LOADING
  ======================================================= */

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">

          <div
            className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-brand-gold"
          />

          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700">
              Loading Student Portal
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Please wait...
            </p>
          </div>

        </div>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50">

      {/* ===================================================
          MOBILE BACKDROP
      ==================================================== */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close student menu"
          onClick={closeMobileSidebar}
          className="
            fixed
            inset-0
            z-40

            bg-slate-950/50
            backdrop-blur-[2px]

            lg:hidden
          "
        />
      )}

      {/* ===================================================
          SIDEBAR
      ==================================================== */}

      <StudentSidebar
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={closeMobileSidebar}
      />

      {/* ===================================================
          MAIN AREA
      ==================================================== */}

      <div
        className={`
          min-h-screen

          transition-[padding]
          duration-300
          ease-in-out

          ${
            collapsed
              ? "lg:pl-[88px]"
              : "lg:pl-72"
          }
        `}
      >

        {/* =================================================
            HEADER
        ================================================== */}

        <header
          className="
            sticky
            top-0
            z-30

            h-[72px]

            border-b
            border-slate-200/80

            bg-white/90

            shadow-[0_1px_12px_rgba(15,23,42,0.03)]

            backdrop-blur-xl
          "
        >
          <div
            className="
              flex
              h-full
              items-center
              justify-between

              gap-4

              px-4
              sm:px-6
              lg:px-8
              xl:px-10
            "
          >

            {/* =================================================
                LEFT SIDE
            ================================================== */}

            <div className="flex min-w-0 items-center gap-3">

              {/* Mobile menu */}

              <button
                type="button"
                onClick={() =>
                  setMobileOpen((current) => !current)
                }
                aria-label={
                  mobileOpen
                    ? "Close student menu"
                    : "Open student menu"
                }
                aria-expanded={mobileOpen}
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center

                  rounded-xl

                  border
                  border-slate-200

                  bg-white

                  text-slate-600

                  shadow-sm

                  transition-all
                  duration-200

                  hover:border-brand-gold/40
                  hover:bg-brand-gold/5
                  hover:text-brand-navy

                  active:scale-95

                  lg:hidden
                "
              >
                {mobileOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>

              {/* Page information */}

              <div className="min-w-0">

                <div className="flex min-w-0 items-center gap-2">

                  {/* Portal label */}

                  <span
                    className="
                      hidden
                      shrink-0

                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.18em]

                      text-brand-gold

                      sm:block
                    "
                  >
                    Student Portal
                  </span>

                  {/* Dot */}

                  <span
                    className="
                      hidden
                      h-1
                      w-1
                      shrink-0

                      rounded-full

                      bg-slate-300

                      sm:block
                    "
                  />

                  {/* Page title */}

                  <h1
                    className="
                      truncate

                      text-base
                      font-bold
                      tracking-tight

                      text-slate-900

                      sm:text-lg
                    "
                  >
                    {pageTitle}
                  </h1>

                </div>

                {/* Subtitle */}

                <p
                  className="
                    mt-0.5

                    hidden
                    truncate

                    text-xs

                    text-slate-400

                    sm:block
                  "
                >
                  Manage your academic journey and student account
                </p>

              </div>
            </div>

            {/* =================================================
                RIGHT SIDE
            ================================================== */}

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">

              {/* Search */}

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/dashboards/student/courses",
                  )
                }
                aria-label="Search student portal"
                title="Search"
                className="
                  hidden

                  h-10
                  w-10

                  items-center
                  justify-center

                  rounded-xl

                  border
                  border-slate-200

                  bg-white

                  text-slate-400

                  shadow-sm

                  transition-all
                  duration-200

                  hover:border-brand-gold/40
                  hover:bg-brand-gold/5
                  hover:text-brand-navy

                  active:scale-95

                  sm:flex
                "
              >
                <Search className="h-4 w-4" />
              </button>

              {/* Notifications */}

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/dashboards/student/notifications",
                  )
                }
                aria-label="Open notifications"
                title="Notifications"
                className="
                  relative

                  flex
                  h-10
                  w-10

                  shrink-0

                  items-center
                  justify-center

                  rounded-xl

                  border
                  border-slate-200

                  bg-white

                  text-slate-500

                  shadow-sm

                  transition-all
                  duration-200

                  hover:border-brand-gold/40
                  hover:bg-brand-gold/5
                  hover:text-brand-navy

                  active:scale-95
                "
              >
                <Bell className="h-4 w-4" />

                {/* Notification indicator */}

                <span
                  className="
                    absolute
                    right-2
                    top-2

                    h-1.5
                    w-1.5

                    rounded-full

                    bg-brand-gold

                    ring-2
                    ring-white
                  "
                />
              </button>

              {/* Divider */}

              <div
                className="
                  hidden
                  h-8
                  w-px

                  bg-slate-200

                  sm:block
                "
              />

              {/* =================================================
                  STUDENT PROFILE
              ================================================== */}

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/dashboards/student/profile",
                  )
                }
                aria-label="Open student profile"
                className="
                  group

                  flex
                  min-w-0
                  items-center
                  gap-2.5

                  rounded-xl

                  px-1.5
                  py-1

                  transition-all
                  duration-200

                  hover:bg-slate-50

                  active:scale-[0.98]
                "
              >

                {/* Avatar */}

                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0

                    items-center
                    justify-center

                    rounded-xl

                    bg-gradient-to-br
                    from-brand-gold
                    to-brand-gold/70

                    text-[11px]
                    font-bold

                    text-brand-navy

                    shadow-sm

                    ring-1
                    ring-brand-gold/20
                  "
                >
                  {initials}
                </div>

                {/* User details */}

                <div
                  className="
                    hidden
                    min-w-0
                    text-left

                    md:block
                  "
                >
                  <p
                    className="
                      max-w-[150px]

                      truncate

                      text-xs
                      font-semibold

                      text-slate-800
                    "
                    title={userName}
                  >
                    {userName}
                  </p>

                  <p
                    className="
                      max-w-[150px]

                      truncate

                      text-[10px]

                      text-slate-400
                    "
                    title={userEmail}
                  >
                    {userEmail}
                  </p>
                </div>

                <UserRound
                  className="
                    hidden

                    h-3.5
                    w-3.5
                    shrink-0

                    text-slate-300

                    transition-colors
                    duration-200

                    group-hover:text-brand-gold

                    md:block
                  "
                />

              </button>
            </div>
          </div>
        </header>

        {/* =================================================
            PAGE CONTENT
        ================================================== */}

        <main
          className="
            min-h-[calc(100vh-72px)]

            px-4
            py-5

            sm:px-6
            sm:py-6

            lg:px-8
            lg:py-8

            xl:px-10
            xl:py-10
          "
        >
          <div
            className="
              mx-auto
              w-full
              max-w-[1600px]
            "
          >
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}