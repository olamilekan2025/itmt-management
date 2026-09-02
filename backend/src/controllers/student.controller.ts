import type { Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import Programme from "../models/Programme.js";
import AcademicSession from "../models/AcademicSession.js";

import {
  createExistingStudentSchema,
} from "../validators/student.validator.js";

export async function createExistingStudent(
  req: Request,
  res: Response,
) {
  try {
    const data = createExistingStudentSchema.parse(req.body);

    const matricNumber = data.matricNumber
      .trim()
      .toUpperCase();

    /*
     * Check email first.
     */
    const existingEmail = await User.findOne({
      email: data.email,
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message:
          "An account already exists with this email address.",
      });
    }

    /*
     * Check matric number.
     *
     * This is especially important because existing
     * students already have official matric numbers.
     */
    const existingMatric = await User.findOne({
      matricNumber,
    });

    if (existingMatric) {
      return res.status(409).json({
        success: false,
        message:
          "This matric number is already associated with an account.",
      });
    }

    /*
     * Make sure the programme exists.
     */
    const programme = await Programme.findById(
      data.programme,
    );

    if (!programme) {
      return res.status(400).json({
        success: false,
        message: "Selected programme was not found.",
      });
    }

    /*
     * Make sure the academic session exists.
     */
    const academicSession =
      await AcademicSession.findById(
        data.academicSession,
      );

    if (!academicSession) {
      return res.status(400).json({
        success: false,
        message:
          "Selected academic session was not found.",
      });
    }

    /*
     * Hash password before saving.
     */
    const hashedPassword = await bcrypt.hash(
      data.password,
      12,
    );

    /*
     * IMPORTANT:
     * The role is controlled by the backend.
     * The admin cannot create this account as another role.
     */
    const student = await User.create({
      name: data.name.trim(),
      email: data.email,
      password: hashedPassword,
      matricNumber,
      programme: programme._id,
      role: "student",
      isActive: true,

      /*
       * Only include this field if your existing
       * User model already has academicSession.
       */
      academicSession: academicSession._id,

      /*
       * Only include this if your User model
       * already contains level.
       */
      level: data.level,
    });

    return res.status(201).json({
      success: true,
      message:
        "Existing student account created successfully.",
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        matricNumber: student.matricNumber,
        role: student.role,
        programme: student.programme,
        academicSession:
          student.academicSession,
        level: student.level,
        isActive: student.isActive,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.flatten().fieldErrors,
      });
    }

    if (
      (error as { code?: number }).code === 11000
    ) {
      return res.status(409).json({
        success: false,
        message:
          "A student with this email or matric number already exists.",
      });
    }

    console.error(
      "Create existing student error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create existing student account.",
    });
  }
}