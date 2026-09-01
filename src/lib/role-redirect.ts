export type UserRole =
  | "admin"
  | "registrar"
  | "finance"
  | "lecturer"
  | "student";

export function getDashboardPath(role?: UserRole) {
  const paths: Record<UserRole, string> = {
    admin: "/dashboards/admin",
    registrar: "/dashboards/registrar",
    finance: "/dashboards/finance",
    lecturer: "/dashboards/lecturer",
    student: "/dashboards/student",
  };

  return paths[role || "student"];
}