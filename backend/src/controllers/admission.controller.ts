import type { Request, Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";

import Admission from "../models/Admission.js";
import Programme from "../models/Programme.js";
import Department from "../models/Department.js";
import AcademicSession from "../models/AcademicSession.js";
import User from "../models/User.js";
import Counter from "../models/Counter.js";
import { generateVerificationToken, hashToken } from "../utils/token.js";
import { sendPasswordResetEmail } from "../utils/email.js";
import { notifyAdmins } from "../services/notification.service.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { uploadBufferToCloudinary } from "../utils/uploadToCloudinary.js";

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
    .min(1, "At least one referee is required")
    .refine((refs) => refs.some((r) => /guardian|sponsor/i.test(r.relationship || "")), {
      message: "At least one referee must be listed as a guardian or sponsor",
    }),
  educationRecords: z.array(educationRecordSchema).optional().default([]),
  medicalCondition: z.string().optional(),
  referredBy: z.string().optional(),
  applicantSignature: z.string().trim().min(1, "Please type your full name as your signature"),
});

// Helper: generate sequential application number per year
async function generateApplicationNumber(session?: mongoose.ClientSession) {
  const year = new Date().getFullYear();
  const key = `APP_${year}`;

  const counter = await Counter.findOneAndUpdate(
    { key },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true, session },
  );

  const seq = counter.sequence.toString().padStart(6, "0");
  return `ITMT/APP/${year}/${seq}`;
}

// Helper: generate matric number per academic session year
async function generateMatricNumber(academicSessionId?: string, session?: mongoose.ClientSession) {
  let year = new Date().getFullYear();
  if (academicSessionId) {
    const acad = await AcademicSession.findById(academicSessionId).session(session || null);
    if (acad) {
      const m = /^(\d{4})/.exec(acad.name);
      if (m) year = parseInt(m[1], 10);
      else if (acad.startDate) year = acad.startDate.getFullYear();
    }
  }

  const key = `MATRIC_${year}`;

  const counter = await Counter.findOneAndUpdate(
    { key },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true, session },
  );

  const seq = counter.sequence.toString().padStart(6, "0");
  return { matricNumber: `ITMT/${year}/${seq}`, year, sequence: counter.sequence };
}

export async function applyForAdmission(req: Request, res: Response) {
  try {
    const rawBody = req.body as Record<string, string>;

    const parsedBody = {
      ...rawBody,
      referees: rawBody.referees ? JSON.parse(rawBody.referees) : [],
      educationRecords: rawBody.educationRecords ? JSON.parse(rawBody.educationRecords) : [],
    };

    const data = applySchema.parse(parsedBody);

    if (!req.file) {
      return res.status(400).json({ success: false, message: "A passport photograph is required" });
    }

    if (data.programmeId) {
      const prog = await Programme.findById(data.programmeId);
      if (!prog) return res.status(400).json({ success: false, message: "Invalid programme" });
    }

    if (data.departmentId) {
      const dept = await Department.findById(data.departmentId);
      if (!dept) return res.status(400).json({ success: false, message: "Invalid department" });
    }

    if (data.academicSessionId) {
      const sess = await AcademicSession.findById(data.academicSessionId);
      if (!sess) return res.status(400).json({ success: false, message: "Invalid academic session" });
      if (!sess.isActive) return res.status(400).json({ success: false, message: "Admissions are not open for the selected session" });
    }

    const existing = await Admission.findOne({
      email: data.email.toLowerCase(),
      academicSession: data.academicSessionId,
      status: { $in: ["PENDING", "UNDER_REVIEW"] },
    });

    if (existing) {
      return res.status(409).json({ success: false, message: "An application with this email for the selected session already exists." });
    }

      const uploadResult = await uploadBufferToCloudinary(req.file.buffer, "itmt/passports");

    const documents = [
      {
        filename: req.file.originalname,
        url: uploadResult.secure_url,
      },
    ];

    const mongoSession = await mongoose.startSession();
    let applicationNumber = "";

    try {
      await mongoSession.withTransaction(async () => {
        applicationNumber = await generateApplicationNumber(mongoSession);

        const admission = new Admission({
          applicationNumber,
          surname: data.surname,
          otherNames: data.otherNames,
          email: data.email.toLowerCase(),
          telephone: data.telephone,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
          nationality: data.nationality,
          postalAddress: data.postalAddress,
          residentialAddress: data.residentialAddress,
          programme: data.programmeId,
          department: data.departmentId,
          academicSession: data.academicSessionId,
          referees: data.referees,
          educationRecords: data.educationRecords,
          medicalCondition: data.medicalCondition,
          referredBy: data.referredBy,
          applicantSignature: data.applicantSignature,
          documents,
          status: "PENDING",
        });

        await admission.save({ session: mongoSession });
      });
    } finally {
      mongoSession.endSession();
    }

    await notifyAdmins({
      title: "New Admission Application",
      message: `${data.otherNames} ${data.surname} submitted an admission application (${applicationNumber}).`,
      type: "admission",
      link: "/dashboards/admin/admissions",
      metadata: { applicationNumber },
    });

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully.",
      data: { applicationNumber, status: "PENDING" },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: "Validation failed", errors: error.flatten().fieldErrors });
    }

    if (error instanceof SyntaxError) {
      return res.status(400).json({ success: false, message: "Invalid referee or education record data" });
    }

    console.error("Apply error:", error);
    return res.status(500).json({ success: false, message: "Unable to submit application" });
  }
}

