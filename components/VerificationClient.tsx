"use client";

import { useState } from "react";
import CameraCapture from "@/components/CameraCapture";

interface VerificationClientProps {
  photoType: "verification" | "pickup" | "delivery";
  label: string;
  jobId?: string;
}

export default function VerificationClient({
  photoType,
  label,
  jobId,
}: VerificationClientProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSuccess = (url: string) => {
    setError(null);
    setSuccess(true);
    // Refresh page after 2 seconds to show updated status
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  const handleError = (err: string) => {
    setError(err);
    setSuccess(false);
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <p className="text-green-700 text-sm font-semibold">Photo uploaded successfully!</p>
        </div>
      )}

      {!success && (
        <CameraCapture
          photoType={photoType}
          jobId={jobId}
          onSuccess={handleSuccess}
          onError={handleError}
          label={label}
        />
      )}
    </div>
  );
}
