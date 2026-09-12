

import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { apiGet } from "@/lib/api";
import RegistrarAdmissionsClient from "./registrar-admissions-client";

interface AdmissionDocument {
  type: string;
  filename: string;
  url: string;
}

interface Referee {
  name: string;
  address?: string;
  phone?: string;
  relationship?: string;
}

interface EducationRecord {
  schoolAttended: string;
  certificate: string;
  dateObtained?: string;
  grade?: string;
}

interface Admission {
  _id: string;
  applicationNumber: string;
  surname: string;
  otherNames: string;
  email: string;
  telephone?: string;
  dateOfBirth?: string;
  nationality?: string;
  postalAddress?: string;
  residentialAddress?: string;
  programme?: { _id: string; name: string; code: string };
  department?: { _id: string; name: string; code: string };
  academicSession?: { _id: string; name: string };
  status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "WITHDRAWN";
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: { _id: string; name: string };
  student?: { _id: string; name: string };
  matricNumber?: string;
  rejectionReason?: string;
  referees?: Referee[];
  educationRecords?: EducationRecord[];
  documents?: AdmissionDocument[];
  medicalCondition?: string;
  referredBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface AdmissionsResponse {
  success: boolean;
  data: {
    items: Admission[];
    total: number;
  };
}

export default async function RegistrarAdmissionsPage() {
  const session = await getServerSession(authOptions);
  const token = session?.accessToken as string;

  let admissions: Admission[] = [];
  let total = 0;
  let error = "";

  try {
    const data = await apiGet<AdmissionsResponse>("/admissions?page=1&limit=50", token);
    admissions = data.data.items;
    total = data.data.total;
  } catch (err) {
    console.error("Failed to load admissions:", err);
    error = "Failed to load admissions";
  }

  return (
    <RegistrarAdmissionsClient
      initialAdmissions={admissions}
      initialTotal={total}
      accessToken={token}
      initialError={error}
    />
  );
}