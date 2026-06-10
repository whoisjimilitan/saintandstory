"use client";

import { Check } from "lucide-react";
import VerificationClient from "@/components/VerificationClient";

interface ActiveJobPhotosProps {
  jobId: string;
  pickupPhotoUrl: string | null;
  deliveryPhotoUrl: string | null;
  pickupPhotoTakenAt: string | null;
  deliveryPhotoTakenAt: string | null;
}

export default function ActiveJobPhotos({
  jobId,
  pickupPhotoUrl,
  deliveryPhotoUrl,
  pickupPhotoTakenAt,
  deliveryPhotoTakenAt,
}: ActiveJobPhotosProps) {
  return (
    <div className="space-y-4 pt-4 border-t border-[#E8E8E8]">
      {/* Pickup Photo Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-sans font-semibold text-[#0D0D0D] text-sm">Pickup Photo</p>
          {pickupPhotoUrl && (
            <Check size={16} className="text-[#0D0D0D]" strokeWidth={3} />
          )}
        </div>

        {pickupPhotoUrl ? (
          <div className="space-y-2">
            <img src={pickupPhotoUrl} alt="Pickup" className="w-full rounded-lg" />
            <p className="text-[#888888] text-xs">
              Taken {new Date(pickupPhotoTakenAt!).toLocaleTimeString()}
            </p>
          </div>
        ) : (
          <VerificationClient photoType="pickup" label="Take Pickup Photo" jobId={jobId} />
        )}
      </div>

      {/* Delivery Photo Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-sans font-semibold text-[#0D0D0D] text-sm">Delivery Photo</p>
          {deliveryPhotoUrl && (
            <Check size={16} className="text-[#0D0D0D]" strokeWidth={3} />
          )}
        </div>

        {deliveryPhotoUrl ? (
          <div className="space-y-2">
            <img src={deliveryPhotoUrl} alt="Delivery" className="w-full rounded-lg" />
            <p className="text-[#888888] text-xs">
              Taken {new Date(deliveryPhotoTakenAt!).toLocaleTimeString()}
            </p>
          </div>
        ) : (
          <VerificationClient
            photoType="delivery"
            label="Take Delivery Photo"
            jobId={jobId}
          />
        )}
      </div>

      {/* Completion Status */}
      {pickupPhotoUrl && deliveryPhotoUrl && (
        <div className="border-l-2 border-[#0D0D0D] bg-white px-4 py-3 mt-4">
          <p className="text-[#0D0D0D] text-sm font-semibold">Ready to complete</p>
        </div>
      )}

      {(!pickupPhotoUrl || !deliveryPhotoUrl) && (
        <div className="border-l-2 border-[#888888] bg-[#F5F5F5] px-4 py-3 mt-4">
          <p className="text-[#888888] text-sm font-semibold">{!pickupPhotoUrl ? "Pickup photo needed" : "Delivery photo needed"}</p>
        </div>
      )}
    </div>
  );
}
