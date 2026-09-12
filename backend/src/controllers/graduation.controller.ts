import { Request, Response } from "express";
import mongoose, { Types } from "mongoose";

import Graduation from "../models/graduation.model.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import CourseRegistration from "../models/Registration.js";
import Result from "../models/Result.js";
import AcademicSession from "../models/AcademicSession.js";

/* =========================================================
   TYPES
========================================================= */

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

interface PopulatedProgramme {
  _id: Types.ObjectId;
  name?: string;
  code?: string;
}

interface PopulatedCourse {
  _id: Types.ObjectId;
  code?: string;
  title?: string;
  creditUnits?: number;
  programme?: Types.ObjectId | PopulatedProgramme | null;
  isActive?: boolean;
}

interface PopulatedStudent {
  _id: Types.ObjectId;
  name?: string;
  email?: string;
  matricNumber?: string;
  level?: string;
  programme?: Types.ObjectId | PopulatedProgramme | null;
  academicSession?: Types.ObjectId | null;
  isActive?: boolean;
}

interface RegistrationDocument {
  _id: Types.ObjectId;
  student: Types.ObjectId | PopulatedStudent;
  course: Types.ObjectId | PopulatedCourse;
  semester: Types.ObjectId;
  programme?: Types.ObjectId | PopulatedProgramme | null;
  status: "registered" | "dropped";
}

interface ResultDocument {
  _id: Types.ObjectId;
  student: Types.ObjectId;
  course: Types.ObjectId;
  semester: Types.ObjectId;
  score: number;
  grade: string;
  status: "draft" | "published";
}

/* =========================================================
   HELPERS
========================================================= */

function isValidObjectId(value: unknown): boolean {
  return (
    typeof value === "string" &&
    mongoose.Types.ObjectId.isValid(value)
  );
}

/* ---------------------------------------------------------
   Safely get an ID from ObjectId or populated document
--------------------------------------------------------- */

function getId(value: unknown): string {
  if (!value) {
    return "";
  }

  if (
    value instanceof Types.ObjectId
  ) {
    return value.toString();
  }

  if (
    typeof value === "object" &&
    "_id" in value
  ) {
    const id = (value as { _id?: unknown })._id;

    return id ? String(id) : "";
  }

  return String(value);
}

/* ---------------------------------------------------------
   Safely convert a reference into ObjectId
--------------------------------------------------------- */

function getObjectId(
  value: unknown,
): Types.ObjectId | null {
  const id = getId(value);

  if (!id || !isValidObjectId(id)) {
    return null;
  }

  return new Types.ObjectId(id);
}

/* ---------------------------------------------------------
   Current authenticated user
--------------------------------------------------------- */

function getCurrentUserId(
  req: AuthenticatedRequest,
): string {
  return String(req.user?.id || "");
}

/* ---------------------------------------------------------
   Programme helpers
--------------------------------------------------------- */

function getProgrammeId(
  programme:
    | Types.ObjectId
    | PopulatedProgramme
    | null
    | undefined,
): Types.ObjectId | null {
  return getObjectId(programme);
}

function getProgrammeName(
  programme:
    | Types.ObjectId
    | PopulatedProgramme
    | null
    | undefined,
): string {
  if (
    programme &&
    typeof programme === "object" &&
    "name" in programme
  ) {
    return String(
      (programme as PopulatedProgramme)
        .name || "",
    );
  }

  return "";
}

function getProgrammeCode(
  programme:
    | Types.ObjectId
    | PopulatedProgramme
    | null
    | undefined,
): string {
  if (
    programme &&
    typeof programme === "object" &&
    "code" in programme
  ) {
    return String(
      (programme as PopulatedProgramme)
        .code || "",
    );
  }

  return "";
}

/* ---------------------------------------------------------
   Course helpers
--------------------------------------------------------- */

function getCourseId(
  course: unknown,
): string {
  return getId(course);
}

function getCourseCreditUnits(
  course: unknown,
): number {
  if (
    course &&
    typeof course === "object" &&
    "creditUnits" in course
  ) {
    const value = Number(
      (course as {
        creditUnits?: number;
      }).creditUnits,
    );

    return Number.isFinite(value) &&
      value > 0
      ? value
      : 0;
  }

  return 0;
}

/* =========================================================
   BUILD STUDENT ELIGIBILITY
========================================================= */

