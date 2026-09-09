import mongoose, {
  Document,
  Schema,
  Types,
} from "mongoose";

/* =========================================================
   REFEREE
========================================================= */

export interface IReferee {
  name: string;
  address?: string;
  phone?: string;
  relationship?: string;
}

/* =========================================================
   EDUCATION RECORD
========================================================= */

export interface IEducationRecord {
  schoolAttended: string;
  certificate: string;
  dateObtained?: string;
  grade?: string;
}

/* =========================================================
   ADMISSION DOCUMENT
========================================================= */

export interface IAdmissionDocument {
  /**
   * Examples:
   *
   * passportPhoto
   * primarySchoolCertificate
   * secondarySchoolCertificate
   * birthCertificate
   * waecNecoResult
   * testimonial
   * stateOfOriginCertificate
   */
  type: string;

  filename: string;

  url: string;
}

/* =========================================================
   ADMISSION LETTER
========================================================= */

export interface IAdmissionLetter {
  /**
   * Publicly accessible Cloudinary URL
   * for the generated admission letter PDF.
   */
  url: string;

  /**
   * Cloudinary public ID.
   * Used for future replacement/deletion.
   */
  publicId: string;

  /**
   * Official admission letter reference.
   *
   * Example:
   * ITMT/ADM/2026/000002
   */
  reference: string;

  /**
   * Date/time the admission letter was generated.
   */
  generatedAt: Date;
}

/* =========================================================
   ADMISSION
========================================================= */

export interface IAdmission extends Document {
  applicationNumber: string;

  surname: string;

  otherNames: string;

  email: string;

  telephone?: string;

  dateOfBirth?: Date;

  nationality?: string;

  postalAddress?: string;

  residentialAddress?: string;

  programme?: Types.ObjectId;

  department?: Types.ObjectId;

  academicSession?: Types.ObjectId;

  referees: IReferee[];

  educationRecords: IEducationRecord[];

  documents: IAdmissionDocument[];

  medicalCondition?: string;

  referredBy?: string;

  applicantSignature: string;

  status:
    | "PENDING"
    | "UNDER_REVIEW"
    | "APPROVED"
    | "REJECTED"
    | "WITHDRAWN";

  submittedAt: Date;

  reviewedAt?: Date;

  reviewedBy?: Types.ObjectId;

  student?: Types.ObjectId;

  matricNumber?: string;

  rejectionReason?: string;

  /* -------------------------------------------------------
     ADMISSION LETTER
  ------------------------------------------------------- */

  admissionLetter?: IAdmissionLetter;

  createdAt: Date;

  updatedAt: Date;
}

/* =========================================================
   REFEREE SCHEMA
========================================================= */

const refereeSchema =
  new Schema<IReferee>(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      address: {
        type: String,
        trim: true,
      },

      phone: {
        type: String,
        trim: true,
      },

      relationship: {
        type: String,
        trim: true,
      },
    },
    {
      _id: false,
    },
  );

/* =========================================================
   EDUCATION RECORD SCHEMA
========================================================= */

const educationRecordSchema =
  new Schema<IEducationRecord>(
    {
      schoolAttended: {
        type: String,
        required: true,
        trim: true,
      },

      certificate: {
        type: String,
        required: true,
        trim: true,
      },

      dateObtained: {
        type: String,
        trim: true,
      },

      grade: {
        type: String,
        trim: true,
      },
    },
    {
      _id: false,
    },
  );

/* =========================================================
   ADMISSION DOCUMENT SCHEMA
========================================================= */

const admissionDocumentSchema =
  new Schema<IAdmissionDocument>(
    {
      type: {
        type: String,
        required: true,
        trim: true,
      },

      filename: {
        type: String,
        required: true,
        trim: true,
      },

      url: {
        type: String,
        required: true,
        trim: true,
      },
    },
    {
      _id: false,
    },
  );

/* =========================================================
   ADMISSION LETTER SCHEMA
========================================================= */

const admissionLetterSchema =
  new Schema<IAdmissionLetter>(
    {
      url: {
        type: String,
        required: true,
        trim: true,
      },

      publicId: {
        type: String,
        required: true,
        trim: true,
      },

      reference: {
        type: String,
        required: true,
        trim: true,
      },

      generatedAt: {
        type: Date,
        required: true,
        default: Date.now,
      },
    },
    {
      _id: false,
    },
  );

/* =========================================================
   ADMISSION SCHEMA
========================================================= */

const admissionSchema =
  new Schema<IAdmission>(
    {
      /* -----------------------------------------------------
         APPLICATION
      ----------------------------------------------------- */

      applicationNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },

      /* -----------------------------------------------------
         PERSONAL INFORMATION
      ----------------------------------------------------- */

      surname: {
        type: String,
        required: true,
        trim: true,
      },

      otherNames: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },

      telephone: {
        type: String,
        trim: true,
      },

      dateOfBirth: {
        type: Date,
      },

      nationality: {
        type: String,
        trim: true,
      },

      postalAddress: {
        type: String,
        trim: true,
      },

      residentialAddress: {
        type: String,
        trim: true,
      },

      /* -----------------------------------------------------
         ACADEMIC INFORMATION
      ----------------------------------------------------- */

      programme: {
        type: Schema.Types.ObjectId,
        ref: "Programme",
      },

      department: {
        type: Schema.Types.ObjectId,
        ref: "Department",
      },

      academicSession: {
        type: Schema.Types.ObjectId,
        ref: "AcademicSession",
      },

      /* -----------------------------------------------------
         REFEREES
      ----------------------------------------------------- */

      referees: {
        type: [refereeSchema],
        default: [],
      },

      /* -----------------------------------------------------
         EDUCATION
      ----------------------------------------------------- */

      educationRecords: {
        type: [educationRecordSchema],
        default: [],
      },

      /* -----------------------------------------------------
         DOCUMENTS
      ----------------------------------------------------- */

      documents: {
        type: [admissionDocumentSchema],
        default: [],
      },

      /* -----------------------------------------------------
         ADDITIONAL INFORMATION
      ----------------------------------------------------- */

      medicalCondition: {
        type: String,
        trim: true,
      },

      referredBy: {
        type: String,
        trim: true,
      },

      applicantSignature: {
        type: String,
        required: true,
        trim: true,
      },

      /* -----------------------------------------------------
         STATUS
      ----------------------------------------------------- */

      status: {
        type: String,

        enum: [
          "PENDING",
          "UNDER_REVIEW",
          "APPROVED",
          "REJECTED",
          "WITHDRAWN",
        ],

        default: "PENDING",
      },

      /* -----------------------------------------------------
         REVIEW
      ----------------------------------------------------- */

      submittedAt: {
        type: Date,
        default: Date.now,
      },

      reviewedAt: {
        type: Date,
      },

      reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },

      /* -----------------------------------------------------
         STUDENT
      ----------------------------------------------------- */

      student: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },

      matricNumber: {
        type: String,
        trim: true,
      },

      /* -----------------------------------------------------
         REJECTION
      ----------------------------------------------------- */

      rejectionReason: {
        type: String,
        trim: true,
      },

      /* -----------------------------------------------------
         ADMISSION LETTER
      ----------------------------------------------------- */

      admissionLetter: {
        type: admissionLetterSchema,
      },
    },

    {
      timestamps: true,
    },
  );

/* =========================================================
   MODEL
========================================================= */

const Admission =
  mongoose.models.Admission ||
  mongoose.model<IAdmission>(
    "Admission",
    admissionSchema,
  );

export default Admission;