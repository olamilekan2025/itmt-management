import type { Response } from "express";
import { Types } from "mongoose";
import { z } from "zod";

import StudentDocument from "../models/StudentDocument.js";
import User from "../models/User.js";

import type { AuthRequest } from "../middleware/auth.middleware.js";

import {
  uploadDocumentToCloudinary,
  deleteDocumentFromCloudinary,
} from "../utils/document-upload.js";

/* =========================================================
   TYPES
========================================================= */

const documentTypeSchema = z.enum([
  "admission_letter",
  "registration_slip",
  "fee_receipt",
  "result",
  "transcript",
  "certificate",
  "identity",
  "other",
]);

/* =========================================================
   CREATE SCHEMA
========================================================= */

const createDocumentSchema = z.object({
  student: z
    .string()
    .trim()
    .min(1, "Student is required"),

  title: z
    .string()
    .trim()
    .min(1, "Document title is required")
    .max(
      200,
      "Document title cannot exceed 200 characters",
    ),

  type: documentTypeSchema,

  description: z
    .string()
    .trim()
    .max(
      1000,
      "Description cannot exceed 1000 characters",
    )
    .optional()
    .or(z.literal("")),

  academicSession: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  semester: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  issuedAt: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  isAvailable: z
    .string()
    .optional()
    .transform((value) => {
      if (value === undefined || value === "") {
        return true;
      }

      return value !== "false";
    }),
});

/* =========================================================
   UPDATE SCHEMA
========================================================= */

const updateDocumentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Document title is required")
    .max(
      200,
      "Document title cannot exceed 200 characters",
    )
    .optional(),

  type: documentTypeSchema.optional(),

  description: z
    .string()
    .trim()
    .max(
      1000,
      "Description cannot exceed 1000 characters",
    )
    .optional()
    .or(z.literal("")),

  academicSession: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  semester: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  issuedAt: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  isAvailable: z
    .string()
    .optional()
    .transform((value) => {
      if (value === undefined) {
        return undefined;
      }

      return value !== "false";
    }),
});

/* =========================================================
   HELPERS
========================================================= */

function getRouteParam(
  value: string | string[] | undefined,
): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && value.length > 0) {
    return value[0];
  }

  return null;
}

function isValidObjectId(value: string): boolean {
  return Types.ObjectId.isValid(value);
}

function parseOptionalObjectId(
  value: string | undefined,
): Types.ObjectId | undefined {
  if (!value || value.trim() === "") {
    return undefined;
  }

  if (!Types.ObjectId.isValid(value)) {
    throw new Error("Invalid ObjectId");
  }

  return new Types.ObjectId(value);
}

/* =========================================================
   GET ALL DOCUMENTS
   ADMIN / REGISTRAR ONLY
========================================================= */

export async function getAllDocuments(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const type =
      typeof req.query.type === "string"
        ? req.query.type.trim()
        : "";

    const pageValue =
      typeof req.query.page === "string"
        ? Number(req.query.page)
        : 1;

    const limitValue =
      typeof req.query.limit === "string"
        ? Number(req.query.limit)
        : 20;

    const page =
      Number.isFinite(pageValue) && pageValue > 0
        ? Math.floor(pageValue)
        : 1;

    const limit =
      Number.isFinite(limitValue) &&
      limitValue > 0
        ? Math.min(
            Math.floor(limitValue),
            100,
          )
        : 20;

    /* =====================================================
       BUILD QUERY
    ===================================================== */

    const query: Record<string, unknown> = {};

    if (type) {
      const parsedType =
        documentTypeSchema.safeParse(type);

      if (!parsedType.success) {
        return res.status(400).json({
          success: false,
          message: "Invalid document type",
        });
      }

      query.type = parsedType.data;
    }

    /* =====================================================
       SEARCH STUDENTS
    ===================================================== */

    if (search) {
      const escapedSearch = search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
      );

      const matchingStudents =
        await User.find({
          role: "student",
          $or: [
            {
              name: {
                $regex: escapedSearch,
                $options: "i",
              },
            },
            {
              email: {
                $regex: escapedSearch,
                $options: "i",
              },
            },
            {
              matricNumber: {
                $regex: escapedSearch,
                $options: "i",
              },
            },
          ],
        })
          .select("_id")
          .lean();

      const studentIds =
        matchingStudents.map(
          (student) => student._id,
        );

      query.$or = [
        {
          title: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
        {
          fileName: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
        {
          student: {
            $in: studentIds,
          },
        },
      ];
    }

    /* =====================================================
       PAGINATION
    ===================================================== */

    const skip = (page - 1) * limit;

    const [
      documents,
      total,
    ] = await Promise.all([
      StudentDocument.find(query)
        .populate(
          "student",
          "name email matricNumber programme level",
        )
        .populate(
          "academicSession",
          "name startDate endDate",
        )
        .populate(
          "semester",
          "name code",
        )
        .populate(
          "uploadedBy",
          "name email role",
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      StudentDocument.countDocuments(query),
    ]);

    return res.json({
      success: true,
      documents,
      pagination: {
        page,
        limit,
        total,
        pages:
          total > 0
            ? Math.ceil(total / limit)
            : 0,
      },
    });
  } catch (error) {
    console.error(
      "Get all student documents error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load student documents",
    });
  }
}

