import type { Request, Response } from "express";

import crypto from "node:crypto";

import { Types } from "mongoose";

import { z } from "zod";

import type { AuthRequest } from "../middleware/auth.middleware.js";

import Payment from "../models/Payment.js";
import FeeStructure from "../models/FeeStructure.js";
import User from "../models/User.js";
import Semester from "../models/Semester.js";

/* =========================================================
   TYPES
========================================================= */

interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyData {
  id: number;
  status: string;
  reference: string;
  amount: number;
  currency: string;
  paid_at?: string;
  transaction_date?: string;
  channel?: string;
  fees?: number;
  gateway_response?: string;
  metadata?: unknown;
  customer?: {
    email?: string;
    first_name?: string;
    last_name?: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data?: PaystackVerifyData;
}

interface PaystackWebhookBody {
  event?: string;
  data?: PaystackVerifyData;
}

interface FeeCategoryInfo {
  _id?: unknown;
  name?: string;
  code?: string;
  description?: string;
}

interface FeeStructureInfo {
  _id: unknown;
  programme: unknown;
  level: string;
  semester: unknown;
  amount: number;
  description?: string;
  feeCategory?: FeeCategoryInfo | unknown;
}

interface StudentInfo {
  _id: Types.ObjectId;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  matricNumber?: string;
  programme?: Types.ObjectId;
  department?: Types.ObjectId;
  level?: string;
  academicSession?: Types.ObjectId;
}

interface StudentStatusInfo {
  isActive?: boolean;
  isSuspended?: boolean;
}

interface FeeGroup {
  programme: string;
  level: string;
  semester: string;
  amount: number;
}

/* =========================================================
   VALIDATION
========================================================= */

const objectId = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid ID");

const paymentSchema = z.object({
  student: objectId,

  semester: objectId,

  academicSession: objectId.optional(),

  programme: objectId.optional(),

  department: objectId.optional(),

  amount: z.number().finite().positive(),

  currency: z
    .string()
    .trim()
    .min(1)
    .max(10)
    .default("NGN"),

  method: z.enum([
    "cash",
    "bank_transfer",
    "card",
    "other",
  ]),

  purpose: z.enum([
    "tuition",
    "registration",
    "examination",
    "acceptance",
    "transcript",
    "certificate",
    "hostel",
    "other",
  ]),

  paymentReference: z
    .string()
    .trim()
    .min(2)
    .max(100),

  invoiceNumber: z
    .string()
    .trim()
    .max(100)
    .optional(),

  paymentProvider: z
    .string()
    .trim()
    .max(100)
    .optional(),

  providerTransactionRef: z
    .string()
    .trim()
    .max(150)
    .optional(),

  status: z
    .enum([
      "pending",
      "successful",
      "failed",
      "refunded",
      "cancelled",
    ])
    .optional(),

  notes: z
    .string()
    .trim()
    .max(1000)
    .optional(),

  paidAt: z
    .string()
    .datetime()
    .optional(),

  receiptUrl: z
    .string()
    .trim()
    .url()
    .optional(),

  metadata: z
    .record(z.string(), z.unknown())
    .optional(),
});

const paystackInitializeSchema = z.object({
  semester: objectId,

  amount: z
    .number()
    .finite()
    .positive()
    .refine(
      (value) =>
        Number.isFinite(value) &&
        Math.abs(
          value * 100 - Math.round(value * 100),
        ) < 1e-8,
      "Amount must have at most two decimal places",
    ),

  purpose: z
    .enum([
      "tuition",
      "registration",
      "examination",
      "acceptance",
      "transcript",
      "certificate",
      "hostel",
      "other",
    ])
    .default("tuition"),
});

/* =========================================================
   HELPERS
========================================================= */

function getPaystackSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;

  if (!key) {
    throw new Error(
      "PAYSTACK_SECRET_KEY is not configured",
    );
  }

  return key;
}

function getFrontendUrl(): string {
  const url =
    process.env.FRONTEND_URL ||
    "http://localhost:3000";

  return url.replace(/\/+$/, "");
}

/**
 * Normalizes level values so:
 *
 * ND1
 * ND 1
 * ND-1
 * ND_1
 * nd 1
 *
 * are treated as the same academic level.
 *
 * This does NOT convert unrelated values such as:
 * 100 -> ND1
 */
function normalizeLevel(
  level?: string | null,
): string {
  return String(level ?? "")
    .trim()
    .toUpperCase()
    .replace(/[\s_-]+/g, "");
}

function generatePaymentReference(): string {
  const timestamp = Date.now()
    .toString(36)
    .toUpperCase();

  const random = crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase();

  return `ITMT-PAY-${timestamp}-${random}`;
}

function amountToKobo(
  amount: number,
): number {
  return Math.round(amount * 100);
}

function mapPaystackChannelToMethod(
  channel?: string,
):
  | "cash"
  | "bank_transfer"
  | "card"
  | "other" {
  if (!channel) {
    return "card";
  }

  const normalized =
    channel.toLowerCase();

  if (normalized === "card") {
    return "card";
  }

  if (
    normalized === "bank" ||
    normalized === "bank_transfer" ||
    normalized === "mobile_money" ||
    normalized === "ussd"
  ) {
    return "bank_transfer";
  }

  return "other";
}

function getStudentDisplayName(
  student: StudentInfo,
): string {
  if (student.name?.trim()) {
    return student.name.trim();
  }

  const fallback =
    `${student.firstName ?? ""} ${
      student.lastName ?? ""
    }`.trim();

  return fallback || "Student";
}

function escapeRegex(
  value: string,
): string {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );
}

/* =========================================================
   GET STUDENT
========================================================= */

async function getStudentForBalance(
  studentId: string,
) {
  if (
    !Types.ObjectId.isValid(studentId)
  ) {
    return null;
  }

  return User.findById(studentId)
    .select(
      "name email matricNumber programme level academicSession",
    )
    .lean<StudentInfo>();
}

