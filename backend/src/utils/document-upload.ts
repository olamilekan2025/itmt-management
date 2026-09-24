import { Readable } from "node:stream";

import cloudinary from "./cloudinary.js";

import type {
  UploadApiErrorResponse,
  UploadApiResponse,
} from "cloudinary";

/* =========================================================
   TYPES
========================================================= */

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  resource_type: string;
}

/* =========================================================
   UPLOAD BUFFER TO CLOUDINARY
========================================================= */

export function uploadDocumentToCloudinary(
  buffer: Buffer,
  options: {
    folder: string;
    publicId?: string;
    resourceType?: "raw" | "image" | "video" | "auto";
  },
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream =
      cloudinary.uploader.upload_stream(
        {
          folder: options.folder,

          resource_type:
            options.resourceType ?? "raw",

          ...(options.publicId
            ? {
                public_id: options.publicId,
              }
            : {}),
        },

        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result) {
            reject(
              new Error(
                "Cloudinary upload completed without a result.",
              ),
            );

            return;
          }

          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            resource_type: result.resource_type,
          });
        },
      );

    Readable.from(buffer).pipe(uploadStream);
  });
}

/* =========================================================
   DELETE DOCUMENT FROM CLOUDINARY
========================================================= */

export async function deleteDocumentFromCloudinary(
  publicId: string,
  resourceType: string = "raw",
) {
  return cloudinary.uploader.destroy(
    publicId,
    {
      resource_type: resourceType,
    },
  );
}