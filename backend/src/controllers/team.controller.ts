
import type { Request, Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";

import TeamMember from "../models/TeamMember.js";

import {
  deleteCloudinaryAsset,
  uploadBufferToCloudinary,
} from "../utils/uploadToCloudinary.js";

const MAX_IMAGE_SIZE = 4 * 1024 * 1024;
const MAX_CV_SIZE = 5 * 1024 * 1024;

const optionalBoolean = z
  .union([
    z.boolean(),
    z.enum(["true", "false"]),
  ])
  .transform((value) => value === true || value === "true");

const optionalEmail = z
  .union([
    z.string().trim().email("Enter a valid email address"),
    z.literal(""),
  ])
  .optional();

const teamMemberSchema = z.object({
  name: z.string().trim().min(1).max(120),
  badge: z.string().trim().min(1).max(80),
  title: z.string().trim().min(1).max(120),

  group: z.enum(["management", "staff"]),

  bio: z.string().trim().max(5000).optional(),
  department: z.string().trim().max(150).optional(),
  email: optionalEmail,
  phone: z.string().trim().max(40).optional(),

  order: z.coerce.number().int().min(0).optional(),
  isPublished: optionalBoolean.optional(),
});

const updateTeamMemberSchema = teamMemberSchema.partial();

type TeamMemberInput = z.infer<typeof teamMemberSchema>;

type UploadedTeamFiles = {
  image?: Express.Multer.File[];
  cv?: Express.Multer.File[];
};

function getUploadedFiles(req: Request): UploadedTeamFiles {
  const files = req.files;

  if (!files || Array.isArray(files)) {
    return {};
  }

  return files as UploadedTeamFiles;
}

function getRequestErrorMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues
      .map((issue) => issue.message)
      .join(", ");
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
}

function sendValidationError(
  res: Response,
  error: z.ZodError,
) {
  return res.status(400).json({
    success: false,
    message: "Please check the submitted team member information.",
    errors: error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    })),
  });
}

function validateFileSizes(
  image?: Express.Multer.File,
  cv?: Express.Multer.File,
): string | null {
  if (image && image.size > MAX_IMAGE_SIZE) {
    return "The team photograph must not exceed 4 MB.";
  }

  if (cv && cv.size > MAX_CV_SIZE) {
    return "The CV must not exceed 5 MB.";
  }

  return null;
}

async function deleteAssetSafely(
  publicId: string | undefined,
  resourceType: "image" | "raw",
): Promise<void> {
  if (!publicId) return;

  try {
    await deleteCloudinaryAsset(publicId, resourceType);
  } catch (error) {
    // Do not fail the main request because a cleanup operation failed.
    console.error(
      `[TEAM] Failed to delete ${resourceType} asset:`,
      publicId,
      error,
    );
  }
}

/* =========================================================
   PUBLIC TEAM MEMBERS
========================================================= */

