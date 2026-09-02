import type { Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import Programme from "../models/Programme.js";

import { notifyAdmins } from "../services/notification.service.js";
import { createAuditLog } from "../services/auditLog.service.js";

import type { AuthRequest } from "../middleware/auth.middleware.js";

/**
 * =========================================================
 * HELPERS
 * =========================================================
 */

const objectId = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid ID");

function getRouteId(
  req: Request,
  res: Response,
): string | null {
  const id = req.params.id;

  if (typeof id !== "string" || !id.trim()) {
    res.status(400).json({
      success: false,
      message: "Invalid ID",
    });

    return null;
  }

  return id.trim();
}

function isValidObjectId(id: string): boolean {
  return /^[a-f\d]{24}$/i.test(id);
}

function isDuplicateKeyError(
  error: unknown,
): error is {
  code: 11000;
  keyPattern?: Record<string, unknown>;
  keyValue?: Record<string, unknown>;
} {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}

/**
 * =========================================================
 * COMMON USER SELECT
 * =========================================================
 */

const userSelect =
  "name email role programme academicSession level matricNumber isActive isSuspended isEmailVerified createdAt updatedAt";

/**
 * =========================================================
 * ASSIGN / UPDATE PROGRAMME
 * =========================================================
 */

const assignProgrammeSchema = z.object({
  programme: objectId,

  level: z
    .string()
    .trim()
    .min(1, "Level cannot be empty")
    .max(50, "Level is too long")
    .optional(),

  matricNumber: z
    .string()
    .trim()
    .min(
      3,
      "Matric number must be at least 3 characters",
    )
    .max(
      30,
      "Matric number is too long",
    )
    .optional(),
});

export async function assignProgramme(
  req: AuthRequest,
  res: Response,
) {
  try {
    const id = getRouteId(req, res);

    if (!id) {
      return;
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const data =
      assignProgrammeSchema.parse(req.body);

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "student") {
      return res.status(400).json({
        success: false,
        message:
          "Only student accounts can be assigned a programme",
      });
    }

    const programme = await Programme.findOne({
      _id: data.programme,
      isActive: true,
    });

    if (!programme) {
      return res.status(400).json({
        success: false,
        message:
          "Programme not found or inactive",
      });
    }

    user.programme = programme._id;

    if (data.level !== undefined) {
      user.level = data.level;
    }

    if (data.matricNumber !== undefined) {
      user.matricNumber =
        data.matricNumber
          .trim()
          .toUpperCase();
    }

    await user.save();

    /**
     * =====================================================
     * AUDIT
     * =====================================================
     *
     * Actor = authenticated administrator/staff member
     * Target = student being modified
     */
    await createAuditLog({
      req,
      actorId: req.user?.userId,
      actorRole: req.user?.role,
      action: "ASSIGN",
      module: "USERS",
      description:
        `${user.name} was assigned to the ${programme.name} programme.`,
      targetType: "User",
      resourceId: user._id.toString(),
      metadata: {
        studentId: user._id.toString(),
        studentName: user.name,
        studentEmail: user.email,
        programmeId: programme._id.toString(),
        programmeName: programme.name,
        programmeCode: programme.code,
        level: data.level !== undefined ? data.level : user.level,
        matricNumber: data.matricNumber !== undefined ? data.matricNumber.trim().toUpperCase() : user.matricNumber,
      },
      status: "success",
    });

    const updatedUser =
      await User.findById(user._id)
        .select(userSelect)
        .populate(
          "programme",
          "name code",
        )
        .populate(
          "academicSession",
          "name",
        );

    try {
      await notifyAdmins({
        title:
          "Student Programme Assigned",

        message:
          `${user.name} was assigned to ${programme.name}.`,

        type: "user",

        link:
          "/dashboards/admin/students",
      });
    } catch (notificationError) {
      console.error(
        "Programme assignment notification error:",
        notificationError,
      );
    }

    return res.status(200).json({
      success: true,
      message:
        "Programme assigned successfully",
      user: updatedUser,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors:
          error.flatten().fieldErrors,
      });
    }

    if (isDuplicateKeyError(error)) {
      if (
        error.keyPattern?.matricNumber
      ) {
        return res.status(409).json({
          success: false,
          message:
            "This matric number is already in use",
        });
      }

      return res.status(409).json({
        success: false,
        message:
          "This user already has conflicting information",
      });
    }

    console.error(
      "Assign programme error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to assign programme",
    });
  }
}

