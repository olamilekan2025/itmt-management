"use client";

import { AlertCircle } from "lucide-react";

interface StudentResultsErrorProps {
  onRetry: () => void;
}

export default function StudentResultsError({ onRetry }: StudentResultsErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-12">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
        <AlertCircle className="h-8 w-8 text-red-600" />
      </div>
      <div className="text-center space-y-3">
        <h3 className="text-lg font-semibold text-slate-900">
          Unable to load results
        </h3>
        <p className="text-sm text-slate-600 max-w-sm">
          We couldn&apos;t retrieve your academic results right now. Please try again.
        </p>
        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center rounded-lg bg-brand-navy px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
