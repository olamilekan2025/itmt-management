import { z } from "zod";

const objectId = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid ID");

export const createExistingStudentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Student name must be at least 2 characters")
    .max(100, "Student name is too long"),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .toLowerCase(),

  matricNumber: z
    .string()
    .trim()
    .min(2, "Matric number is required")
    .max(50, "Matric number is too long"),

  programme: objectId,

  academicSession: objectId,

  level: z
    .string()
    .trim()
    .min(1, "Level is required")
    .max(30, "Invalid level"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
});

export type CreateExistingStudentInput = z.infer<
  typeof createExistingStudentSchema
>;