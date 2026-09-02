import mongoose, { Document, Schema, Types } from "mongoose";

export interface IReferee {
  name: string;
  address: string;
  phone: string;
  isGuardianOrSponsor: boolean;
}

export interface IEducationHistoryEntry {
  schoolAttended: string;
  certificateObtained: string;
  dateObtained?: string;
  grade?: string;
}

export interface IAdmission extends Document {
  applicationNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: string;
  nationality?: string;
  postalAddress?: string;
  residentialAddress?: string;
  programme?: Types.ObjectId;
  department?: Types.ObjectId;
  academicSession?: Types.ObjectId;
  previousInstitution?: string;
  previousQualification?: string;
  referees: IReferee[];
  educationHistory: IEducationHistoryEntry[];
  passportPhotoUrl?: string;
  medicalCondition?: string;
  referredBy?: string;
  agreedToTerms: boolean;
  status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "WITHDRAWN";
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: Types.ObjectId;
  student?: Types.ObjectId;
  matricNumber?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const refereeSchema = new Schema<IReferee>(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    isGuardianOrSponsor: { type: Boolean, default: false },
  },
  { _id: false },
);

const educationHistorySchema = new Schema<IEducationHistoryEntry>(
  {
    schoolAttended: { type: String, required: true, trim: true },
    certificateObtained: { type: String, required: true, trim: true },
    dateObtained: { type: String, trim: true },
    grade: { type: String, trim: true },
  },
  { _id: false },
);

const admissionSchema = new Schema<IAdmission>(
  {
    applicationNumber: { type: String, required: true, unique: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    middleName: { type: String, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    dateOfBirth: { type: Date },
    gender: { type: String, trim: true },
    nationality: { type: String, trim: true },
    postalAddress: { type: String, trim: true },
    residentialAddress: { type: String, trim: true },

    programme: { type: Schema.Types.ObjectId, ref: "Programme" },
    department: { type: Schema.Types.ObjectId, ref: "Department" },
    academicSession: { type: Schema.Types.ObjectId, ref: "AcademicSession" },

    previousInstitution: { type: String, trim: true },
    previousQualification: { type: String, trim: true },

    referees: { type: [refereeSchema], default: [] },
    educationHistory: { type: [educationHistorySchema], default: [] },

    passportPhotoUrl: { type: String },
    medicalCondition: { type: String, trim: true },
    referredBy: { type: String, trim: true },
    agreedToTerms: { type: Boolean, required: true, default: false },

    status: {
      type: String,
      enum: ["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "WITHDRAWN"],
      default: "PENDING",
    },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    student: { type: Schema.Types.ObjectId, ref: "User" },
    matricNumber: { type: String },
    rejectionReason: { type: String, trim: true },
  },
  { timestamps: true },
);

const Admission =
  mongoose.models.Admission || mongoose.model<IAdmission>("Admission", admissionSchema);

export default Admission;