/**
 * =========================================================
 * CREATE EXISTING STUDENT
 * =========================================================
 */

const createExistingStudentSchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(
        2,
        "Name must be at least 2 characters",
      )
      .max(
        100,
        "Name is too long",
      ),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email(
        "Enter a valid email address",
      ),

    matricNumber: z
      .string()
      .trim()
      .min(
        3,
        "Matric number is required",
      )
      .max(
        30,
        "Matric number is too long",
      ),

    programme: objectId,

    academicSession: objectId,

    level: z
      .string()
      .trim()
      .min(
        1,
        "Level is required",
      )
      .max(
        50,
        "Level is too long",
      ),

    password: z
      .string()
      .min(
        8,
        "Password must be at least 8 characters",
      )
      .max(
        100,
        "Password is too long",
      ),
  });

export async function createExistingStudent(
  req: AuthRequest,
  res: Response,
) {
  try {
    const data =
      createExistingStudentSchema.parse(
        req.body,
      );

    const normalizedEmail =
      data.email
        .trim()
        .toLowerCase();

    const normalizedMatricNumber =
      data.matricNumber
        .trim()
        .toUpperCase();

    const [
      existingEmail,
      existingMatricNumber,
    ] = await Promise.all([
      User.findOne({
        email: normalizedEmail,
      }),

      User.findOne({
        matricNumber:
          normalizedMatricNumber,
      }),
    ]);

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }

    if (existingMatricNumber) {
      return res.status(409).json({
        success: false,
        message:
          "This matric number is already registered",
      });
    }

    const programme =
      await Programme.findOne({
        _id: data.programme,
        isActive: true,
      });

    if (!programme) {
      return res.status(400).json({
        success: false,
        message:
          "Programme not found or inactive",
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        data.password,
        12,
      );

    const user =
      await User.create({
        name: data.name,
        email: normalizedEmail,
        password: hashedPassword,
        role: "student",

        matricNumber:
          normalizedMatricNumber,

        programme:
          programme._id,

        academicSession:
          data.academicSession,

        level:
          data.level,

        isEmailVerified: true,
        isActive: true,
        isSuspended: false,
      });

    /**
     * =====================================================
     * AUDIT
     * =====================================================
     */

    await createAuditLog({
      req,
      actorId: req.user?.userId,
      actorRole: req.user?.role,
      action: "CREATE",
      module: "USERS",
      description:
        `Existing student ${user.name} (${user.matricNumber}) was added to the system.`,
      targetType: "User",
      resourceId: user._id.toString(),
      metadata: {
        studentId: user._id.toString(),
        name: user.name,
        email: user.email,
        matricNumber: user.matricNumber,
        programmeId: programme._id.toString(),
        programmeName: programme.name,
        academicSessionId: user.academicSession?.toString(),
        level: user.level,
        role: user.role,
      },
      status: "success",
    });

    try {
      await notifyAdmins({
        title:
          "New Student Added",

        message:
          `${user.name} (${user.matricNumber}) was added as an existing student.`,

        type: "user",

        link:
          "/dashboards/admin/students",
      });
    } catch (notificationError) {
      console.error(
        "Create existing student notification error:",
        notificationError,
      );
    }

    return res.status(201).json({
      success: true,

      message:
        "Existing student account created successfully",

      user: {
        id: user._id,

        name: user.name,

        email: user.email,

        role: user.role,

        matricNumber:
          user.matricNumber,

        programme:
          user.programme,

        academicSession:
          user.academicSession,

        level:
          user.level,

        isActive:
          user.isActive,

        isSuspended:
          user.isSuspended,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors:
          error.flatten().fieldErrors,
      });
    }

    if (isDuplicateKeyError(error)) {
      if (
        error.keyPattern?.matricNumber
      ) {
        return res.status(409).json({
          success: false,
          message:
            "This matric number is already registered",
        });
      }

      if (error.keyPattern?.email) {
        return res.status(409).json({
          success: false,
          message:
            "An account with this email already exists",
        });
      }

      return res.status(409).json({
        success: false,
        message:
          "A student account with these details already exists",
      });
    }

    console.error(
      "Create existing student error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create existing student account",
    });
  }
}

