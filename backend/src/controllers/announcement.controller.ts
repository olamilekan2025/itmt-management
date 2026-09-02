import type {
  Request,
  Response,
} from "express";

import { z } from "zod";

import type { AuthRequest } from "../middleware/auth.middleware.js";

import Announcement from "../models/Announcement.js";

import { notifyAdmins } from "../services/notification.service.js";

/* =========================================================
   VALIDATION
========================================================= */

const objectId = z
  .string()
  .regex(
    /^[a-f\d]{24}$/i,
    "Invalid ID",
  );

const createAnnouncementSchema =
  z.object({
    title: z
      .string()
      .trim()
      .min(
        3,
        "Title must be at least 3 characters",
      )
      .max(
        200,
        "Title cannot exceed 200 characters",
      ),

    content: z
      .string()
      .trim()
      .min(
        1,
        "Announcement content is required",
      )
      .max(
        10000,
        "Content cannot exceed 10000 characters",
      ),

    audience: z
      .enum([
        "everyone",
        "students",
        "lecturers",
        "staff",
      ])
      .default("everyone"),

    status: z
      .enum([
        "draft",
        "published",
        "archived",
      ])
      .default("draft"),
  });

const updateAnnouncementSchema =
  z.object({
    title: z
      .string()
      .trim()
      .min(
        3,
        "Title must be at least 3 characters",
      )
      .max(
        200,
        "Title cannot exceed 200 characters",
      )
      .optional(),

    content: z
      .string()
      .trim()
      .min(
        1,
        "Announcement content is required",
      )
      .max(
        10000,
        "Content cannot exceed 10000 characters",
      )
      .optional(),

    audience: z
      .enum([
        "everyone",
        "students",
        "lecturers",
        "staff",
      ])
      .optional(),

    status: z
      .enum([
        "draft",
        "published",
        "archived",
      ])
      .optional(),
  });

const announcementQuerySchema =
  z.object({
    status: z
      .enum([
        "draft",
        "published",
        "archived",
      ])
      .optional(),

    audience: z
      .enum([
        "everyone",
        "students",
        "lecturers",
        "staff",
      ])
      .optional(),

    search: z
      .string()
      .trim()
      .optional(),
  });

/* =========================================================
   GET ALL ANNOUNCEMENTS
   ADMIN / REGISTRAR
========================================================= */

export async function getAllAnnouncements(
  req: Request,
  res: Response,
) {
  try {
    const parsed =
      announcementQuerySchema.safeParse({
        status:
          typeof req.query.status ===
          "string"
            ? req.query.status
            : undefined,

        audience:
          typeof req.query.audience ===
          "string"
            ? req.query.audience
            : undefined,

        search:
          typeof req.query.search ===
          "string"
            ? req.query.search
            : undefined,
      });

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid announcement filters",
        errors:
          parsed.error.flatten()
            .fieldErrors,
      });
    }

    const {
      status,
      audience,
      search,
    } = parsed.data;

    const filter: Record<
      string,
      unknown
    > = {};

    if (status) {
      filter.status = status;
    }

    if (audience) {
      filter.audience = audience;
    }

    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          content: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const announcements =
      await Announcement.find(filter)
        .populate(
          "createdBy",
          "name email role",
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      announcements,
    });
  } catch (error) {
    console.error(
      "Get announcements error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve announcements",
    });
  }
}

/* =========================================================
   GET SINGLE ANNOUNCEMENT
========================================================= */

export async function getAnnouncementById(
  req: Request,
  res: Response,
) {
  try {
    const { id } = req.params;

    if (!objectId.safeParse(id).success) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid announcement ID",
      });
    }

    const announcement =
      await Announcement.findById(id).populate(
        "createdBy",
        "name email role",
      );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message:
          "Announcement not found",
      });
    }

    return res.status(200).json({
      success: true,
      announcement,
    });
  } catch (error) {
    console.error(
      "Get announcement error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve announcement",
    });
  }
}

/* =========================================================
   CREATE ANNOUNCEMENT
   ADMIN
========================================================= */

