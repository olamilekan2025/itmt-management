/**
 * Result utility functions
 */

export function getGradeColor(grade: string): string {
  switch (grade) {
    case "A":
      return "bg-emerald-50 text-emerald-700";
    case "B":
      return "bg-blue-50 text-blue-700";
    case "C":
      return "bg-amber-50 text-amber-700";
    case "D":
      return "bg-orange-50 text-orange-700";
    case "E":
      return "bg-red-50 text-red-700";
    case "F":
      return "bg-red-100 text-red-900";
    default:
      return "bg-slate-50 text-slate-700";
  }
}

