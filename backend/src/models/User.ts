import mongoose, {
  Document,
  Schema,
  Types,
} from "mongoose";

export type UserRole =
  | "admin"
  | "registrar"
  | "finance"
  | "lecturer"
  | "student";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;

  role: UserRole;

  programme?: Types.ObjectId;
  academicSession?: Types.ObjectId;
  matricNumber?: string;
  level?: string;

  isActive: boolean;
  isSuspended: boolean;
  isEmailVerified: boolean;

  emailVerificationTokenHash?: string;
  emailVerificationExpires?: Date;

  otpHash?: string;
  otpExpires?: Date;

  passwordResetTokenHash?: string;
  passwordResetExpires?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    /* =====================================================
       BASIC INFORMATION
    ===================================================== */

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      select: false,
    },

    /* =====================================================
       ROLE
    ===================================================== */

    role: {
      type: String,
      enum: [
        "admin",
        "registrar",
        "finance",
        "lecturer",
        "student",
      ],
      default: "student",
      required: true,
    },

    /* =====================================================
       STUDENT ACADEMIC INFORMATION
    ===================================================== */

    programme: {
      type: Schema.Types.ObjectId,
      ref: "Programme",
    },

    academicSession: {
      type: Schema.Types.ObjectId,
      ref: "AcademicSession",
    },

    matricNumber: {
      type: String,
      trim: true,
      uppercase: true,
      sparse: true,
      unique: true,
    },

    level: {
      type: String,
      trim: true,
    },

    /* =====================================================
       ACCOUNT STATUS
    ===================================================== */

    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },

    isSuspended: {
      type: Boolean,
      default: false,
      required: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
      required: true,
    },

    /* =====================================================
       EMAIL VERIFICATION
    ===================================================== */

    emailVerificationTokenHash: {
      type: String,
      select: false,
    },

    emailVerificationExpires: {
      type: Date,
      select: false,
    },

    /* =====================================================
       OTP
    ===================================================== */

    otpHash: {
      type: String,
      select: false,
    },

    otpExpires: {
      type: Date,
      select: false,
    },

    /* =====================================================
       PASSWORD RESET
    ===================================================== */

    passwordResetTokenHash: {
      type: String,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

/* =========================================================
   INDEXES
========================================================= */

userSchema.index({
  role: 1,
  isActive: 1,
  isSuspended: 1,
});

userSchema.index({
  createdAt: -1,
});

/* =========================================================
   MODEL
========================================================= */

const User =
  mongoose.models.User ||
  mongoose.model<IUser>("User", userSchema);

export default User;