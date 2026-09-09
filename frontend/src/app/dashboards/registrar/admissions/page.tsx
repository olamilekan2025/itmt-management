import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { apiGet } from "@/lib/api";
import RegistrarAdmissionsClient from "./registrar-admissions-client";

interface Admission {
  _id: string;
  applicationNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
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
  referees?: Array<{ name: string; address: string; phone: string; isGuardianOrSponsor: boolean }>;
  educationHistory?: Array<{ schoolAttended: string; certificateObtained: string; dateObtained?: string; grade?: string }>;
  passportPhotoUrl?: string;
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
