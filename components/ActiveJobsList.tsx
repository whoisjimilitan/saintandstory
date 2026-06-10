"use client";

import { useState } from "react";
import JobCard from "@/components/JobCard";
import ActiveJobPhotos from "@/components/ActiveJobPhotos";
import { useCallback } from "react";

interface Job {
  id: string;
  status: string;
  customer_name?: string;
  postcode_from?: string;
  postcode_to?: string;
  service_type?: string;
  price?: number;
  duration?: string;
  timeframe?: string;
  distance_miles?: number;
  reference?: string;
  notes?: string;
  help_loading?: string;
  customer_email?: string;
  customer_phone?: string;
  recipient_name?: string;
  pickup_lat?: number;
  pickup_lng?: number;
  pickup_photo_url?: string;
  pickup_photo_taken_at?: string;
  delivery_photo_url?: string;
  delivery_photo_taken_at?: string;
  confirmed_at?: string;
  in_progress_at?: string;
  created_at?: string;
}

interface Props {
  jobs: Job[];
  driverId: string | null;
  driverName?: string;
  onStatusUpdate?: (jobId: string, newStatus: string) => Promise<void>;
}

export default function ActiveJobsList({ jobs, driverId, driverName, onStatusUpdate }: Props) {
  // Filter to confirmed + in_progress only
  const activeJobs = jobs.filter(
    (j) => j.status === "confirmed" || j.status === "in_progress"
  );

  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const handleStatusUpdate = useCallback(
    async (jobId: string, newStatus: string) => {
      setUpdating(jobId);
      try {
        if (onStatusUpdate) {
          await onStatusUpdate(jobId, newStatus);
        }
      } finally {
        setUpdating(null);
      }
    },
    [onStatusUpdate]
  );

  if (activeJobs.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="bg-white border border-[#EAE6E0] rounded-2xl p-8 text-center">
          <p className="text-[#888888] text-sm">No active jobs right now.</p>
          <p className="text-[#888888] text-xs mt-1">You'll see jobs here once you accept an offer.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="space-y-3">
        {activeJobs.map((job) => (
          <div key={job.id} className="space-y-3">
            <JobCard
              job={job as unknown as Record<string, unknown>}
              isExpanded={expandedJobId === job.id}
              onToggleExpand={() =>
                setExpandedJobId(expandedJobId === job.id ? null : job.id)
              }
              onUpdateStatus={
                job.status === "confirmed"
                  ? (status) => handleStatusUpdate(job.id, status)
                  : undefined
              }
              updating={updating === job.id}
              driverName={driverName}
            />
            {expandedJobId === job.id && (
              <div className="bg-white border border-[#E8E8E8] rounded-2xl p-5">
                <ActiveJobPhotos
                  jobId={job.id}
                  pickupPhotoUrl={job.pickup_photo_url ?? null}
                  deliveryPhotoUrl={job.delivery_photo_url ?? null}
                  pickupPhotoTakenAt={job.pickup_photo_taken_at ?? null}
                  deliveryPhotoTakenAt={job.delivery_photo_taken_at ?? null}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
