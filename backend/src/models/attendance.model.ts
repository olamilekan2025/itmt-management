import mongoose, {
  Document,
  Schema,
  Types,
} from "mongoose";

/**
 * =========================================================
 * ATTENDANCE STATUS
 * =========================================================
 */

export type AttendanceStatus =
  | "present"
  | "absent"
  | "late"
  | "excused";

/**
 * =========================================================
 * ATTENDANCE DOCUMENT
 * =========================================================
 */

export interface IAttendance extends Document {
  student: Types.ObjectId;
  lecturer: Types.ObjectId;
  course: Types.ObjectId;
  semester: Types.ObjectId;

  date: Date;

  status: AttendanceStatus;

  note?: string;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * =========================================================
 * SCHEMA
 * =========================================================
 */

const attendanceSchema =
  new Schema<IAttendance>(
    {
      /**
       * -----------------------------------------------------
       * STUDENT
       * -----------------------------------------------------
       */

      student: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      /**
       * -----------------------------------------------------
       * LECTURER
       * -----------------------------------------------------
       */

      lecturer: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      /**
       * -----------------------------------------------------
       * COURSE
       * -----------------------------------------------------
       */

      course: {
        type: Schema.Types.ObjectId,
        ref: "Course",
        required: true,
        index: true,
      },

      /**
       * -----------------------------------------------------
       * SEMESTER
       * -----------------------------------------------------
       */

      semester: {
        type: Schema.Types.ObjectId,
        ref: "Semester",
        required: true,
        index: true,
      },

      /**
       * -----------------------------------------------------
       * DATE
       * -----------------------------------------------------
       *
       * Attendance is recorded once per student per
       * course/semester/date.
       *
       */

      date: {
        type: Date,
        required: true,
        index: true,
      },

      /**
       * -----------------------------------------------------
       * STATUS
       * -----------------------------------------------------
       */

      status: {
        type: String,
        enum: [
          "present",
          "absent",
          "late",
          "excused",
        ],
        required: true,
        default: "present",
      },

      /**
       * -----------------------------------------------------
       * NOTE
       * -----------------------------------------------------
       */

      note: {
        type: String,
        trim: true,
        maxlength: 500,
      },
    },
    {
      timestamps: true,
    },
  );

/**
 * =========================================================
 * UNIQUE ATTENDANCE RECORD
 * =========================================================
 *
 * Prevent:
 *
 * Student A
 * Course X
 * Semester Y
 * Date Z
 *
 * from having multiple attendance records.
 *
 * =========================================================
 */

attendanceSchema.index(
  {
    student: 1,
    course: 1,
    semester: 1,
    date: 1,
  },
  {
    unique: true,
  },
);

/**
 * =========================================================
 * MODEL
 * =========================================================
 */

const Attendance: mongoose.Model<IAttendance> =
  (mongoose.models.Attendance as
    | mongoose.Model<IAttendance>
    | undefined) ??
  mongoose.model<IAttendance>(
    "Attendance",
    attendanceSchema,
  );

export default Attendance;