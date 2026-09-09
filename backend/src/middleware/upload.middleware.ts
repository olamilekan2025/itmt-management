import multer from "multer";

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

  if (
    allowedTypes.includes(
      file.mimetype,
    )
  ) {
    cb(null, true);

    return;
  }

  cb(
    new Error(
      "Only JPEG, PNG, or WEBP images are allowed",
    ),
  );
}

/* =========================================================
   ADMISSION DOCUMENT FILTER
========================================================= */

function admissionDocumentFileFilter(
  _req: any,

  file: Express.Multer.File,

  cb: multer.FileFilterCallback,
) {
  /* -------------------------------------------------------
     PASSPORT PHOTOGRAPH
     
     Passport photograph:
     JPEG
     PNG
     WEBP

     PDF is NOT allowed.
  ------------------------------------------------------- */

  if (
    file.fieldname ===
    "passportPhoto"
  ) {
    const allowedPassportTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      allowedPassportTypes.includes(
        file.mimetype,
      )
    ) {
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

  /* -------------------------------------------------------
     SUPPORTING DOCUMENTS
     
     Supporting documents:
     JPEG
     PNG
     WEBP
     PDF
  ------------------------------------------------------- */

  const allowedDocumentTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];

  if (
    allowedDocumentTypes.includes(
      file.mimetype,
    )
  ) {
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
   PASSPORT PHOTO UPLOAD
========================================================= */

export const uploadPassportPhoto =
  multer({
    storage:
      multer.memoryStorage(),

    fileFilter,

    limits: {
      fileSize:
        2 * 1024 * 1024,
    },
  }).single(
    "passportPhoto",
  );

/* =========================================================
   HERO IMAGE UPLOAD
========================================================= */

export const uploadHeroImage =
  multer({
    storage:
      multer.memoryStorage(),

    fileFilter,

    limits: {
      fileSize:
        4 * 1024 * 1024,
    },
  }).single(
    "image",
  );

/* =========================================================
   ADMISSION DOCUMENT UPLOAD
========================================================= */

/*
 * IMPORTANT:
 *
 * This uses multer.fields().
 *
 * Therefore the controller MUST use:
 *
 *     req.files
 *
 * and NOT:
 *
 *     req.file
 */

export const uploadAdmissionDocuments =
  multer({
    storage:
      multer.memoryStorage(),

    fileFilter:
      admissionDocumentFileFilter,

    limits: {
      fileSize:
        5 * 1024 * 1024,
    },
  }).fields([
    /* -----------------------------------------------------
       PASSPORT
    ----------------------------------------------------- */

    {
      name:
        "passportPhoto",

      maxCount: 1,
    },

    /* -----------------------------------------------------
       PRIMARY SCHOOL
    ----------------------------------------------------- */

    {
      name:
        "primarySchoolCertificate",

      maxCount: 1,
    },

    /* -----------------------------------------------------
       SECONDARY SCHOOL
    ----------------------------------------------------- */

    {
      name:
        "secondarySchoolCertificate",

      maxCount: 1,
    },

    /* -----------------------------------------------------
       BIRTH CERTIFICATE
    ----------------------------------------------------- */

    {
      name:
        "birthCertificate",

      maxCount: 1,
    },

    /* -----------------------------------------------------
       WAEC / NECO
    ----------------------------------------------------- */

    {
      name:
        "waecNecoResult",

      maxCount: 1,
    },

    /* -----------------------------------------------------
       TESTIMONIAL
    ----------------------------------------------------- */

    {
      name:
        "testimonial",

      maxCount: 1,
    },

    /* -----------------------------------------------------
       STATE OF ORIGIN
    ----------------------------------------------------- */

    {
      name:
        "stateOfOriginCertificate",

      maxCount: 1,
    },
  ]);