/* =========================================================
   COMPUTE STUDENT BALANCE
========================================================= */

async function computeBalance(
  studentId: string,
  semesterId: string,
) {
  const emptyBalance = {
    feeAmount: 0,
    totalPaid: 0,
    balance: 0,
    outstanding: 0,
    overpayment: 0,
    hasFeeStructure: false,
    feeBreakdown: [],
  };

  if (
    !Types.ObjectId.isValid(studentId) ||
    !Types.ObjectId.isValid(semesterId)
  ) {
    return emptyBalance;
  }

  const student =
    await User.findById(studentId)
      .select("programme level")
      .lean();

  if (
    !student ||
    !student.programme ||
    !student.level
  ) {
    return emptyBalance;
  }

  const semesterObjectId =
    new Types.ObjectId(semesterId);

  /*
   * Query by programme + semester first.
   * Level is normalized in JavaScript so:
   *
   * ND1
   * ND 1
   * ND-1
   *
   * all match.
   */
  const allFeeStructures =
    await FeeStructure.find({
      programme: student.programme,
      semester: semesterObjectId,
      isActive: true,
    })
      .select(
        "programme level semester feeCategory amount description",
      )
      .populate(
        "feeCategory",
        "name code description",
      )
      .lean<FeeStructureInfo[]>();

  const normalizedStudentLevel =
    normalizeLevel(student.level);

  const feeStructures =
    allFeeStructures.filter(
      (fee) =>
        normalizeLevel(fee.level) ===
        normalizedStudentLevel,
    );

  /*
   * Sum ALL active fee structures.
   *
   * This allows:
   * Tuition
   * Acceptance
   * Examination
   * Library
   * Registration
   * etc.
   */
  const feeAmount =
    feeStructures.reduce(
      (total, fee) =>
        total +
        (Number(fee.amount) || 0),
      0,
    );

  const feeBreakdown =
    feeStructures.map((fee) => {
      const category =
        fee.feeCategory &&
        typeof fee.feeCategory ===
          "object"
          ? (fee.feeCategory as FeeCategoryInfo)
          : undefined;

      return {
        _id: String(fee._id),

        category:
          category?.name ??
          "Other Fees",

        code:
          category?.code ??
          "OTHER",

        amount:
          Number(fee.amount) || 0,

        description:
          fee.description ??
          category?.description ??
          "",
      };
    });

  const paymentResult =
    await Payment.aggregate([
      {
        $match: {
          student:
            new Types.ObjectId(studentId),

          semester:
            semesterObjectId,

          status: "successful",
        },
      },

      {
        $group: {
          _id: null,

          totalPaid: {
            $sum: "$amount",
          },
        },
      },
    ]);

  const totalPaid =
    Number(
      paymentResult[0]?.totalPaid,
    ) || 0;

  const balance =
    feeAmount - totalPaid;

  return {
    feeAmount,

    totalPaid,

    balance,

    outstanding:
      Math.max(balance, 0),

    overpayment:
      Math.max(-balance, 0),

    hasFeeStructure:
      feeStructures.length > 0,

    feeBreakdown,
  };
}

/* =========================================================
   RECORD PAYMENT
   FINANCE / ADMIN MANUAL PAYMENT
========================================================= */

export async function recordPayment(
  req: AuthRequest,
  res: Response,
) {
  try {
    const data =
      paymentSchema.parse(req.body);

    const student =
      await User.findById(data.student)
        .select(
          "name email matricNumber programme level academicSession",
        )
        .lean<StudentInfo>();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const semester =
      await Semester.findById(
        data.semester,
      ).lean();

    if (!semester) {
      return res.status(404).json({
        success: false,
        message: "Semester not found",
      });
    }

    const paymentReference =
      data.paymentReference
        .trim()
        .toUpperCase();

    const existingPayment =
      await Payment.findOne({
        paymentReference,
      });

    if (existingPayment) {
      return res.status(409).json({
        success: false,
        message:
          "Payment reference already exists",
      });
    }

    const status =
      data.status ?? "successful";

    const payment =
      await Payment.create({
        ...data,

        paymentReference,

        currency:
          data.currency
            .trim()
            .toUpperCase(),

        studentName:
          getStudentDisplayName(student),

        matricNumber:
          student.matricNumber,

        programme:
          data.programme ??
          student.programme,

        academicSession:
          data.academicSession ??
          student.academicSession,

        status,

        recordedBy:
          req.user?.userId,

        paidAt:
          status === "successful"
            ? data.paidAt
              ? new Date(data.paidAt)
              : new Date()
            : undefined,
      });

    const populatedPayment =
      await Payment.findById(
        payment._id,
      )
        .populate(
          "student",
          "name email matricNumber",
        )
        .populate(
          "semester",
          "name order",
        )
        .populate(
          "academicSession",
          "name",
        )
        .populate(
          "programme",
          "name code",
        )
        .populate(
          "department",
          "name code",
        )
        .lean();

    return res.status(201).json({
      success: true,

      message:
        "Payment recorded successfully",

      payment:
        populatedPayment,
    });
  } catch (error) {
    if (
      error instanceof z.ZodError
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Validation failed",

        errors:
          error.flatten()
            .fieldErrors,
      });
    }

    if (
      (
        error as {
          code?: number;
        }
      ).code === 11000
    ) {
      return res.status(409).json({
        success: false,

        message:
          "Payment reference already exists",
      });
    }

    console.error(
      "Record payment error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to record payment",
    });
  }
}

/* =========================================================
   GET PAYMENTS
========================================================= */

