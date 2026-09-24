import type { Response } from "express";

import type { AuthRequest } from "../middleware/auth.middleware.js";

import User from "../models/User.js";
import Result from "../models/Result.js";

/* =========================================================
   TYPES
========================================================= */

type Grade =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F";

interface PopulatedCourse {
  _id: unknown;
  code: string;
  title: string;
  creditUnits: number;
}

interface PopulatedSession {
  _id: unknown;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

interface PopulatedSemester {
  _id: unknown;
  name: string;
  order: number;
  session?: PopulatedSession;
  isActive: boolean;
}

interface PopulatedProgramme {
  _id: unknown;
  name: string;
  code: string;
  award?: string;
  durationYears?: number;
}

interface PopulatedStudent {
  _id: unknown;
  name: string;
  email: string;
  matricNumber?: string;
  level?: string;
  programme?: PopulatedProgramme;
  academicSession?: PopulatedSession;
}

/* =========================================================
   GRADE POINTS
========================================================= */

const GRADE_POINTS: Record<Grade, number> = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  E: 1,
  F: 0,
};

/* =========================================================
   HELPERS
========================================================= */

function calculateGPA(
  results: Array<{
    grade: Grade;
    creditUnits: number;
  }>,
): number {
  if (results.length === 0) {
    return 0;
  }

  let totalQualityPoints = 0;
  let totalCredits = 0;

  for (const result of results) {
    const creditUnits = Number(
      result.creditUnits,
    );

    const gradePoint =
      GRADE_POINTS[result.grade] ?? 0;

    totalQualityPoints +=
      gradePoint * creditUnits;

    totalCredits += creditUnits;
  }

  if (totalCredits === 0) {
    return 0;
  }

  return (
    totalQualityPoints /
    totalCredits
  );
}

function roundToTwo(
  value: number,
): number {
  return Number(
    value.toFixed(2),
  );
}

function toId(
  value: unknown,
): string {
  if (
    value &&
    typeof value === "object" &&
    "toString" in value
  ) {
    return String(value);
  }

  return String(value);
}

/* =========================================================
   STUDENT
   GET ACADEMIC PROGRESS
========================================================= */

