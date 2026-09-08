import type { Response } from "express";

import { Types } from "mongoose";

import { z } from "zod";

import type { AuthRequest } from "../middleware/auth.middleware.js";

import Payment from "../models/Payment.js";

import FeeStructure from "../models/FeeStructure.js";

import User from "../models/User.js";

import Semester from "../models/Semester.js";

import AcademicSession from "../models/AcademicSession.js";

import Programme from "../models/Programme.js";

import AuditLog from "../models/AuditLog.js";

const objectId = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid ID");

const recordPaymentSchema = z.object({
  student: objectId,

  semester: objectId,

  academicSession: objectId.optional(),

  programme: objectId.optional(),

  department: objectId.optional(),

  amount: z.number().positive(),

  currency: z.string().default("NGN").optional(),

  method: z
    .enum([
      "cash",
      "bank_transfer",
      "card",
      "other",
    ])
    .default("cash"),

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

  paymentReference: z.string().trim().min(3).max(50),

  invoiceNumber: z.string().trim().optional(),

  paymentProvider: z.string().trim().optional(),

  providerTransactionRef: z.string().trim().optional(),

  status: z
    .enum([
      "pending",
      "successful",
      "failed",
      "refunded",
      "cancelled",
    ])
    .default("successful"),

  notes: z.string().trim().optional(),
});

/**
 * Empty finance summary.
 */
const EMPTY_DASHBOARD_SUMMARY = {
  totalRevenue: 0,
  todayRevenue: 0,
  monthlyRevenue: 0,
  totalPayments: 0,
  outstandingAmount: 0,
  studentsWithOutstanding: 0,
};

/**
 * Escape user input before creating a RegExp.
 */
function escapeRegex(value: string) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );
}

/**
 * Calculate a student's balance for a semester.
 *
 * A student's total fee is the sum of ALL active
 * fee structures matching:
 *
 * - programme
 * - level
 * - semester
 *
 * This allows multiple fee categories such as:
 *
 * Tuition
 * Registration
 * ICT
 * Library
 * Examination
 * etc.
 */
