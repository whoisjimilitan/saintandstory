"use client";

import { Check, Play, X } from "lucide-react";
import { useState } from "react";

interface Job {
  id: string;
  status: "offered" | "confirmed" | "in_progress" | "completed" | "cancelled";
  driverId?: string;
}

interface Props {
  job: Job;
  onAssign?: (jobId: string, driverId: string) => Promise<void>;
  onStart?: (jobId: string) => Promise<void>;
  onComplete?: (jobId: string) => Promise<void>;
  onCancel?: (jobId: string) => Promise<void>;
  assignedDriverId?: string;
  loading?: boolean;
  compact?: boolean;
}

export default function AdminDispatchControls({
  job,
  onAssign,
  onStart,
  onComplete,
  onCancel,
  assignedDriverId,
  loading = false,
  compact = false,
}: Props) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleAssign = async () => {
    if (!onAssign || !assignedDriverId) return;
    setLoadingAction("assign");
    try {
      await onAssign(job.id, assignedDriverId);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleStart = async () => {
    if (!onStart) return;
    setLoadingAction("start");
    try {
      await onStart(job.id);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleComplete = async () => {
    if (!onComplete) return;
    setLoadingAction("complete");
    try {
      await onComplete(job.id);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCancel = async () => {
    if (!onCancel) return;
    setLoadingAction("cancel");
    try {
      await onCancel(job.id);
    } finally {
      setLoadingAction(null);
    }
  };

  if (compact) {
    // Compact button row for job lists
    return (
      <div className="flex items-center gap-1">
        {job.status === "confirmed" && onStart && (
          <button
            onClick={handleStart}
            disabled={loading || loadingAction === "start"}
            className="px-2 py-1 rounded text-[10px] font-semibold bg-[#0D0D0D] text-white hover:bg-[#333333] disabled:opacity-40 transition-colors flex items-center gap-1"
          >
            <Play size={12} strokeWidth={2} />
            {loadingAction === "start" ? "..." : "Start"}
          </button>
        )}
        {job.status === "in_progress" && onComplete && (
          <button
            onClick={handleComplete}
            disabled={loading || loadingAction === "complete"}
            className="px-2 py-1 rounded text-[10px] font-semibold bg-[#0D0D0D] text-white hover:bg-[#333333] disabled:opacity-40 transition-colors flex items-center gap-1"
          >
            <Check size={12} strokeWidth={2} />
            {loadingAction === "complete" ? "..." : "Done"}
          </button>
        )}
        {(job.status === "confirmed" || job.status === "in_progress") && onCancel && (
          <button
            onClick={handleCancel}
            disabled={loading || loadingAction === "cancel"}
            className="px-2 py-1 rounded text-[10px] font-semibold border border-[#E8E8E8] text-[#888888] hover:text-[#0D0D0D] disabled:opacity-40 transition-colors flex items-center gap-1"
          >
            <X size={12} strokeWidth={2} />
          </button>
        )}
      </div>
    );
  }

  // Full button row for dispatch panel
  return (
    <div className="border-t border-[#E8E8E8] pt-4 mt-4 space-y-2">
      {job.status === "offered" && onAssign && assignedDriverId && (
        <button
          onClick={handleAssign}
          disabled={loading || loadingAction === "assign"}
          className="w-full px-4 py-2.5 rounded-full text-sm font-semibold bg-[#0D0D0D] text-white hover:bg-[#333333] disabled:opacity-40 transition-colors"
        >
          {loadingAction === "assign" ? "Assigning…" : "Assign to Driver"}
        </button>
      )}

      {job.status === "confirmed" && onStart && (
        <button
          onClick={handleStart}
          disabled={loading || loadingAction === "start"}
          className="w-full px-4 py-2.5 rounded-full text-sm font-semibold bg-[#0D0D0D] text-white hover:bg-[#333333] disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
        >
          <Play size={16} strokeWidth={2} />
          {loadingAction === "start" ? "Starting…" : "Start Delivery"}
        </button>
      )}

      {job.status === "in_progress" && onComplete && (
        <button
          onClick={handleComplete}
          disabled={loading || loadingAction === "complete"}
          className="w-full px-4 py-2.5 rounded-full text-sm font-semibold bg-[#0D0D0D] text-white hover:bg-[#333333] disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
        >
          <Check size={16} strokeWidth={2} />
          {loadingAction === "complete" ? "Completing…" : "Mark Completed"}
        </button>
      )}

      {(job.status === "confirmed" || job.status === "in_progress") && onCancel && (
        <button
          onClick={handleCancel}
          disabled={loading || loadingAction === "cancel"}
          className="w-full px-4 py-2.5 rounded-full text-sm font-medium border border-[#E8E8E8] text-[#888888] hover:text-[#0D0D0D] hover:bg-[#F5F5F5] disabled:opacity-40 transition-colors"
        >
          {loadingAction === "cancel" ? "Cancelling…" : "Cancel Job"}
        </button>
      )}
    </div>
  );
}