async function evaluateStudent(
  student: PopulatedStudent,
) {
  const studentId =
    String(student._id);

  const programmeId =
    getProgrammeId(
      student.programme,
    );

  /* -------------------------------------------------------
     Student must have a programme
  ------------------------------------------------------- */

  if (!programmeId) {
    return {
      status: "not_eligible" as const,

      requiredCreditUnits: 0,

      earnedCreditUnits: 0,

      totalRegisteredCourses: 0,

      completedCourses: 0,

      failedCourses: 0,

      missingResults: 0,

      failedCourseIds:
        [] as Types.ObjectId[],

      missingResultCourseIds:
        [] as Types.ObjectId[],

      eligibilityReason:
        "Student is not assigned to a programme.",
    };
  }

  /* -------------------------------------------------------
     Get active programme courses
  ------------------------------------------------------- */

  const programmeCourses =
    (await Course.find({
      programme: programmeId,
      isActive: true,
    })
      .select(
        "_id code title creditUnits programme isActive",
      )
      .lean()) as unknown as
      PopulatedCourse[];

  /*
   * The current system does not hard-code
   * a fixed requirement such as 120 credits.
   *
   * Active courses belonging to the student's
   * programme determine the available curriculum
   * credit requirement.
   */

  const requiredCreditUnits =
    programmeCourses.reduce(
      (total, course) =>
        total +
        getCourseCreditUnits(course),
      0,
    );

  /* -------------------------------------------------------
     Get registered courses
  ------------------------------------------------------- */

  const registrations =
    (await CourseRegistration.find({
      student: studentId,
      status: "registered",
    })
      .select(
        "_id student course semester programme status",
      )
      .populate(
        "course",
        "_id code title creditUnits programme isActive",
      )
      .lean()) as unknown as
      RegistrationDocument[];

  const totalRegisteredCourses =
    registrations.length;

  /* -------------------------------------------------------
     No registered courses
  ------------------------------------------------------- */

  if (
    totalRegisteredCourses === 0
  ) {
    return {
      status: "not_eligible" as const,

      requiredCreditUnits,

      earnedCreditUnits: 0,

      totalRegisteredCourses: 0,

      completedCourses: 0,

      failedCourses: 0,

      missingResults: 0,

      failedCourseIds:
        [] as Types.ObjectId[],

      missingResultCourseIds:
        [] as Types.ObjectId[],

      eligibilityReason:
        "Student has no registered courses.",
    };
  }

  /* -------------------------------------------------------
     Get published results
  ------------------------------------------------------- */

  const publishedResults =
    (await Result.find({
      student: studentId,
      status: "published",
    })
      .select(
        "_id student course semester score grade status",
      )
      .lean()) as unknown as
      ResultDocument[];

  /* -------------------------------------------------------
     Build result lookup
     
     Key = course + semester
  ------------------------------------------------------- */

  const resultMap =
    new Map<
      string,
      ResultDocument
    >();

  for (
    const result of publishedResults
  ) {
    const courseId =
      getCourseId(result.course);

    const semesterId =
      getId(result.semester);

    if (!courseId || !semesterId) {
      continue;
    }

    const key =
      `${courseId}:${semesterId}`;

    resultMap.set(key, result);
  }

  /* -------------------------------------------------------
     Evaluation counters
  ------------------------------------------------------- */

  const failedCourseIds:
    Types.ObjectId[] = [];

  const missingResultCourseIds:
    Types.ObjectId[] = [];

  let earnedCreditUnits = 0;

  let completedCourses = 0;

  /* -------------------------------------------------------
     Evaluate registered courses
  ------------------------------------------------------- */

  for (
    const registration of registrations
  ) {
    const courseId =
      getCourseId(
        registration.course,
      );

    const semesterId =
      getId(
        registration.semester,
      );

    if (!courseId || !semesterId) {
      continue;
    }

    const key =
      `${courseId}:${semesterId}`;

    const result =
      resultMap.get(key);

    /* -----------------------------------------------------
       Missing published result
    ----------------------------------------------------- */

    if (!result) {
      const courseObjectId =
        getObjectId(courseId);

      if (courseObjectId) {
        missingResultCourseIds.push(
          courseObjectId,
        );
      }

      continue;
    }

    /* -----------------------------------------------------
       Course credit units
    ----------------------------------------------------- */

    const creditUnits =
      getCourseCreditUnits(
        registration.course,
      );

    const score =
      Number(result.score);

    /* -----------------------------------------------------
       Failed course
    ----------------------------------------------------- */

    if (
      score < 40 ||
      result.grade === "F"
    ) {
      const courseObjectId =
        getObjectId(courseId);

      if (courseObjectId) {
        failedCourseIds.push(
          courseObjectId,
        );
      }

      continue;
    }

    /* -----------------------------------------------------
       Passed course
    ----------------------------------------------------- */

    completedCourses += 1;

    earnedCreditUnits +=
      creditUnits;
  }

  /* -------------------------------------------------------
     Remove duplicate failed courses
  ------------------------------------------------------- */

  const uniqueFailedCourseIds =
    Array.from(
      new Map(
        failedCourseIds.map(
          (id) => [
            String(id),
            id,
          ],
        ),
      ).values(),
    );

  /* -------------------------------------------------------
     Remove duplicate missing courses
  ------------------------------------------------------- */

  const uniqueMissingCourseIds =
    Array.from(
      new Map(
        missingResultCourseIds.map(
          (id) => [
            String(id),
            id,
          ],
        ),
      ).values(),
    );

  const failedCourses =
    uniqueFailedCourseIds.length;

  const missingResults =
    uniqueMissingCourseIds.length;

  /* -------------------------------------------------------
     Check credit requirement
  ------------------------------------------------------- */

  const creditsSatisfied =
    requiredCreditUnits > 0 &&
    earnedCreditUnits >=
      requiredCreditUnits;

  /* -------------------------------------------------------
     Determine eligibility
  ------------------------------------------------------- */

  let status:
    | "eligible"
    | "not_eligible" =
    "not_eligible";

  let eligibilityReason =
    "Academic requirements have not been satisfied.";

  if (
    requiredCreditUnits <= 0
  ) {
    eligibilityReason =
      "No active curriculum credit requirement could be determined for this programme.";
  } else if (
    missingResults > 0
  ) {
    eligibilityReason =
      `${missingResults} registered course result${
        missingResults === 1
          ? ""
          : "s"
      } ${
        missingResults === 1
          ? "is"
          : "are"
      } still missing or unpublished.`;
  } else if (
    failedCourses > 0
  ) {
    eligibilityReason =
      `${failedCourses} failed course${
        failedCourses === 1
          ? ""
          : "s"
      } must be cleared before graduation.`;
  } else if (
    !creditsSatisfied
  ) {
    eligibilityReason =
      `Student has earned ${earnedCreditUnits} of ${requiredCreditUnits} required credit units.`;
  } else {
    status = "eligible";

    eligibilityReason =
      "Student has satisfied the available academic graduation requirements.";
  }

  return {
    status,

    requiredCreditUnits,

    earnedCreditUnits,

    totalRegisteredCourses,

    completedCourses,

    failedCourses,

    missingResults,

    failedCourseIds:
      uniqueFailedCourseIds,

    missingResultCourseIds:
      uniqueMissingCourseIds,

    eligibilityReason,
  };
}