async function computeBalance(
  studentId: string,
  semesterId: string,
) {
  if (
    !Types.ObjectId.isValid(studentId) ||
    !Types.ObjectId.isValid(semesterId)
  ) {
    return {
      feeAmount: 0,
      totalPaid: 0,
      balance: 0,
      outstanding: 0,
      overpayment: 0,
      hasFeeStructure: false,
    };
  }

  /**
   * Get the student programme and level.
   */
  const student = await User.findById(studentId)
    .select("programme level")
    .lean();

  if (
    !student ||
    !student.programme ||
    !student.level
  ) {
    return {
      feeAmount: 0,
      totalPaid: 0,
      balance: 0,
      outstanding: 0,
      overpayment: 0,
      hasFeeStructure: false,
    };
  }

  const semesterObjectId =
    new Types.ObjectId(semesterId);

  /**
   * Find ALL active fee structures for:
   *
   * programme + level + semester
   *
   * We intentionally use find() instead of findOne()
   * because there can now be multiple fee categories.
   */
  const feeStructures =
    await FeeStructure.find({
      programme: student.programme,
      level: student.level,
      semester: semesterObjectId,
      isActive: true,
    })
      .select("amount")
      .lean();

  /**
   * Sum all applicable fee categories.
   *
   * Example:
   *
   * Tuition       = 100,000
   * Registration   = 20,000
   * ICT            = 10,000
   *
   * Total fee     = 130,000
   */
  const feeAmount =
    feeStructures.reduce(
      (total, fee) =>
        total + (Number(fee.amount) || 0),
      0,
    );

  /**
   * Calculate all payments made by the student
   * for this semester.
   */
  const paymentResult =
    await Payment.aggregate([
      {
        $match: {
          student:
            new Types.ObjectId(studentId),

          semester: semesterObjectId,
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

  /**
   * Calculate balance.
   */
  const balance =
    feeAmount - totalPaid;

  return {
    feeAmount,

    totalPaid,

    balance,

    outstanding: Math.max(
      balance,
      0,
    ),

    overpayment: Math.max(
      -balance,
      0,
    ),

    hasFeeStructure:
      feeStructures.length > 0,
  };
}

/**
 * Finance/Admin records a payment for a student.
 */
export async function recordPayment(
  req: AuthRequest,
  res: Response,
) {
  try {
    const data =
      recordPaymentSchema.parse(
        req.body,
      );

    /**
     * Verify student.
     */
    const student =
      await User.findOne({
        _id: data.student,
        role: "student",
      });

    if (!student) {
      return res.status(400).json({
        success: false,
        message: "Student not found",
      });
    }

    /**
     * Verify semester.
     */
    const semester =
      await Semester.findById(
        data.semester,
      );

    if (!semester) {
      return res.status(400).json({
        success: false,
        message: "Semester not found",
      });
    }

    /**
     * Verify academic session if provided.
     */
    if (data.academicSession) {
      const session = await AcademicSession.findById(data.academicSession);
      if (!session) {
        return res.status(400).json({
          success: false,
          message: "Academic session not found",
        });
      }
    }

    /**
     * Verify programme if provided.
     */
    if (data.programme) {
      const programme = await Programme.findById(data.programme);
      if (!programme) {
        return res.status(400).json({
          success: false,
          message: "Programme not found",
        });
      }
    }

    /**
     * Check for duplicate payment reference.
     */
    const existingPayment = await Payment.findOne({
      paymentReference: data.paymentReference.toUpperCase(),
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: "Payment reference already exists",
      });
    }

    /**
     * Verify authenticated finance/admin user.
     */
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authenticated user not found",
      });
    }

    const recordingUser = await User.findById(req.user.userId);
    if (!recordingUser) {
      return res.status(401).json({
        success: false,
        message: "Recording user not found",
      });
    }

    /**
     * Create payment.
     */
    const payment =
      await Payment.create({
        student: data.student,
        studentName: student.name,
        matricNumber: student.matricNumber,
        semester: data.semester,
        academicSession: data.academicSession,
        programme: data.programme,
        department: data.department,
        amount: data.amount,
        currency: data.currency || "NGN",
        method: data.method,
        purpose: data.purpose,
        paymentReference: data.paymentReference.toUpperCase(),
        invoiceNumber: data.invoiceNumber,
        paymentProvider: data.paymentProvider,
        providerTransactionRef: data.providerTransactionRef,
        status: data.status,
        notes: data.notes,
        recordedBy: req.user.userId,
        paidAt: data.status === "successful" ? new Date() : undefined,
      });

    /**
     * Log audit.
     */
    await AuditLog.create({
      actor: req.user.userId,
      actorName: recordingUser.name,
      actorEmail: recordingUser.email,
      actorRole: recordingUser.role,
      action: "CREATE",
      module: "PAYMENTS",
      description: `Recorded payment of ${data.currency || "NGN"} ${data.amount} for student ${student.name}`,
      targetType: "Payment",
      targetId: String(payment._id),
      status: "success",
      metadata: {
        studentId: data.student,
        amount: data.amount,
        purpose: data.purpose,
        paymentReference: data.paymentReference,
      },
    });

    /**
     * Recalculate balance after payment.
     *
     * computeBalance() now includes ALL fee
     * categories.
     */
    const balance =
      await computeBalance(
        data.student,
        data.semester,
      );

    return res.status(201).json({
      success: true,

      message:
        "Payment recorded successfully",

      payment,

      balance,
    });
  } catch (error) {
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

/**
 * Finance/Admin views payments with filtering and pagination.
 *
 * Optional query parameters:
 * ?student=STUDENT_ID
 * ?semester=SEMESTER_ID
 * ?status=STATUS
 * ?purpose=PURPOSE
 * ?method=METHOD
 * ?search=SEARCH_TERM
 * ?page=PAGE_NUMBER
 * ?limit=LIMIT
 * ?from=START_DATE
 * ?to=END_DATE
 */
export async function getPayments(
  req: AuthRequest,
  res: Response,
) {
  try {
    const student =
      typeof req.query.student ===
      "string"
        ? req.query.student.trim()
        : undefined;

    const semester =
      typeof req.query.semester ===
      "string"
        ? req.query.semester.trim()
        : undefined;

    const status =
      typeof req.query.status ===
      "string"
        ? req.query.status.trim()
        : undefined;

    const purpose =
      typeof req.query.purpose ===
      "string"
        ? req.query.purpose.trim()
        : undefined;

    const method =
      typeof req.query.method ===
      "string"
        ? req.query.method.trim()
        : undefined;

    const search =
      typeof req.query.search ===
      "string"
        ? req.query.search.trim()
        : undefined;

    const page = Math.max(
      1,
      parseInt(
        typeof req.query.page === "string"
          ? req.query.page
          : "1",
        10,
      ),
    );

    const limit = Math.min(
      100,
      Math.max(
        10,
        parseInt(
          typeof req.query.limit === "string"
            ? req.query.limit
            : "20",
          10,
        ),
      ),
    );

    const from =
      typeof req.query.from ===
      "string"
        ? req.query.from.trim()
        : undefined;

    const to =
      typeof req.query.to ===
      "string"
        ? req.query.to.trim()
        : undefined;

    /**
     * Validate IDs.
     */
    if (
      student &&
      !Types.ObjectId.isValid(student)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid student ID",
      });
    }

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

    /**
     * Build query.
     */
    const query: Record<
      string,
      unknown
    > = {};

    if (student) {
      query.student =
        new Types.ObjectId(student);
    }

    if (semester) {
      query.semester =
        new Types.ObjectId(semester);
    }

    if (status) {
      query.status = status;
    }

    if (purpose) {
      query.purpose = purpose;
    }

    if (method) {
      query.method = method;
    }

    /**
     * Date range filter.
     */
    if (from || to) {
      const dateFilter: Record<string, unknown> = {};
      if (from) {
        dateFilter.$gte = new Date(from);
      }
      if (to) {
        dateFilter.$lte = new Date(to);
      }
      query.createdAt = dateFilter;
    }

    /**
     * Search filter.
     */
    if (search) {
      const searchRegex =
        new RegExp(
          escapeRegex(search),
          "i",
        );

      query.$or = [
        {
          paymentReference: searchRegex,
        },
        {
          studentName: searchRegex,
        },
        {
          matricNumber: searchRegex,
        },
        {
          invoiceNumber: searchRegex,
        },
        {
          providerTransactionRef: searchRegex,
        },
      ];
    }

    /**
     * Get total count.
     */
    const total =
      await Payment.countDocuments(
        query,
      );

    /**
     * Get payments with pagination.
     */
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
        .populate(
          "recordedBy",
          "name",
        )
        .populate(
          "verifiedBy",
          "name",
        )
        .sort({
          createdAt: -1,
        })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

    const totalPages =
      Math.ceil(total / limit);

    return res.status(200).json({
      success: true,

      payments,

      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
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

/**
 * Finance/Admin views all students and their
 * fee/payment status for a semester.
 *
 * Required:
 * ?semester=SEMESTER_ID
 *
 * Optional:
 * ?programme=PROGRAMME_ID
 * ?level=LEVEL
 * ?search=SEARCH
 */
export async function getStudentsFees(
  req: AuthRequest,
  res: Response,
) {
  try {
    const semesterId =
      typeof req.query.semester ===
      "string"
        ? req.query.semester.trim()
        : undefined;

    const programmeId =
      typeof req.query.programme ===
      "string"
        ? req.query.programme.trim()
        : undefined;

    const search =
      typeof req.query.search ===
      "string"
        ? req.query.search.trim()
        : undefined;

    const level =
      typeof req.query.level ===
      "string"
        ? req.query.level.trim()
        : undefined;

    /**
     * Semester is required.
     */
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

    if (
      programmeId &&
      !Types.ObjectId.isValid(
        programmeId,
      )
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid programme ID",
      });
    }

    const semesterObjectId =
      new Types.ObjectId(
        semesterId,
      );

    /**
     * Verify semester exists.
     */
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

    /**
     * Build student filter.
     */
    const studentFilter: Record<
      string,
      unknown
    > = {
      role: "student",
    };

    if (programmeId) {
      studentFilter.programme =
        new Types.ObjectId(
          programmeId,
        );
    }

    if (level) {
      studentFilter.level = level;
    }

    if (search) {
      const searchRegex =
        new RegExp(
          escapeRegex(search),
          "i",
        );

      studentFilter.$or = [
        {
          name: searchRegex,
        },
        {
          email: searchRegex,
        },
        {
          matricNumber: searchRegex,
        },
      ];
    }

    /**
     * Get students.
     */
    const students =
      await User.find(studentFilter)
        .select(
          "name email matricNumber programme level",
        )
        .populate(
          "programme",
          "name code",
        )
        .sort({
          name: 1,
        })
        .lean();

    /**
     * Get ALL active fee structures
     * for this semester.
     */
    const feeStructures =
      await FeeStructure.find({
        semester:
          semesterObjectId,

        isActive: true,
      })
        .select(
          "programme level amount description",
        )
        .lean();

    /**
     * Aggregate all payments for this
     * semester in one database query.
     */
    const payments =
      await Payment.aggregate([
        {
          $match: {
            semester:
              semesterObjectId,
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

    /**
     * studentId -> total paid.
     */
    const paymentMap =
      new Map<string, number>();

    for (const payment of payments) {
      paymentMap.set(
        String(payment._id),

        Number(
          payment.totalPaid,
        ) || 0,
      );
    }

    /**
     * programmeId:level -> TOTAL fee amount.
     *
     * Important:
     *
     * Multiple fee categories must be
     * added together.
     */
    const feeMap =
      new Map<string, number>();

    for (const fee of feeStructures) {
      const key =
        `${String(
          fee.programme,
        )}:${String(fee.level)}`;

      const current =
        feeMap.get(key) ?? 0;

      feeMap.set(
        key,

        current +
          (Number(fee.amount) || 0),
      );
    }

    /**
     * Build student fee records.
     */
    const studentsFees =
      students.map((student) => {
        const programme =
          student.programme &&
          typeof student.programme ===
            "object"
            ? student.programme
            : null;

        const programmeIdValue =
          programme
            ? String(
                programme._id,
              )
            : student.programme
              ? String(
                  student.programme,
                )
              : "";

        const levelValue =
          student.level ?? "";

        const feeAmount =
          feeMap.get(
            `${programmeIdValue}:${levelValue}`,
          ) ?? 0;

        const totalPaid =
          paymentMap.get(
            String(student._id),
          ) ?? 0;

        const rawBalance =
          feeAmount - totalPaid;

        const outstanding =
          Math.max(
            rawBalance,
            0,
          );

        const overpayment =
          Math.max(
            -rawBalance,
            0,
          );

        let status:
          | "no_fee"
          | "outstanding"
          | "partial"
          | "paid";

        if (feeAmount <= 0) {
          status = "no_fee";
        } else if (totalPaid <= 0) {
          status = "outstanding";
        } else if (
          totalPaid >= feeAmount
        ) {
          status = "paid";
        } else {
          status = "partial";
        }

        return {
          student: {
            _id: student._id,

            name: student.name,

            email: student.email,

            matricNumber:
              student.matricNumber,

            programme,

            level: levelValue,
          },

          semester: {
            _id: semester._id,

            name: semester.name,

            order: semester.order,
          },

          feeAmount,

          totalPaid,

          outstanding,

          overpayment,

          status,
        };
      });

    /**
     * Calculate summary.
     */
    const summary =
      studentsFees.reduce(
        (acc, item) => {
          acc.totalFees +=
            item.feeAmount;

          acc.totalPaid +=
            item.totalPaid;

          acc.totalOutstanding +=
            item.outstanding;

          if (
            item.status === "paid"
          ) {
            acc.paidStudents += 1;
          }

          if (
            item.status === "partial"
          ) {
            acc.partialStudents += 1;
          }

          if (
            item.status ===
            "outstanding"
          ) {
            acc.outstandingStudents +=
              1;
          }

          if (
            item.status === "no_fee"
          ) {
            acc.noFeeStudents += 1;
          }

          if (item.feeAmount > 0) {
            acc.studentsWithFees +=
              1;
          }

          return acc;
        },

        {
          totalStudents:
            studentsFees.length,

          studentsWithFees: 0,

          totalFees: 0,

          totalPaid: 0,

          totalOutstanding: 0,

          paidStudents: 0,

          partialStudents: 0,

          outstandingStudents: 0,

          noFeeStudents: 0,
        },
      );

    return res.status(200).json({
      success: true,

      semester,

      studentsFees,

      summary,
    });
  } catch (error) {
    console.error(
      "Get students fees error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to retrieve student fee records",
    });
  }
}

/**
 * Finance/Admin views a specific student's
 * balance for a semester.
 */
export async function getStudentBalance(
  req: AuthRequest,
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

    if (!studentId || !semesterId) {
      return res.status(400).json({
        success: false,

        message:
          "student and semester query parameters are required",
      });
    }

    if (
      !Types.ObjectId.isValid(
        studentId,
      )
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

    /**
     * Verify student.
     */
    const student =
      await User.findOne({
        _id: studentId,
        role: "student",
      }).lean();

    if (!student) {
      return res.status(404).json({
        success: false,

        message:
          "Student not found",
      });
    }

    /**
     * Verify semester.
     */
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

    /**
     * computeBalance() now sums all
     * applicable fee categories.
     */
    const balance =
      await computeBalance(
        studentId,
        semesterId,
      );

    return res.status(200).json({
      success: true,

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
        "Unable to retrieve balance",
    });
  }
}

/**
 * Student views their own payment history.
 */
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
        new Types.ObjectId(
          semester,
        );
    }

    const payments =
      await Payment.find(query)
        .populate(
          "semester",
          "name order",
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

/**
 * Student views their own balance.
 */
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

    /**
     * Verify semester.
     */
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

    /**
     * computeBalance() now sums all
     * applicable fee categories.
     */
    const balance =
      await computeBalance(
        req.user.userId,
        semesterId,
      );

    return res.status(200).json({
      success: true,

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
        "Unable to retrieve balance",
    });
  }
}

/**
 * Finance/Admin dashboard summary.
 *
 * Optional:
 * ?semester=SEMESTER_ID
 *
 * Returns:
 * - total revenue
 * - today's revenue
 * - current month's revenue
 * - total payment count
 * - outstanding amount
 * - students with outstanding fees
 * - payment method breakdown
 * - six-month revenue
 * - recent payments
 */
export async function getFinanceDashboard(
  req: AuthRequest,
  res: Response,
) {
  try {
    const now = new Date();

    const startOfToday =
      new Date(now);

    startOfToday.setHours(
      0,
      0,
      0,
      0,
    );

    const startOfMonth =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      );

    const startOfSixMonthsAgo =
      new Date(
        now.getFullYear(),
        now.getMonth() - 5,
        1,
      );

    const semesterId =
      typeof req.query.semester ===
      "string"
        ? req.query.semester.trim()
        : undefined;

    /**
     * Validate optional semester.
     */
    if (
      semesterId &&
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
      semesterId
        ? new Types.ObjectId(
            semesterId,
          )
        : undefined;

    /**
     * Verify semester exists when supplied.
     */
    if (semesterObjectId) {
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
    }

    /**
     * Base payment filter.
     */
    const paymentMatch: Record<
      string,
      unknown
    > = {};

    if (semesterObjectId) {
      paymentMatch.semester =
        semesterObjectId;
    }

    const [
      revenueResult,

      todayResult,

      monthlyResult,

      paymentCount,

      paymentMethods,

      monthlyRevenue,

      recentPayments,

      outstandingResult,
    ] = await Promise.all([
      /**
       * Total revenue.
       */
      Payment.aggregate([
        {
          $match:
            paymentMatch,
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

      /**
       * Today's revenue.
       */
      Payment.aggregate([
        {
          $match: {
            ...paymentMatch,

            createdAt: {
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

      /**
       * Current month's revenue.
       */
      Payment.aggregate([
        {
          $match: {
            ...paymentMatch,

            createdAt: {
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

      /**
       * Number of payments.
       */
      Payment.countDocuments(
        paymentMatch,
      ),

      /**
       * Payment method breakdown.
       */
      Payment.aggregate([
        {
          $match:
            paymentMatch,
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

      /**
       * Revenue for the last six months.
       */
      Payment.aggregate([
        {
          $match: {
            ...paymentMatch,

            createdAt: {
              $gte:
                startOfSixMonthsAgo,
            },
          },
        },

        {
          $group: {
            _id: {
              year: {
                $year:
                  "$createdAt",
              },

              month: {
                $month:
                  "$createdAt",
              },
            },

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
            "_id.year": 1,

            "_id.month": 1,
          },
        },
      ]),

      /**
       * Recent payments.
       */
      Payment.find(paymentMatch)
        .populate(
          "student",
          "name email matricNumber",
        )
        .populate(
          "semester",
          "name order",
        )
        .populate(
          "recordedBy",
          "name",
        )
        .sort({
          createdAt: -1,
        })
        .limit(10)
        .lean(),

      /**
       * Outstanding fee calculation.
       *
       * Total student fee =
       * sum of ALL active fee structures
       * matching:
       *
       * programme + level + semester
       *
       * Outstanding =
       * total fee - total payments
       */
      User.aggregate([
        {
          $match: {
            role: "student",

            programme: {
              $exists: true,

              $ne: null,
            },

            level: {
              $exists: true,

              $ne: null,
            },
          },
        },

        /**
         * Find ALL matching active
         * fee structures.
         */
        {
          $lookup: {
            from: "feestructures",

            let: {
              programmeId:
                "$programme",

              studentLevel:
                "$level",
            },

            pipeline: [
              {
                $match: {
                  isActive: true,

                  ...(semesterObjectId
                    ? {
                        semester:
                          semesterObjectId,
                      }
                    : {}),

                  $expr: {
                    $and: [
                      {
                        $eq: [
                          "$programme",
                          "$$programmeId",
                        ],
                      },

                      {
                        $eq: [
                          "$level",
                          "$$studentLevel",
                        ],
                      },
                    ],
                  },
                },
              },

              /**
               * Sum ALL fee categories.
               */
              {
                $group: {
                  _id: null,

                  totalFee: {
                    $sum: "$amount",
                  },
                },
              },
            ],

            as: "feeTotals",
          },
        },

        /**
         * Extract total fee.
         */
        {
          $addFields: {
            totalFee: {
              $ifNull: [
                {
                  $arrayElemAt: [
                    "$feeTotals.totalFee",
                    0,
                  ],
                },

                0,
              ],
            },
          },
        },

        /**
         * Ignore students without
         * an applicable fee structure.
         */
        {
          $match: {
            totalFee: {
              $gt: 0,
            },
          },
        },

        /**
         * Find payments for each student.
         */
        {
          $lookup: {
            from: "payments",

            let: {
              studentId: "$_id",
            },

            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: [
                          "$student",
                          "$$studentId",
                        ],
                      },

                      ...(semesterObjectId
                        ? [
                            {
                              $eq: [
                                "$semester",
                                semesterObjectId,
                              ],
                            },
                          ]
                        : []),
                    ],
                  },
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
            ],

            as: "paymentTotals",
          },
        },

        /**
         * Extract total paid.
         */
        {
          $addFields: {
            totalPaid: {
              $ifNull: [
                {
                  $arrayElemAt: [
                    "$paymentTotals.totalPaid",
                    0,
                  ],
                },

                0,
              ],
            },
          },
        },

        /**
         * Calculate balance.
         */
        {
          $addFields: {
            balance: {
              $subtract: [
                "$totalFee",

                "$totalPaid",
              ],
            },
          },
        },

        /**
         * Only students who owe money.
         */
        {
          $match: {
            balance: {
              $gt: 0,
            },
          },
        },

        /**
         * Produce dashboard totals.
         */
        {
          $group: {
            _id: null,

            outstandingAmount: {
              $sum: "$balance",
            },

            studentsWithOutstanding: {
              $sum: 1,
            },
          },
        },
      ]),
    ]);

    /**
     * Extract dashboard totals.
     */
    const totalRevenue =
      Number(
        revenueResult[0]?.total,
      ) || 0;

    const todayRevenue =
      Number(
        todayResult[0]?.total,
      ) || 0;

    const monthlyRevenueTotal =
      Number(
        monthlyResult[0]?.total,
      ) || 0;

    const outstandingAmount =
      Number(
        outstandingResult[0]
          ?.outstandingAmount,
      ) || 0;

    const studentsWithOutstanding =
      Number(
        outstandingResult[0]
          ?.studentsWithOutstanding,
      ) || 0;

    /**
     * Payment method data.
     */
    const paymentMethodData =
      paymentMethods.map(
        (item) => ({
          method: String(
            item._id,
          ),

          amount:
            Number(
              item.amount,
            ) || 0,

          count:
            Number(
              item.count,
            ) || 0,
        }),
      );

    /**
     * Six-month revenue data.
     */
    const revenueByMonth =
      monthlyRevenue.map(
        (item) => ({
          year: item._id.year,

          month: item._id.month,

          amount:
            Number(
              item.amount,
            ) || 0,

          count:
            Number(
              item.count,
            ) || 0,

          date: new Date(
            item._id.year,

            item._id.month - 1,

            1,
          ).toLocaleDateString(
            "en-NG",
            {
              month: "short",

              year: "2-digit",
            },
          ),
        }),
      );

    return res.status(200).json({
      success: true,

      summary: {
        ...EMPTY_DASHBOARD_SUMMARY,

        totalRevenue,

        todayRevenue,

        monthlyRevenue:
          monthlyRevenueTotal,

        totalPayments:
          paymentCount,

        outstandingAmount,

        studentsWithOutstanding,
      },

      paymentMethods:
        paymentMethodData,

      revenueByMonth,

      recentPayments,
    });
  } catch (error) {
    console.error(
      "Finance dashboard error:",
      error,
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to retrieve finance dashboard",
    });
  }
}

/**
 * Finance/Admin views a specific payment by ID.
 */
export async function getPaymentById(
  req: AuthRequest,
  res: Response,
) {
  try {
    const { id } = req.params;
    const paymentId = Array.isArray(id) ? id[0] : id;

    if (!Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ID",
      });
    }

    const payment = await Payment.findById(paymentId)
      .populate("student", "name email matricNumber programme level")
      .populate("semester", "name order")
      .populate("academicSession", "name")
      .populate("programme", "name code")
      .populate("department", "name code")
      .populate("recordedBy", "name email")
      .populate("verifiedBy", "name email")
      .lean();

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    return res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Get payment error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve payment",
    });
  }
}

/**
 * Finance/Admin verifies a payment.
 */
export async function verifyPayment(
  req: AuthRequest,
  res: Response,
) {
  try {
    const { id } = req.params;
    const paymentId = Array.isArray(id) ? id[0] : id;

    if (!Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ID",
      });
    }

    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user not found",
      });
    }

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.status === "successful") {
      return res.status(400).json({
        success: false,
        message: "Payment is already verified",
      });
    }

    const verifyingUser = await User.findById(req.user.userId);
    if (!verifyingUser) {
      return res.status(401).json({
        success: false,
        message: "Verifying user not found",
      });
    }

    payment.status = "successful";
    payment.verifiedBy = req.user.userId;
    payment.verifiedAt = new Date();
    payment.paidAt = new Date();

    await payment.save();

    /**
     * Log audit.
     */
    await AuditLog.create({
      actor: req.user.userId,
      actorName: verifyingUser.name,
      actorEmail: verifyingUser.email,
      actorRole: verifyingUser.role,
      action: "APPROVE",
      module: "PAYMENTS",
      description: `Verified payment ${payment.paymentReference}`,
      targetType: "Payment",
      targetId: String(payment._id),
      status: "success",
      metadata: {
        paymentReference: payment.paymentReference,
        amount: payment.amount,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      payment,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to verify payment",
    });
  }
}