import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { apiGet } from "@/lib/api";
import FinanceSidebar from "@/components/dashboard/finance/sidebar";
import FinanceHeader from "@/components/dashboard/finance/header";
import FeeStructurePanel from "@/components/dashboard/finance/fee-structure-panel";
import RecordPaymentPanel from "@/components/dashboard/finance/record-payment-panel";
import BalanceLookupPanel from "@/components/dashboard/finance/balance-lookup-panel";

interface UsersResponse {
  success: boolean;
  users: Array<{ _id: string; name: string; matricNumber?: string }>;
}

interface ProgrammesResponse {
  success: boolean;
  programmes: Array<{ _id: string; name: string; code: string }>;
}

interface SemestersResponse {
  success: boolean;
  semesters: Array<{ _id: string; name: string }>;
}

interface FeeStructuresResponse {
  success: boolean;
  feeStructures: Array<{
    _id: string;
    programme: { name: string; code: string };
    level: string;
    semester: { name: string };
    amount: number;
    description?: string;
  }>;
}

export default async function FinancePage() {
  const session = await getServerSession(authOptions);
  const token = session?.accessToken as string;

  const [studentsRes, programmesRes, semestersRes, feeStructuresRes] = await Promise.all([
    apiGet<UsersResponse>("/users?role=student", token),
    apiGet<ProgrammesResponse>("/programmes", token),
    apiGet<SemestersResponse>("/semesters", token),
    apiGet<FeeStructuresResponse>("/fee-structures", token),
  ]);

  return (
    <div className="flex min-h-screen bg-brand-light">
      <FinanceSidebar />

      <div className="flex flex-1 flex-col">
        <FinanceHeader userName={session?.user?.name || "Finance"} />

        <main className="flex-1 p-8">
          <div className="mx-auto max-w-5xl space-y-6">
            <div id="overview" className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-sm text-slate-600">
                {studentsRes.users.length} student{studentsRes.users.length === 1 ? "" : "s"} •{" "}
                {feeStructuresRes.feeStructures.length} fee structure
                {feeStructuresRes.feeStructures.length === 1 ? "" : "s"}
              </p>
            </div>

            <div id="fee-structures">
              <FeeStructurePanel
                accessToken={token}
                programmes={programmesRes.programmes}
                semesters={semestersRes.semesters}
                feeStructures={feeStructuresRes.feeStructures}
              />
            </div>

            <div id="record-payment">
              <RecordPaymentPanel
                accessToken={token}
                students={studentsRes.users}
                semesters={semestersRes.semesters}
              />
            </div>

            <div id="balance">
              <BalanceLookupPanel
                accessToken={token}
                students={studentsRes.users}
                semesters={semestersRes.semesters}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}