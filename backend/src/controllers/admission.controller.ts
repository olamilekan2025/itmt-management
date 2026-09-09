import type { Request, Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";

import Admission, {
  type IAdmissionDocument,
} from "../models/Admission.js";

import Programme from "../models/Programme.js";
import Department from "../models/Department.js";
import AcademicSession from "../models/AcademicSession.js";
import User from "../models/User.js";
import Counter from "../models/Counter.js";

import {
  generateVerificationToken,
} from "../utils/token.js";

import {
  sendAdmissionApprovedEmail,
  sendAdmissionRejectedEmail,
  sendAdmissionSubmittedEmail,
  sendAdmissionUnderReviewEmail,
  sendPasswordResetEmail,
} from "../utils/email.js";

import {
  generateAdmissionLetter,
} from "../utils/admissionLetter.js";

import {
  notifyAdmins,
} from "../services/notification.service.js";

import type {
  AuthRequest,
} from "../middleware/auth.middleware.js";

import {
  uploadBufferToCloudinary,
} from "../utils/uploadToCloudinary.js";

/* =========================================================
   TYPES
========================================================= */

type AdmissionFiles = {
  [fieldname: string]: Express.Multer.File[];
};

/* =========================================================
   VALIDATION SCHEMAS
========================================================= */

const refereeSchema = z.object({
  name: z.string().trim().min(1),
  address: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  relationship: z.string().trim().optional(),
});

const educationRecordSchema = z.object({
  schoolAttended: z.string().trim().min(1),
  certificate: z.string().trim().min(1),
  dateObtained: z.string().trim().optional(),
  grade: z.string().trim().optional(),
});

const applySchema = z.object({
  surname: z.string().trim().min(1),
  otherNames: z.string().trim().min(1),

  email: z.string().trim().email(),

  telephone: z.string().trim().optional(),

  dateOfBirth: z.string().optional(),

  nationality: z.string().optional(),

  postalAddress: z.string().optional(),

  residentialAddress: z.string().optional(),

  programmeId: z.string().optional(),

  departmentId: z.string().optional(),

  academicSessionId: z.string().optional(),

  referees: z
    .array(refereeSchema)
    .min(
      1,
      "At least one referee is required",
    )
    .refine(
      (refs) =>
        refs.some((referee) =>
          /guardian|sponsor/i.test(
            referee.relationship || "",
          ),
        ),
      {
        message:
          "At least one referee must be listed as a guardian or sponsor",
      },
    ),

  educationRecords: z
    .array(educationRecordSchema)
    .optional()
    .default([]),

  medicalCondition: z.string().optional(),

  referredBy: z.string().optional(),

  applicantSignature: z
    .string()
    .trim()
    .min(
      1,
      "Please type your full name as your signature",
    ),
});

/* =========================================================
   REJECTION VALIDATION
========================================================= */

const rejectSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(
      5,
      "Rejection reason must be at least 5 characters",
    ),
});

/* =========================================================
   APPLICATION NUMBER
========================================================= */

async function generateApplicationNumber(
  session?: mongoose.ClientSession,
): Promise<string> {
  const year = new Date().getFullYear();

  const key = `APP_${year}`;

  const counter =
    await Counter.findOneAndUpdate(
      { key },
      {
        $inc: {
          sequence: 1,
        },
      },
      {
        new: true,
        upsert: true,
        session,
      },
    );

  if (!counter) {
    throw new Error(
      "Unable to generate application number",
    );
  }

  const sequence =
    counter.sequence
      .toString()
      .padStart(6, "0");

  return `ITMT/APP/${year}/${sequence}`;
}

/* =========================================================
   MATRIC NUMBER
========================================================= */

async function generateMatricNumber(
  academicSessionId?: string,
  session?: mongoose.ClientSession,
): Promise<{
  matricNumber: string;
  year: number;
  sequence: number;
}> {
  let year = new Date().getFullYear();

  if (academicSessionId) {
    const academicSessionQuery =
      AcademicSession.findById(
        academicSessionId,
      );

    if (session) {
      academicSessionQuery.session(session);
    }

    const academicSession =
      await academicSessionQuery;

    if (academicSession) {
      const match = /^(\d{4})/.exec(
        academicSession.name,
      );

      if (match) {
        year = parseInt(
          match[1],
          10,
        );
      } else if (
        academicSession.startDate
      ) {
        year =
          academicSession.startDate.getFullYear();
      }
    }
  }

  const key = `MATRIC_${year}`;

  const counter =
    await Counter.findOneAndUpdate(
      { key },
      {
        $inc: {
          sequence: 1,
        },
      },
      {
        new: true,
        upsert: true,
        session,
      },
    );

  if (!counter) {
    throw new Error(
      "Unable to generate matric number",
    );
  }

  const sequence =
    counter.sequence;

  return {
    matricNumber:
      `ITMT/${year}/${sequence
        .toString()
        .padStart(6, "0")}`,
    year,
    sequence,
  };
}

