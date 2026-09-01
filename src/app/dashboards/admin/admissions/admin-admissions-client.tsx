"use client";

import { useState, useEffect } from "react";

import { apiPatch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

interface AdminAdmissionsClientProps {
  initialAdmissions: Admission[];
  accessToken: string;
  initialError: string;
}

export default function AdminAdmissionsClient({ initialAdmissions, accessToken, initialError }: AdminAdmissionsClientProps) {
  const [admissions, setAdmissions] = useState<Admission[]>(initialAdmissions);
  const [filteredAdmissions, setFilteredAdmissions] = useState<Admission[]>(initialAdmissions);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [error, setError] = useState(initialError);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let filtered = admissions;

    if (statusFilter !== "all") {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.applicationNumber.toLowerCase().includes(query) ||
          a.email.toLowerCase().includes(query) ||
          a.firstName.toLowerCase().includes(query) ||
          a.lastName.toLowerCase().includes(query)
      );
    }

    setFilteredAdmissions(filtered);
  }, [statusFilter, searchQuery, admissions]);

  function getStatusColor(status: string) {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "UNDER_REVIEW":
        return "bg-blue-100 text-blue-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "WITHDRAWN":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  async function handleReview(id: string) {
    setIsProcessing(true);
    setError("");
    setSuccess("");

    try {
      await apiPatch(`/admissions/${id}/review`, {}, accessToken);
      
      setAdmissions((prev) =>
        prev.map((a) =>
          a._id === id ? { ...a, status: "UNDER_REVIEW", reviewedAt: new Date().toISOString() } : a
        )
      );
      setSuccess("Application marked for review");
    } catch (err) {
      setError("Failed to review application");
    } finally {
      setIsProcessing(false);
    }
  }

 async function handleApprove(id: string) {
  setIsProcessing(true);
  setError("");
  setSuccess("");

  try {
    const response = await apiPatch<{
      success: boolean;
      message: string;
      data: { applicationNumber: string; matricNumber: string; studentId: string };
    }>(`/admissions/${id}/approve`, {}, accessToken);

    setAdmissions((prev) =>
      prev.map((a) =>
        a._id === id
          ? {
              ...a,
              status: "APPROVED",
              reviewedAt: new Date().toISOString(),
              matricNumber: response.data.matricNumber,
            }
          : a
      )
    );
    setSuccess("Application approved successfully");
    setSelectedAdmission(null);
  } catch (err) {
    setError("Failed to approve application");
  } finally {
    setIsProcessing(false);
  }
}
  async function handleReject(id: string) {
    if (!rejectionReason.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }

    setIsProcessing(true);
    setError("");
    setSuccess("");

    try {
      await apiPatch(`/admissions/${id}/reject`, { reason: rejectionReason }, accessToken);
      
      setAdmissions((prev) =>
        prev.map((a) =>
          a._id === id
            ? { ...a, status: "REJECTED", reviewedAt: new Date().toISOString(), rejectionReason }
            : a
        )
      );
      setSuccess("Application rejected");
      setShowRejectDialog(false);
      setRejectionReason("");
      setSelectedAdmission(null);
    } catch (err) {
      setError("Failed to reject application");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Admissions Management</h1>
          <p className="mt-1 text-sm text-slate-600">
            Review and manage admission applications
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <input
                type="text"
                placeholder="Search by application number, email, or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy"
              />
            </div>

            <div className="text-sm text-slate-600">
              Showing {filteredAdmissions.length} of {admissions.length} applications
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredAdmissions.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-slate-500">No admission applications found</p>
            </CardContent>
          </Card>
        ) : (
          filteredAdmissions.map((admission) => (
            <Card key={admission._id}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-brand-navy">
                        {(admission.firstName || "")} {admission.lastName}
                      </h3>
                      <Badge className={getStatusColor(admission.status)}>
                        {admission.status}
                      </Badge>
                    </div>

                    <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                      <div>
                        <span className="font-medium">Application:</span> {admission.applicationNumber}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {admission.email}
                      </div>
                      {admission.phone && (
                        <div>
                          <span className="font-medium">Phone:</span> {admission.phone}
                        </div>
                      )}
                      {admission.programme && (
                        <div>
                          <span className="font-medium">Programme:</span> {admission.programme.name}
                        </div>
                      )}
                      {admission.department && (
                        <div>
                          <span className="font-medium">Department:</span> {admission.department.name}
                        </div>
                      )}
                      {admission.academicSession && (
                        <div>
                          <span className="font-medium">Session:</span> {admission.academicSession.name}
                        </div>
                      )}
                      {admission.matricNumber && (
                        <div>
                          <span className="font-medium">Matric:</span> {admission.matricNumber}
                        </div>
                      )}
                    </div>

                    {admission.rejectionReason && (
                      <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                        <span className="font-medium">Rejection Reason:</span> {admission.rejectionReason}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {admission.status === "PENDING" && (
                      <>
                        <Button
                          onClick={() => handleReview(admission._id)}
                          disabled={isProcessing}
                          variant="outline"
                          size="sm"
                        >
                          Review
                        </Button>
                        <Button
                          onClick={() => handleApprove(admission._id)}
                          disabled={isProcessing}
                          size="sm"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedAdmission(admission);
                            setShowRejectDialog(true);
                          }}
                          disabled={isProcessing}
                          variant="destructive"
                          size="sm"
                        >
                          Reject
                        </Button>
                      </>
                    )}

                    {admission.status === "UNDER_REVIEW" && (
                      <>
                        <Button
                          onClick={() => handleApprove(admission._id)}
                          disabled={isProcessing}
                          size="sm"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedAdmission(admission);
                            setShowRejectDialog(true);
                          }}
                          disabled={isProcessing}
                          variant="destructive"
                          size="sm"
                        >
                          Reject
                        </Button>
                      </>
                    )}

                    {admission.status === "APPROVED" && (
                      <Badge className="bg-green-100 text-green-800">Approved</Badge>
                    )}

                    {admission.status === "REJECTED" && (
                      <Badge className="bg-red-100 text-red-800">Rejected</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Reject Dialog */}
      {showRejectDialog && selectedAdmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Reject Application</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                Are you sure you want to reject the application from{" "}
                <strong>
                  {selectedAdmission.firstName} {selectedAdmission.lastName}
                </strong>
                ?
              </p>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Reason for Rejection
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy"
                  placeholder="Provide a reason for rejection..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => {
                    setShowRejectDialog(false);
                    setRejectionReason("");
                    setSelectedAdmission(null);
                  }}
                  variant="outline"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleReject(selectedAdmission._id)}
                  variant="destructive"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Rejecting..." : "Reject"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
