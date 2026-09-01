import { getGreeting } from "@/lib/greeting";

interface DashboardHeaderProps {
  /** First name (or full name) of the signed-in admin, if available. */
  adminName?: string | null;
  /** Small uppercase label above the heading, e.g. "ITMT Administration". */
  eyebrow?: string;
  /** Line under the greeting, e.g. "Welcome back to the Admin Dashboard." */
  welcomeText?: string;
  /** Longer description under the welcome line. */
  description?: string;
}

/**
 * Greeting header used at the top of dashboard pages.
 *
 *   <DashboardHeader
 *     adminName={session?.user?.name?.split(" ")[0]}
 *     description="Manage students, staff, academic programmes,
 *       courses, admissions, results and institutional operations
 *       from one place."
 *   />
 *
 * Swap eyebrow/welcomeText/description per page (e.g. lecturer or
 * student dashboards) while keeping the same layout and greeting logic.
 */
export default function DashboardHeader({
  adminName,
  eyebrow = "ITMT Administration",
  welcomeText = "Welcome back to the Admin Dashboard.",
  description,
}: DashboardHeaderProps) {
  const greeting = getGreeting();

  return (
    <section className="relative overflow-hidden rounded-xl bg-brand-navy p-6 shadow-sm md:p-8 dark:bg-brand-dark dark:ring-1 dark:ring-white/10">
      {/* subtle gold glow accent, purely decorative */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-gold/20 blur-3xl"
      />

      {/* small decorative mortarboard icon, purely visual */}
      <svg
        aria-hidden="true"
        viewBox="0 0 64 64"
        className="pointer-events-none absolute right-5 top-5 h-14 w-14 text-brand-gold/25 md:h-16 md:w-16"
        fill="none"
      >
        <path
          d="M32 10 4 24l28 14 28-14-28-14Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        <path
          d="M16 30v12c0 4 7.2 8 16 8s16-4 16-8V30"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M56 24v14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      <div className="relative flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-brand-gold" />

        <p className="text-sm font-semibold uppercase tracking-wider text-brand-gold">
          {eyebrow}
        </p>
      </div>

      <h1 className="relative mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">
        {greeting}
        {adminName ? `, ${adminName}` : ""}
      </h1>

      <p className="relative mt-1 text-sm font-medium text-slate-200">
        {welcomeText}
      </p>

      {description ? (
        <p className="relative mt-2 max-w-2xl text-sm text-slate-300">
          {description}
        </p>
      ) : null}
    </section>
  );
}