export async function getPayments(
  req: Request,
  res: Response,
) {
  try {
    const {
      student,
      semester,
      status,
      method,
      purpose,
      search,
    } = req.query;

    const query: Record<
      string,
      unknown
    > = {};

    if (
      typeof student === "string"
    ) {
      if (
        !Types.ObjectId.isValid(student)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid student ID",
        });
      }

      query.student =
        new Types.ObjectId(student);
    }

    if (
      typeof semester === "string"
    ) {
      if (
        !Types.ObjectId.isValid(
          semester,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid semester ID",
        });
      }

      query.semester =
        new Types.ObjectId(semester);
    }

    if (
      typeof status === "string"
    ) {
      query.status = status;
    }

    if (
      typeof method === "string"
    ) {
      query.method = method;
    }

    if (
      typeof purpose === "string"
    ) {
      query.purpose = purpose;
    }

    if (
      typeof search === "string" &&
      search.trim()
    ) {
      const searchRegex =
        new RegExp(
          escapeRegex(search.trim()),
          "i",
        );

      query.$or = [
        {
          paymentReference:
            searchRegex,
        },

        {
          invoiceNumber:
            searchRegex,
        },

        {
          providerTransactionRef:
            searchRegex,
        },

        {
          studentName:
            searchRegex,
        },

        {
          matricNumber:
            searchRegex,
        },
      ];
    }

    const payments =
      await Payment.find(query)
        .populate(
          "student",
          "name email matricNumber",
        )
        .populate(
          "semester",
          "name order",
        )
        .populate(
          "academicSession",
          "name",
        )
        .populate(
          "programme",
          "name code",
        )
        .populate(
          "department",
          "name code",
        )
        .sort({
          createdAt: -1,
        })
        .lean();

    return res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error(
      "Get payments error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to retrieve payments",
    });
  }
}

/* =========================================================
   GET STUDENTS FEES
========================================================= */

export async function getStudentsFees(
  req: Request,
  res: Response,
) {
  try {
    const semesterId =
      typeof req.query.semester ===
      "string"
        ? req.query.semester.trim()
        : undefined;

    if (!semesterId) {
      return res.status(400).json({
        success: false,

        message:
          "semester query parameter is required",
      });
    }

    if (
      !Types.ObjectId.isValid(
        semesterId,
      )
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid semester ID",
      });
    }

    const semesterObjectId =
      new Types.ObjectId(semesterId);

    const semester =
      await Semester.findById(
        semesterObjectId,
      ).lean();

    if (!semester) {
      return res.status(404).json({
        success: false,

        message:
          "Semester not found",
      });
    }

    const students =
      await User.find({
        role: "student",
      })
        .select(
          "name email matricNumber programme level",
        )
        .populate(
          "programme",
          "name code",
        )
        .lean();

    const feeStructures =
      await FeeStructure.find({
        semester:
          semesterObjectId,

        isActive: true,
      })
        .select(
          "programme level amount feeCategory",
        )
        .populate(
          "feeCategory",
          "name code",
        )
        .lean();

    /*
     * Key:
     *
     * programme + normalized level
     */
    const feeMap =
      new Map<string, number>();

    for (
      const fee of feeStructures
    ) {
      const key =
        `${String(
          fee.programme,
        )}_${normalizeLevel(
          fee.level,
        )}`;

      feeMap.set(
        key,
        (feeMap.get(key) ?? 0) +
          (Number(fee.amount) || 0),
      );
    }

    const payments =
      await Payment.aggregate([
        {
          $match: {
            semester:
              semesterObjectId,

            status: "successful",
          },
        },

        {
          $group: {
            _id: "$student",

            totalPaid: {
              $sum: "$amount",
            },
          },
        },
      ]);

    const paymentMap =
      new Map<string, number>();

    for (
      const payment of payments
    ) {
      paymentMap.set(
        String(payment._id),
        Number(payment.totalPaid) || 0,
      );
    }

    const records =
      students.map((student) => {
        const programmeId =
          student.programme &&
          typeof student.programme ===
            "object" &&
          "_id" in student.programme
            ? student.programme._id
            : student.programme;

        const key =
          `${String(
            programmeId,
          )}_${normalizeLevel(
            student.level,
          )}`;

        const feeAmount =
          feeMap.get(key) ?? 0;

        const totalPaid =
          paymentMap.get(
            String(student._id),
          ) ?? 0;

        const balance =
          feeAmount - totalPaid;

        let status:
          | "no_fee_structure"
          | "unpaid"
          | "partial"
          | "paid"
          | "overpaid";

        if (feeAmount === 0) {
          status =
            "no_fee_structure";
        } else if (totalPaid <= 0) {
          status = "unpaid";
        } else if (
          totalPaid < feeAmount
        ) {
          status = "partial";
        } else if (
          totalPaid === feeAmount
        ) {
          status = "paid";
        } else {
          status = "overpaid";
        }

        return {
          student,

          semester: {
            _id: semester._id,

            name: semester.name,

            order: semester.order,
          },

          feeAmount,

          totalPaid,

          balance,

          outstanding:
            Math.max(balance, 0),

          overpayment:
            Math.max(-balance, 0),

          status,
        };
      });

    return res.status(200).json({
      success: true,

      semester,

      students: records,
    });
  } catch (error) {
    console.error(
      "Get students fees error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to retrieve student fees",
    });
  }
}

/* =========================================================
   GET STUDENT BALANCE
========================================================= */

export async function getStudentBalance(
  req: Request,
  res: Response,
) {
  try {
    const studentId =
      typeof req.query.student ===
      "string"
        ? req.query.student.trim()
        : undefined;

    const semesterId =
      typeof req.query.semester ===
      "string"
        ? req.query.semester.trim()
        : undefined;

    if (!studentId) {
      return res.status(400).json({
        success: false,

        message:
          "student query parameter is required",
      });
    }

    if (!semesterId) {
      return res.status(400).json({
        success: false,

        message:
          "semester query parameter is required",
      });
    }

    if (
      !Types.ObjectId.isValid(studentId)
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid student ID",
      });
    }

    if (
      !Types.ObjectId.isValid(
        semesterId,
      )
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid semester ID",
      });
    }

    const student =
      await getStudentForBalance(
        studentId,
      );

    if (!student) {
      return res.status(404).json({
        success: false,

        message:
          "Student not found",
      });
    }

    const semester =
      await Semester.findById(
        semesterId,
      ).lean();

    if (!semester) {
      return res.status(404).json({
        success: false,

        message:
          "Semester not found",
      });
    }

    const balance =
      await computeBalance(
        studentId,
        semesterId,
      );

    return res.status(200).json({
      success: true,

      student,

      semester,

      balance,
    });
  } catch (error) {
    console.error(
      "Get student balance error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to retrieve student balance",
    });
  }
}