/* =========================================================
   UPLOAD ADMISSION FILE
========================================================= */

async function uploadAdmissionFile(
  file:
    | Express.Multer.File
    | undefined,
  type: string,
  folder: string,
): Promise<IAdmissionDocument | null> {
  if (!file) {
    return null;
  }

  const uploadResult =
    await uploadBufferToCloudinary(
      file.buffer,
      folder,
    );

  return {
    type,
    filename: file.originalname,
    url: uploadResult.secure_url,
  };
}

/* =========================================================
   APPLY FOR ADMISSION
========================================================= */

export async function applyForAdmission(
  req: Request,
  res: Response,
) {
  try {
    /* -------------------------------------------------------
       BODY
    ------------------------------------------------------- */

    const rawBody =
      req.body as Record<
        string,
        string
      >;

    let referees: unknown[] = [];
    let educationRecords: unknown[] = [];

    try {
      referees = rawBody.referees
        ? JSON.parse(
            rawBody.referees,
          )
        : [];

      educationRecords =
        rawBody.educationRecords
          ? JSON.parse(
              rawBody.educationRecords,
            )
          : [];
    } catch {
      return res.status(400).json({
        success: false,
        message:
          "Invalid referee or education record data",
      });
    }

    const parsedBody = {
      ...rawBody,
      referees,
      educationRecords,
    };

    /* -------------------------------------------------------
       VALIDATE BODY
    ------------------------------------------------------- */

    const data =
      applySchema.parse(
        parsedBody,
      );

    /* -------------------------------------------------------
       GET FILES
    ------------------------------------------------------- */

    const files =
      req.files as
        | AdmissionFiles
        | undefined;

    /* -------------------------------------------------------
       PASSPORT PHOTO
    ------------------------------------------------------- */

    const passportPhoto =
      files?.passportPhoto?.[0];

    if (!passportPhoto) {
      return res.status(400).json({
        success: false,
        message:
          "A passport photograph is required",
      });
    }

    /* -------------------------------------------------------
       VALIDATE PROGRAMME
    ------------------------------------------------------- */

    if (data.programmeId) {
      if (
        !mongoose.Types.ObjectId.isValid(
          data.programmeId,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid programme",
        });
      }

      const programme =
        await Programme.findById(
          data.programmeId,
        );

      if (!programme) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid programme",
        });
      }
    }

    /* -------------------------------------------------------
       VALIDATE DEPARTMENT
    ------------------------------------------------------- */

    if (data.departmentId) {
      if (
        !mongoose.Types.ObjectId.isValid(
          data.departmentId,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid department",
        });
      }

      const department =
        await Department.findById(
          data.departmentId,
        );

      if (!department) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid department",
        });
      }
    }

    /* -------------------------------------------------------
       VALIDATE ACADEMIC SESSION
    ------------------------------------------------------- */

    if (data.academicSessionId) {
      if (
        !mongoose.Types.ObjectId.isValid(
          data.academicSessionId,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid academic session",
        });
      }

      const academicSession =
        await AcademicSession.findById(
          data.academicSessionId,
        );

      if (!academicSession) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid academic session",
        });
      }

      if (!academicSession.isActive) {
        return res.status(400).json({
          success: false,
          message:
            "Admissions are not open for the selected session",
        });
      }
    }

    /* -------------------------------------------------------
       DUPLICATE APPLICATION
    ------------------------------------------------------- */

    const duplicateQuery: Record<
      string,
      unknown
    > = {
      email:
        data.email.toLowerCase(),

      status: {
        $in: [
          "PENDING",
          "UNDER_REVIEW",
        ],
      },
    };

    if (data.academicSessionId) {
      duplicateQuery.academicSession =
        data.academicSessionId;
    }

    const existing =
      await Admission.findOne(
        duplicateQuery,
      );

    if (existing) {
      return res.status(409).json({
        success: false,
        message:
          "An application with this email for the selected session already exists.",
      });
    }

    /* -------------------------------------------------------
       UPLOAD ALL DOCUMENTS
    ------------------------------------------------------- */

    const documents:
      IAdmissionDocument[] = [];

    /* -------------------------------------------------------
       PASSPORT PHOTO
    ------------------------------------------------------- */

    const passportDocument =
      await uploadAdmissionFile(
        passportPhoto,
        "passportPhoto",
        "itmt/admissions/passports",
      );

    if (passportDocument) {
      documents.push(
        passportDocument,
      );
    }

    /* -------------------------------------------------------
       SUPPORTING DOCUMENTS
    ------------------------------------------------------- */

    const supportingDocuments = [
      {
        field:
          "primarySchoolCertificate",
        type:
          "primarySchoolCertificate",
      },
      {
        field:
          "secondarySchoolCertificate",
        type:
          "secondarySchoolCertificate",
      },
      {
        field: "birthCertificate",
        type: "birthCertificate",
      },
      {
        field: "waecNecoResult",
        type: "waecNecoResult",
      },
      {
        field: "testimonial",
        type: "testimonial",
      },
      {
        field:
          "stateOfOriginCertificate",
        type:
          "stateOfOriginCertificate",
      },
    ] as const;

    for (
      const documentDefinition of
        supportingDocuments
    ) {
      const file =
        files?.[
          documentDefinition.field
        ]?.[0];

      if (!file) {
        continue;
      }

      const uploadedDocument =
        await uploadAdmissionFile(
          file,
          documentDefinition.type,
          "itmt/admissions/documents",
        );

      if (uploadedDocument) {
        documents.push(
          uploadedDocument,
        );
      }
    }

    /* -------------------------------------------------------
       CREATE ADMISSION
    ------------------------------------------------------- */

    const mongoSession =
      await mongoose.startSession();

    let applicationNumber = "";

    try {
      await mongoSession.withTransaction(
        async () => {
          applicationNumber =
            await generateApplicationNumber(
              mongoSession,
            );

          const admission =
            new Admission({
              applicationNumber,

              surname:
                data.surname,

              otherNames:
                data.otherNames,

              email:
                data.email.toLowerCase(),

              telephone:
                data.telephone,

              dateOfBirth:
                data.dateOfBirth
                  ? new Date(
                      data.dateOfBirth,
                    )
                  : undefined,

              nationality:
                data.nationality,

              postalAddress:
                data.postalAddress,

              residentialAddress:
                data.residentialAddress,

              programme:
                data.programmeId,

              department:
                data.departmentId,

              academicSession:
                data.academicSessionId,

              referees:
                data.referees,

              educationRecords:
                data.educationRecords,

              medicalCondition:
                data.medicalCondition,

              referredBy:
                data.referredBy,

              applicantSignature:
                data.applicantSignature,

              documents,

              status: "PENDING",
            });

          await admission.save({
            session:
              mongoSession,
          });
        },
      );
    } finally {
      await mongoSession.endSession();
    }

    /* -------------------------------------------------------
       NOTIFY ADMINS
    ------------------------------------------------------- */

    try {
      await notifyAdmins({
        title:
          "New Admission Application",

        message:
          `${data.otherNames} ${data.surname} submitted an admission application (${applicationNumber}).`,

        type: "admission",

        link:
          "/dashboards/admin/admissions",

        metadata: {
          applicationNumber,
        },
      });
    } catch (notificationError) {
      console.error(
        "Admission notification error:",
        notificationError,
      );
    }

    /* -------------------------------------------------------
       APPLICANT EMAIL — SUBMITTED
    ------------------------------------------------------- */

    const applicantName =
      `${data.otherNames} ${data.surname}`.trim();

    try {
      await sendAdmissionSubmittedEmail(
        data.email.toLowerCase(),
        applicantName,
        applicationNumber,
      );
    } catch (emailError) {
      console.error(
        "[ADMISSION EMAIL] Failed to send application submitted email:",
        emailError,
      );
    }

    /* -------------------------------------------------------
       RESPONSE
    ------------------------------------------------------- */

    return res.status(201).json({
      success: true,
      message:
        "Application submitted successfully.",
      data: {
        applicationNumber,
        status: "PENDING",
      },
    });
  } catch (error) {
    /* -------------------------------------------------------
       ZOD ERROR
    ------------------------------------------------------- */

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message:
          "Validation failed",
        errors:
          error.flatten().fieldErrors,
      });
    }

    /* -------------------------------------------------------
       MULTER / UPLOAD ERROR
    ------------------------------------------------------- */

    if (
      error instanceof Error &&
      (
        error.name ===
          "MulterError" ||
        error.message.includes(
          "Passport photograph",
        ) ||
        error.message.includes(
          "Supporting documents",
        )
      )
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    /* -------------------------------------------------------
       GENERAL ERROR
    ------------------------------------------------------- */

    console.error(
      "Apply admission error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to submit application",
    });
  }
}

