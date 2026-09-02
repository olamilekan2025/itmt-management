import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { apiGet } from "@/lib/api";
import AdminAdmissionsClient from "./admin-admissions-client";

interface Admission {
  _id: string;
  applicationNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  programme?: { _id: string; name: string; code: string };
  department?: { _id: string; name: string };
  academicSession?: { _id: string; name: string };
  status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "WITHDRAWN";
  submittedAt: string;
  reviewedAt?: string;
  matricNumber?: string;
  rejectionReason?: string;
}

interface AdmissionsResponse {
  success: boolean;
  data: {
    items: Admission[];
    total: number;
  };
}

export default async function AdminAdmissionsPage() {
  const session = await getServerSession(authOptions);
  const token = session?.accessToken as string;

  let admissions: Admission[] = [];
  let error = "";

  try {
    const data = await apiGet<AdmissionsResponse>("/admissions", token);
    admissions = data.data.items;
  } catch (err) {
    console.error("Failed to load admissions:", err);
    error = "Failed to load admissions";
  }

  return <AdminAdmissionsClient initialAdmissions={admissions} accessToken={token} initialError={error} />;
}