/**
 * =========================================================
 * GET USERS
 * =========================================================
 */

export async function getUsers(
  req: Request,
  res: Response,
) {
  try {
    const role =
      typeof req.query.role === "string"
        ? req.query.role.trim()
        : undefined;

    const users =
      await User.find(
        role ? { role } : {},
      )
        .select(userSelect)
        .populate(
          "programme",
          "name code",
        )
        .populate(
          "academicSession",
          "name",
        )
        .sort({
          name: 1,
        });

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error(
      "Get users error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve users",
    });
  }
}

/**
 * =========================================================
 * GET STUDENT BY ID
 * =========================================================
 */

export async function getUserById(
  req: Request,
  res: Response,
) {
  try {
    const id =
      getRouteId(req, res);

    if (!id) {
      return;
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid student ID",
      });
    }

    const user =
      await User.findById(id)
        .select(userSelect)
        .populate(
          "programme",
          "name code",
        )
        .populate(
          "academicSession",
          "name",
        );

    if (
      !user ||
      user.role !== "student"
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(
      "Get student by ID error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve student",
    });
  }
}

/**
 * =========================================================
 * GET STAFF USER BY ID
 * =========================================================
 *
 * GET /api/users/staff/:id
 *
 * Admin only.
 */

export async function getStaffUserById(
  req: Request,
  res: Response,
) {
  try {
    const id =
      getRouteId(req, res);

    if (!id) {
      return;
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid staff ID",
      });
    }

    const user =
      await User.findById(id).select(
        "name email role isActive isSuspended isEmailVerified createdAt updatedAt",
      );

    if (
      !user ||
      user.role === "student"
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Staff member not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(
      "Get staff user by ID error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve staff member",
    });
  }
}

/**
 * =========================================================
 * ACTIVATE STUDENT
 * =========================================================
 */

export async function activateUser(
  req: AuthRequest,
  res: Response,
) {
  try {
    const id =
      getRouteId(req, res);

    if (!id) {
      return;
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid student ID",
      });
    }

    const student =
      await User.findById(id);

    if (
      !student ||
      student.role !== "student"
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Student not found",
      });
    }

    if (
      student.isActive &&
      !student.isSuspended
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Student account is already active",
      });
    }

    student.isActive = true;
    student.isSuspended = false;

    await student.save();

    /**
     * =====================================================
     * AUDIT
     * =====================================================
     */

    await createAuditLog({
      req,
      actorId: req.user?.userId,
      actorRole: req.user?.role,
      action: "ACTIVATE",
      module: "USERS",
      description:
        `Student account for ${student.name} was activated.`,
      targetType: "User",
      resourceId: student._id.toString(),
      metadata: {
        studentId: student._id.toString(),
        studentName: student.name,
        studentEmail: student.email,
        matricNumber: student.matricNumber,
      },
      status: "success",
    });

    const updatedStudent =
      await User.findById(
        student._id,
      )
        .select(userSelect)
        .populate(
          "programme",
          "name code",
        )
        .populate(
          "academicSession",
          "name",
        );

    return res.status(200).json({
      success: true,

      message:
        "Student account activated successfully",

      user:
        updatedStudent,
    });
  } catch (error) {
    console.error(
      "Activate user error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to activate student account",
    });
  }
}

/**
 * =========================================================
 * DEACTIVATE STUDENT
 * =========================================================
 */

