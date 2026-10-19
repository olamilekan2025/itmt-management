
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
  // Basic information
  name: string;
  email: string;
  password?: string;
  phone?: string;
  profileImage?: string;

  // Role
  role: UserRole;

  // Notification preferences
  notificationPreferences?: {
    emailNotifications?: boolean;
    academicUpdates?: boolean;
    announcements?: boolean;
    paymentNotifications?: boolean;
  };

  // Appearance preferences
  appearancePreferences?: {
    theme?: "system" | "light" | "dark";
  };

  // Staff information
  staffNumber?: string;
  qualification?: string;

  // Student academic information
  programme?: Types.ObjectId;
  academicSession?: Types.ObjectId;
  matricNumber?: string;
  level?: string;

  // Account status
  isActive: boolean;
  isSuspended: boolean;
  isEmailVerified: boolean;
  tokenVersion: number;

  // Email verification
  emailVerificationTokenHash?: string;
  emailVerificationExpires?: Date;

  // OTP
  otpHash?: string;
  otpExpires?: Date;

  // Password reset
  passwordResetTokenHash?: string;
  passwordResetExpires?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    // Basic information
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
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

    phone: {
      type: String,
      trim: true,
      maxlength: 30,
    },

    profileImage: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // Role
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

    // Notification preferences
    notificationPreferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      academicUpdates: {
        type: Boolean,
        default: true,
      },
      announcements: {
        type: Boolean,
        default: true,
      },
      paymentNotifications: {
        type: Boolean,
        default: true,
      },
    },

    // Appearance preferences
    appearancePreferences: {
      theme: {
        type: String,
        enum: ["system", "light", "dark"],
        default: "system",
      },
    },

    // Staff information
    staffNumber: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 50,
      sparse: true,
      unique: true,
    },

    qualification: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    // Student academic information
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

    // Account status
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

    tokenVersion: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Email verification
    emailVerificationTokenHash: {
      type: String,
      select: false,
    },

    emailVerificationExpires: {
      type: Date,
      select: false,
    },

    // OTP
    otpHash: {
      type: String,
      select: false,
    },

    otpExpires: {
      type: Date,
      select: false,
    },

    // Password reset
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

// Indexes
userSchema.index({
  role: 1,
  isActive: 1,
  isSuspended: 1,
});

userSchema.index({
  createdAt: -1,
});

// Model
const User =
  mongoose.models.User ||
  mongoose.model<IUser>("User", userSchema);

export default User;