/* =========================================================
   GET GRADUATION RECORDS
   GET /graduations
========================================================= */

export const getGraduations =
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    try {
      const {
        session,
        programme,
        status,
        search,
        refresh,
      } = req.query;

      /* -----------------------------------------------------
         Validate session
      ----------------------------------------------------- */

      if (
        session &&
        typeof session === "string" &&
        !isValidObjectId(session)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid academic session.",
        });
      }

      /* -----------------------------------------------------
         Validate programme
      ----------------------------------------------------- */

      if (
        programme &&
        typeof programme === "string" &&
        !isValidObjectId(programme)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid programme.",
        });
      }

      /* -----------------------------------------------------
         Determine academic session
      ----------------------------------------------------- */

      let academicSessionId =
        typeof session === "string"
          ? session
          : "";

      if (!academicSessionId) {
        const activeSession =
          await AcademicSession.findOne({
            isActive: true,
          })
            .select("_id name")
            .lean();

        if (activeSession) {
          academicSessionId =
            String(
              activeSession._id,
            );
        }
      }

      if (!academicSessionId) {
        return res.status(400).json({
          success: false,
          message:
            "No academic session was supplied and no active academic session exists.",
        });
      }

      /* -----------------------------------------------------
         Build student filter
      ----------------------------------------------------- */

      const studentFilter:
        Record<string, unknown> = {
        role: "student",
      };

      if (
        typeof programme === "string"
      ) {
        studentFilter.programme =
          new Types.ObjectId(
            programme,
          );
      }

      studentFilter.academicSession =
        new Types.ObjectId(
          academicSessionId,
        );

      /* -----------------------------------------------------
         Load students
      ----------------------------------------------------- */

      const students =
        (await User.find(
          studentFilter,
        )
          .select(
            "_id name email matricNumber level programme academicSession isActive",
          )
          .populate(
            "programme",
            "_id name code",
          )
          .lean()) as unknown as
          PopulatedStudent[];

      /* -----------------------------------------------------
         Evaluate students
      ----------------------------------------------------- */

      const records: Array<
        Record<string, unknown>
      > = [];

      for (
        const student of students
      ) {
        const evaluation =
          await evaluateStudent(
            student,
          );

        const programmeId =
          getProgrammeId(
            student.programme,
          );

        /*
         * Graduation requires a programme.
         */
        if (!programmeId) {
          continue;
        }

        const academicSessionObjectId =
          new Types.ObjectId(
            academicSessionId,
          );

        let graduation =
          await Graduation.findOne({
            student:
              student._id,

            academicSession:
              academicSessionObjectId,
          });

        /*
         * Never automatically overwrite
         * approved or graduated records.
         */

        if (
          !graduation ||
          ![
            "approved",
            "graduated",
          ].includes(
            graduation.status,
          )
        ) {
          graduation =
            await Graduation.findOneAndUpdate(
              {
                student:
                  student._id,

                academicSession:
                  academicSessionObjectId,
              },
              {
                $set: {
                  programme:
                    programmeId,

                  status:
                    evaluation.status,

                  requiredCreditUnits:
                    evaluation.requiredCreditUnits,

                  earnedCreditUnits:
                    evaluation.earnedCreditUnits,

                  totalRegisteredCourses:
                    evaluation.totalRegisteredCourses,

                  completedCourses:
                    evaluation.completedCourses,

                  failedCourses:
                    evaluation.failedCourses,

                  missingResults:
                    evaluation.missingResults,

                  failedCourseIds:
                    evaluation.failedCourseIds,

                  missingResultCourseIds:
                    evaluation.missingResultCourseIds,

                  eligibilityReason:
                    evaluation.eligibilityReason,
                },
              },
              {
                new: true,

                upsert: true,

                setDefaultsOnInsert:
                  true,
              },
            );
        }

        if (!graduation) {
          continue;
        }

        records.push({
          id: String(
            graduation._id,
          ),

          student: {
            id: String(
              student._id,
            ),

            name:
              student.name || "",

            email:
              student.email || "",

            matricNumber:
              student.matricNumber ||
              "",

            level:
              student.level || "",
          },

          programme: {
            id: String(
              programmeId,
            ),

            name:
              getProgrammeName(
                student.programme,
              ),

            code:
              getProgrammeCode(
                student.programme,
              ),
          },

          academicSession:
            academicSessionId,

          status:
            graduation.status,

          requiredCreditUnits:
            graduation.requiredCreditUnits,

          earnedCreditUnits:
            graduation.earnedCreditUnits,

          totalRegisteredCourses:
            graduation.totalRegisteredCourses,

          completedCourses:
            graduation.completedCourses,

          failedCourses:
            graduation.failedCourses,

          missingResults:
            graduation.missingResults,

          failedCourseIds:
            graduation.failedCourseIds,

          missingResultCourseIds:
            graduation.missingResultCourseIds,

          eligibilityReason:
            graduation.eligibilityReason,

          reviewedBy:
            graduation.reviewedBy ||
            null,

          reviewedAt:
            graduation.reviewedAt ||
            null,

          graduatedBy:
            graduation.graduatedBy ||
            null,

          graduatedAt:
            graduation.graduatedAt ||
            null,

          notes:
            graduation.notes ||
            "",
        });
      }

      /* -----------------------------------------------------
         Search
      ----------------------------------------------------- */

      let filteredRecords =
        records;

      if (
        typeof search === "string" &&
        search.trim()
      ) {
        const term =
          search
            .trim()
            .toLowerCase();

        filteredRecords =
          filteredRecords.filter(
            (record) => {
              const student =
                record.student as {
                  name: string;
                  email: string;
                  matricNumber: string;
                };

              const programmeData =
                record.programme as {
                  name: string;
                  code: string;
                };

              return (
                student.name
                  .toLowerCase()
                  .includes(term) ||
                student.email
                  .toLowerCase()
                  .includes(term) ||
                student.matricNumber
                  .toLowerCase()
                  .includes(term) ||
                programmeData.name
                  .toLowerCase()
                  .includes(term) ||
                programmeData.code
                  .toLowerCase()
                  .includes(term)
              );
            },
          );
      }

      /* -----------------------------------------------------
         Status filter
      ----------------------------------------------------- */

      const validStatuses = [
        "eligible",
        "not_eligible",
        "approved",
        "graduated",
      ];

      if (
        typeof status === "string" &&
        validStatuses.includes(status)
      ) {
        filteredRecords =
          filteredRecords.filter(
            (record) =>
              record.status ===
              status,
          );
      }

      /* -----------------------------------------------------
         Statistics
      ----------------------------------------------------- */

      const statistics = {
        total:
          records.length,

        eligible:
          records.filter(
            (record) =>
              record.status ===
              "eligible",
          ).length,

        notEligible:
          records.filter(
            (record) =>
              record.status ===
              "not_eligible",
          ).length,

        approved:
          records.filter(
            (record) =>
              record.status ===
              "approved",
          ).length,

        graduated:
          records.filter(
            (record) =>
              record.status ===
              "graduated",
          ).length,
      };

      return res.status(200).json({
        success: true,

        academicSession:
          academicSessionId,

        statistics,

        graduations:
          filteredRecords,

        refresh:
          refresh === "true",
      });
    } catch (error) {
      console.error(
        "getGraduations error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load graduation records.",
      });
    }
  };