export async function deactivateUser(
  req: AuthRequest,
  res: Response,
) {
  try {
    const id =
      getRouteId(req, res);

    if (!id) {
      return;
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid student ID",
      });
    }

    const student =
      await User.findById(id);

    if (
      !student ||
      student.role !== "student"
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Student not found",
      });
    }

    if (!student.isActive) {
      return res.status(400).json({
        success: false,
        message:
          "Student account is already inactive",
      });
    }

    student.isActive = false;

    await student.save();

    /**
     * =====================================================
     * AUDIT
     * =====================================================
     */

    await createAuditLog({
      req,
      actorId: req.user?.userId,
      actorRole: req.user?.role,
      action: "DEACTIVATE",
      module: "USERS",
      description:
        `Student account for ${student.name} was deactivated.`,
      targetType: "User",
      resourceId: student._id.toString(),
      metadata: {
        studentId: student._id.toString(),
        studentName: student.name,
        studentEmail: student.email,
        matricNumber: student.matricNumber,
      },
      status: "success",
    });

    const updatedStudent =
      await User.findById(
        student._id,
      )
        .select(userSelect)
        .populate(
          "programme",
          "name code",
        )
        .populate(
          "academicSession",
          "name",
        );

    return res.status(200).json({
      success: true,

      message:
        "Student account deactivated successfully",

      user:
        updatedStudent,
    });
  } catch (error) {
    console.error(
      "Deactivate user error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to deactivate student account",
    });
  }
}

/**
 * =========================================================
 * CREATE STAFF USER
 * =========================================================
 */

const createStaffSchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(
        2,
        "Name must be at least 2 characters",
      )
      .max(
        100,
        "Name is too long",
      ),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email(
        "Enter a valid email address",
      ),

    password: z
      .string()
      .min(
        6,
        "Password must be at least 6 characters",
      )
      .max(
        100,
        "Password is too long",
      ),

    role: z.enum([
      "registrar",
      "finance",
      "lecturer",
      "admin",
    ]),
  });

export async function createStaffUser(
  req: AuthRequest,
  res: Response,
) {
  try {
    const data =
      createStaffSchema.parse(
        req.body,
      );

    const normalizedEmail =
      data.email
        .trim()
        .toLowerCase();

    const existing =
      await User.findOne({
        email: normalizedEmail,
      });

    if (existing) {
      return res.status(409).json({
        success: false,
        message:
          "A user with this email already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        data.password,
        12,
      );

    const user =
      await User.create({
        name: data.name,

        email:
          normalizedEmail,

        password:
          hashedPassword,

        role:
          data.role,

        isEmailVerified:
          true,

        isActive:
          true,

        isSuspended:
          false,
      });

    /**
     * =====================================================
     * AUDIT
     * =====================================================
     */

    await createAuditLog({
      req,
      actorId: req.user?.userId,
      actorRole: req.user?.role,
      action: "CREATE",
      module: "USERS",
      description:
        `Staff account for ${user.name} was created with the ${user.role} role.`,
      targetType: "User",
      resourceId: user._id.toString(),
      metadata: {
        staffId: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      status: "success",
    });

    return res.status(201).json({
      success: true,

      message:
        "Staff account created successfully",

      user: {
        id:
          user._id,

        name:
          user.name,

        email:
          user.email,

        role:
          user.role,

        isActive:
          user.isActive,

        isSuspended:
          user.isSuspended,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message:
          "Validation failed",
        errors:
          error.flatten().fieldErrors,
      });
    }

    if (isDuplicateKeyError(error)) {
      return res.status(409).json({
        success: false,
        message:
          "A user with this email already exists",
      });
    }

    console.error(
      "Create staff user error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create staff account",
    });
  }
}

/**
 * =========================================================
 * ACTIVATE STAFF
 * =========================================================
 *
 * PATCH /api/users/staff/:id/activate
 *
 * Admin only.
 */

export async function activateStaffUser(
  req: AuthRequest,
  res: Response,
) {
  try {
    const id =
      getRouteId(req, res);

    if (!id) {
      return;
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid staff ID",
      });
    }

    const staff =
      await User.findById(id);

    if (
      !staff ||
      staff.role === "student"
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Staff member not found",
      });
    }

    if (
      staff.isActive &&
      !staff.isSuspended
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Staff account is already active",
      });
    }

    staff.isActive = true;
    staff.isSuspended = false;

    await staff.save();

    /**
     * =====================================================
     * AUDIT
     * =====================================================
     */

    await createAuditLog({
      req,
      actorId: req.user?.userId,
      actorRole: req.user?.role,
      action: "ACTIVATE",
      module: "USERS",
      description:
        `Staff account for ${staff.name} was activated.`,
      targetType: "User",
      resourceId: staff._id.toString(),
      metadata: {
        staffId: staff._id.toString(),
        staffName: staff.name,
        staffEmail: staff.email,
        role: staff.role,
      },
      status: "success",
    });

    const updatedStaff =
      await User.findById(
        staff._id,
      ).select(
        "name email role isActive isSuspended isEmailVerified createdAt updatedAt",
      );

    return res.status(200).json({
      success: true,

      message:
        "Staff account activated successfully",

      user:
        updatedStaff,
    });
  } catch (error) {
    console.error(
      "Activate staff error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to activate staff account",
    });
  }
}

