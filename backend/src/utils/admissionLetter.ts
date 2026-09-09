import PDFDocument from "pdfkit";

import { uploadBufferToCloudinary } from "./uploadToCloudinary.js";

/* =========================================================
   TYPES
========================================================= */

export interface AdmissionLetterInput {
  applicantName: string;
  applicationNumber: string;
  matricNumber: string;

  programmeName?: string;
  departmentName?: string;
  academicSessionName?: string;

  admissionDate?: Date;
}

export interface AdmissionLetterResult {
  buffer: Buffer;
  url: string;
  publicId: string;
  reference: string;
  generatedAt: Date;
}

/* =========================================================
   CONSTANTS
========================================================= */

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;

const MARGIN_LEFT = 60;
const MARGIN_RIGHT = 60;

const BRAND_NAVY = "#0f172a";
const BRAND_BLUE = "#1d4ed8";
const BRAND_GOLD = "#c9a227";
const TEXT_DARK = "#172033";
const TEXT_MUTED = "#64748b";
const BORDER = "#dbe2ea";
const LIGHT_BLUE = "#eff6ff";

/* =========================================================
   HELPERS
========================================================= */

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getLetterReference(
  applicationNumber: string,
  date: Date,
): string {
  const year = date.getFullYear();

  /*
   * Try to reuse the application sequence.
   *
   * Example:
   * ITMT/APP/2026/000002
   *
   * becomes:
   * ITMT/ADM/2026/000002
   */
  const match = applicationNumber.match(/(\d{6})$/);

  const sequence = match?.[1] ?? "000001";

  return `ITMT/ADM/${year}/${sequence}`;
}

function safeText(value?: string): string {
  return value?.trim() || "Not specified";
}

/* =========================================================
   PDF BUFFER GENERATOR
========================================================= */

