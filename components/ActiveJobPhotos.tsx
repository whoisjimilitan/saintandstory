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
            <span className="text-[10px] font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full uppercase tracking-[0.1em] flex items-center gap-1.5">
              <Check size={12} /> Done
            </span>
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
            <span className="text-[10px] font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full uppercase tracking-[0.1em] flex items-center gap-1.5">
              <Check size={12} /> Done
            </span>
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
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-center">
          <p className="text-green-700 text-sm font-semibold">
            Job ready to complete ✓
          </p>
        </div>
      )}

      {(!pickupPhotoUrl || !deliveryPhotoUrl) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-center">
          <p className="text-yellow-700 text-sm font-semibold">
            Photos required to complete job
          </p>
        </div>
      )}
    </div>
  );
}
