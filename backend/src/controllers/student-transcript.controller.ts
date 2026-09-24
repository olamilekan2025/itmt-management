import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";

import User from "../models/User.js";
import Programme from "../models/Programme.js";
import AcademicSession from "../models/AcademicSession.js";
import Result from "../models/Result.js";

/* =========================================================
   TYPES
========================================================= */

type Grade = "A" | "B" | "C" | "D" | "E" | "F";

interface PopulatedSemester {
  _id: unknown;
  name?: string;
  order?: number;
  session?: {
    _id?: unknown;
    name?: string;
  } | null;
}

interface PopulatedCourse {
  _id: unknown;
  code?: string;
  title?: string;
  creditUnits?: number;
}

interface TranscriptCourse {
  id: string;
  code: string;
  title: string;
  creditUnits: number;
  score: number;
  grade: Grade;
  gradePoint: number;
}

interface TranscriptSemester {
  id: string;
  name: string;
  order: number;
  session: string;
  courses: TranscriptCourse[];
  attemptedCredits: number;
  earnedCredits: number;
  qualityPoints: number;
  gpa: number;
}

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

function round(
  value: number,
  decimals = 2,
): number {
  const factor = 10 ** decimals;

  return (
    Math.round(
      (value + Number.EPSILON) *
        factor,
    ) / factor
  );
}

function isPassed(
  grade: Grade,
): boolean {
  return grade !== "F";
}

/* =========================================================
   STUDENT — GET TRANSCRIPT
========================================================= */

export const getMyTranscript = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message:
          "Only students can access a transcript.",
      });
    }

    /* =====================================================
       STUDENT
    ===================================================== */

    const student =
      await User.findById(
        req.user.userId,
      )
        .select(
          "name email phone profileImage matricNumber level programme academicSession",
        )
        .lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message:
          "Student account not found.",
      });
    }

    /* =====================================================
       PROGRAMME + SESSION
    ===================================================== */

    const [
      programme,
      academicSession,
    ] = await Promise.all([
      student.programme
        ? Programme.findById(
            student.programme,
          )
            .select(
              "name code award durationYears description isActive",
            )
            .lean()
        : null,

      student.academicSession
        ? AcademicSession.findById(
            student.academicSession,
          )
            .select(
              "name startDate endDate isActive",
            )
            .lean()
        : null,
    ]);

    /* =====================================================
       RESULTS
    ===================================================== */

    const results =
      await Result.find({
        student: student._id,
        status: "published",
      })
        .populate(
          "course",
          "code title creditUnits programme semester",
        )
        .populate({
          path: "semester",
          select:
            "name order session isActive",
          populate: {
            path: "session",
            select: "name",
          },
        })
        .sort({
          createdAt: 1,
        })
        .lean();

    /* =====================================================
       SUMMARY
    ===================================================== */

    let totalCourses = 0;
    let passedCourses = 0;
    let failedCourses = 0;

    let totalCredits = 0;
    let earnedCredits = 0;
    let totalQualityPoints = 0;

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
       SEMESTER GROUPING
    ===================================================== */

    const semesterMap =
      new Map<
        string,
        TranscriptSemester
      >();

    for (const result of results) {
      const course =
        result.course as unknown as
          | PopulatedCourse
          | null;

      const semester =
        result.semester as unknown as
          | PopulatedSemester
          | null;

      if (!course || !semester) {
        continue;
      }

      const grade =
        result.grade as Grade;

      const creditUnits =
        Number(
          course.creditUnits ?? 0,
        );

      const gradePoint =
        GRADE_POINTS[grade] ?? 0;

      const qualityPoints =
        creditUnits * gradePoint;

      const semesterId =
        String(semester._id);

      if (
        !semesterMap.has(
          semesterId,
        )
      ) {
        semesterMap.set(
          semesterId,
          {
            id: semesterId,

            name:
              semester.name ??
              "Semester",

            order:
              Number(
                semester.order ?? 0,
              ),

            session:
              semester.session
                ?.name ??
              "Academic Session",

            courses: [],

            attemptedCredits: 0,

            earnedCredits: 0,

            qualityPoints: 0,

            gpa: 0,
          },
        );
      }

      const semesterData =
        semesterMap.get(
          semesterId,
        )!;

      semesterData.courses.push({
        id: String(course._id),

        code:
          course.code ??
          "N/A",

        title:
          course.title ??
          "Untitled Course",

        creditUnits,

        score: Number(
          result.score ?? 0,
        ),

        grade,

        gradePoint,
      });

      semesterData.attemptedCredits +=
        creditUnits;

      semesterData.qualityPoints +=
        qualityPoints;

      if (isPassed(grade)) {
        semesterData.earnedCredits +=
          creditUnits;
      }

      /* ===================================================
         OVERALL SUMMARY
      =================================================== */

      totalCourses += 1;

      totalCredits +=
        creditUnits;

      totalQualityPoints +=
        qualityPoints;

      gradeDistribution[grade] += 1;

      if (isPassed(grade)) {
        passedCourses += 1;

        earnedCredits +=
          creditUnits;
      } else {
        failedCourses += 1;
      }
    }

    /* =====================================================
       SEMESTERS
    ===================================================== */

    const semesters =
      Array.from(
        semesterMap.values(),
      )
        .map((semester) => ({
          ...semester,

          gpa:
            semester.attemptedCredits >
            0
              ? round(
                  semester.qualityPoints /
                    semester.attemptedCredits,
                )
              : 0,

          courses:
            semester.courses.sort(
              (a, b) =>
                a.code.localeCompare(
                  b.code,
                ),
            ),
        }))
        .sort((a, b) => {
          if (
            a.session !==
            b.session
          ) {
            return a.session.localeCompare(
              b.session,
            );
          }

          return (
            a.order - b.order
          );
        });

    /* =====================================================
       CGPA
    ===================================================== */

    const cgpa =
      totalCredits > 0
        ? round(
            totalQualityPoints /
              totalCredits,
          )
        : 0;

    /* =====================================================
       RESPONSE
    ===================================================== */

    return res.status(200).json({
      success: true,

      student: {
        id: String(
          student._id,
        ),
        name: student.name,
        email: student.email,
        phone:
          student.phone ??
          null,
        profileImage:
          student.profileImage ??
          null,
        matricNumber:
          student.matricNumber ??
          null,
        level:
          student.level ??
          null,
      },

      programme: programme
        ? {
            id: String(
              programme._id,
            ),
            name: programme.name,
            code: programme.code,
            award:
              programme.award ??
              null,
            durationYears:
              programme.durationYears ??
              null,
          }
        : null,

      academicSession:
        academicSession
          ? {
              id: String(
                academicSession._id,
              ),
              name:
                academicSession.name,
              startDate:
                academicSession.startDate,
              endDate:
                academicSession.endDate,
              isActive:
                academicSession.isActive,
            }
          : null,

      summary: {
        totalCourses,
        passedCourses,
        failedCourses,
        totalCredits,
        earnedCredits,
        totalQualityPoints:
          round(
            totalQualityPoints,
          ),
        cgpa,
        totalSemesters:
          semesters.length,
      },

      semesters,

      gradeDistribution,
    });
  } catch (error) {
    console.error(
      "Get student transcript error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to generate student transcript.",
    });
  }
};