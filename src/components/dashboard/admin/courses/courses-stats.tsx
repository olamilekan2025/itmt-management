
import {
  Archive,
  BookOpen,
  CheckCircle2,
} from "lucide-react";

import AdminStatCard from "../admin-stat-card";

interface CoursesStatsProps {
  total: number;
  active: number;
  archived: number;
}

export default function CoursesStats({
  total,
  active,
  archived,
}: CoursesStatsProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <AdminStatCard
        title="Total Courses"
        value={String(total)}
        description="All courses in the institution"
        icon={BookOpen}
      />

      <AdminStatCard
        title="Active Courses"
        value={String(active)}
        description="Currently available courses"
        icon={CheckCircle2}
      />

      <AdminStatCard
        title="Archived Courses"
        value={String(archived)}
        description="Inactive course records"
        icon={Archive}
      />
    </section>
  );
}