/* =========================================================
   LIST ADMISSIONS
========================================================= */

export async function listAdmissions(
  req: AuthRequest,
  res: Response,
) {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search,
    } = req.query as {
      page?: string | number;
      limit?: string | number;
      status?: string;
      search?: string;
    };

    const query: Record<
      string,
      unknown
    > = {};

    /* -------------------------------------------------------
       STATUS
    ------------------------------------------------------- */

    if (status) {
      query.status = status;
    }

    /* -------------------------------------------------------
       SEARCH
    ------------------------------------------------------- */

    if (search) {
      query.$or = [
        {
          applicationNumber: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
        {
          surname: {
            $regex: search,
            $options: "i",
          },
        },
        {
          otherNames: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const pageNumber =
      Math.max(
        Number(page) || 1,
        1,
      );

    const limitNumber =
      Math.min(
        Math.max(
          Number(limit) || 20,
          1,
        ),
        100,
      );

    const skip =
      (pageNumber - 1) *
      limitNumber;

    const [
      items,
      total,
    ] = await Promise.all([
      Admission.find(query)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limitNumber)
        .populate(
          "programme department academicSession reviewedBy student",
        ),

      Admission.countDocuments(
        query,
      ),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        items,
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages:
          Math.ceil(
            total /
              limitNumber,
          ),
      },
    });
  } catch (error) {
    console.error(
      "List admissions error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to list admissions",
    });
  }
}