/**
 * =========================================================
 * DEACTIVATE STAFF
 * =========================================================
 *
 * PATCH /api/users/staff/:id/deactivate
 *
 * Admin only.
 */

export async function deactivateStaffUser(
  req: AuthRequest,
  res: Response,
) {
  try {
    const id =
      getRouteId(req, res);

    if (!id) {
      return;
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid staff ID",
      });
    }

    if (req.user?.userId === id) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot deactivate your own administrator account",
      });
    }

    const staff =
      await User.findById(id);

    if (
      !staff ||
      staff.role === "student"
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Staff member not found",
      });
    }

    if (!staff.isActive) {
      return res.status(400).json({
        success: false,
        message:
          "Staff account is already inactive",
      });
    }

    staff.isActive = false;

    await staff.save();

    /**
     * =====================================================
     * AUDIT
     * =====================================================
     */

    await createAuditLog({
      req,
      actorId: req.user?.userId,
      actorRole: req.user?.role,
      action: "DEACTIVATE",
      module: "USERS",
      description:
        `Staff account for ${staff.name} was deactivated.`,
      targetType: "User",
      resourceId: staff._id.toString(),
      metadata: {
        staffId: staff._id.toString(),
        staffName: staff.name,
        staffEmail: staff.email,
        role: staff.role,
      },
      status: "success",
    });

    const updatedStaff =
      await User.findById(
        staff._id,
      ).select(
        "name email role isActive isSuspended isEmailVerified createdAt updatedAt",
      );

    return res.status(200).json({
      success: true,

      message:
        "Staff account deactivated successfully",

      user:
        updatedStaff,
    });
  } catch (error) {
    console.error(
      "Deactivate staff error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to deactivate staff account",
    });
  }
}

/**
 * =========================================================
 * SUSPEND STAFF
 * =========================================================
 *
 * PATCH /api/users/staff/:id/suspend
 *
 * Admin only.
 */

export async function suspendStaffUser(
  req: AuthRequest,
  res: Response,
) {
  try {
    const id =
      getRouteId(req, res);

    if (!id) {
      return;
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid staff ID",
      });
    }

    if (req.user?.userId === id) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot suspend your own administrator account",
      });
    }

    const staff =
      await User.findById(id);

    if (
      !staff ||
      staff.role === "student"
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Staff member not found",
      });
    }

    if (staff.isSuspended) {
      return res.status(400).json({
        success: false,
        message:
          "Staff account is already suspended",
      });
    }

    staff.isSuspended = true;
    staff.isActive = false;

    await staff.save();

    /**
     * =====================================================
     * AUDIT
     * =====================================================
     */

    await createAuditLog({
      req,
      actorId: req.user?.userId,
      actorRole: req.user?.role,
      action: "SUSPEND",
      module: "USERS",
      description:
        `Staff account for ${staff.name} was suspended.`,
      targetType: "User",
      resourceId: staff._id.toString(),
      metadata: {
        staffId: staff._id.toString(),
        staffName: staff.name,
        staffEmail: staff.email,
        role: staff.role,
        isActive: staff.isActive,
        isSuspended: staff.isSuspended,
      },
      status: "success",
    });

    const updatedStaff =
      await User.findById(
        staff._id,
      ).select(
        "name email role isActive isSuspended isEmailVerified createdAt updatedAt",
      );

    return res.status(200).json({
      success: true,

      message:
        "Staff account suspended successfully",

      user:
        updatedStaff,
    });
  } catch (error) {
    console.error(
      "Suspend staff error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to suspend staff account",
    });
  }
}