export async function getPublicTeamMembers(
  req: Request,
  res: Response,
) {
  try {
    const querySchema = z.object({
      group: z.enum(["management", "staff"]).optional(),
    });

    const queryResult = querySchema.safeParse(req.query);

    if (!queryResult.success) {
      return sendValidationError(res, queryResult.error);
    }

    const filter: Record<string, unknown> = {
      isPublished: true,
    };

    if (queryResult.data.group) {
      filter.group = queryResult.data.group;
    }

    const members = await TeamMember.find(filter)
      .sort({ group: 1, order: 1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error) {
    console.error("[TEAM] Failed to fetch public team members:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load team members at this time.",
    });
  }
}

/* =========================================================
   ADMIN: ALL TEAM MEMBERS
========================================================= */

export async function getAllTeamMembers(
  _req: Request,
  res: Response,
) {
  try {
    const members = await TeamMember.find()
      .sort({ group: 1, order: 1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error) {
    console.error("[TEAM] Failed to fetch admin team members:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load team management data.",
    });
  }
}

/* =========================================================
   ADMIN: CREATE TEAM MEMBER
========================================================= */

export async function createTeamMember(
  req: Request,
  res: Response,
) {
  let uploadedImagePublicId: string | undefined;
  let uploadedCvPublicId: string | undefined;

  try {
    const files = getUploadedFiles(req);
    const image = files.image?.[0];
    const cv = files.cv?.[0];

    const validationError = validateFileSizes(image, cv);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const parsed = teamMemberSchema.safeParse(req.body);

    if (!parsed.success) {
      return sendValidationError(res, parsed.error);
    }

    if (!image) {
      return res.status(400).json({
        success: false,
        message: "A team member photograph is required.",
      });
    }

    const imageUpload = await uploadBufferToCloudinary(
      image.buffer,
      "itmt/team",
      "image",
    );

    uploadedImagePublicId = imageUpload.public_id;

    let cvUpload:
      | Awaited<ReturnType<typeof uploadBufferToCloudinary>>
      | undefined;

    if (cv) {
      cvUpload = await uploadBufferToCloudinary(
        cv.buffer,
        "itmt/team/cvs",
        "raw",
        cv.originalname,
      );

      uploadedCvPublicId = cvUpload.public_id;
    }

    const data: TeamMemberInput = parsed.data;

    const member = await TeamMember.create({
      ...data,
      imageUrl: imageUpload.secure_url,
      imagePublicId: imageUpload.public_id,

      ...(cvUpload
        ? {
            cvUrl: cvUpload.secure_url,
            cvPublicId: cvUpload.public_id,
            cvFileName: cv!.originalname,
          }
        : {}),
    });

    return res.status(201).json({
      success: true,
      message: "Team member created successfully.",
      data: member,
    });
  } catch (error) {
    await Promise.all([
      deleteAssetSafely(uploadedImagePublicId, "image"),
      deleteAssetSafely(uploadedCvPublicId, "raw"),
    ]);

    console.error("[TEAM] Failed to create team member:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create the team member.",
      error: getRequestErrorMessage(error),
    });
  }
}

/* =========================================================
   ADMIN: UPDATE TEAM MEMBER
========================================================= */

export async function updateTeamMember(
  req: Request,
  res: Response,
) {
  let uploadedImagePublicId: string | undefined;
  let uploadedCvPublicId: string | undefined;

  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team member ID.",
      });
    }

    const files = getUploadedFiles(req);
    const image = files.image?.[0];
    const cv = files.cv?.[0];

    const validationError = validateFileSizes(image, cv);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const parsed = updateTeamMemberSchema.safeParse(req.body);

    if (!parsed.success) {
      return sendValidationError(res, parsed.error);
    }

    const removeCvResult = z
      .union([z.boolean(), z.enum(["true", "false"])])
      .optional()
      .transform((value) => value === true || value === "true")
      .safeParse(req.body?.removeCv);

    if (!removeCvResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid CV removal value.",
      });
    }

    const removeCv = removeCvResult.data === true;

    const hasBodyChanges = Object.keys(parsed.data).length > 0;

    if (!hasBodyChanges && !image && !cv && !removeCv) {
      return res.status(400).json({
        success: false,
        message: "No changes were submitted.",
      });
    }

    const member = await TeamMember.findById(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Team member not found.",
      });
    }

    const oldImagePublicId = member.imagePublicId;
    const oldCvPublicId = member.cvPublicId;

    if (image) {
      const imageUpload = await uploadBufferToCloudinary(
        image.buffer,
        "itmt/team",
        "image",
      );

      uploadedImagePublicId = imageUpload.public_id;

      member.imageUrl = imageUpload.secure_url;
      member.imagePublicId = imageUpload.public_id;
    }

    if (cv) {
      const cvUpload = await uploadBufferToCloudinary(
        cv.buffer,
        "itmt/team/cvs",
        "raw",
        cv.originalname,
      );

      uploadedCvPublicId = cvUpload.public_id;

      member.cvUrl = cvUpload.secure_url;
      member.cvPublicId = cvUpload.public_id;
      member.cvFileName = cv.originalname;
    } else if (removeCv) {
      member.cvUrl = undefined;
      member.cvPublicId = undefined;
      member.cvFileName = undefined;
    }

    const data = parsed.data;

    if (data.name !== undefined) member.name = data.name;
    if (data.badge !== undefined) member.badge = data.badge;
    if (data.title !== undefined) member.title = data.title;
    if (data.group !== undefined) member.group = data.group;
    if (data.bio !== undefined) member.bio = data.bio;
    if (data.department !== undefined) member.department = data.department;
    if (data.email !== undefined) member.email = data.email;
    if (data.phone !== undefined) member.phone = data.phone;
    if (data.order !== undefined) member.order = data.order;
    if (data.isPublished !== undefined) {
      member.isPublished = data.isPublished;
    }

    await member.save();

    // Only remove the old assets after the updated document is saved.
    if (
      image &&
      oldImagePublicId &&
      oldImagePublicId !== member.imagePublicId
    ) {
      await deleteAssetSafely(oldImagePublicId, "image");
    }

    if (
      (cv || removeCv) &&
      oldCvPublicId &&
      oldCvPublicId !== member.cvPublicId
    ) {
      await deleteAssetSafely(oldCvPublicId, "raw");
    }

    return res.status(200).json({
      success: true,
      message: "Team member updated successfully.",
      data: member,
    });
  } catch (error) {
    await Promise.all([
      deleteAssetSafely(uploadedImagePublicId, "image"),
      deleteAssetSafely(uploadedCvPublicId, "raw"),
    ]);

    console.error("[TEAM] Failed to update team member:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update the team member.",
      error: getRequestErrorMessage(error),
    });
  }
}

/* =========================================================
   ADMIN: DELETE TEAM MEMBER
========================================================= */

export async function deleteTeamMember(
  req: Request,
  res: Response,
) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team member ID.",
      });
    }

    const member = await TeamMember.findByIdAndDelete(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Team member not found.",
      });
    }

    await Promise.all([
      deleteAssetSafely(member.imagePublicId, "image"),
      deleteAssetSafely(member.cvPublicId, "raw"),
    ]);

    return res.status(200).json({
      success: true,
      message: "Team member deleted successfully.",
    });
  } catch (error) {
    console.error("[TEAM] Failed to delete team member:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete the team member.",
    });
  }
}