export async function createAnnouncement(
  req: AuthRequest,
  res: Response,
) {
  try {
    const data =
      createAnnouncementSchema.parse(
        req.body,
      );

    const announcement =
      await Announcement.create({
        ...data,
        createdBy: req.user!.userId,

        publishedAt:
          data.status === "published"
            ? new Date()
            : undefined,
      });

    await announcement.populate(
      "createdBy",
      "name email role",
    );

    /*
     * Notify administrators only when
     * an announcement is published immediately.
     */

    if (data.status === "published") {
      await notifyAdmins({
        title: "New Announcement Published",
        message: `"${data.title}" has been published.`,
        type: "announcement",
        link:
          "/dashboards/admin/announcements",
      });
    }

    return res.status(201).json({
      success: true,
      message:
        "Announcement created successfully",
      announcement,
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

    console.error(
      "Create announcement error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create announcement",
    });
  }
}

/* =========================================================
   UPDATE ANNOUNCEMENT
   ADMIN
========================================================= */

export async function updateAnnouncement(
  req: AuthRequest,
  res: Response,
) {
  try {
    const { id } = req.params;

    if (!objectId.safeParse(id).success) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid announcement ID",
      });
    }

    const data =
      updateAnnouncementSchema.parse(
        req.body,
      );

    const existing =
      await Announcement.findById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message:
          "Announcement not found",
      });
    }

    const wasPublished =
      existing.status ===
      "published";

    const willBePublished =
      data.status ===
        "published" ||
      (!data.status &&
        wasPublished);

    const updateData: Record<
      string,
      unknown
    > = {
      ...data,
    };

    /*
     * Set publishedAt when an announcement
     * becomes published for the first time.
     */

    if (
      data.status === "published" &&
      !existing.publishedAt
    ) {
      updateData.publishedAt =
        new Date();
    }

    /*
     * If an announcement is moved back
     * to draft, remove publishedAt.
     */

    if (
      data.status === "draft"
    ) {
      updateData.publishedAt =
        undefined;
    }

    const announcement =
      await Announcement.findByIdAndUpdate(
        id,
        updateData,
        {
          new: true,
          runValidators: true,
        },
      ).populate(
        "createdBy",
        "name email role",
      );

    if (
      !wasPublished &&
      willBePublished
    ) {
      await notifyAdmins({
        title:
          "Announcement Published",
        message: `"${announcement!.title}" has been published.`,
        type: "announcement",
        link:
          "/dashboards/admin/announcements",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Announcement updated successfully",
      announcement,
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

    console.error(
      "Update announcement error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update announcement",
    });
  }
}

/* =========================================================
   PUBLISH ANNOUNCEMENT
   ADMIN
========================================================= */

export async function publishAnnouncement(
  req: AuthRequest,
  res: Response,
) {
  try {
    const { id } = req.params;

    if (!objectId.safeParse(id).success) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid announcement ID",
      });
    }

    const announcement =
      await Announcement.findById(id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message:
          "Announcement not found",
      });
    }

    if (
      announcement.status ===
      "published"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Announcement is already published",
      });
    }

    announcement.status =
      "published";

    announcement.publishedAt =
      new Date();

    await announcement.save();

    await announcement.populate(
      "createdBy",
      "name email role",
    );

    await notifyAdmins({
      title:
        "Announcement Published",
      message: `"${announcement.title}" has been published.`,
      type: "announcement",
      link:
        "/dashboards/admin/announcements",
    });

    return res.status(200).json({
      success: true,
      message:
        "Announcement published successfully",
      announcement,
    });
  } catch (error) {
    console.error(
      "Publish announcement error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to publish announcement",
    });
  }
}

/* =========================================================
   ARCHIVE ANNOUNCEMENT
   ADMIN
========================================================= */

export async function archiveAnnouncement(
  req: AuthRequest,
  res: Response,
) {
  try {
    const { id } = req.params;

    if (!objectId.safeParse(id).success) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid announcement ID",
      });
    }

    const announcement =
      await Announcement.findByIdAndUpdate(
        id,
        {
          status: "archived",
        },
        {
          new: true,
          runValidators: true,
        },
      ).populate(
        "createdBy",
        "name email role",
      );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message:
          "Announcement not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Announcement archived successfully",
      announcement,
    });
  } catch (error) {
    console.error(
      "Archive announcement error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to archive announcement",
    });
  }
}

/* =========================================================
   DELETE ANNOUNCEMENT
   ADMIN
========================================================= */

export async function deleteAnnouncement(
  req: AuthRequest,
  res: Response,
) {
  try {
    const { id } = req.params;

    if (!objectId.safeParse(id).success) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid announcement ID",
      });
    }

    const announcement =
      await Announcement.findByIdAndDelete(
        id,
      );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message:
          "Announcement not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Announcement deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete announcement error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete announcement",
    });
  }
}