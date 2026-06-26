"use client";

import DriverLocationShare from "@/components/DriverLocationShare";
import AdminTrackingMapCard from "@/components/AdminTrackingMapCard";
import AdminDispatchControls from "@/components/AdminDispatchControls";

const STATUS_LABEL: Record<string, string> = {
  offered: "Offered to you",
  confirmed: "Confirmed",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_STYLE: Record<string, string> = {
  offered: "bg-[#0D0D0D] text-white",
  confirmed: "bg-[#F5F5F5] text-[#0D0D0D] border border-[#0D0D0D]",
  in_progress: "bg-[#0D0D0D] text-white",
  completed: "bg-[#888888] text-white border border-[#0D0D0D]",
  cancelled: "bg-[#F5F5F5] text-[#888888] border border-[#E8E8E8]",
};

const STATUS_COLORS: Record<string, Record<string, string>> = {
  offered: { offered: "bg-blue-500", confirmed: "bg-[#E8E8E8]", in_progress: "bg-[#E8E8E8]", completed: "bg-[#E8E8E8]" },
  confirmed: { offered: "bg-blue-500", confirmed: "bg-green-500", in_progress: "bg-[#E8E8E8]", completed: "bg-[#E8E8E8]" },
  in_progress: { offered: "bg-blue-500", confirmed: "bg-green-500", in_progress: "bg-orange-500", completed: "bg-[#E8E8E8]" },
  completed: { offered: "bg-blue-500", confirmed: "bg-green-500", in_progress: "bg-orange-500", completed: "bg-purple-500" },
  cancelled: { offered: "bg-blue-500", confirmed: "bg-[#E8E8E8]", in_progress: "bg-[#E8E8E8]", completed: "bg-[#E8E8E8]" },
};

export default function JobCard({
  job,
  onAccept,
  onDecline,
  onUpdateStatus,
  responding,
  updating,
  isExpanded,
  onToggleExpand,
  adminMode = false,
  driverLocations = [],
  jobRoutes = [],
  onDispatchStart,
  onDispatchComplete,
  onDispatchCancel,
  driverId,
  driverName,
}: {
  job: Record<string, unknown>;
  onAccept?: () => void;
  onDecline?: () => void;
  onUpdateStatus?: (newStatus: string) => void;
  responding?: boolean;
  updating?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  adminMode?: boolean;
  driverLocations?: Array<{
    driverId: string;
    driverName: string;
    latitude: number;
    longitude: number;
    status: "confirmed" | "in_progress" | "completed";
    currentJobId?: string;
  }>;
  jobRoutes?: Array<{
    jobId: string;
    pickupLat: number;
    pickupLng: number;
    deliveryLat: number;
    deliveryLng: number;
    status: "confirmed" | "in_progress" | "completed";
  }>;
  onDispatchStart?: (jobId: string) => Promise<void>;
  onDispatchComplete?: (jobId: string) => Promise<void>;
  onDispatchCancel?: (jobId: string) => Promise<void>;
  driverId?: string;
  driverName?: string;
}) {
  const status = (job.status as string) ?? "offered";
  const isOffered = status === "offered";
  const colors = STATUS_COLORS[status] || STATUS_COLORS.offered;

  return (
    <div className={`rounded-2xl p-5 border ${isOffered ? "bg-[#1A1A1A] border-[#1A1A1A]" : "bg-white border-[#E8E8E8]"}`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className={`font-sans font-bold text-sm ${isOffered ? "text-white" : "text-[#0D0D0D]"}`}>
            {(job.service_type as string) || "Removal"}
          </p>
          <p className={`text-xs mt-0.5 ${isOffered ? "text-white/60" : "text-[#888888]"}`}>
            {job.postcode_from as string}
            {job.postcode_to ? ` → ${job.postcode_to as string}` : ""}
            {job.distance_miles ? ` · ${job.distance_miles as number} mi` : ""}
          </p>
        </div>
        {/* StatusIndicator: semantic color badge showing job status */}
        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-[0.1em] shrink-0 ${
          isOffered ? "bg-white/15 text-white" : STATUS_STYLE[status]
        }`}>
          {STATUS_LABEL[status] ?? status}
        </span>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        {job.timeframe ? (
          <div>
            <p className={`text-[10px] uppercase tracking-[0.1em] ${isOffered ? "text-white/50" : "text-[#888888]"}`}>Timeframe</p>
            <p className={`text-sm font-medium ${isOffered ? "text-white/90" : "text-[#0D0D0D]"}`}>{job.timeframe as string}</p>
          </div>
        ) : null}
        {job.duration ? (
          <div>
            <p className={`text-[10px] uppercase tracking-[0.1em] ${isOffered ? "text-white/50" : "text-[#888888]"}`}>Duration</p>
            <p className={`text-sm font-medium ${isOffered ? "text-white/90" : "text-[#0D0D0D]"}`}>{job.duration as string}</p>
          </div>
        ) : null}
        {job.price ? (
          <div>
            <p className={`text-[10px] uppercase tracking-[0.1em] ${isOffered ? "text-white/50" : "text-[#888888]"}`}>Price</p>
            <p className={`font-sans font-black text-sm ${isOffered ? "text-white" : "text-[#0D0D0D]"}`}>£{Number(job.price as number).toFixed(2)}</p>
          </div>
        ) : null}
      </div>

      {job.help_loading ? (
        <p className={`text-xs mb-4 ${isOffered ? "text-white/60" : "text-[#888888]"}`}>
          Loading help: {job.help_loading as string}
        </p>
      ) : null}

      {job.reference ? (
        <p className={`text-[10px] font-mono tracking-[0.1em] mb-4 ${isOffered ? "text-white/40" : "text-[#888888]"}`}>
          {job.reference as string}
        </p>
      ) : null}

      {isOffered && onAccept && onDecline && (
        <div className="flex gap-2 border-t border-white/15 pt-4">
          <button
            onClick={onAccept}
            disabled={responding}
            className="flex-1 bg-white hover:bg-[#F5F5F5] disabled:opacity-40 text-[#0D0D0D] font-semibold py-2.5 rounded-full text-sm transition-colors"
          >
            {responding ? "Confirming…" : "Accept →"}
          </button>
          <button
            onClick={onDecline}
            disabled={responding}
            className="px-5 border border-white/20 hover:border-white/40 text-white/70 hover:text-white font-medium py-2.5 rounded-full text-sm transition-colors"
          >
            Decline
          </button>
        </div>
      )}

      {/* DriverLocationShare: Activates when confirmed → in_progress */}
      {status === "confirmed" && onUpdateStatus && (
        <div className="space-y-3">
          <DriverLocationShare
            job={job}
            onArrived={() => onUpdateStatus("in_progress")}
            arriving={updating}
          />
          <button
            onClick={async () => {
              if (confirm("Cancel this job?")) {
                const res = await fetch("/api/jobs/cancel", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ jobId: job.id }),
                });
                if (res.ok) {
                  window.location.reload();
                }
              }
            }}
            className="w-full text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 font-medium py-2.5 rounded-full text-sm transition-colors"
          >
            Cancel job
          </button>
        </div>
      )}

      {/* LocationIndicator: Shows live status when in_progress (driver is delivering) */}
      {status === "in_progress" && (
        <div className="border-t border-[#E8E8E8] pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-[#0D0D0D] text-sm font-medium">Sharing location</p>
            </div>
            <p className="text-[#888888] text-[10px]">Live</p>
          </div>
          <p className="text-[#888888] text-xs">(Phase 1: Last updated timestamp will display here)</p>
        </div>
      )}

      {status === "in_progress" && onUpdateStatus && (
        <div className="border-t border-[#E8E8E8] pt-4">
          <button
            onClick={() => onUpdateStatus("completed")}
            disabled={updating}
            className="w-full bg-[#0D0D0D] hover:bg-[#333333] disabled:opacity-40 text-white font-semibold py-2.5 rounded-full text-sm transition-colors"
          >
            {updating ? "Completing…" : "Mark as complete →"}
          </button>
        </div>
      )}

      {/* Expandable job detail view */}
      {isExpanded && (onToggleExpand || (status !== "offered" && status !== "completed")) && (
        <div className="border-t border-[#E8E8E8] pt-4 space-y-4">
          {/* Customer Information */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.1em] text-[#888888] mb-2">Customer</p>
            <div className="space-y-1 text-sm">
              <p className="text-[#0D0D0D] font-medium">{job.customer_name ? String(job.customer_name) : "—"}</p>
              <p className="text-[#888888] text-xs">{job.customer_email ? String(job.customer_email) : "—"}</p>
              <p className="text-[#888888] text-xs">{job.customer_phone ? String(job.customer_phone) : "—"}</p>
            </div>
          </div>

          {/* Job Details */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.1em] text-[#888888] mb-2">Job Details</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[#888888]">From</span>
                <span className="text-[#0D0D0D] font-medium">{job.postcode_from ? String(job.postcode_from) : "—"}</span>
              </div>
              {job.postcode_to ? (
                <div className="flex justify-between">
                  <span className="text-[#888888]">To</span>
                  <span className="text-[#0D0D0D] font-medium">{String(job.postcode_to)}</span>
                </div>
              ) : null}
              {job.price ? (
                <div className="flex justify-between">
                  <span className="text-[#888888]">Price</span>
                  <span className="text-[#0D0D0D] font-medium">£{Number(job.price).toFixed(2)}</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Special Instructions */}
          {job.notes ? (
            <div>
              <p className="text-[10px] uppercase tracking-[0.1em] text-[#888888] mb-2">Instructions</p>
              <p className="text-[#0D0D0D] text-xs leading-relaxed">{String(job.notes)}</p>
            </div>
          ) : null}

          {/* Admin: Live Tracking Map (Phase 2) */}
          {adminMode && status === "in_progress" && (
            <div>
              <AdminTrackingMapCard
                drivers={driverLocations.filter((d) => d.currentJobId === (job.id as string))}
                routes={jobRoutes.filter((r) => r.jobId === (job.id as string))}
              />
            </div>
          )}

          {/* Status Timeline */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.1em] text-[#888888] mb-2">Status Progress</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${colors.offered}`} />
                <span className="text-[#888888]">Offered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${colors.confirmed}`} />
                <span className="text-[#888888]">Confirmed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${colors.in_progress}`} />
                <span className="text-[#888888]">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${colors.completed}`} />
                <span className="text-[#888888]">Completed</span>
              </div>
            </div>
          </div>

          {/* Location Preview (Phase 1: placeholder) */}
          {status === "in_progress" && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.1em] text-[#888888] mb-2">Location</p>
              <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-lg p-3 text-center">
                <p className="text-[#888888] text-xs">(Phase 1: Map preview placeholder)</p>
                <p className="text-[#888888] text-[10px] mt-1">Live location will display here in Phase 2</p>
              </div>
            </div>
          )}

          {/* Driver Name */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.1em] text-[#888888] mb-2">Assigned To</p>
            <p className="text-[#0D0D0D] text-sm font-medium">{driverName ? driverName.split(" ")[0] : "—"}</p>
          </div>

          {/* Admin: Dispatch Controls (Phase 2) */}
          {adminMode && (
            <AdminDispatchControls
              job={{
                id: String(job.id),
                status: status as "offered" | "confirmed" | "in_progress" | "completed" | "cancelled",
                driverId: driverId,
              }}
              onStart={onDispatchStart}
              onComplete={onDispatchComplete}
              onCancel={onDispatchCancel}
              assignedDriverId={driverId}
              compact={false}
            />
          )}
        </div>
      )}

      {/* Expand/collapse button */}
      {onToggleExpand && (status === "confirmed" || status === "in_progress") && (
        <div className="border-t border-[#E8E8E8] pt-4">
          <button
            onClick={onToggleExpand}
            className="w-full bg-[#F5F5F5] hover:bg-[#E8E8E8] text-[#0D0D0D] text-sm font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-between px-4"
          >
            <span>{isExpanded ? "Hide details" : "Show details"}</span>
            <span className="text-xs">{isExpanded ? "↑" : "↓"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