/* =========================================================
   GET SINGLE GRADUATION
   GET /graduations/:id
========================================================= */

export const getGraduationById =
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    try {
      const { id } =
        req.params;

      if (
        !isValidObjectId(id)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid graduation record ID.",
        });
      }

      const graduation =
        await Graduation.findById(
          id,
        )
          .populate(
            "student",
            "_id name email matricNumber level programme academicSession",
          )
          .populate(
            "programme",
            "_id name code",
          )
          .populate(
            "academicSession",
            "_id name startDate endDate isActive",
          )
          .populate(
            "failedCourseIds",
            "_id code title creditUnits",
          )
          .populate(
            "missingResultCourseIds",
            "_id code title creditUnits",
          )
          .populate(
            "reviewedBy",
            "_id name email",
          )
          .populate(
            "graduatedBy",
            "_id name email",
          );

      if (!graduation) {
        return res.status(404).json({
          success: false,
          message:
            "Graduation record not found.",
        });
      }

      return res.status(200).json({
        success: true,
        graduation,
      });
    } catch (error) {
      console.error(
        "getGraduationById error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load graduation record.",
      });
    }
  };

/* =========================================================
   EVALUATE ONE STUDENT
   POST /graduations/evaluate
========================================================= */

export const evaluateGraduation =
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    try {
      const {
        student,
        academicSession,
      } = req.body;

      if (
        !isValidObjectId(student)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid student ID.",
        });
      }

      if (
        !isValidObjectId(
          academicSession,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid academic session ID.",
        });
      }

      const foundStudent =
        (await User.findOne({
          _id: student,
          role: "student",
        })
          .select(
            "_id name email matricNumber level programme academicSession isActive",
          )
          .populate(
            "programme",
            "_id name code",
          )
          .lean()) as unknown as
          | PopulatedStudent
          | null;

      if (!foundStudent) {
        return res.status(404).json({
          success: false,
          message:
            "Student not found.",
        });
      }

      const evaluation =
        await evaluateStudent(
          foundStudent,
        );

      const programmeId =
        getProgrammeId(
          foundStudent.programme,
        );

      if (!programmeId) {
        return res.status(400).json({
          success: false,
          message:
            "Student is not assigned to a programme.",
        });
      }

      const graduation =
        await Graduation.findOneAndUpdate(
          {
            student:
              new Types.ObjectId(
                student,
              ),

            academicSession:
              new Types.ObjectId(
                academicSession,
              ),
          },
          {
            $set: {
              programme:
                programmeId,

              status:
                evaluation.status,

              requiredCreditUnits:
                evaluation.requiredCreditUnits,

              earnedCreditUnits:
                evaluation.earnedCreditUnits,

              totalRegisteredCourses:
                evaluation.totalRegisteredCourses,

              completedCourses:
                evaluation.completedCourses,

              failedCourses:
                evaluation.failedCourses,

              missingResults:
                evaluation.missingResults,

              failedCourseIds:
                evaluation.failedCourseIds,

              missingResultCourseIds:
                evaluation.missingResultCourseIds,

              eligibilityReason:
                evaluation.eligibilityReason,
            },
          },
          {
            new: true,

            upsert: true,

            setDefaultsOnInsert:
              true,
          },
        );

      return res.status(200).json({
        success: true,

        message:
          "Graduation eligibility evaluated successfully.",

        graduation,
      });
    } catch (error) {
      console.error(
        "evaluateGraduation error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to evaluate graduation eligibility.",
      });
    }
  };

