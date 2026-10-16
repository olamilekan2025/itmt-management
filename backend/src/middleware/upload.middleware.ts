
import multer from "multer";
import { extname } from "node:path";

/* =========================================================
   GENERAL IMAGE FILTER
========================================================= */

function fileFilter(
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(new Error("Only JPEG, PNG, or WEBP images are allowed"));
}

/* =========================================================
   ADMISSION DOCUMENT FILTER
========================================================= */

function admissionDocumentFileFilter(
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) {
  if (file.fieldname === "passportPhoto") {
    const allowedPassportTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (allowedPassportTypes.includes(file.mimetype)) {
      cb(null, true);
      return;
    }

    cb(
      new Error(
        "Passport photograph must be a JPEG, PNG, or WEBP image",
      ),
    );
    return;
  }

  const allowedDocumentTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];

  if (allowedDocumentTypes.includes(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(
    new Error(
      "Supporting documents must be JPEG, PNG, WEBP, or PDF files",
    ),
  );
}

/* =========================================================
   TEAM MEMBER FILE FILTER
========================================================= */

function teamMemberFileFilter(
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) {
  if (file.fieldname === "image") {
    const allowedImageTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
      return;
    }

    cb(
      new Error(
        "Team photographs must be JPEG, PNG, or WEBP images",
      ),
    );
    return;
  }

  if (file.fieldname === "cv") {
    const allowedCvTypes: Record<string, string[]> = {
      ".pdf": ["application/pdf"],
      ".doc": ["application/msword"],
      ".docx": [
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
    };

    const extension = extname(file.originalname).toLowerCase();
    const allowedMimeTypes = allowedCvTypes[extension];

    if (
      allowedMimeTypes &&
      allowedMimeTypes.includes(file.mimetype)
    ) {
      cb(null, true);
      return;
    }

    cb(
      new Error(
        "CV must be a valid PDF, DOC, or DOCX file",
      ),
    );
    return;
  }

  cb(new Error("Unexpected team member upload field"));
}

/* =========================================================
   PASSPORT PHOTO UPLOAD
========================================================= */

export const uploadPassportPhoto = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
}).single("passportPhoto");

/* =========================================================
   HERO IMAGE UPLOAD
========================================================= */

export const uploadHeroImage = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 4 * 1024 * 1024,
  },
}).single("image");

/* =========================================================
   TEAM MEMBER UPLOAD
========================================================= */

/**
 * Multipart fields:
 * - image: one profile photograph, maximum 4 MB
 * - cv: one PDF, DOC, or DOCX CV, maximum 5 MB
 *
 * Multer applies fileSize per file.
 * Controllers must read req.files, not req.file.
 */
export const uploadTeamMemberFiles = multer({
  storage: multer.memoryStorage(),
  fileFilter: teamMemberFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 2,
    fields: 20,
  },
}).fields([
  {
    name: "image",
    maxCount: 1,
  },
  {
    name: "cv",
    maxCount: 1,
  },
]);

/* =========================================================
   ADMISSION DOCUMENT UPLOAD
========================================================= */

export const uploadAdmissionDocuments = multer({
  storage: multer.memoryStorage(),
  fileFilter: admissionDocumentFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).fields([
  { name: "passportPhoto", maxCount: 1 },
  { name: "primarySchoolCertificate", maxCount: 1 },
  { name: "secondarySchoolCertificate", maxCount: 1 },
  { name: "birthCertificate", maxCount: 1 },
  { name: "waecNecoResult", maxCount: 1 },
  { name: "testimonial", maxCount: 1 },
  { name: "stateOfOriginCertificate", maxCount: 1 },
]);
