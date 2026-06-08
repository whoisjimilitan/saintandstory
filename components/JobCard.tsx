"use client";

import DriverLocationShare from "@/components/DriverLocationShare";

const STATUS_LABEL: Record<string, string> = {
  offered: "Offered to you",
  confirmed: "Confirmed",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_STYLE: Record<string, string> = {
  offered: "bg-[#0D0D0D] text-white",
  confirmed: "bg-[#F5F5F5] text-[#0D0D0D] border border-[#E8E8E8]",
  in_progress: "bg-[#0D0D0D] text-white",
  completed: "bg-[#F5F5F5] text-[#888888] border border-[#E8E8E8]",
  cancelled: "bg-[#F5F5F5] text-[#888888] border border-[#E8E8E8]",
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
}: {
  job: Record<string, unknown>;
  onAccept?: () => void;
  onDecline?: () => void;
  onUpdateStatus?: (newStatus: string) => void;
  responding?: boolean;
  updating?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}) {
  const status = (job.status as string) ?? "offered";
  const isOffered = status === "offered";

  return (
    <div className={`rounded-2xl p-5 border ${isOffered ? "bg-[#0D0D0D] border-[#0D0D0D]" : "bg-white border-[#E8E8E8]"}`}>
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

      {status === "confirmed" && onUpdateStatus && (
        <DriverLocationShare
          job={job}
          onArrived={() => onUpdateStatus("in_progress")}
          arriving={updating}
        />
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

      {/* Expandable detail view (Phase 1: placeholder) */}
      {isExpanded && (onToggleExpand || (status !== "offered" && status !== "completed")) && (
        <div className="border-t border-[#E8E8E8] pt-4">
          <p className="text-[10px] uppercase tracking-[0.1em] text-[#888888] mb-3">Details</p>
          <p className="text-[#888888] text-xs">Job details will load here. (Phase 1: placeholder)</p>
        </div>
      )}

      {/* Expand/collapse button */}
      {onToggleExpand && (status === "confirmed" || status === "in_progress") && (
        <div className="border-t border-[#E8E8E8] pt-4">
          <button
            onClick={onToggleExpand}
            className="text-[#888888] hover:text-[#0D0D0D] text-xs font-medium transition-colors"
          >
            {isExpanded ? "Hide details ↑" : "Show details ↓"}
          </button>
        </div>
      )}
    </div>
  );
}