/* =========================================================
   APPROVE GRADUATION
   PATCH /graduations/:id/approve
========================================================= */

export const approveGraduation =
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    try {
      const { id } =
        req.params;

      if (
        !isValidObjectId(id)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid graduation record ID.",
        });
      }

      const graduation =
        await Graduation.findById(
          id,
        );

      if (!graduation) {
        return res.status(404).json({
          success: false,
          message:
            "Graduation record not found.",
        });
      }

      if (
        graduation.status !==
        "eligible"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Only eligible students can be approved for graduation.",
        });
      }

      const reviewerId =
        getCurrentUserId(req);

      if (
        !isValidObjectId(
          reviewerId,
        )
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Authenticated reviewer could not be identified.",
        });
      }

      graduation.status =
        "approved";

      graduation.reviewedBy =
        new Types.ObjectId(
          reviewerId,
        );

      graduation.reviewedAt =
        new Date();

      if (
        typeof req.body?.notes ===
        "string"
      ) {
        graduation.notes =
          req.body.notes.trim();
      }

      await graduation.save();

      return res.status(200).json({
        success: true,

        message:
          "Student approved for graduation.",

        graduation,
      });
    } catch (error) {
      console.error(
        "approveGraduation error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to approve graduation.",
      });
    }
  };

/* =========================================================
   MARK AS GRADUATED
   PATCH /graduations/:id/graduate
========================================================= */