/* =========================================================
   GET MY PAYMENTS
========================================================= */

export async function getMyPayments(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,

        message:
          "Authenticated user not found",
      });
    }

    const semester =
      typeof req.query.semester ===
      "string"
        ? req.query.semester.trim()
        : undefined;

    if (
      semester &&
      !Types.ObjectId.isValid(semester)
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid semester ID",
      });
    }

    const query: Record<
      string,
      unknown
    > = {
      student:
        new Types.ObjectId(
          req.user.userId,
        ),
    };

    if (semester) {
      query.semester =
        new Types.ObjectId(semester);
    }

    const payments =
      await Payment.find(query)
        .populate(
          "semester",
          "name order",
        )
        .populate(
          "academicSession",
          "name",
        )
        .populate(
          "programme",
          "name code",
        )
        .populate(
          "department",
          "name code",
        )
        .sort({
          createdAt: -1,
        })
        .lean();

    return res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error(
      "Get my payments error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to retrieve payments",
    });
  }
}

/* =========================================================
   GET MY BALANCE
========================================================= */

export async function getMyBalance(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,

        message:
          "Authenticated user not found",
      });
    }

    const semesterId =
      typeof req.query.semester ===
      "string"
        ? req.query.semester.trim()
        : undefined;

    if (!semesterId) {
      return res.status(400).json({
        success: false,

        message:
          "semester query parameter is required",
      });
    }

    if (
      !Types.ObjectId.isValid(
        semesterId,
      )
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid semester ID",
      });
    }

    const student =
      await getStudentForBalance(
        req.user.userId,
      );

    if (!student) {
      return res.status(404).json({
        success: false,

        message:
          "Student profile not found",
      });
    }

    const semester =
      await Semester.findById(
        semesterId,
      ).lean();

    if (!semester) {
      return res.status(404).json({
        success: false,

        message:
          "Semester not found",
      });
    }

    const balance =
      await computeBalance(
        req.user.userId,
        semesterId,
      );

    return res.status(200).json({
      success: true,

      student,

      semester,

      balance,
    });
  } catch (error) {
    console.error(
      "Get my balance error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to retrieve student balance",
    });
  }
}

/* =========================================================
   PAYSTACK: INITIALIZE STUDENT PAYMENT
========================================================= */

