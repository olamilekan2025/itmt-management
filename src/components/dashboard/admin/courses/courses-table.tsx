import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Archive,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { Course } from "@/lib/admin-courses";

interface CoursesTableProps {
  courses: Course[];
  onEdit: (course: Course) => void;
  onView: (course: Course) => void;
  onArchive: (course: Course) => void;
}

export default function CoursesTable({
  courses,
  onEdit,
  onView,
  onArchive,
}: CoursesTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">
              Course Code
            </th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">
              Title
            </th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">
              Programme
            </th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">
              Level
            </th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">
              Credits
            </th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">
              Semester
            </th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">
              Status
            </th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">
              Updated
            </th>
            <th className="px-4 py-3 text-right font-semibold text-slate-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr
              key={course._id}
              className="border-b border-slate-100 transition-colors hover:bg-slate-50"
            >
              <td className="px-4 py-3 font-medium text-brand-navy">
                {course.code}
              </td>
              <td className="px-4 py-3 text-slate-700">{course.title}</td>
              <td className="px-4 py-3 text-slate-600">
                {typeof course.programme === 'string' ? '—' : course.programme.name}
              </td>
              <td className="px-4 py-3 text-slate-600">{course.level}</td>
              <td className="px-4 py-3 text-slate-600">{course.creditUnits}</td>
              <td className="px-4 py-3 text-slate-600">{typeof course.semester === 'string' ? '—' : course.semester.name}</td>
              <td className="px-4 py-3">
                {course.isActive ? (
                  <Badge
                    variant="default"
                    className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  >
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Active
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-slate-100 text-slate-600 hover:bg-slate-200"
                  >
                    <XCircle className="mr-1 h-3 w-3" />
                    Archived
                  </Badge>
                )}
              </td>
              <td className="px-4 py-3 text-slate-500">
                {course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : '—'}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    onClick={() => onView(course)}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => onEdit(course)}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => onArchive(course)}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
