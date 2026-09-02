import mongoose, {
  Document,
  Schema,
  Types,
} from "mongoose";

/* =========================================================
   TYPES
========================================================= */

export type Grade =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F";

export type ResultStatus =
  | "draft"
  | "published";

/* =========================================================
   RESULT DOCUMENT
========================================================= */

export interface IResult extends Document {
  student: Types.ObjectId;
  course: Types.ObjectId;
  semester: Types.ObjectId;
  lecturer: Types.ObjectId;

  score: number;
  grade: Grade;
  status: ResultStatus;

  createdAt: Date;
  updatedAt: Date;
}

/* =========================================================
   GRADE CALCULATION
========================================================= */

/**
 * Calculates a student's grade from their score.
 *
 * 70 - 100 = A
 * 60 - 69  = B
 * 50 - 59  = C
 * 45 - 49  = D
 * 40 - 44  = E
 * 0  - 39  = F
 */
export function computeGrade(
  score: number,
): Grade {
  if (score >= 70) {
    return "A";
  }

  if (score >= 60) {
    return "B";
  }

  if (score >= 50) {
    return "C";
  }

  if (score >= 45) {
    return "D";
  }

  if (score >= 40) {
    return "E";
  }

  return "F";
}

/* =========================================================
   SCHEMA
========================================================= */

const resultSchema =
  new Schema<IResult>(
    {
      /* =====================================================
         STUDENT
      ====================================================== */

      student: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      /* =====================================================
         COURSE
      ====================================================== */

      course: {
        type: Schema.Types.ObjectId,
        ref: "Course",
        required: true,
      },

      /* =====================================================
         SEMESTER
      ====================================================== */

      semester: {
        type: Schema.Types.ObjectId,
        ref: "Semester",
        required: true,
      },

      /* =====================================================
         LECTURER
      ====================================================== */

      lecturer: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      /* =====================================================
         SCORE
      ====================================================== */

      score: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },

      /* =====================================================
         GRADE
      ====================================================== */

      grade: {
        type: String,
        enum: [
          "A",
          "B",
          "C",
          "D",
          "E",
          "F",
        ],
        required: true,
      },

      /* =====================================================
         STATUS
      ====================================================== */

      status: {
        type: String,
        enum: [
          "draft",
          "published",
        ],
        default: "draft",
        required: true,
      },
    },
    {
      timestamps: true,
    },
  );

/* =========================================================
   UNIQUE RESULT CONSTRAINT
========================================================= */

/**
 * A student can only have one result for:
 *
 * student + course + semester
 *
 * This prevents duplicate result records.
 */
resultSchema.index(
  {
    student: 1,
    course: 1,
    semester: 1,
  },
  {
    unique: true,
  },
);

/* =========================================================
   AUTOMATIC GRADE CALCULATION
========================================================= */

/**
 * Always calculate the grade from the score
 * before validation.
 *
 * This is intentionally a synchronous middleware.
 *
 * We do NOT use:
 *
 * function (next) {}
 *
 * because the current Mongoose TypeScript typings
 * can incorrectly infer the callback parameter.
 */
resultSchema.pre(
  "validate",
  function () {
    if (
      typeof this.score === "number"
    ) {
      this.grade = computeGrade(
        this.score,
      );
    }
  },
);

/* =========================================================
   MODEL
========================================================= */

/**
 * Reuse the existing model during development
 * to prevent OverwriteModelError caused by
 * Next.js / tsx / nodemon hot reloads.
 */
const Result =
  mongoose.models.Result ||
  mongoose.model<IResult>(
    "Result",
    resultSchema,
  );

export default Result;
