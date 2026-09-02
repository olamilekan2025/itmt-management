import type { Response } from "express";
import { z } from "zod";

import type { AuthRequest } from "../middleware/auth.middleware.js";
import Payment from "../models/Payment.js";
import FeeStructure from "../models/FeeStructure.js";
import User from "../models/User.js";
import Semester from "../models/Semester.js";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID");

const recordPaymentSchema = z.object({
  student: objectId,
  semester: objectId,
  amount: z.number().positive(),
  method: z.enum(["cash", "bank_transfer", "card", "other"]).default("cash"),
  reference: z.string().trim().max(100).optional(),
});

async function computeBalance(studentId: string, semesterId: string) {
  const student = await User.findById(studentId);

  if (!student || !student.programme || !student.level) {
    return {
      feeAmount: 0,
      totalPaid: 0,
      balance: 0,
      hasFeeStructure: false,
    };
  }

  const feeStructure = await FeeStructure.findOne({
    programme: student.programme,
    level: student.level,
    semester: semesterId,
    isActive: true,
  });

  const payments = await Payment.find({ student: studentId, semester: semesterId });
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const feeAmount = feeStructure?.amount || 0;

  return {
    feeAmount,
    totalPaid,
    balance: feeAmount - totalPaid,
    hasFeeStructure: Boolean(feeStructure),
  };
}

// Finance records a payment for a student
export async function recordPayment(req: AuthRequest, res: Response) {
  try {
    const data = recordPaymentSchema.parse(req.body);

    const student = await User.findOne({ _id: data.student, role: "student" });

    if (!student) {
      return res.status(400).json({
        success: false,
        message: "Student not found",
      });
    }

    const semester = await Semester.findById(data.semester);

    if (!semester) {
      return res.status(400).json({
        success: false,
        message: "Semester not found",
      });
    }

    const payment = await Payment.create({
      ...data,
      recordedBy: req.user!.userId,
    });

    const balance = await computeBalance(data.student, data.semester);

    return res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      payment,
      balance,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.flatten().fieldErrors,
      });
    }

    console.error("Record payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to record payment",
    });
  }
}

// Finance/admin views all payments, optionally filtered by student or semester
export async function getPayments(req: AuthRequest, res: Response) {
  try {
    const student =
      typeof req.query.student === "string" ? req.query.student : undefined;
    const semester =
      typeof req.query.semester === "string" ? req.query.semester : undefined;

    const payments = await Payment.find({
      ...(student ? { student } : {}),
      ...(semester ? { semester } : {}),
    })
      .populate("student", "name email matricNumber")
      .populate("semester", "name order")
      .populate("recordedBy", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      payments,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve payments",
    });
  }
}

// Finance/admin views a specific student's balance for a semester
export async function getStudentBalance(req: AuthRequest, res: Response) {
  try {
    const studentId =
      typeof req.query.student === "string" ? req.query.student : undefined;
    const semesterId =
      typeof req.query.semester === "string" ? req.query.semester : undefined;

    if (!studentId || !semesterId) {
      return res.status(400).json({
        success: false,
        message: "student and semester query parameters are required",
      });
    }

    const balance = await computeBalance(studentId, semesterId);

    return res.status(200).json({
      success: true,
      balance,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve balance",
    });
  }
}

// Student views their own payment history
export async function getMyPayments(req: AuthRequest, res: Response) {
  try {
    const semester =
      typeof req.query.semester === "string" ? req.query.semester : undefined;

    const payments = await Payment.find({
      student: req.user!.userId,
      ...(semester ? { semester } : {}),
    })
      .populate("semester", "name order")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      payments,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve payments",
    });
  }
}

// Student views their own balance for a semester
export async function getMyBalance(req: AuthRequest, res: Response) {
  try {
    const semesterId =
      typeof req.query.semester === "string" ? req.query.semester : undefined;

    if (!semesterId) {
      return res.status(400).json({
        success: false,
        message: "semester query parameter is required",
      });
    }

    const balance = await computeBalance(req.user!.userId, semesterId);

    return res.status(200).json({
      success: true,
      balance,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve balance",
    });
  }
}