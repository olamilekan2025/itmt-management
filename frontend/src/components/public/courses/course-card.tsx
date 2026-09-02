import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/lib/courses";

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <Badge variant="secondary" className="text-xs">
            {course.code}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {course.creditUnits} Credit{course.creditUnits !== 1 ? "s" : ""}
          </Badge>
        </div>
        <CardTitle className="line-clamp-2">{course.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-medium text-brand-navy">
              {course.programme.name}
            </span>
            <span>•</span>
            <span>{course.level}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>{course.semester.name}</span>
          </div>
        </div>

        {course.description && (
          <p className="line-clamp-2 text-sm text-slate-500">
            {course.description}
          </p>
        )}

        {course.category && (
          <Badge variant="outline" className="text-xs">
            {course.category}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