/**
 * =========================================================
 * UNSUSPEND STAFF
 * =========================================================
 *
 * PATCH /api/users/staff/:id/unsuspend
 *
 * Admin only.
 */

export async function unsuspendStaffUser(
  req: AuthRequest,
  res: Response,
) {
  try {
    const id =
      getRouteId(req, res);

    if (!id) {
      return;
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid staff ID",
      });
    }

    const staff =
      await User.findById(id);

    if (
      !staff ||
      staff.role === "student"
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Staff member not found",
      });
    }

    if (!staff.isSuspended) {
      return res.status(400).json({
        success: false,
        message:
          "Staff account is not suspended",
      });
    }

    staff.isSuspended = false;
    staff.isActive = true;

    await staff.save();

    /**
     * =====================================================
     * AUDIT
     * =====================================================
     */

    await createAuditLog({
      req,
      actorId: req.user?.userId,
      actorRole: req.user?.role,
      action: "UNSUSPEND",
      module: "USERS",
      description:
        `Staff account for ${staff.name} was unsuspended and activated.`,
      targetType: "User",
      resourceId: staff._id.toString(),
      metadata: {
        staffId: staff._id.toString(),
        staffName: staff.name,
        staffEmail: staff.email,
        role: staff.role,
        isActive: staff.isActive,
        isSuspended: staff.isSuspended,
      },
      status: "success",
    });

    const updatedStaff =
      await User.findById(
        staff._id,
      ).select(
        "name email role isActive isSuspended isEmailVerified createdAt updatedAt",
      );

    return res.status(200).json({
      success: true,

      message:
        "Staff account unsuspended and activated successfully",

      user:
        updatedStaff,
    });
  } catch (error) {
    console.error(
      "Unsuspend staff error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to unsuspend staff account",
    });
  }
}

/**
 * =========================================================
 * GET CURRENT USER
 * =========================================================
 */

export async function getMe(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const user =
      await User.findById(
        req.user.userId,
      )
        .select(userSelect)
        .populate(
          "programme",
          "name code",
        )
        .populate(
          "academicSession",
          "name",
        );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    return res.status(200).json({
      success: true,

      user: {
        id:
          user._id,

        name:
          user.name,

        email:
          user.email,

        role:
          user.role,

        programme:
          user.programme,

        academicSession:
          user.academicSession,

        level:
          user.level,

        matricNumber:
          user.matricNumber,

        isActive:
          user.isActive,

        isSuspended:
          user.isSuspended,

        isEmailVerified:
          user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error(
      "Get current user error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve profile",
    });
  }
}

/**
 * =========================================================
 * GET STAFF USERS
 * =========================================================
 */

export async function getStaffUsers(
  req: Request,
  res: Response,
) {
  try {
    const users =
      await User.find({
        role: {
          $ne: "student",
        },
      })
        .select(
          "name email role isActive isSuspended isEmailVerified createdAt updatedAt",
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error(
      "Get staff users error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve staff accounts",
    });
  }
}

/**
 * =========================================================
 * UPDATE CURRENT USER PROFILE
 * =========================================================
 */

const updateProfileSchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(
        2,
        "Name must be at least 2 characters",
      )
      .max(
        100,
        "Name is too long",
      )
      .optional(),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email(
        "Enter a valid email address",
      )
      .optional(),
  });