/* =========================================================
   GET MY DOCUMENTS
   STUDENT ONLY
========================================================= */

export async function getMyDocuments(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const documents =
      await StudentDocument.find({
        student: req.user.userId,
        isAvailable: true,
      })
        .populate(
          "academicSession",
          "name startDate endDate",
        )
        .populate(
          "semester",
          "name code",
        )
        .populate(
          "uploadedBy",
          "name email role",
        )
        .sort({
          createdAt: -1,
        })
        .lean();

    return res.json({
      success: true,
      documents,
      count: documents.length,
    });
  } catch (error) {
    console.error(
      "Get student documents error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load your documents",
    });
  }
}

/* =========================================================
   GET SINGLE DOCUMENT
   STUDENT ONLY
========================================================= */

export async function getMyDocumentById(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const id = getRouteParam(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Document ID is required",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document ID",
      });
    }

    const document =
      await StudentDocument.findOne({
        _id: id,
        student: req.user.userId,
        isAvailable: true,
      })
        .populate(
          "academicSession",
          "name startDate endDate",
        )
        .populate(
          "semester",
          "name code",
        )
        .populate(
          "uploadedBy",
          "name email role",
        )
        .lean();

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    return res.json({
      success: true,
      document,
    });
  } catch (error) {
    console.error(
      "Get student document error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load document",
    });
  }
}

/* =========================================================
   CREATE / UPLOAD DOCUMENT
   ADMIN / REGISTRAR ONLY
========================================================= */

export async function createDocument(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "A document file is required",
      });
    }

    const parsed =
      createDocumentSchema.safeParse(
        req.body,
      );

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid document information",
        errors: parsed.error.flatten(),
      });
    }

    const data = parsed.data;

    /* =====================================================
       VALIDATE STUDENT
    ===================================================== */

    if (!Types.ObjectId.isValid(data.student)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    const student =
      await User.findOne({
        _id: data.student,
        role: "student",
        isActive: true,
      }).select(
        "_id name email matricNumber",
      );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Active student was not found",
      });
    }

    /* =====================================================
       VALIDATE OPTIONAL REFERENCES
    ===================================================== */

    let academicSession:
      | Types.ObjectId
      | undefined;

    let semester:
      | Types.ObjectId
      | undefined;

    try {
      academicSession =
        parseOptionalObjectId(
          data.academicSession,
        );

      semester =
        parseOptionalObjectId(
          data.semester,
        );
    } catch {
      return res.status(400).json({
        success: false,
        message:
          "Invalid academic session or semester ID",
      });
    }

    /* =====================================================
       VALIDATE ISSUED DATE
    ===================================================== */

    let issuedAt:
      | Date
      | undefined;

    if (data.issuedAt) {
      const parsedDate =
        new Date(data.issuedAt);

      if (
        Number.isNaN(
          parsedDate.getTime(),
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid issued date",
        });
      }

      issuedAt = parsedDate;
    }

    /* =====================================================
       CLOUDINARY UPLOAD
    ===================================================== */

    const folder =
      `itmt/student-documents/${student._id.toString()}`;

    const uploadResult =
      await uploadDocumentToCloudinary(
        req.file.buffer,
        {
          folder,
          resourceType: "raw",
        },
      );

    /* =====================================================
       CREATE DATABASE RECORD
    ===================================================== */

    try {
      const document =
        await StudentDocument.create({
          student: student._id,

          title: data.title,

          type: data.type,

          description:
            data.description || undefined,

          fileUrl:
            uploadResult.secure_url,

          fileName:
            req.file.originalname,

          mimeType:
            req.file.mimetype,

          fileSize:
            req.file.size,

          cloudinaryPublicId:
            uploadResult.public_id,

          cloudinaryResourceType:
            uploadResult.resource_type,

          academicSession,

          semester,

          issuedAt,

          uploadedBy:
            req.user.userId,

          isAvailable:
            data.isAvailable,
        });

      const populatedDocument =
        await StudentDocument.findById(
          document._id,
        )
          .populate(
            "student",
            "name email matricNumber programme level",
          )
          .populate(
            "academicSession",
            "name startDate endDate",
          )
          .populate(
            "semester",
            "name code",
          )
          .populate(
            "uploadedBy",
            "name email role",
          )
          .lean();

      return res.status(201).json({
        success: true,
        message:
          "Student document uploaded successfully",
        document:
          populatedDocument,
      });
    } catch (databaseError) {
      console.error(
        "Create document database error:",
        databaseError,
      );

      /* =================================================
         CLEAN UP CLOUDINARY IF DATABASE CREATION FAILS
      ================================================= */

      try {
        await deleteDocumentFromCloudinary(
          uploadResult.public_id,
          uploadResult.resource_type,
        );
      } catch (cleanupError) {
        console.error(
          "Cloudinary cleanup error:",
          cleanupError,
        );
      }

      throw databaseError;
    }
  } catch (error) {
    console.error(
      "Upload student document error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to upload student document",
    });
  }
}