/* =========================================================
   GET SINGLE ADMISSION
========================================================= */

export async function getAdmission(
  req: AuthRequest,
  res: Response,
) {
  try {
    const idParam =
      req.params.id;

    const id =
      Array.isArray(idParam)
        ? idParam[0]
        : idParam;

    if (
      !id ||
      !mongoose.Types.ObjectId.isValid(
        id,
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid id",
      });
    }

    const admission =
      await Admission.findById(
        id,
      ).populate(
        "programme department academicSession reviewedBy student",
      );

    if (!admission) {
      return res.status(404).json({
        success: false,
        message:
          "Application not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: admission,
    });
  } catch (error) {
    console.error(
      "Get admission error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve application",
    });
  }
}

/* =========================================================
   REVIEW ADMISSION
========================================================= */

export async function reviewAdmission(
  req: AuthRequest,
  res: Response,
) {
  try {
    const idParam =
      req.params.id;

    const id =
      Array.isArray(idParam)
        ? idParam[0]
        : idParam;

    if (
      !id ||
      !mongoose.Types.ObjectId.isValid(
        id,
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid id",
      });
    }

    const admission =
      await Admission.findById(id);

    if (!admission) {
      return res.status(404).json({
        success: false,
        message:
          "Application not found",
      });
    }

    /* -------------------------------------------------------
       ONLY PENDING APPLICATIONS
    ------------------------------------------------------- */

    if (
      admission.status !==
      "PENDING"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Only pending applications can be moved to review.",
      });
    }

    /* -------------------------------------------------------
       UPDATE STATUS
    ------------------------------------------------------- */

    admission.status =
      "UNDER_REVIEW";

    admission.reviewedAt =
      new Date();

    admission.reviewedBy =
      req.user?.userId;

    await admission.save();

    /* -------------------------------------------------------
       APPLICANT EMAIL — UNDER REVIEW
    ------------------------------------------------------- */

    const applicantName =
      `${admission.otherNames} ${admission.surname}`.trim();

    try {
      await sendAdmissionUnderReviewEmail(
        admission.email,
        applicantName,
        admission.applicationNumber,
      );
    } catch (emailError) {
      console.error(
        "[ADMISSION EMAIL] Failed to send under-review email:",
        emailError,
      );
    }

    /* -------------------------------------------------------
       RESPONSE
    ------------------------------------------------------- */

    return res.status(200).json({
      success: true,
      message:
        "Application marked under review",
    });
  } catch (error) {
    console.error(
      "Review admission error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to review application",
    });
  }
}