export async function initializePaystackPayment(
  req: AuthRequest,
  res: Response,
) {
  /*
   * IMPORTANT:
   *
   * Do NOT use:
   *
   * ReturnType<typeof Payment.create>
   *
   * Mongoose has multiple create() overloads and
   * TypeScript can resolve the wrong overload.
   *
   * InstanceType<typeof Payment> represents the
   * actual Payment document and gives us:
   *
   * payment._id
   * payment.status
   * payment.notes
   * payment.metadata
   * payment.save()
   */
  let payment:
    | InstanceType<typeof Payment>
    | null = null;

  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,

        message:
          "Authenticated user not found",
      });
    }

    const data =
      paystackInitializeSchema.parse(
        req.body,
      );

    const student =
      await User.findById(
        req.user.userId,
      )
        .select(
          "name email matricNumber programme level academicSession isActive isSuspended",
        )
        .lean<
          StudentInfo &
            StudentStatusInfo
        >();

    if (!student) {
      return res.status(404).json({
        success: false,

        message:
          "Student profile not found",
      });
    }

    if (
      student.isActive === false ||
      student.isSuspended === true
    ) {
      return res.status(403).json({
        success: false,

        message:
          "Your student account cannot make payments at this time",
      });
    }

    if (!student.email?.trim()) {
      return res.status(400).json({
        success: false,

        message:
          "A valid student email is required before payment",
      });
    }

    const semester =
      await Semester.findById(
        data.semester,
      ).lean();

    if (!semester) {
      return res.status(404).json({
        success: false,

        message:
          "Semester not found",
      });
    }

    /*
     * Calculate current balance.
     */
    const balance =
      await computeBalance(
        req.user.userId,
        data.semester,
      );

    if (!balance.hasFeeStructure) {
      return res.status(400).json({
        success: false,

        message:
          "No fee structure has been configured for your programme and level for this semester",
      });
    }

    if (balance.outstanding <= 0) {
      return res.status(400).json({
        success: false,

        message:
          "You do not have any outstanding balance for this semester",
      });
    }

    if (
      data.amount >
      balance.outstanding
    ) {
      return res.status(400).json({
        success: false,

        message:
          `Maximum payment allowed is ₦${balance.outstanding.toLocaleString(
            "en-NG",
            {
              minimumFractionDigits: 2,

              maximumFractionDigits: 2,
            },
          )}`,

        outstanding:
          balance.outstanding,
      });
    }

    const amountInKobo =
      amountToKobo(data.amount);

    if (amountInKobo <= 0) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid payment amount",
      });
    }

    /*
     * Generate unique local reference.
     */
    const reference =
      generatePaymentReference();

    /*
     * Create PENDING local payment first.
     *
     * This is intentionally:
     *
     * pending
     *
     * and NOT successful.
     */
    payment =
      new Payment({
        student:
          new Types.ObjectId(
            req.user.userId,
          ),

        studentName:
          getStudentDisplayName(student),

        matricNumber:
          student.matricNumber,

        semester:
          new Types.ObjectId(
            data.semester,
          ),

        academicSession:
          student.academicSession,

        programme:
          student.programme,

        amount:
          data.amount,

        currency:
          "NGN",

        method:
          "card",

        purpose:
          data.purpose,

        paymentReference:
          reference,

        paymentProvider:
          "paystack",

        status:
          "pending",

        recordedBy:
          new Types.ObjectId(
            req.user.userId,
          ),

        metadata: {
          source:
            "student_portal",

          paymentType:
            "installment",

          outstandingBeforePayment:
            balance.outstanding,
        },
      });

    await payment.save();

    try {
      const callbackUrl =
        `${getFrontendUrl()}/dashboards/student/payments/callback?reference=${encodeURIComponent(
          reference,
        )}`;

      /*
       * Initialize Paystack.
       */
      const response =
        await fetch(
          "https://api.paystack.co/transaction/initialize",
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${getPaystackSecretKey()}`,

              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              email:
                student.email.trim(),

              amount:
                amountInKobo,

              currency:
                "NGN",

              reference,

              callback_url:
                callbackUrl,

              metadata: {
                paymentId:
                  String(
                    payment._id,
                  ),

                studentId:
                  String(
                    req.user.userId,
                  ),

                semesterId:
                  data.semester,

                purpose:
                  data.purpose,

                amount:
                  data.amount,

                installment:
                  true,
              },
            }),
          },
        );

      const result =
        (await response.json()) as PaystackInitializeResponse;

      if (
        !response.ok ||
        !result.status ||
        !result.data
      ) {
        payment.status =
          "failed";

        payment.notes =
          result.message ||
          "Paystack initialization failed";

        await payment.save();

        return res.status(502).json({
          success: false,

          message:
            result.message ||
            "Unable to initialize Paystack payment",
        });
      }

      /*
       * Store Paystack information.
       *
       * providerTransactionRef is NOT set here.
       *
       * The Paystack transaction ID is stored after
       * successful verification/webhook.
       */
      payment.metadata = {
        ...(payment.metadata ?? {}),

        paystackAccessCode:
          result.data.access_code,

        paystackAuthorizationUrl:
          result.data.authorization_url,

        paystackReference:
          result.data.reference,
      };

      await payment.save();

      return res.status(201).json({
        success: true,

        message:
          "Payment initialized successfully",

        paymentId:
          String(payment._id),

        reference,

        authorizationUrl:
          result.data
            .authorization_url,

        accessCode:
          result.data.access_code,

        amount:
          data.amount,

        currency:
          "NGN",

        purpose:
          data.purpose,

        outstanding:
          balance.outstanding,

        balance,
      });
    } catch (paystackError) {
      if (payment) {
        payment.status =
          "failed";

        payment.notes =
          paystackError instanceof
          Error
            ? paystackError.message
            : "Unable to connect to Paystack";

        await payment.save();
      }

      throw paystackError;
    }
  } catch (error) {
    if (
      error instanceof z.ZodError
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid payment details",

        errors:
          error.flatten()
            .fieldErrors,
      });
    }

    console.error(
      "Initialize Paystack payment error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to initialize payment",
    });
  }
}

/* =========================================================
   COMPLETE PAYSTACK PAYMENT

   Used by:
   - callback verification
   - Paystack webhook

   This function is intentionally idempotent.
========================================================= */

async function completePaystackPayment(
  paystackData: PaystackVerifyData,
) {
  const reference =
    paystackData.reference?.trim();

  if (!reference) {
    throw new Error(
      "Paystack transaction reference is missing",
    );
  }

  const payment =
    await Payment.findOne({
      paymentReference:
        reference,
    });

  if (!payment) {
    return {
      found: false,

      payment: null,

      alreadySuccessful: false,
    };
  }

  /*
   * Validate reference before accepting
   * the transaction.
   */
  if (
    paystackData.reference !==
    payment.paymentReference
  ) {
    throw new Error(
      "Paystack reference does not match local payment",
    );
  }

  /*
   * Validate amount.
   */
  const expectedKobo =
    amountToKobo(
      Number(payment.amount),
    );

  if (
    Number(paystackData.amount) !==
    expectedKobo
  ) {
    payment.status =
      "failed";

    payment.notes =
      "Paystack amount mismatch";

    await payment.save();

    throw new Error(
      "Paystack payment amount does not match the local payment amount",
    );
  }

  /*
   * Validate currency.
   */
  if (
    String(
      paystackData.currency,
    ).toUpperCase() !==
    String(
      payment.currency,
    ).toUpperCase()
  ) {
    payment.status =
      "failed";

    payment.notes =
      "Paystack currency mismatch";

    await payment.save();

    throw new Error(
      "Paystack currency does not match the local payment currency",
    );
  }

  /*
   * Only successful Paystack transactions
   * can become successful locally.
   */
  if (
    paystackData.status !==
    "success"
  ) {
    return {
      found: true,

      payment,

      alreadySuccessful: false,

      notSuccessful: true,
    };
  }

  /*
   * Idempotency.
   *
   * This is checked after validating:
   * reference
   * amount
   * currency
   * Paystack success status
   */
  if (
    payment.status ===
    "successful"
  ) {
    return {
      found: true,

      payment,

      alreadySuccessful: true,

      notSuccessful: false,
    };
  }

  /*
   * Mark successful.
   */
  payment.status =
    "successful";

  payment.method =
    mapPaystackChannelToMethod(
      paystackData.channel,
    );

  payment.paymentProvider =
    "paystack";

  payment.providerTransactionRef =
    paystackData.id
      ? String(paystackData.id)
      : reference;

  payment.paidAt =
    paystackData.paid_at
      ? new Date(
          paystackData.paid_at,
        )
      : paystackData.transaction_date
        ? new Date(
            paystackData.transaction_date,
          )
        : new Date();

  payment.verifiedAt =
    new Date();

  payment.notes =
    undefined;

  payment.metadata = {
    ...(payment.metadata ?? {}),

    paystackTransactionId:
      paystackData.id,

    paystackReference:
      paystackData.reference,

    paystackChannel:
      paystackData.channel,

    paystackFees:
      paystackData.fees,

    paystackStatus:
      paystackData.status,

    gatewayResponse:
      paystackData.gateway_response,

    verifiedAutomatically:
      true,
  };

  await payment.save();

  return {
    found: true,

    payment,

    alreadySuccessful: false,

    notSuccessful: false,
  };
}

/* =========================================================
   VERIFY PAYSTACK PAYMENT
   STUDENT CALLBACK
========================================================= */

export async function verifyPaystackPayment(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,

        message:
          "Authenticated user not found",
      });
    }

    const reference =
      typeof req.body?.reference ===
      "string"
        ? req.body.reference.trim()
        : "";

    if (!reference) {
      return res.status(400).json({
        success: false,

        message:
          "Paystack reference is required",
      });
    }

    const localPayment =
      await Payment.findOne({
        paymentReference:
          reference,

        student:
          new Types.ObjectId(
            req.user.userId,
          ),
      });

    if (!localPayment) {
      return res.status(404).json({
        success: false,

        message:
          "Payment record not found",
      });
    }

    if (
      localPayment.status ===
      "successful"
    ) {
      const balance =
        await computeBalance(
          req.user.userId,

          String(
            localPayment.semester,
          ),
        );

      return res.status(200).json({
        success: true,

        message:
          "Payment has already been verified",

        payment:
          localPayment,

        balance,
      });
    }

    /*
     * Verify directly with Paystack.
     */
    const response =
      await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(
          reference,
        )}`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${getPaystackSecretKey()}`,
          },
        },
      );

    const result =
      (await response.json()) as PaystackVerifyResponse;

    if (
      !response.ok ||
      !result.status ||
      !result.data
    ) {
      return res.status(502).json({
        success: false,

        message:
          result.message ||
          "Unable to verify payment with Paystack",
      });
    }

    /*
     * Validate reference.
     */
    if (
      result.data.reference !==
      localPayment.paymentReference
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Paystack reference mismatch",
      });
    }

    /*
     * Do not mark unsuccessful Paystack
     * transactions as successful.
     */
    if (
      result.data.status !==
      "success"
    ) {
      return res.status(400).json({
        success: false,

        message:
          result.data.gateway_response ||
          `Payment status is ${result.data.status}`,

        status:
          result.data.status,
      });
    }

    /*
     * completePaystackPayment()
     * validates:
     *
     * - reference
     * - amount
     * - currency
     * - success status
     * - idempotency
     */
    const completed =
      await completePaystackPayment(
        result.data,
      );

    if (!completed.found) {
      return res.status(404).json({
        success: false,

        message:
          "Local payment record not found",
      });
    }

    const payment =
      await Payment.findById(
        localPayment._id,
      )
        .populate(
          "student",
          "name email matricNumber",
        )
        .populate(
          "semester",
          "name order",
        )
        .populate(
          "academicSession",
          "name",
        )
        .populate(
          "programme",
          "name code",
        )
        .populate(
          "department",
          "name code",
        )
        .lean();

    const balance =
      await computeBalance(
        req.user.userId,

        String(
          localPayment.semester,
        ),
      );

    return res.status(200).json({
      success: true,

      message:
        "Payment verified successfully",

      payment,

      balance,
    });
  } catch (error) {
    console.error(
      "Verify Paystack payment error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        error instanceof Error
          ? error.message
          : "Unable to verify payment",
    });
  }
}

/* =========================================================
   PAYSTACK WEBHOOK

   IMPORTANT:
   - NO authenticate middleware
   - Requires rawBody
   - Validates x-paystack-signature
========================================================= */

export async function paystackWebhook(
  req: Request,
  res: Response,
) {
  try {
    const secret =
      process.env.PAYSTACK_SECRET_KEY;

    if (!secret) {
      console.error(
        "PAYSTACK_SECRET_KEY is not configured",
      );

      return res.sendStatus(500);
    }

    const signature =
      req.header(
        "x-paystack-signature",
      );

    if (!signature) {
      return res.sendStatus(401);
    }

    const rawBody =
      (
        req as Request & {
          rawBody?: Buffer;
        }
      ).rawBody;

    if (!rawBody) {
      console.error(
        "Paystack webhook raw body is missing",
      );

      return res.sendStatus(400);
    }

    /*
     * Generate expected HMAC SHA512.
     */
    const expectedSignature =
      crypto
        .createHmac(
          "sha512",
          secret,
        )
        .update(rawBody)
        .digest("hex");

    const expectedBuffer =
      Buffer.from(
        expectedSignature,
        "utf8",
      );

    const receivedBuffer =
      Buffer.from(
        signature.trim(),
        "utf8",
      );

    /*
     * timingSafeEqual throws when the
     * buffer lengths are different.
     */
    if (
      expectedBuffer.length !==
      receivedBuffer.length
    ) {
      return res.sendStatus(401);
    }

    const valid =
      crypto.timingSafeEqual(
        expectedBuffer,
        receivedBuffer,
      );

    if (!valid) {
      return res.sendStatus(401);
    }

    const event =
      req.body as PaystackWebhookBody;

    /*
     * Only process successful charge events.
     */
    if (
      event.event !==
      "charge.success"
    ) {
      return res.sendStatus(200);
    }

    if (!event.data?.reference) {
      return res.sendStatus(200);
    }

    if (
      event.data.status !==
      "success"
    ) {
      return res.sendStatus(200);
    }

    try {
      await completePaystackPayment(
        event.data,
      );
    } catch (error) {
      console.error(
        "Paystack webhook payment processing error:",
        error,
      );
    }

    /*
     * Valid webhook received.
     *
     * Return 200 so Paystack knows the event
     * was received.
     */
    return res.sendStatus(200);
  } catch (error) {
    console.error(
      "Paystack webhook error:",
      error,
    );

    return res.sendStatus(500);
  }
}

/* =========================================================
   GET MY PAYMENT RECEIPT
========================================================= */

export async function getMyPaymentReceipt(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,

        message:
          "Authenticated user not found",
      });
    }

    const reference =
      typeof req.params.reference ===
      "string"
        ? req.params.reference.trim()
        : "";

    if (!reference) {
      return res.status(400).json({
        success: false,

        message:
          "Payment reference is required",
      });
    }

    const payment =
      await Payment.findOne({
        paymentReference:
          reference,

        student:
          new Types.ObjectId(
            req.user.userId,
          ),
      })
        .populate(
          "student",
          "name email matricNumber",
        )
        .populate(
          "semester",
          "name order",
        )
        .populate(
          "academicSession",
          "name",
        )
        .populate(
          "programme",
          "name code",
        )
        .populate(
          "department",
          "name code",
        )
        .lean();

    if (!payment) {
      return res.status(404).json({
        success: false,

        message:
          "Payment receipt not found",
      });
    }

    return res.status(200).json({
      success: true,

      payment,
    });
  } catch (error) {
    console.error(
      "Get payment receipt error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to retrieve payment receipt",
    });
  }
}

/* =========================================================
   FINANCE DASHBOARD
========================================================= */

export async function getFinanceDashboard(
  req: Request,
  res: Response,
) {
  try {
    const today = new Date();

    const startOfToday =
      new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );

    const startOfMonth =
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
      );

    const startOfSixMonths =
      new Date(
        today.getFullYear(),
        today.getMonth() - 5,
        1,
      );

    const [
      totalRevenueResult,
      todayRevenueResult,
      monthlyRevenueResult,
      totalPaymentsResult,
      outstandingResult,
      paymentMethodsResult,
      monthlyRevenue,
      recentPayments,
    ] = await Promise.all([
      /*
       * Total revenue.
       */
      Payment.aggregate([
        {
          $match: {
            status: "successful",
          },
        },

        {
          $group: {
            _id: null,

            total: {
              $sum: "$amount",
            },
          },
        },
      ]),

      /*
       * Today's revenue.
       */
      Payment.aggregate([
        {
          $match: {
            status: "successful",

            paidAt: {
              $gte: startOfToday,
            },
          },
        },

        {
          $group: {
            _id: null,

            total: {
              $sum: "$amount",
            },
          },
        },
      ]),

      /*
       * Monthly revenue.
       */
      Payment.aggregate([
        {
          $match: {
            status: "successful",

            paidAt: {
              $gte: startOfMonth,
            },
          },
        },

        {
          $group: {
            _id: null,

            total: {
              $sum: "$amount",
            },
          },
        },
      ]),

      /*
       * Total successful payments.
       */
      Payment.countDocuments({
        status: "successful",
      }),

      /*
       * Outstanding student balances.
       */
      getOutstandingAmount(),

      /*
       * Payment methods.
       */
      Payment.aggregate([
        {
          $match: {
            status: "successful",
          },
        },

        {
          $group: {
            _id: "$method",

            amount: {
              $sum: "$amount",
            },

            count: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            amount: -1,
          },
        },
      ]),

      /*
       * Six-month revenue.
       */
      Payment.aggregate([
        {
          $match: {
            status: "successful",

            paidAt: {
              $gte: startOfSixMonths,
            },
          },
        },

        {
          $group: {
            _id: {
              year: {
                $year: "$paidAt",
              },

              month: {
                $month: "$paidAt",
              },
            },

            amount: {
              $sum: "$amount",
            },
          },
        },

        {
          $sort: {
            "_id.year": 1,

            "_id.month": 1,
          },
        },
      ]),

      /*
       * Recent payments.
       */
      Payment.find()
        .populate(
          "student",
          "name email matricNumber",
        )
        .populate(
          "semester",
          "name order",
        )
        .sort({
          createdAt: -1,
        })
        .limit(10)
        .lean(),
    ]);

    return res.status(200).json({
      success: true,

      summary: {
        totalRevenue:
          Number(
            totalRevenueResult[0]
              ?.total,
          ) || 0,

        todayRevenue:
          Number(
            todayRevenueResult[0]
              ?.total,
          ) || 0,

        monthlyRevenue:
          Number(
            monthlyRevenueResult[0]
              ?.total,
          ) || 0,

        totalPayments:
          Number(
            totalPaymentsResult,
          ) || 0,

        outstandingAmount:
          Number(
            outstandingResult.outstandingAmount,
          ) || 0,

        studentsWithOutstanding:
          Number(
            outstandingResult.studentsWithOutstanding,
          ) || 0,
      },

      paymentMethods:
        paymentMethodsResult,

      monthlyRevenue,

      recentPayments,
    });
  } catch (error) {
    console.error(
      "Get finance dashboard error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to retrieve finance dashboard",
    });
  }
}

/* =========================================================
   GET OUTSTANDING AMOUNT
========================================================= */

async function getOutstandingAmount() {
  const students =
    await User.find({
      role: "student",
    })
      .select(
        "_id programme level",
      )
      .lean();

  if (!students.length) {
    return {
      outstandingAmount: 0,

      studentsWithOutstanding: 0,
    };
  }

  const studentIds =
    students.map(
      (student) =>
        student._id,
    );

  const programmeIds =
    students
      .map(
        (student) =>
          student.programme,
      )
      .filter(
        (
          id,
        ): id is Types.ObjectId =>
          Boolean(id),
      );

  if (!programmeIds.length) {
    return {
      outstandingAmount: 0,

      studentsWithOutstanding: 0,
    };
  }

  const feeStructures =
    await FeeStructure.find({
      programme: {
        $in: programmeIds,
      },

      isActive: true,
    })
      .select(
        "programme level semester amount",
      )
      .lean();

  if (!feeStructures.length) {
    return {
      outstandingAmount: 0,

      studentsWithOutstanding: 0,
    };
  }

  const payments =
    await Payment.aggregate([
      {
        $match: {
          student: {
            $in: studentIds,
          },

          status: "successful",
        },
      },

      {
        $group: {
          _id: {
            student: "$student",

            semester: "$semester",
          },

          totalPaid: {
            $sum: "$amount",
          },
        },
      },
    ]);

  const paymentMap =
    new Map<string, number>();

  for (
    const payment of payments
  ) {
    const key =
      `${String(
        payment._id.student,
      )}_${String(
        payment._id.semester,
      )}`;

    paymentMap.set(
      key,

      Number(
        payment.totalPaid,
      ) || 0,
    );
  }

  /*
   * Group fee structures by:
   *
   * programme + normalized level + semester
   *
   * This supports multiple categories:
   *
   * Tuition
   * Examination
   * Acceptance
   * Library
   * Registration
   * etc.
   */
  const feeGroupMap =
    new Map<
      string,
      FeeGroup
    >();

  for (
    const fee of feeStructures
  ) {
    const programmeId =
      String(fee.programme);

    const semesterId =
      String(fee.semester);

    const normalizedLevel =
      normalizeLevel(
        fee.level,
      );

    const key =
      `${programmeId}_${normalizedLevel}_${semesterId}`;

    const existing =
      feeGroupMap.get(key);

    if (existing) {
      existing.amount +=
        Number(fee.amount) || 0;
    } else {
      feeGroupMap.set(key, {
        programme:
          programmeId,

        level:
          normalizedLevel,

        semester:
          semesterId,

        amount:
          Number(fee.amount) || 0,
      });
    }
  }

  const feeGroups =
    Array.from(
      feeGroupMap.values(),
    );

  let outstandingAmount = 0;

  const countedStudents =
    new Set<string>();

  for (
    const student of students
  ) {
    if (
      !student.programme ||
      !student.level
    ) {
      continue;
    }

    const studentProgramme =
      String(
        student.programme,
      );

    const studentLevel =
      normalizeLevel(
        student.level,
      );

    const studentFeeGroups =
      feeGroups.filter(
        (group) =>
          group.programme ===
            studentProgramme &&
          group.level ===
            studentLevel,
      );

    for (
      const group of studentFeeGroups
    ) {
      const paymentKey =
        `${String(
          student._id,
        )}_${group.semester}`;

      const totalPaid =
        paymentMap.get(
          paymentKey,
        ) ?? 0;

      const outstanding =
        Math.max(
          group.amount -
            totalPaid,
          0,
        );

      if (outstanding > 0) {
        outstandingAmount +=
          outstanding;

        countedStudents.add(
          String(
            student._id,
          ),
        );
      }
    }
  }

  return {
    outstandingAmount,

    studentsWithOutstanding:
      countedStudents.size,
  };
}

/* =========================================================
   GET PAYMENT BY ID
========================================================= */

export async function getPaymentById(
  req: Request,
  res: Response,
) {
  try {
    const id =
      typeof req.params.id ===
      "string"
        ? req.params.id.trim()
        : undefined;

    if (!id) {
      return res.status(400).json({
        success: false,

        message:
          "Payment ID is required",
      });
    }

    if (
      !Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid payment ID",
      });
    }

    const payment =
      await Payment.findById(id)
        .populate(
          "student",
          "name email matricNumber",
        )
        .populate(
          "semester",
          "name order",
        )
        .populate(
          "academicSession",
          "name",
        )
        .populate(
          "programme",
          "name code",
        )
        .populate(
          "department",
          "name code",
        )
        .populate(
          "recordedBy",
          "name email role",
        )
        .populate(
          "verifiedBy",
          "name email role",
        )
        .lean();

    if (!payment) {
      return res.status(404).json({
        success: false,

        message:
          "Payment not found",
      });
    }

    return res.status(200).json({
      success: true,

      payment,
    });
  } catch (error) {
    console.error(
      "Get payment by ID error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to retrieve payment",
    });
  }
}

/* =========================================================
   MANUAL VERIFY PAYMENT
   FINANCE / ADMIN ONLY
========================================================= */

export async function verifyPayment(
  req: AuthRequest,
  res: Response,
) {
  try {
    const id =
      typeof req.params.id ===
      "string"
        ? req.params.id.trim()
        : undefined;

    if (!id) {
      return res.status(400).json({
        success: false,

        message:
          "Payment ID is required",
      });
    }

    if (
      !Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid payment ID",
      });
    }

    const payment =
      await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,

        message:
          "Payment not found",
      });
    }

    if (
      payment.status ===
      "successful"
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Payment is already successful",
      });
    }

    /*
     * Paystack payments must be verified
     * through Paystack.
     */
    if (
      payment.paymentProvider ===
      "paystack"
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Paystack payments must be verified through Paystack",
      });
    }

    payment.status =
      "successful";

    if (req.user?.userId) {
      payment.verifiedBy =
        new Types.ObjectId(
          req.user.userId,
        );
    }

    payment.verifiedAt =
      new Date();

    payment.paidAt =
      payment.paidAt ??
      new Date();

    await payment.save();

    const populatedPayment =
      await Payment.findById(
        payment._id,
      )
        .populate(
          "student",
          "name email matricNumber",
        )
        .populate(
          "semester",
          "name order",
        )
        .populate(
          "academicSession",
          "name",
        )
        .populate(
          "programme",
          "name code",
        )
        .populate(
          "department",
          "name code",
        )
        .populate(
          "verifiedBy",
          "name email role",
        )
        .lean();

    return res.status(200).json({
      success: true,

      message:
        "Payment verified successfully",

      payment:
        populatedPayment,
    });
  } catch (error) {
    console.error(
      "Verify payment error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to verify payment",
    });
  }
}