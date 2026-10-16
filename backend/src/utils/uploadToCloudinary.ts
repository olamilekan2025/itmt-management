
import { extname } from "node:path";
import cloudinary from "../config/cloudinary.js";

export type CloudinaryResourceType = "image" | "raw";

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  resource_type: string;
  format?: string;
}

export async function uploadBufferToCloudinary(
  buffer: Buffer,
  folder: string,
  resourceType: CloudinaryResourceType = "image",
  originalFileName?: string,
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const options: Record<string, unknown> = {
      folder,
      resource_type: resourceType,
    };

    if (resourceType === "raw" && originalFileName) {
      const extension = extname(originalFileName).toLowerCase();

      const baseName = originalFileName
        .replace(/\.[^/.]+$/, "")
        .normalize("NFKD")
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);

      const safeBaseName = baseName || "team-member-cv";

      // Raw Cloudinary assets should retain the file extension
      // in their public ID for reliable document delivery.
      options.public_id =
        `${Date.now()}-${safeBaseName}${extension}`;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error("Cloudinary upload failed"));
          return;
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          resource_type: result.resource_type,
          format: result.format,
        });
      },
    );

    uploadStream.end(buffer);
  });
}

/**
 * Deletes a Cloudinary asset using its resource type.
 * Defaults to image to preserve existing callers.
 */
export async function deleteCloudinaryAsset(
  publicId?: string,
  resourceType: CloudinaryResourceType = "image",
): Promise<void> {
  if (!publicId) return;

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    invalidate: true,
  });

  if (
    result.result !== "ok" &&
    result.result !== "not found"
  ) {
    throw new Error(
      `Cloudinary ${resourceType} deletion failed: ${result.result}`,
    );
  }
}

/**
 * Backward-compatible helper for existing image uploads.
 */
export async function deleteCloudinaryImage(
  publicId?: string,
): Promise<void> {
  return deleteCloudinaryAsset(publicId, "image");
}