export async function listAdmissions(req: AuthRequest, res: Response) {
  try {
    const { page = 1, limit = 20, status, search } = req.query as any;

    const query: any = {};
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { applicationNumber: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { surname: { $regex: search, $options: "i" } },
        { otherNames: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Admission.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("programme department academicSession reviewedBy student"),
      Admission.countDocuments(query),
    ]);

    return res.status(200).json({ success: true, data: { items, total } });
  } catch (error) {
    console.error("List admissions error:", error);
    return res.status(500).json({ success: false, message: "Unable to list admissions" });
  }
}

export async function getAdmission(req: AuthRequest, res: Response) {
  try {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid id" });

    const admission = await Admission.findById(id).populate("programme department academicSession reviewedBy student");

    if (!admission) return res.status(404).json({ success: false, message: "Application not found" });

    return res.status(200).json({ success: true, data: admission });
  } catch (error) {
    console.error("Get admission error:", error);
    return res.status(500).json({ success: false, message: "Unable to retrieve application" });
  }
}

export async function reviewAdmission(req: AuthRequest, res: Response) {
  try {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid id" });

    const admission = await Admission.findById(id);
    if (!admission) return res.status(404).json({ success: false, message: "Application not found" });

    if (admission.status !== "PENDING") {
      return res.status(409).json({ success: false, message: "Only pending applications can be moved to review." });
    }

    admission.status = "UNDER_REVIEW";
    admission.reviewedAt = new Date();
    admission.reviewedBy = req.user?.userId;
    await admission.save();

    return res.status(200).json({ success: true, message: "Application marked under review" });
  } catch (error) {
    console.error("Review admission error:", error);
    return res.status(500).json({ success: false, message: "Unable to review application" });
  }
}

export async function approveAdmission(req: AuthRequest, res: Response) {
  const idParam = req.params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid id" });

  const mongoSession = await mongoose.startSession();

  try {
    let resultData: any = {};

    await mongoSession.withTransaction(async () => {
      const admission = await Admission.findById(id).session(mongoSession);
      if (!admission) throw { status: 404, message: "Application not found" };

      if (admission.status === "APPROVED") {
        resultData = {
          applicationNumber: admission.applicationNumber,
          matricNumber: admission.matricNumber,
          studentId: admission.student,
        };
        return;
      }

      if (admission.status === "REJECTED") {
        throw { status: 409, message: "This application has been rejected and cannot be approved." };
      }

      if (!admission.email || !admission.surname || !admission.otherNames) {
        throw { status: 422, message: "Application missing required applicant information." };
      }

      const { matricNumber } = await generateMatricNumber(admission.academicSession?.toString(), mongoSession);

      let user = await User.findOne({ email: admission.email.toLowerCase() }).session(mongoSession);

      if (!user) {
        user = new User({
          name: `${admission.otherNames} ${admission.surname}`,
          email: admission.email.toLowerCase(),
          role: "student",
          isActive: true,
          isEmailVerified: true,
          programme: admission.programme,
          matricNumber,
        });

        await user.save({ session: mongoSession });
      } else {
        user.role = "student";
        user.programme = user.programme || admission.programme;
        user.matricNumber = user.matricNumber || matricNumber;
        await user.save({ session: mongoSession });
      }

      const { token: activationToken, hash: activationHash } = generateVerificationToken();
      user.passwordResetTokenHash = activationHash;
      user.passwordResetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save({ session: mongoSession });

      const activationLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${activationToken}&email=${encodeURIComponent(user.email)}`;

      admission.status = "APPROVED";
      admission.reviewedAt = new Date();
      admission.reviewedBy = req.user?.userId;
      admission.student = user._id;
      admission.matricNumber = matricNumber;

      await admission.save({ session: mongoSession });

      resultData = { applicationNumber: admission.applicationNumber, matricNumber, studentId: user._id };

      (async () => {
        try {
          await sendPasswordResetEmail(user.email, user.name, activationLink);
        } catch (err) {
          console.error("Failed to send activation email:", err);
        }
      })();
    });

    return res.status(200).json({ success: true, message: "Admission application approved successfully.", data: resultData });
  } catch (error: any) {
    if (error && error.status) return res.status(error.status).json({ success: false, message: error.message });
    console.error("Approve admission error:", error);
    return res.status(500).json({ success: false, message: "Unable to approve application" });
  } finally {
    mongoSession.endSession();
  }
}

const rejectSchema = z.object({ reason: z.string().trim().min(5) });

export async function rejectAdmission(req: AuthRequest, res: Response) {
  try {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid id" });

    const data = rejectSchema.parse(req.body);

    const admission = await Admission.findById(id);
    if (!admission) return res.status(404).json({ success: false, message: "Application not found" });

    if (admission.status === "APPROVED") return res.status(409).json({ success: false, message: "Cannot reject an already approved application" });

    admission.status = "REJECTED";
    admission.rejectionReason = data.reason;
    admission.reviewedAt = new Date();
    admission.reviewedBy = req.user?.userId;

    await admission.save();

    return res.status(200).json({ success: true, message: "Admission application rejected successfully." });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: "Validation failed", errors: error.flatten().fieldErrors });
    console.error("Reject admission error:", error);
    return res.status(500).json({ success: false, message: "Unable to reject application" });
  }
}