/* =========================================================
   APPROVE ADMISSION
========================================================= */

export async function approveAdmission(
  req: AuthRequest,
  res: Response,
) {
  const idParam =
    req.params.id;

  const id =
    Array.isArray(idParam)
      ? idParam[0]
      : idParam;

  if (
    !id ||
    !mongoose.Types.ObjectId.isValid(
      id,
    )
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid id",
    });
  }

  const mongoSession =
    await mongoose.startSession();

  try {
    /* =====================================================
       TRANSACTION
    ===================================================== */

    const transactionResult =
      await mongoSession.withTransaction(
        async () => {
          /* -------------------------------------------------
             FIND APPLICATION
          ------------------------------------------------- */

          const admission =
            await Admission.findById(
              id,
            ).session(
              mongoSession,
            );

          if (!admission) {
            throw {
              status: 404,
              message:
                "Application not found",
            };
          }

          /* -------------------------------------------------
             ALREADY APPROVED
          ------------------------------------------------- */

          if (
            admission.status ===
            "APPROVED"
          ) {
            return {
              admissionId:
                admission._id.toString(),

              applicationNumber:
                admission.applicationNumber,

              matricNumber:
                admission.matricNumber,

              studentId:
                admission.student,

              activationEmailData:
                null,

              approvedEmailData:
                null,
            };
          }

          /* -------------------------------------------------
             REJECTED
          ------------------------------------------------- */

          if (
            admission.status ===
            "REJECTED"
          ) {
            throw {
              status: 409,
              message:
                "This application has been rejected and cannot be approved.",
            };
          }

          /* -------------------------------------------------
             REQUIRED INFORMATION
          ------------------------------------------------- */

          if (
            !admission.email ||
            !admission.surname ||
            !admission.otherNames
          ) {
            throw {
              status: 422,
              message:
                "Application missing required applicant information.",
            };
          }

          /* -------------------------------------------------
             FIND EXISTING USER
          ------------------------------------------------- */

          let user =
            await User.findOne({
              email:
                admission.email.toLowerCase(),
            }).session(
              mongoSession,
            );

          /* -------------------------------------------------
             PREVENT STAFF ACCOUNT COLLISION
          ------------------------------------------------- */

          if (
            user &&
            user.role !== "student"
          ) {
            throw {
              status: 409,
              message:
                "A staff account already exists with this email address. Please use a different applicant email address.",
            };
          }

          /* -------------------------------------------------
             GENERATE MATRIC NUMBER
          ------------------------------------------------- */

          let matricNumber =
            user?.matricNumber;

          if (!matricNumber) {
            const generated =
              await generateMatricNumber(
                admission.academicSession?.toString(),
                mongoSession,
              );

            matricNumber =
              generated.matricNumber;
          }

          /* -------------------------------------------------
             CREATE STUDENT
          ------------------------------------------------- */

          if (!user) {
            user =
              new User({
                name:
                  `${admission.otherNames} ${admission.surname}`.trim(),

                email:
                  admission.email.toLowerCase(),

                role: "student",

                isActive: true,

                isEmailVerified: true,

                programme:
                  admission.programme,

                matricNumber,
              });

            await user.save({
              session:
                mongoSession,
            });
          } else {
            user.role =
              "student";

            user.programme =
              user.programme ||
              admission.programme;

            user.matricNumber =
              user.matricNumber ||
              matricNumber;

            user.isActive = true;

            user.isEmailVerified =
              true;

            await user.save({
              session:
                mongoSession,
            });
          }

          /* -------------------------------------------------
             ACTIVATION TOKEN
          ------------------------------------------------- */

          const {
            token: activationToken,
            hash: activationHash,
          } =
            generateVerificationToken();

          user.passwordResetTokenHash =
            activationHash;

          user.passwordResetExpires =
            new Date(
              Date.now() +
                24 *
                  60 *
                  60 *
                  1000,
            );

          await user.save({
            session:
              mongoSession,
          });

          /* -------------------------------------------------
             FRONTEND URL
          ------------------------------------------------- */

          const frontendUrl =
            process.env.FRONTEND_URL;

          if (!frontendUrl) {
            throw new Error(
              "FRONTEND_URL environment variable is not configured",
            );
          }

          const normalizedFrontendUrl =
            frontendUrl.replace(
              /\/+$/,
              "",
            );

          const activationLink =
            `${normalizedFrontendUrl}/auth/reset-password?token=${activationToken}&email=${encodeURIComponent(
              user.email,
            )}`;

          /* -------------------------------------------------
             UPDATE ADMISSION
          ------------------------------------------------- */

          admission.status =
            "APPROVED";

          admission.reviewedAt =
            new Date();

          admission.reviewedBy =
            req.user?.userId;

          admission.student =
            user._id;

          admission.matricNumber =
            user.matricNumber ||
            matricNumber;

          await admission.save({
            session:
              mongoSession,
          });

          /* -------------------------------------------------
             APPLICANT INFORMATION
          ------------------------------------------------- */

          const applicantName =
            `${admission.otherNames} ${admission.surname}`.trim();

          /* -------------------------------------------------
             RETURN TRANSACTION RESULT
          ------------------------------------------------- */

          return {
            admissionId:
              admission._id.toString(),

            applicationNumber:
              admission.applicationNumber,

            matricNumber:
              admission.matricNumber ||
              matricNumber,

            studentId:
              user._id,

            activationEmailData: {
              email:
                user.email,

              name:
                applicantName,

              activationLink,
            },

            approvedEmailData: {
              email:
                user.email,

              name:
                applicantName,

              applicationNumber:
                admission.applicationNumber,

              matricNumber:
                admission.matricNumber ||
                matricNumber,
            },
          };
        },
      );

    /* =====================================================
       GENERATE ADMISSION LETTER
    ===================================================== */

    let admissionLetterData:
      | {
          buffer: Buffer;
          url: string;
          publicId: string;
          reference: string;
          generatedAt: Date;
        }
      | null = null;

    /*
     * Only generate the letter for a newly approved
     * application.
     *
     * This keeps the approval operation idempotent and
     * prevents duplicate admission letters when the same
     * request is accidentally submitted twice.
     */

    if (
      transactionResult.approvedEmailData
    ) {
      try {
        const approvedAdmission =
          await Admission.findById(
            transactionResult.admissionId,
          )
            .populate("programme")
            .populate("department")
            .populate(
              "academicSession",
            );

        if (!approvedAdmission) {
          throw new Error(
            "Approved admission could not be retrieved for admission letter generation.",
          );
        }

        const programme =
          approvedAdmission.programme as
            | {
                name?: string;
              }
            | undefined;

        const department =
          approvedAdmission.department as
            | {
                name?: string;
              }
            | undefined;

        const academicSession =
          approvedAdmission.academicSession as
            | {
                name?: string;
              }
            | undefined;

        admissionLetterData =
          await generateAdmissionLetter({
            applicantName:
              `${approvedAdmission.otherNames} ${approvedAdmission.surname}`.trim(),

            applicationNumber:
              approvedAdmission.applicationNumber,

            matricNumber:
              transactionResult.matricNumber,

            programmeName:
              programme?.name,

            departmentName:
              department?.name,

            academicSessionName:
              academicSession?.name,

            admissionDate:
              approvedAdmission.reviewedAt ||
              new Date(),
          });

        /* -----------------------------------------------
           SAVE LETTER INFORMATION
        ----------------------------------------------- */

        approvedAdmission.admissionLetter = {
          url:
            admissionLetterData.url,

          publicId:
            admissionLetterData.publicId,

          reference:
            admissionLetterData.reference,

          generatedAt:
            admissionLetterData.generatedAt,
        };

        await approvedAdmission.save();

        console.log(
          "[ADMISSION LETTER] Generated successfully",
          {
            applicationNumber:
              approvedAdmission.applicationNumber,

            matricNumber:
              transactionResult.matricNumber,

            reference:
              admissionLetterData.reference,

            url:
              admissionLetterData.url,
          },
        );
      } catch (letterError) {
        /*
         * The admission itself has already been approved.
         * A PDF/Cloudinary failure must not undo the
         * student's admission.
         */

        console.error(
          "[ADMISSION LETTER] Failed to generate admission letter:",
          letterError,
        );
      }
    }

    /* =====================================================
       SEND ACCOUNT ACTIVATION EMAIL
    ===================================================== */

    if (
      transactionResult.activationEmailData
    ) {
      const {
        email,
        name,
        activationLink,
      } =
        transactionResult.activationEmailData;

      try {
        await sendPasswordResetEmail(
          email,
          name,
          activationLink,
        );
      } catch (emailError) {
        console.error(
          "[ADMISSION EMAIL] Failed to send account activation email:",
          emailError,
        );
      }
    }

    /* =====================================================
       SEND ADMISSION APPROVAL EMAIL
    ===================================================== */

    if (
      transactionResult.approvedEmailData
    ) {
      const {
        email,
        name,
        applicationNumber,
        matricNumber,
      } =
        transactionResult.approvedEmailData;

      try {
        await sendAdmissionApprovedEmail(
          email,
          name,
          applicationNumber,
          matricNumber,
          admissionLetterData?.buffer,
          admissionLetterData?.reference,
        );
      } catch (emailError) {
        console.error(
          "[ADMISSION EMAIL] Failed to send admission approval email:",
          emailError,
        );
      }
    }

    /* =====================================================
       RESPONSE
    ===================================================== */

    return res.status(200).json({
      success: true,

      message:
        "Admission application approved successfully.",

      data: {
        applicationNumber:
          transactionResult.applicationNumber,

        matricNumber:
          transactionResult.matricNumber,

        studentId:
          transactionResult.studentId,

        admissionLetter:
          admissionLetterData
            ? {
                url:
                  admissionLetterData.url,

                publicId:
                  admissionLetterData.publicId,

                reference:
                  admissionLetterData.reference,

                generatedAt:
                  admissionLetterData.generatedAt,
              }
            : null,
      },
    });
  } catch (error: any) {
    /* =====================================================
       EXPECTED APPLICATION ERRORS
    ===================================================== */

    if (
      error &&
      typeof error.status ===
        "number"
    ) {
      return res
        .status(error.status)
        .json({
          success: false,
          message:
            error.message,
        });
    }

    /* =====================================================
       GENERAL ERROR
    ===================================================== */

    console.error(
      "Approve admission error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to approve application",
    });
  } finally {
    await mongoSession.endSession();
  }
}

