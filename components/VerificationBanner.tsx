import Link from "next/link";
import { AlertCircle, Clock, CheckCircle } from "lucide-react";

interface VerificationBannerProps {
  status: string | null;
}

export default function VerificationBanner({ status }: VerificationBannerProps) {
  if (!status || status === "approved") {
    return null;
  }

  if (status === "pending") {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-5 py-4 mb-6 sm:mb-8 flex items-start gap-3">
        <Clock size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-sans font-semibold text-yellow-900 text-sm">Verification Pending</p>
          <p className="text-yellow-700 text-xs mt-1">Your identity verification is under review. You can still view your account.</p>
        </div>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-6 sm:mb-8 flex items-start gap-3">
        <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-sans font-semibold text-red-900 text-sm">Verification Required</p>
          <p className="text-red-700 text-xs mt-1">Your verification was not approved. Please submit a new photo.</p>
          <Link
            href="/dashboard/driver/onboarding"
            className="text-red-700 text-xs font-semibold hover:underline mt-2 inline-block"
          >
            Resubmit →
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
