import type { Request, Response } from "express";
import { z } from "zod";

import Result from "../models/Result.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Programme from "../models/Programme.js";
import Semester from "../models/Semester.js";
import AcademicSession from "../models/AcademicSession.js";

/* =========================================================
   VALIDATION
========================================================= */

const objectId = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid ID");

const reportQuerySchema = z.object({
  session: objectId.optional(),
  semester: objectId.optional(),
  programme: objectId.optional(),
  level: z.string().trim().min(1).max(50).optional(),
});

/* =========================================================
   HELPERS
========================================================= */

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/* =========================================================
   GET ACADEMIC REPORT
========================================================= */

export async function getAcademicReport(
  req: Request,
  res: Response,
) {
  try {
    const parsed = reportQuerySchema.safeParse({
      session:
        typeof req.query.session === "string"
          ? req.query.session
          : undefined,

      semester:
        typeof req.query.semester === "string"
          ? req.query.semester
          : undefined,

      programme:
        typeof req.query.programme === "string"
          ? req.query.programme
          : undefined,

      level:
        typeof req.query.level === "string"
          ? req.query.level
          : undefined,
    });

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid report filters.",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const {
      session,
      semester,
      programme,
      level,
    } = parsed.data;

    /* =====================================================
       RESOLVE SEMESTERS
    ====================================================== */

    let semesterIds: string[] | undefined;

    if (semester) {
      const selectedSemester =
        await Semester.findById(semester).select(
          "_id session",
        );

      if (!selectedSemester) {
        return res.status(404).json({
          success: false,
          message: "Semester not found.",
        });
      }

      if (
        session &&
        selectedSemester.session.toString() !== session
      ) {
        return res.status(400).json({
          success: false,
          message:
            "The selected semester does not belong to the selected academic session.",
        });
      }

      semesterIds = [selectedSemester._id.toString()];
    } else if (session) {
      const semesters = await Semester.find({
        session,
      }).select("_id");

      semesterIds = semesters.map((item) =>
        item._id.toString(),
      );
    }

    /* =====================================================
       BUILD RESULT FILTER
    ====================================================== */

    const resultFilter: Record<string, unknown> = {
      status: "published",
    };

    if (semesterIds) {
      resultFilter.semester = {
        $in: semesterIds,
      };
    }

    /* =====================================================
       GET PUBLISHED RESULTS
    ====================================================== */

    const results = await Result.find(resultFilter)
      .populate(
        "student",
        "name email matricNumber programme academicSession level",
      )
      .populate(
        "course",
        "code title creditUnits programme semester level category",
      )
      .populate(
        "semester",
        "name order session",
      )
      .populate(
        "lecturer",
        "name email",
      )
      .lean();

    /* =====================================================
       FILTER PROGRAMME / LEVEL
    ====================================================== */

    const filteredResults = results.filter(
      (result) => {
        const student =
          result.student &&
          typeof result.student === "object"
            ? result.student
            : null;

        const course =
          result.course &&
          typeof result.course === "object"
            ? result.course
            : null;

        if (!student) {
          return false;
        }

        if (programme) {
          const studentProgramme =
            student.programme?.toString();

          const courseProgramme =
            course?.programme?.toString();

          if (
            studentProgramme !== programme &&
            courseProgramme !== programme
          ) {
            return false;
          }
        }

        if (
          level &&
          student.level?.toLowerCase() !==
            level.toLowerCase()
        ) {
          return false;
        }

        return true;
      },
    );

    /* =====================================================
       OVERVIEW
    ====================================================== */

    const totalResults =
      filteredResults.length;

    const passedResults =
      filteredResults.filter(
        (result) => result.score >= 40,
      ).length;

    const failedResults =
      filteredResults.filter(
        (result) => result.score < 40,
      ).length;

    const totalScore =
      filteredResults.reduce(
        (sum, result) =>
          sum + result.score,
        0,
      );

    const averageScore =
      totalResults > 0
        ? totalScore / totalResults
        : 0;

    const passRate =
      totalResults > 0
        ? (passedResults / totalResults) * 100
        : 0;

    /* =====================================================
       GRADE DISTRIBUTION
    ====================================================== */

    const gradeDistribution = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      E: 0,
      F: 0,
    };

    for (const result of filteredResults) {
      if (result.grade in gradeDistribution) {
        gradeDistribution[
          result.grade as keyof typeof gradeDistribution
        ]++;
      }
    }

    /* =====================================================
       STUDENT IDS
    ====================================================== */

    const studentIds = [
      ...new Set(
        filteredResults
          .map((result) =>
            typeof result.student === "object" &&
            result.student
              ? result.student._id?.toString()
              : null,
          )
          .filter(Boolean),
      ),
    ];

    /* =====================================================
       COURSE PERFORMANCE
    ====================================================== */

    const courseMap = new Map<
      string,
      {
        code: string;
        title: string;
        results: number;
        passed: number;
        failed: number;
        totalScore: number;
        averageScore: number;
      }
    >();

    for (const result of filteredResults) {
      if (
        !result.course ||
        typeof result.course !== "object"
      ) {
        continue;
      }

      const courseId =
        result.course._id.toString();

      const existing =
        courseMap.get(courseId);

      if (existing) {
        existing.results += 1;
        existing.totalScore += result.score;

        if (result.score >= 40) {
          existing.passed += 1;
        } else {
          existing.failed += 1;
        }

        existing.averageScore =
          existing.totalScore /
          existing.results;
      } else {
        courseMap.set(courseId, {
          code:
            result.course.code || "—",

          title:
            result.course.title || "Unknown Course",

          results: 1,

          passed:
            result.score >= 40 ? 1 : 0,

          failed:
            result.score < 40 ? 1 : 0,

          totalScore:
            result.score,

          averageScore:
            result.score,
        });
      }
    }

    const coursePerformance = Array.from(
      courseMap.values(),
    )
      .map((course) => ({
        code: course.code,
        title: course.title,
        results: course.results,
        passed: course.passed,
        failed: course.failed,
        averageScore: round(
          course.averageScore,
        ),
        passRate: round(
          (course.passed /
            course.results) *
            100,
        ),
      }))
      .sort(
        (a, b) =>
          b.averageScore -
          a.averageScore,
      );

    /* =====================================================
       PROGRAMME PERFORMANCE
    ====================================================== */

    const programmeMap = new Map<
      string,
      {
        results: number;
        passed: number;
        failed: number;
        totalScore: number;
      }
    >();

    for (const result of filteredResults) {
      const student =
        result.student &&
        typeof result.student === "object"
          ? result.student
          : null;

      const course =
        result.course &&
        typeof result.course === "object"
          ? result.course
          : null;

      const programmeId =
        student?.programme?.toString() ||
        course?.programme?.toString();

      if (!programmeId) {
        continue;
      }

      const existing =
        programmeMap.get(programmeId);

      if (existing) {
        existing.results += 1;
        existing.totalScore += result.score;

        if (result.score >= 40) {
          existing.passed += 1;
        } else {
          existing.failed += 1;
        }
      } else {
        programmeMap.set(programmeId, {
          results: 1,
          passed:
            result.score >= 40 ? 1 : 0,
          failed:
            result.score < 40 ? 1 : 0,
          totalScore:
            result.score,
        });
      }
    }

    const programmeIds =
      Array.from(programmeMap.keys());

    const programmes =
      programmeIds.length > 0
        ? await Programme.find({
            _id: {
              $in: programmeIds,
            },
          }).select(
            "name code",
          )
        : [];

    const programmePerformance =
      programmes
        .map((programmeItem) => {
          const data =
            programmeMap.get(
              programmeItem._id.toString(),
            );

          if (!data) {
            return null;
          }

          return {
            id:
              programmeItem._id.toString(),

            name:
              programmeItem.name,

            code:
              programmeItem.code,

            results:
              data.results,

            passed:
              data.passed,

            failed:
              data.failed,

            averageScore: round(
              data.totalScore /
                data.results,
            ),

            passRate: round(
              (data.passed /
                data.results) *
                100,
            ),
          };
        })
        .filter(Boolean);

    /* =====================================================
       STUDENT PERFORMANCE
    ====================================================== */

    const studentMap = new Map<
      string,
      {
        student: any;
        results: number;
        passed: number;
        failed: number;
        totalScore: number;
      }
    >();

    for (const result of filteredResults) {
      if (
        !result.student ||
        typeof result.student !== "object"
      ) {
        continue;
      }

      const studentId =
        result.student._id.toString();

      const existing =
        studentMap.get(studentId);

      if (existing) {
        existing.results += 1;
        existing.totalScore += result.score;

        if (result.score >= 40) {
          existing.passed += 1;
        } else {
          existing.failed += 1;
        }
      } else {
        studentMap.set(studentId, {
          student: result.student,
          results: 1,
          passed:
            result.score >= 40 ? 1 : 0,
          failed:
            result.score < 40 ? 1 : 0,
          totalScore:
            result.score,
        });
      }
    }

    const studentPerformance =
      Array.from(
        studentMap.values(),
      )
        .map((item) => ({
          id:
            item.student._id.toString(),

          name:
            item.student.name,

          email:
            item.student.email,

          matricNumber:
            item.student.matricNumber,

          level:
            item.student.level,

          programme:
            item.student.programme,

          results:
            item.results,

          passed:
            item.passed,

          failed:
            item.failed,

          averageScore: round(
            item.totalScore /
              item.results,
          ),

          passRate: round(
            (item.passed /
              item.results) *
              100,
          ),
        }))
        .sort(
          (a, b) =>
            b.averageScore -
            a.averageScore,
        );

    /* =====================================================
       STUDENT COUNTS
    ====================================================== */

    const studentFilter: Record<
      string,
      unknown
    > = {
      role: "student",
    };

    if (programme) {
      studentFilter.programme =
        programme;
    }

    if (level) {
      studentFilter.level =
        level;
    }

    if (session) {
      studentFilter.academicSession =
        session;
    }

    const totalStudents =
      await User.countDocuments(
        studentFilter,
      );

    /* =====================================================
       FILTER INFORMATION
    ====================================================== */

    const [
      selectedSession,
      selectedSemester,
      selectedProgramme,
    ] = await Promise.all([
      session
        ? AcademicSession.findById(
            session,
          ).select("name")
        : null,

      semester
        ? Semester.findById(
            semester,
          ).select(
            "name order session",
          )
        : null,

      programme
        ? Programme.findById(
            programme,
          ).select(
            "name code",
          )
        : null,
    ]);

    /* =====================================================
       RESPONSE
    ====================================================== */

    return res.status(200).json({
      success: true,

      filters: {
        session: selectedSession
          ? {
              _id:
                selectedSession._id,
              name:
                selectedSession.name,
            }
          : null,

        semester: selectedSemester
          ? {
              _id:
                selectedSemester._id,
              name:
                selectedSemester.name,
              order:
                selectedSemester.order,
            }
          : null,

        programme:
          selectedProgramme
            ? {
                _id:
                  selectedProgramme._id,
                name:
                  selectedProgramme.name,
                code:
                  selectedProgramme.code,
              }
            : null,

        level: level || null,
      },

      overview: {
        totalStudents,
        totalResults,
        passedResults,
        failedResults,
        averageScore:
          round(averageScore),
        passRate:
          round(passRate),
      },

      gradeDistribution,

      coursePerformance,

      programmePerformance,

      studentPerformance,
    });
  } catch (error) {
    console.error(
      "Get academic report error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to generate academic report.",
    });
  }
}