/* =========================================================
   UPDATE DOCUMENT
   ADMIN / REGISTRAR ONLY
========================================================= */

export async function updateDocument(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const id =
      getRouteParam(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          "Document ID is required",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid document ID",
      });
    }

    const parsed =
      updateDocumentSchema.safeParse(
        req.body,
      );

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid document information",
        errors:
          parsed.error.flatten(),
      });
    }

    const existingDocument =
      await StudentDocument.findById(id);

    if (!existingDocument) {
      return res.status(404).json({
        success: false,
        message:
          "Document not found",
      });
    }

    const data = parsed.data;

    const update:
      Record<string, unknown> = {};

    if (data.title !== undefined) {
      update.title = data.title;
    }

    if (data.type !== undefined) {
      update.type = data.type;
    }

    if (
      data.description !==
      undefined
    ) {
      update.description =
        data.description ||
        undefined;
    }

    if (
      data.academicSession !==
      undefined
    ) {
      if (
        data.academicSession &&
        !Types.ObjectId.isValid(
          data.academicSession,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid academic session ID",
        });
      }

      update.academicSession =
        data.academicSession
          ? new Types.ObjectId(
              data.academicSession,
            )
          : undefined;
    }

    if (
      data.semester !==
      undefined
    ) {
      if (
        data.semester &&
        !Types.ObjectId.isValid(
          data.semester,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid semester ID",
        });
      }

      update.semester =
        data.semester
          ? new Types.ObjectId(
              data.semester,
            )
          : undefined;
    }

    if (
      data.issuedAt !==
      undefined
    ) {
      if (data.issuedAt) {
        const parsedDate =
          new Date(
            data.issuedAt,
          );

        if (
          Number.isNaN(
            parsedDate.getTime(),
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid issued date",
          });
        }

        update.issuedAt =
          parsedDate;
      } else {
        update.issuedAt =
          undefined;
      }
    }

    if (
      data.isAvailable !==
      undefined
    ) {
      update.isAvailable =
        data.isAvailable;
    }

    const document =
      await StudentDocument.findByIdAndUpdate(
        id,
        {
          $set: update,
        },
        {
          new: true,
          runValidators: true,
        },
      )
        .populate(
          "student",
          "name email matricNumber programme level",
        )
        .populate(
          "academicSession",
          "name startDate endDate",
        )
        .populate(
          "semester",
          "name code",
        )
        .populate(
          "uploadedBy",
          "name email role",
        )
        .lean();

    if (!document) {
      return res.status(404).json({
        success: false,
        message:
          "Document not found",
      });
    }

    return res.json({
      success: true,
      message:
        "Document updated successfully",
      document,
    });
  } catch (error) {
    console.error(
      "Update student document error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update document",
    });
  }
}

/* =========================================================
   DELETE DOCUMENT
   ADMIN / REGISTRAR ONLY
========================================================= */

export async function deleteDocument(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const id =
      getRouteParam(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          "Document ID is required",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid document ID",
      });
    }

    const document =
      await StudentDocument.findById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message:
          "Document not found",
      });
    }

    /* =====================================================
       DELETE CLOUDINARY FILE FIRST
    ===================================================== */

    try {
      await deleteDocumentFromCloudinary(
        document.cloudinaryPublicId,
        document.cloudinaryResourceType,
      );
    } catch (cloudinaryError) {
      console.error(
        "Cloudinary document deletion error:",
        cloudinaryError,
      );

      return res.status(500).json({
        success: false,
        message:
          "The document could not be removed from file storage",
      });
    }

    /* =====================================================
       DELETE DATABASE RECORD
    ===================================================== */

    await StudentDocument.findByIdAndDelete(
      id,
    );

    return res.json({
      success: true,
      message:
        "Document deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete student document error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete document",
    });
  }
}