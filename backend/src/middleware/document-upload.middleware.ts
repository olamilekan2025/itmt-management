import multer from "multer";

/* =========================================================
   MEMORY STORAGE
========================================================= */

const storage = multer.memoryStorage();

/* =========================================================
   ALLOWED FILE TYPES
========================================================= */

const allowedMimeTypes = new Set([
  "application/pdf",

  "image/jpeg",
  "image/png",
  "image/webp",

  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

  "text/plain",
]);

/* =========================================================
   FILE FILTER
========================================================= */

function fileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback,
) {
  if (!allowedMimeTypes.has(file.mimetype)) {
    return callback(
      new Error(
        "Unsupported file type. Allowed files are PDF, images, Word, Excel, and text documents.",
      ),
    );
  }

  callback(null, true);
}

/* =========================================================
   MULTER UPLOAD
========================================================= */

export const documentUpload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },

  fileFilter,
});