export async function getMyAcademicProgress(
  req: AuthRequest,
  res: Response,
) {
  try {
    const studentId =
      req.user?.userId;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    /* =====================================================
       GET STUDENT
    ====================================================== */

    const student =
      await User.findOne({
        _id: studentId,
        role: "student",
      })
        .populate(
          "programme",
          "name code award durationYears",
        )
        .populate(
          "academicSession",
          "name startDate endDate isActive",
        )
        .lean<PopulatedStudent>();

    if (!student) {
      return res.status(404).json({
        success: false,
        message:
          "Student account not found",
      });
    }

    /* =====================================================
       GET PUBLISHED RESULTS
    ====================================================== */

    const results =
      await Result.find({
        student: studentId,
        status: "published",
      })
        .populate(
          "course",
          "code title creditUnits",
        )
        .populate({
          path: "semester",
          select:
            "name order session isActive",
          populate: {
            path: "session",
            select:
              "name startDate endDate isActive",
          },
        })
        .sort({
          "semester.order": 1,
          createdAt: 1,
        })
        .lean();

    /* =====================================================
       EMPTY RESULT RESPONSE
    ====================================================== */

    if (results.length === 0) {
      return res.status(200).json({
        success: true,

        progress: {
          student: {
            id: toId(student._id),
            name: student.name,
            email: student.email,
            matricNumber:
              student.matricNumber ??
              null,
            level:
              student.level ??
              null,
          },

          programme:
            student.programme
              ? {
                  id: toId(
                    student.programme
                      ._id,
                  ),
                  name:
                    student.programme
                      .name,
                  code:
                    student.programme
                      .code,
                  award:
                    student.programme
                      .award ??
                    null,
                  durationYears:
                    student.programme
                      .durationYears ??
                    null,
                }
              : null,

          currentAcademicSession:
            student.academicSession
              ? {
                  id: toId(
                    student
                      .academicSession
                      ._id,
                  ),
                  name:
                    student
                      .academicSession
                      .name,
                  startDate:
                    student
                      .academicSession
                      .startDate,
                  endDate:
                    student
                      .academicSession
                      .endDate,
                  isActive:
                    student
                      .academicSession
                      .isActive,
                }
              : null,

          summary: {
            cgpa: 0,
            totalCredits: 0,
            coursesCompleted: 0,
            coursesPassed: 0,
            coursesFailed: 0,
            averageScore: 0,
            totalSemesters: 0,
          },

          gradeDistribution: {
            A: 0,
            B: 0,
            C: 0,
            D: 0,
            E: 0,
            F: 0,
          },

          semesters: [],
        },
      });
    }

    /* =====================================================
       OVERALL STATISTICS
    ====================================================== */

    let totalCredits = 0;
    let totalQualityPoints = 0;
    let totalScore = 0;

    let coursesPassed = 0;
    let coursesFailed = 0;

    const gradeDistribution: Record<
      Grade,
      number
    > = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      E: 0,
      F: 0,
    };

    /* =====================================================
       SEMESTER GROUPS
    ====================================================== */

    interface SemesterGroup {
      semesterId: string;
      semesterName: string;
      semesterOrder: number;
      sessionId: string | null;
      sessionName: string | null;
      sessionStartDate:
        | Date
        | null;
      sessionEndDate:
        | Date
        | null;
      results: Array<{
        course: PopulatedCourse;
        score: number;
        grade: Grade;
        creditUnits: number;
      }>;
    }

    const semesterMap =
      new Map<
        string,
        SemesterGroup
      >();

    /* =====================================================
       PROCESS RESULTS
    ====================================================== */

    for (const result of results) {
      const course =
        result.course as unknown as
          | PopulatedCourse
          | null;

      const semester =
        result.semester as unknown as
          | PopulatedSemester
          | null;

      if (
        !course ||
        !semester
      ) {
        continue;
      }

      const grade =
        result.grade as Grade;

      const score =
        Number(result.score);

      const creditUnits =
        Number(
          course.creditUnits,
        );

      const gradePoint =
        GRADE_POINTS[grade] ?? 0;

      /* Overall calculations */

      totalCredits +=
        creditUnits;

      totalQualityPoints +=
        gradePoint *
        creditUnits;

      totalScore += score;

      gradeDistribution[grade] +=
        1;

      if (score >= 40) {
        coursesPassed += 1;
      } else {
        coursesFailed += 1;
      }

      /* Semester */

      const semesterId =
        toId(semester._id);

      const session =
        semester.session;

      if (
        !semesterMap.has(
          semesterId,
        )
      ) {
        semesterMap.set(
          semesterId,
          {
            semesterId,
            semesterName:
              semester.name,
            semesterOrder:
              semester.order,

            sessionId: session
              ? toId(session._id)
              : null,

            sessionName:
              session?.name ??
              null,

            sessionStartDate:
              session?.startDate ??
              null,

            sessionEndDate:
              session?.endDate ??
              null,

            results: [],
          },
        );
      }

      semesterMap
        .get(semesterId)!
        .results.push({
          course,
          score,
          grade,
          creditUnits,
        });
    }

    /* =====================================================
       OVERALL GPA / CGPA
    ====================================================== */

    const cgpa =
      totalCredits > 0
        ? totalQualityPoints /
          totalCredits
        : 0;

    const averageScore =
      results.length > 0
        ? totalScore /
          results.length
        : 0;

    /* =====================================================
       SEMESTER PROGRESS
    ====================================================== */

    const semesters =
      Array.from(
        semesterMap.values(),
      )
        .sort((a, b) => {
          if (
            a.sessionName !==
            b.sessionName
          ) {
            return (
              (a.sessionName ??
                "").localeCompare(
                b.sessionName ??
                  "",
              )
            );
          }

          return (
            a.semesterOrder -
            b.semesterOrder
          );
        })
        .map(
          (
            semester,
            index,
          ) => {
            let semesterCredits = 0;

            let semesterQualityPoints = 0;

            let semesterScore = 0;

            let passed = 0;
            let failed = 0;

            const grades: Record<
              Grade,
              number
            > = {
              A: 0,
              B: 0,
              C: 0,
              D: 0,
              E: 0,
              F: 0,
            };

            const courses =
              semester.results.map(
                (result) => {
                  const gradePoint =
                    GRADE_POINTS[
                      result.grade
                    ] ?? 0;

                  semesterCredits +=
                    result.creditUnits;

                  semesterQualityPoints +=
                    gradePoint *
                    result.creditUnits;

                  semesterScore +=
                    result.score;

                  grades[
                    result.grade
                  ] += 1;

                  if (
                    result.score >=
                    40
                  ) {
                    passed += 1;
                  } else {
                    failed += 1;
                  }

                  return {
                    id: toId(
                      result.course
                        ._id,
                    ),
                    code:
                      result.course
                        .code,
                    title:
                      result.course
                        .title,
                    creditUnits:
                      result.creditUnits,
                    score:
                      result.score,
                    grade:
                      result.grade,
                    gradePoint,
                  };
                },
              );

            const gpa =
              semesterCredits >
              0
                ? semesterQualityPoints /
                  semesterCredits
                : 0;

            const semesterAverage =
              courses.length > 0
                ? semesterScore /
                  courses.length
                : 0;

            return {
              id:
                semester.semesterId,

              sequence:
                index + 1,

              semester:
                semester.semesterName,

              semesterOrder:
                semester.semesterOrder,

              academicSession:
                semester.sessionName,

              sessionId:
                semester.sessionId,

              sessionStartDate:
                semester.sessionStartDate,

              sessionEndDate:
                semester.sessionEndDate,

              gpa:
                roundToTwo(gpa),

              creditUnits:
                semesterCredits,

              courses:
                courses.length,

              passed,

              failed,

              averageScore:
                roundToTwo(
                  semesterAverage,
                ),

              grades,

              courseResults:
                courses,
            };
          },
        );

    /* =====================================================
       CUMULATIVE CREDIT PROGRESS
    ====================================================== */

    const totalCourses =
      results.length;

    /* =====================================================
       RESPONSE
    ====================================================== */

    return res.status(200).json({
      success: true,

      progress: {
        student: {
          id: toId(student._id),
          name: student.name,
          email: student.email,
          matricNumber:
            student.matricNumber ??
            null,
          level:
            student.level ??
            null,
        },

        programme:
          student.programme
            ? {
                id: toId(
                  student.programme
                    ._id,
                ),
                name:
                  student.programme
                    .name,
                code:
                  student.programme
                    .code,
                award:
                  student.programme
                    .award ??
                  null,
                durationYears:
                  student.programme
                    .durationYears ??
                  null,
              }
            : null,

        currentAcademicSession:
          student.academicSession
            ? {
                id: toId(
                  student
                    .academicSession
                    ._id,
                ),
                name:
                  student
                    .academicSession
                    .name,
                startDate:
                  student
                    .academicSession
                    .startDate,
                endDate:
                  student
                    .academicSession
                    .endDate,
                isActive:
                  student
                    .academicSession
                    .isActive,
              }
            : null,

        summary: {
          cgpa:
            roundToTwo(cgpa),

          totalCredits,

          coursesCompleted:
            totalCourses,

          coursesPassed,

          coursesFailed,

          averageScore:
            roundToTwo(
              averageScore,
            ),

          totalSemesters:
            semesters.length,
        },

        gradeDistribution,

        semesters,
      },
    });
  } catch (error) {
    console.error(
      "Get academic progress error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve academic progress",
    });
  }
}