export async function updateMyProfile(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const data =
      updateProfileSchema.parse(
        req.body,
      );

    if (
      data.name === undefined &&
      data.email === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "No profile changes were provided",
      });
    }

    const user =
      await User.findById(
        req.user.userId,
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    const changedFields: string[] = [];

    if (data.email !== undefined) {
      const normalizedEmail =
        data.email
          .trim()
          .toLowerCase();

      const existingEmail =
        await User.findOne({
          email:
            normalizedEmail,

          _id: {
            $ne: user._id,
          },
        });

      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message:
            "An account with this email already exists",
        });
      }

      user.email =
        normalizedEmail;

      user.isEmailVerified =
        false;

      changedFields.push(
        "email",
      );
    }

    if (data.name !== undefined) {
      user.name =
        data.name;

      changedFields.push(
        "name",
      );
    }

    await user.save();

    /**
     * =====================================================
     * AUDIT
     * =====================================================
     */

    await createAuditLog({
      req,
      actorId: user._id.toString(),
      actorName: user.name,
      actorEmail: user.email,
      actorRole: user.role,
      action: "UPDATE",
      module: "USERS",
      description:
        `${user.name} updated their profile.`,
      targetType: "User",
      resourceId: user._id.toString(),
      metadata: {
        changedFields,
      },
      status: "success",
    });

    const updatedUser =
      await User.findById(
        user._id,
      )
        .select(userSelect)
        .populate(
          "programme",
          "name code",
        )
        .populate(
          "academicSession",
          "name",
        );

    return res.status(200).json({
      success: true,

      message:
        "Profile updated successfully",

      user:
        updatedUser,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message:
          "Validation failed",
        errors:
          error.flatten().fieldErrors,
      });
    }

    if (isDuplicateKeyError(error)) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }

    console.error(
      "Update profile error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update profile",
    });
  }
}

/**
 * =========================================================
 * CHANGE PASSWORD
 * =========================================================
 */

const changePasswordSchema =
  z
    .object({
      currentPassword: z
        .string()
        .min(
          1,
          "Current password is required",
        ),

      newPassword: z
        .string()
        .min(
          8,
          "New password must be at least 8 characters",
        )
        .max(
          100,
          "New password is too long",
        ),

      confirmPassword: z
        .string()
        .min(
          1,
          "Please confirm your new password",
        ),
    })
    .refine(
      (data) =>
        data.newPassword ===
        data.confirmPassword,
      {
        message:
          "Passwords do not match",

        path: [
          "confirmPassword",
        ],
      },
    );

export async function changeMyPassword(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const data =
      changePasswordSchema.parse(
        req.body,
      );

    const user =
      await User.findById(
        req.user.userId,
      ).select(
        "+password",
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message:
          "This account does not have a password",
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        data.currentPassword,
        user.password,
      );

    if (!passwordMatches) {
      return res.status(400).json({
        success: false,
        message:
          "Current password is incorrect",
      });
    }

    const samePassword =
      await bcrypt.compare(
        data.newPassword,
        user.password,
      );

    if (samePassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be different from your current password",
      });
    }

    user.password =
      await bcrypt.hash(
        data.newPassword,
        12,
      );

    await user.save();

    /**
     * =====================================================
     * AUDIT
     * =====================================================
     *
     * IMPORTANT:
     * No password, password hash, or password
     * confirmation is stored in the audit log.
     */

    await createAuditLog({
      req,
      actorId: user._id.toString(),
      actorName: user.name,
      actorEmail: user.email,
      actorRole: user.role,
      action: "PASSWORD_RESET",
      module: "AUTH",
      description:
        `${user.name} changed their account password.`,
      targetType: "Auth",
      resourceId: user._id.toString(),
      metadata: {
        method: "change-password",
      },
      status: "success",
    });

    return res.status(200).json({
      success: true,

      message:
        "Password changed successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message:
          "Validation failed",
        errors:
          error.flatten().fieldErrors,
      });
    }

    console.error(
      "Change password error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to change password",
    });
  }
}