export const graduateStudent =
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    try {
      const { id } =
        req.params;

      if (
        !isValidObjectId(id)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid graduation record ID.",
        });
      }

      const graduation =
        await Graduation.findById(
          id,
        );

      if (!graduation) {
        return res.status(404).json({
          success: false,
          message:
            "Graduation record not found.",
        });
      }

      if (
        graduation.status !==
        "approved"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Only approved students can be marked as graduated.",
        });
      }

      const userId =
        getCurrentUserId(req);

      if (
        !isValidObjectId(userId)
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Authenticated user could not be identified.",
        });
      }

      graduation.status =
        "graduated";

      graduation.graduatedBy =
        new Types.ObjectId(
          userId,
        );

      graduation.graduatedAt =
        new Date();

      await graduation.save();

      return res.status(200).json({
        success: true,

        message:
          "Student has been marked as graduated.",

        graduation,
      });
    } catch (error) {
      console.error(
        "graduateStudent error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to complete graduation.",
      });
    }
  };

/* =========================================================
   REJECT / RETURN TO NOT ELIGIBLE
   PATCH /graduations/:id/reject
========================================================= */

export const rejectGraduation =
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    try {
      const { id } =
        req.params;

      if (
        !isValidObjectId(id)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid graduation record ID.",
        });
      }

      const graduation =
        await Graduation.findById(
          id,
        );

      if (!graduation) {
        return res.status(404).json({
          success: false,
          message:
            "Graduation record not found.",
        });
      }

      if (
        graduation.status ===
        "graduated"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A graduated student cannot be returned to an earlier status.",
        });
      }

      /*
       * The Graduation schema only contains:
       *
       * reviewedBy
       * reviewedAt
       * graduatedBy
       * graduatedAt
       *
       * There are no rejectedBy/rejectedAt fields.
       */

      graduation.status =
        "not_eligible";

      graduation.reviewedBy =
        undefined;

      graduation.reviewedAt =
        undefined;

      if (
        typeof req.body?.notes ===
        "string"
      ) {
        graduation.notes =
          req.body.notes.trim();
      }

      await graduation.save();

      return res.status(200).json({
        success: true,

        message:
          "Graduation approval has been returned to not eligible.",

        graduation,
      });
    } catch (error) {
      console.error(
        "rejectGraduation error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update graduation status.",
      });
    }
  };