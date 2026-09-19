// import mongoose, { Document, Schema, Types } from "mongoose";

// export interface IRegistration extends Document {
//   student: Types.ObjectId;
//   course: Types.ObjectId;
//   semester: Types.ObjectId;
//   programme: Types.ObjectId;
//   status: "registered" | "dropped";
//   createdAt: Date;
//   updatedAt: Date;
// }

// const registrationSchema = new Schema<IRegistration>(
//   {
//     student: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     course: {
//       type: Schema.Types.ObjectId,
//       ref: "Course",
//       required: true,
//     },
//     semester: {
//       type: Schema.Types.ObjectId,
//       ref: "Semester",
//       required: true,
//     },
//     programme: {
//       type: Schema.Types.ObjectId,
//       ref: "Programme",
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ["registered", "dropped"],
//       default: "registered",
//     },
//   },
//   {
//     timestamps: true,
//   },
// );

// registrationSchema.index(
//   { student: 1, course: 1, semester: 1 },
//   { unique: true },
// );

// const Registration =
//   mongoose.models.Registration ||
//   mongoose.model<IRegistration>("Registration", registrationSchema);

// export default Registration;



import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IRegistration extends Document {
  student: Types.ObjectId;
  course: Types.ObjectId;
  semester: Types.ObjectId;
  programme: Types.ObjectId;
  status: "registered" | "dropped";
  createdAt: Date;
  updatedAt: Date;
}

const registrationSchema = new Schema<IRegistration>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    semester: {
      type: Schema.Types.ObjectId,
      ref: "Semester",
      required: true,
    },
    programme: {
      type: Schema.Types.ObjectId,
      ref: "Programme",
      required: true,
    },
    status: {
      type: String,
      enum: ["registered", "dropped"],
      default: "registered",
    },
  },
  {
    timestamps: true,
  },
);

registrationSchema.index(
  { student: 1, course: 1, semester: 1 },
  { unique: true },
);

/**
 * Same fix as LecturerAssignment: explicit Model<IRegistration>
 * annotation so the mongoose.models.X fallback pattern doesn't
 * silently widen this to Model<any> for every consumer.
 *
 * NOTE ON `programme: required: true` -- flagged, not changed:
 * if any registration-creation flow elsewhere in the app doesn't
 * supply `programme` at write time, that write will now throw a
 * Mongoose validation error. Confirm your registration-creation
 * endpoint always has the student's programme in hand before
 * relying on this being required; otherwise this field should be
 * optional with a fallback lookup from the student's own
 * `programme` field on the User model.
 */
const Registration: Model<IRegistration> =
  (mongoose.models.Registration as
    | Model<IRegistration>
    | undefined) ??
  mongoose.model<IRegistration>("Registration", registrationSchema);

export default Registration;