async function createAdmissionLetterPdf(
  input: AdmissionLetterInput,
  reference: string,
  generatedAt: Date,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 0,
        info: {
          Title: "ITMT Academy Admission Letter",
          Author: "ITMT Academy",
          Subject: "Official Admission Letter",
          Keywords:
            "ITMT Academy, Admission, Admission Letter",
        },
      });

      const chunks: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });

      doc.on("end", () => {
        resolve(Buffer.concat(chunks));
      });

      doc.on("error", reject);

      /* =====================================================
         PAGE BACKGROUND
      ===================================================== */

      doc
        .rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT)
        .fill("#ffffff");

      /* =====================================================
         TOP BRAND BAR
      ===================================================== */

      doc
        .rect(0, 0, PAGE_WIDTH, 10)
        .fill(BRAND_BLUE);

      doc
        .rect(0, 10, PAGE_WIDTH, 5)
        .fill(BRAND_GOLD);

      /* =====================================================
         HEADER
      ===================================================== */

      doc
        .fillColor(BRAND_NAVY)
        .font("Helvetica-Bold")
        .fontSize(24)
        .text(
          "ITMT ACADEMY",
          MARGIN_LEFT,
          48,
          {
            width:
              PAGE_WIDTH -
              MARGIN_LEFT -
              MARGIN_RIGHT,
            align: "center",
          },
        );

      doc
        .fillColor(BRAND_BLUE)
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(
          "INSTITUTE OF TECHNOLOGY, MANAGEMENT & TRAINING",
          MARGIN_LEFT,
          80,
          {
            width:
              PAGE_WIDTH -
              MARGIN_LEFT -
              MARGIN_RIGHT,
            align: "center",
            characterSpacing: 0.7,
          },
        );

      doc
        .fillColor(TEXT_MUTED)
        .font("Helvetica")
        .fontSize(8.5)
        .text(
          "Official Admission & Academic Services",
          MARGIN_LEFT,
          98,
          {
            width:
              PAGE_WIDTH -
              MARGIN_LEFT -
              MARGIN_RIGHT,
            align: "center",
          },
        );

      /* =====================================================
         GOLD DIVIDER
      ===================================================== */

      doc
        .moveTo(MARGIN_LEFT, 122)
        .lineTo(
          PAGE_WIDTH - MARGIN_RIGHT,
          122,
        )
        .lineWidth(1.5)
        .strokeColor(BRAND_GOLD)
        .stroke();

      /* =====================================================
         LETTER META
      ===================================================== */

      doc
        .fillColor(TEXT_MUTED)
        .font("Helvetica")
        .fontSize(9)
        .text(
          `Reference: ${reference}`,
          MARGIN_LEFT,
          143,
        );

      doc
        .fillColor(TEXT_MUTED)
        .font("Helvetica")
        .fontSize(9)
        .text(
          `Date: ${formatDate(generatedAt)}`,
          PAGE_WIDTH - 220,
          143,
          {
            width: 160,
            align: "right",
          },
        );

      /* =====================================================
         TITLE
      ===================================================== */

      doc
        .fillColor(BRAND_NAVY)
        .font("Helvetica-Bold")
        .fontSize(18)
        .text(
          "LETTER OF ADMISSION",
          MARGIN_LEFT,
          185,
          {
            width:
              PAGE_WIDTH -
              MARGIN_LEFT -
              MARGIN_RIGHT,
            align: "center",
          },
        );

      doc
        .fillColor(BRAND_BLUE)
        .font("Helvetica-Bold")
        .fontSize(9)
        .text(
          "OFFICIAL ADMISSION NOTIFICATION",
          MARGIN_LEFT,
          211,
          {
            width:
              PAGE_WIDTH -
              MARGIN_LEFT -
              MARGIN_RIGHT,
            align: "center",
            characterSpacing: 1,
          },
        );

      /* =====================================================
         STUDENT DETAILS CARD
      ===================================================== */

      const cardX = MARGIN_LEFT;
      const cardY = 245;
      const cardWidth =
        PAGE_WIDTH -
        MARGIN_LEFT -
        MARGIN_RIGHT;
      const cardHeight = 145;

      doc
        .roundedRect(
          cardX,
          cardY,
          cardWidth,
          cardHeight,
          10,
        )
        .fillAndStroke(
          LIGHT_BLUE,
          BORDER,
        );

      doc
        .fillColor(BRAND_BLUE)
        .font("Helvetica-Bold")
        .fontSize(9)
        .text(
          "ADMISSION DETAILS",
          cardX + 18,
          cardY + 17,
        );

      /* Applicant */

      doc
        .fillColor(TEXT_MUTED)
        .font("Helvetica")
        .fontSize(8)
        .text(
          "APPLICANT",
          cardX + 18,
          cardY + 43,
        );

      doc
        .fillColor(TEXT_DARK)
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(
          safeText(input.applicantName),
          cardX + 18,
          cardY + 56,
        );

      /* Application Number */

      doc
        .fillColor(TEXT_MUTED)
        .font("Helvetica")
        .fontSize(8)
        .text(
          "APPLICATION NUMBER",
          cardX + 18,
          cardY + 82,
        );

      doc
        .fillColor(TEXT_DARK)
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(
          input.applicationNumber,
          cardX + 18,
          cardY + 95,
        );

      /* Matric Number */

      doc
        .fillColor(TEXT_MUTED)
        .font("Helvetica")
        .fontSize(8)
        .text(
          "MATRICULATION NUMBER",
          cardX + 285,
          cardY + 43,
        );

      doc
        .fillColor(BRAND_BLUE)
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(
          input.matricNumber,
          cardX + 285,
          cardY + 56,
        );

      /* Academic Session */

      doc
        .fillColor(TEXT_MUTED)
        .font("Helvetica")
        .fontSize(8)
        .text(
          "ACADEMIC SESSION",
          cardX + 285,
          cardY + 82,
        );

      doc
        .fillColor(TEXT_DARK)
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(
          safeText(
            input.academicSessionName,
          ),
          cardX + 285,
          cardY + 95,
        );

      /* =====================================================
         BODY
      ===================================================== */

      let bodyY = 425;

      doc
        .fillColor(TEXT_DARK)
        .font("Helvetica")
        .fontSize(11)
        .text(
          `Dear ${safeText(input.applicantName)},`,
          MARGIN_LEFT,
          bodyY,
          {
            width:
              PAGE_WIDTH -
              MARGIN_LEFT -
              MARGIN_RIGHT,
          },
        );

      bodyY += 35;

      doc
        .fillColor(TEXT_DARK)
        .font("Helvetica")
        .fontSize(10.5)
        .text(
          `We are pleased to inform you that you have been offered admission to ITMT Academy for the ${safeText(
            input.academicSessionName,
          )} academic session.`,
          MARGIN_LEFT,
          bodyY,
          {
            width:
              PAGE_WIDTH -
              MARGIN_LEFT -
              MARGIN_RIGHT,
            lineGap: 5,
            align: "justify",
          },
        );

      bodyY += 62;

      doc
        .fillColor(TEXT_DARK)
        .font("Helvetica")
        .fontSize(10.5)
        .text(
          `You have been admitted to the ${safeText(
            input.programmeName,
          )} programme under the ${safeText(
            input.departmentName,
          )} department.`,
          MARGIN_LEFT,
          bodyY,
          {
            width:
              PAGE_WIDTH -
              MARGIN_LEFT -
              MARGIN_RIGHT,
            lineGap: 5,
            align: "justify",
          },
        );

      bodyY += 62;

      doc
        .fillColor(TEXT_DARK)
        .font("Helvetica")
        .fontSize(10.5)
        .text(
          "Your admission is subject to the successful completion of all required registration procedures, submission of any outstanding documentation, and compliance with the rules and regulations of ITMT Academy.",
          MARGIN_LEFT,
          bodyY,
          {
            width:
              PAGE_WIDTH -
              MARGIN_LEFT -
              MARGIN_RIGHT,
            lineGap: 5,
            align: "justify",
          },
        );

      bodyY += 74;

      /* =====================================================
         IMPORTANT NOTICE
      ===================================================== */

      doc
        .roundedRect(
          MARGIN_LEFT,
          bodyY,
          PAGE_WIDTH -
            MARGIN_LEFT -
            MARGIN_RIGHT,
          65,
          8,
        )
        .fill("#fffbeb")
        .strokeColor("#eadca5")
        .stroke();

      doc
        .fillColor("#8a6a00")
        .font("Helvetica-Bold")
        .fontSize(9)
        .text(
          "IMPORTANT",
          MARGIN_LEFT + 15,
          bodyY + 13,
        );

      doc
        .fillColor("#5f4b00")
        .font("Helvetica")
        .fontSize(9)
        .text(
          "Please retain this letter for your records and present it when required during registration or academic verification.",
          MARGIN_LEFT + 15,
          bodyY + 29,
          {
            width:
              PAGE_WIDTH -
              MARGIN_LEFT -
              MARGIN_RIGHT -
              30,
            lineGap: 2,
          },
        );

      /* =====================================================
         CLOSING
      ===================================================== */

      bodyY += 95;

      doc
        .fillColor(TEXT_DARK)
        .font("Helvetica")
        .fontSize(10.5)
        .text(
          "We warmly welcome you to ITMT Academy and wish you a successful and rewarding academic journey.",
          MARGIN_LEFT,
          bodyY,
          {
            width:
              PAGE_WIDTH -
              MARGIN_LEFT -
              MARGIN_RIGHT,
            lineGap: 5,
          },
        );

      bodyY += 55;

      doc
        .fillColor(TEXT_DARK)
        .font("Helvetica")
        .fontSize(10)
        .text(
          "Yours faithfully,",
          MARGIN_LEFT,
          bodyY,
        );

      bodyY += 35;

      /* Signature line */

      doc
        .moveTo(MARGIN_LEFT, bodyY + 15)
        .lineTo(
          MARGIN_LEFT + 150,
          bodyY + 15,
        )
        .lineWidth(1)
        .strokeColor(BORDER)
        .stroke();

      doc
        .fillColor(BRAND_NAVY)
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(
          "Registrar",
          MARGIN_LEFT,
          bodyY + 24,
        );

      doc
        .fillColor(TEXT_MUTED)
        .font("Helvetica")
        .fontSize(8.5)
        .text(
          "ITMT Academy",
          MARGIN_LEFT,
          bodyY + 38,
        );

      /* =====================================================
         FOOTER
      ===================================================== */

      const footerY = PAGE_HEIGHT - 62;

      doc
        .moveTo(
          MARGIN_LEFT,
          footerY,
        )
        .lineTo(
          PAGE_WIDTH - MARGIN_RIGHT,
          footerY,
        )
        .lineWidth(0.7)
        .strokeColor(BORDER)
        .stroke();

      doc
        .fillColor(TEXT_MUTED)
        .font("Helvetica")
        .fontSize(7.5)
        .text(
          "ITMT Academy • Official Admission Document",
          MARGIN_LEFT,
          footerY + 14,
          {
            width: 250,
          },
        );

      doc
        .fillColor(TEXT_MUTED)
        .font("Helvetica")
        .fontSize(7.5)
        .text(
          `Reference: ${reference}`,
          PAGE_WIDTH - 260,
          footerY + 14,
          {
            width: 200,
            align: "right",
          },
        );

      doc
        .fillColor("#94a3b8")
        .font("Helvetica")
        .fontSize(7)
        .text(
          `Generated ${formatDate(generatedAt)}`,
          MARGIN_LEFT,
          footerY + 29,
          {
            width:
              PAGE_WIDTH -
              MARGIN_LEFT -
              MARGIN_RIGHT,
            align: "center",
          },
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/* =========================================================
   GENERATE + UPLOAD ADMISSION LETTER
========================================================= */

export async function generateAdmissionLetter(
  input: AdmissionLetterInput,
): Promise<AdmissionLetterResult> {
  if (!input.applicantName.trim()) {
    throw new Error(
      "Applicant name is required to generate the admission letter.",
    );
  }

  if (!input.applicationNumber.trim()) {
    throw new Error(
      "Application number is required to generate the admission letter.",
    );
  }

  if (!input.matricNumber.trim()) {
    throw new Error(
      "Matriculation number is required to generate the admission letter.",
    );
  }

  const generatedAt =
    input.admissionDate ?? new Date();

  const reference =
    getLetterReference(
      input.applicationNumber,
      generatedAt,
    );

  const buffer =
    await createAdmissionLetterPdf(
      input,
      reference,
      generatedAt,
    );

  const uploadResult =
    await uploadBufferToCloudinary(
      buffer,
      "itmt/admissions/letters",
    );

  return {
    buffer,
    url: uploadResult.secure_url,
    publicId: uploadResult.public_id,
    reference,
    generatedAt,
  };
}