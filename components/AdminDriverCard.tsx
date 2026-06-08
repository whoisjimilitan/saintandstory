"use client";

import { MapPin, Phone } from "lucide-react";

interface Job {
  id: string;
  service_type?: string;
  postcode_from?: string;
  postcode_to?: string;
  status: "confirmed" | "in_progress" | "completed";
}

interface Driver {
  id: string;
  fullName?: string;
  phone?: string;
  status: "available" | "active" | "offline";
  activeJobs: Job[];
  lastLocationUpdate?: string;
  currentJobId?: string;
}

interface Props {
  driver: Driver;
  onAssign?: (driverId: string, jobId: string) => void;
  onStart?: (jobId: string) => void;
  isSelected?: boolean;
  onClick?: () => void;
}

// Semantic colors for driver status (Tier 1 compliance)
const DRIVER_STATUS_COLORS: Record<string, string> = {
  active: "bg-[#0D0D0D] text-white",
  available: "bg-[#F5F5F5] text-[#0D0D0D] border border-[#E8E8E8]",
  offline: "bg-[#F5F5F5] text-[#888888] border border-[#E8E8E8]",
};

const DRIVER_STATUS_LABEL: Record<string, string> = {
  active: "In Progress",
  available: "Available",
  offline: "Offline",
};

export default function AdminDriverCard({
  driver,
  onAssign,
  onStart,
  isSelected = false,
  onClick,
}: Props) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-5 border transition-all cursor-pointer ${
        isSelected
          ? "bg-[#0D0D0D] border-[#0D0D0D]"
          : "bg-white border-[#E8E8E8] hover:border-[#0D0D0D]"
      }`}
    >
      {/* Header: Driver Name + Status Badge */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className={`font-sans font-bold text-sm ${isSelected ? "text-white" : "text-[#0D0D0D]"}`}>
            {driver.fullName || "Unknown Driver"}
          </p>
          <p className={`text-xs mt-0.5 ${isSelected ? "text-white/60" : "text-[#888888]"}`}>
            {driver.activeJobs.length} active {driver.activeJobs.length === 1 ? "job" : "jobs"}
          </p>
        </div>

        {/* Status Indicator Badge (semantic color from Phase 1) */}
        <span
          className={`text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-[0.1em] shrink-0 ${
            DRIVER_STATUS_COLORS[driver.status]
          }`}
        >
          {DRIVER_STATUS_LABEL[driver.status]}
        </span>
      </div>

      {/* Location Indicator: Green pulse for active drivers */}
      {driver.status === "active" && (
        <div className="border-t border-white/15 pt-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className={`text-xs ${isSelected ? "text-white/90" : "text-[#0D0D0D]"}`}>
              Sharing location
            </span>
            <span className={`ml-auto text-[10px] ${isSelected ? "text-white/50" : "text-[#888888]"}`}>
              Live
            </span>
          </div>
        </div>
      )}

      {/* Contact Info */}
      {driver.phone && (
        <div className={`flex items-center gap-2 mb-3 ${isSelected ? "text-white/80" : "text-[#888888]"}`}>
          <Phone size={16} strokeWidth={2} />
          <p className="text-xs">{driver.phone}</p>
        </div>
      )}

      {/* Active Jobs List */}
      {driver.activeJobs.length > 0 && (
        <div className={`border-t ${isSelected ? "border-white/15" : "border-[#E8E8E8]"} pt-3 space-y-2`}>
          <p className={`text-[10px] uppercase tracking-[0.1em] font-semibold ${isSelected ? "text-white/50" : "text-[#888888]"}`}>
            Active Jobs
          </p>
          {driver.activeJobs.slice(0, 3).map((job) => (
            <div
              key={job.id}
              className={`rounded-lg p-2.5 flex items-start justify-between gap-2 ${
                isSelected ? "bg-white/5 border border-white/10" : "bg-[#F5F5F5] border border-[#E8E8E8]"
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-medium ${isSelected ? "text-white" : "text-[#0D0D0D]"}`}>
                  {job.service_type || "Job"}
                </p>
                <p className={`text-[10px] mt-0.5 ${isSelected ? "text-white/60" : "text-[#888888]"}`}>
                  {job.postcode_from}
                  {job.postcode_to ? ` → ${job.postcode_to}` : ""}
                </p>
              </div>

              {/* Mini Status Badge for Job */}
              <span
                className={`text-[8px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-[0.05em] shrink-0 ${
                  job.status === "in_progress"
                    ? "bg-[#0D0D0D] text-white"
                    : job.status === "confirmed"
                      ? "bg-[#F5F5F5] text-[#0D0D0D] border border-[#E8E8E8]"
                      : "bg-[#F5F5F5] text-[#888888] border border-[#E8E8E8]"
                }`}
              >
                {job.status === "in_progress" ? "Live" : job.status === "confirmed" ? "Ready" : "Done"}
              </span>
            </div>
          ))}
          {driver.activeJobs.length > 3 && (
            <p className={`text-[10px] ${isSelected ? "text-white/50" : "text-[#888888]"}`}>
              +{driver.activeJobs.length - 3} more
            </p>
          )}
        </div>
      )}

      {/* Last Update Timestamp (Phase 2 placeholder) */}
      {driver.lastLocationUpdate && (
        <div className={`border-t ${isSelected ? "border-white/15" : "border-[#E8E8E8]"} mt-3 pt-3`}>
          <p className={`text-[10px] ${isSelected ? "text-white/40" : "text-[#888888]"}`}>
            Last updated: {driver.lastLocationUpdate}
          </p>
        </div>
      )}
    </div>
  );
}