/* =========================================================
   REJECT ADMISSION
========================================================= */

export async function rejectAdmission(
  req: AuthRequest,
  res: Response,
) {
  try {
    const idParam =
      req.params.id;

    const id =
      Array.isArray(idParam)
        ? idParam[0]
        : idParam;

    if (
      !id ||
      !mongoose.Types.ObjectId.isValid(
        id,
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid id",
      });
    }

    /* -------------------------------------------------------
       VALIDATE REASON
    ------------------------------------------------------- */

    const data =
      rejectSchema.parse(
        req.body,
      );

    /* -------------------------------------------------------
       FIND APPLICATION
    ------------------------------------------------------- */

    const admission =
      await Admission.findById(id);

    if (!admission) {
      return res.status(404).json({
        success: false,
        message:
          "Application not found",
      });
    }

    /* -------------------------------------------------------
       APPROVED APPLICATION
    ------------------------------------------------------- */

    if (
      admission.status ===
      "APPROVED"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Cannot reject an already approved application",
      });
    }

    /* -------------------------------------------------------
       UPDATE
    ------------------------------------------------------- */

    admission.status =
      "REJECTED";

    admission.rejectionReason =
      data.reason;

    admission.reviewedAt =
      new Date();

    admission.reviewedBy =
      req.user?.userId;

    await admission.save();

    /* -------------------------------------------------------
       APPLICANT EMAIL — REJECTED
    ------------------------------------------------------- */

    const applicantName =
      `${admission.otherNames} ${admission.surname}`.trim();

    try {
      await sendAdmissionRejectedEmail(
        admission.email,
        applicantName,
        admission.applicationNumber,
        admission.rejectionReason ||
          data.reason,
      );
    } catch (emailError) {
      console.error(
        "[ADMISSION EMAIL] Failed to send rejection email:",
        emailError,
      );
    }

    /* -------------------------------------------------------
       RESPONSE
    ------------------------------------------------------- */

    return res.status(200).json({
      success: true,
      message:
        "Admission application rejected successfully.",
    });
  } catch (error) {
    /* -------------------------------------------------------
       ZOD ERROR
    ------------------------------------------------------- */

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message:
          "Validation failed",
        errors:
          error.flatten()
            .fieldErrors,
      });
    }

    /* -------------------------------------------------------
       GENERAL ERROR
    ------------------------------------------------------- */

    console.error(
      "Reject admission error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to reject application",
    });
  }
}

